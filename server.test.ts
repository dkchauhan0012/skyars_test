import test from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { createApp } from './server.ts';

async function withTestServer(
  options: Parameters<typeof createApp>[0],
  fn: (baseUrl: string, ctx: ReturnType<typeof createApp>) => Promise<void>
) {
  const ctx = createApp(options);
  const server: Server = await new Promise((resolve) => {
    const s = ctx.app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    await fn(baseUrl, ctx);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve()))
    );
  }
}

test('POST /api/inquiries rejects invalid submissions with 400 and fieldErrors', async () => {
  await withTestServer({}, async (baseUrl, ctx) => {
    const response = await fetch(`${baseUrl}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'A',
        email: 'bad-email',
        serviceArea: '',
        projectSummary: 'Short',
      }),
    });

    assert.equal(response.status, 400);
    const data = (await response.json()) as {
      error: string;
      fieldErrors: Record<string, string>;
      firstInvalidField: string;
    };
    assert.equal(data.firstInvalidField, 'name');
    assert.ok(data.fieldErrors.name);
    assert.ok(data.fieldErrors.email);
    assert.equal(ctx.inquiries.length, 0);
  });
});

test('POST /api/inquiries records valid inquiry and returns honest mailto-required deliveryMode when no webhook is set', async () => {
  await withTestServer({}, async (baseUrl, ctx) => {
    const response = await fetch(`${baseUrl}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Meera Desai',
        email: 'meera@desai-industries.in',
        organization: 'Desai Industries',
        serviceArea: 'Web & Mobile Application',
        budgetRange: 'Full Product Build',
        timeline: 'Starting within 2–4 weeks',
        projectSummary: 'Building an internal production scheduling and inventory portal for two factories.',
      }),
    });

    assert.equal(response.status, 201);
    const data = (await response.json()) as {
      status: string;
      deliveryMode: string;
      mailtoUrl: string;
      inquiryId: string;
    };
    assert.equal(data.status, 'validated');
    assert.equal(data.deliveryMode, 'mailto-required');
    assert.ok(data.mailtoUrl.startsWith('mailto:info@skyars.in'));
    assert.equal(ctx.inquiries.length, 1);
    assert.equal(ctx.inquiries[0].payload.organization, 'Desai Industries');
  });
});

test('POST /api/applications validates URL and returns 502 if configured webhook fails (never false success)', async () => {
  await withTestServer(
    { webhookUrl: 'http://127.0.0.1:1/unreachable-webhook' },
    async (baseUrl, ctx) => {
      const response = await fetch(`${baseUrl}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Nikhil Parmar',
          email: 'nikhil@example.com',
          roleTitle: 'IoT & Embedded Systems Intern',
          portfolioUrl: 'https://github.com/nikhilparmar',
          experienceNote: 'Built a solar inverter telemetry logger using ESP32 and Modbus RTU.',
        }),
      });

      assert.equal(response.status, 502);
      const data = (await response.json()) as { error: string; mailtoUrl: string };
      assert.ok(data.error.includes('info@skyars.in'));
      assert.ok(data.mailtoUrl.startsWith('mailto:info@skyars.in'));
      assert.equal(ctx.applications.length, 0);
    }
  );
});

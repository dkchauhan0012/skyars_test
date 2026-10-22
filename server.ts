import 'dotenv/config';
import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  validateProjectInquiry,
  validateCareerApplication,
  buildProjectInquiryMailto,
  buildCareerApplicationMailto,
  type ProjectInquiryInput,
  type CareerApplicationInput,
} from './src/utils/inquiryValidation.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface StoredRecord<T> {
  id: string;
  createdAt: string;
  payload: T;
  deliveryMode: 'webhook' | 'mailto-required';
}

export interface ServerOptions {
  webhookUrl?: string;
  rateLimitMaxPerMinute?: number;
}

export function createApp(options: ServerOptions = {}): {
  app: Express;
  inquiries: StoredRecord<ProjectInquiryInput>[];
  applications: StoredRecord<CareerApplicationInput>[];
} {
  const app = express();
  const inquiries: StoredRecord<ProjectInquiryInput>[] = [];
  const applications: StoredRecord<CareerApplicationInput>[] = [];

  const rateLimitMax = options.rateLimitMaxPerMinute ?? 20;
  const ipBuckets = new Map<string, { count: number; resetAt: number }>();

  app.use(express.json({ limit: '32kb' }));

  // Handle payload too large or invalid JSON cleanly without leaking stack traces
  app.use((err: { type?: string; status?: number }, _req: Request, res: Response, next: NextFunction) => {
    if (err && err.type === 'entity.too.large') {
      res.status(413).json({
        error: 'Request payload exceeds the 32KB limit.',
      });
      return;
    }
    if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
      res.status(400).json({
        error: 'Malformed JSON request body.',
      });
      return;
    }
    next(err);
  });

  function checkRateLimit(req: Request, res: Response): boolean {
    const ip = req.ip || 'local';
    const now = Date.now();
    const current = ipBuckets.get(ip);
    if (!current || now > current.resetAt) {
      ipBuckets.set(ip, { count: 1, resetAt: now + 60_000 });
      return true;
    }
    if (current.count >= rateLimitMax) {
      res.status(429).json({
        error: 'Too many submissions from this address. Please wait a minute or email info@skyars.in directly.',
      });
      return false;
    }
    current.count += 1;
    return true;
  }

  app.get('/api/health', (_req: Request, res: Response) => {
    const webhookConfigured = Boolean(
      (options.webhookUrl ?? process.env.CONTACT_WEBHOOK_URL ?? '').trim()
    );
    res.json({
      status: 'ok',
      webhookConfigured,
    });
  });

  app.post('/api/inquiries', async (req: Request, res: Response) => {
    if (!checkRateLimit(req, res)) return;

    const body = (req.body ?? {}) as Partial<ProjectInquiryInput>;
    const normalized: ProjectInquiryInput = {
      name: typeof body.name === 'string' ? body.name.trim() : '',
      email: typeof body.email === 'string' ? body.email.trim() : '',
      organization: typeof body.organization === 'string' ? body.organization.trim() : '',
      serviceArea: typeof body.serviceArea === 'string' ? body.serviceArea.trim() : '',
      budgetRange: typeof body.budgetRange === 'string' ? body.budgetRange.trim() : '',
      timeline: typeof body.timeline === 'string' ? body.timeline.trim() : '',
      projectSummary: typeof body.projectSummary === 'string' ? body.projectSummary.trim() : '',
    };

    const validation = validateProjectInquiry(normalized);
    if (!validation.valid) {
      res.status(400).json({
        error: 'Please check the highlighted form fields and try again.',
        fieldErrors: validation.fieldErrors,
        firstInvalidField: validation.firstInvalidField,
      });
      return;
    }

    const mailtoUrl = buildProjectInquiryMailto(normalized);
    const webhookUrl = (options.webhookUrl ?? process.env.CONTACT_WEBHOOK_URL ?? '').trim();
    let deliveryMode: 'webhook' | 'mailto-required' = 'mailto-required';

    if (webhookUrl) {
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'project_inquiry',
            submittedAt: new Date().toISOString(),
            inquiry: normalized,
          }),
        });
        if (!webhookResponse.ok) {
          res.status(502).json({
            error:
              'Our notification relay could not complete delivery right now. Please send your inquiry directly to info@skyars.in using the prepared email link.',
            mailtoUrl,
          });
          return;
        }
        deliveryMode = 'webhook';
      } catch {
        res.status(502).json({
          error:
            'Unable to reach the configured notification relay. Please use the prepared email link to contact info@skyars.in directly.',
          mailtoUrl,
        });
        return;
      }
    }

    const record: StoredRecord<ProjectInquiryInput> = {
      id: `inq_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      payload: normalized,
      deliveryMode,
    };
    inquiries.push(record);

    res.status(201).json({
      status: 'validated',
      inquiryId: record.id,
      deliveryMode,
      mailtoUrl,
      message:
        deliveryMode === 'webhook'
          ? 'Your project inquiry has been forwarded to the Skyars engineering team.'
          : 'Your project details have been validated and formatted. Because no automated email relay is configured on this environment, please click "Open in Email Client" below to send your message directly to info@skyars.in.',
    });
  });

  app.post('/api/applications', async (req: Request, res: Response) => {
    if (!checkRateLimit(req, res)) return;

    const body = (req.body ?? {}) as Partial<CareerApplicationInput>;
    const normalized: CareerApplicationInput = {
      fullName: typeof body.fullName === 'string' ? body.fullName.trim() : '',
      email: typeof body.email === 'string' ? body.email.trim() : '',
      roleTitle: typeof body.roleTitle === 'string' ? body.roleTitle.trim() : '',
      portfolioUrl: typeof body.portfolioUrl === 'string' ? body.portfolioUrl.trim() : '',
      experienceNote: typeof body.experienceNote === 'string' ? body.experienceNote.trim() : '',
    };

    const validation = validateCareerApplication(normalized);
    if (!validation.valid) {
      res.status(400).json({
        error: 'Please check the highlighted application fields and try again.',
        fieldErrors: validation.fieldErrors,
        firstInvalidField: validation.firstInvalidField,
      });
      return;
    }

    const mailtoUrl = buildCareerApplicationMailto(normalized);
    const webhookUrl = (options.webhookUrl ?? process.env.CONTACT_WEBHOOK_URL ?? '').trim();
    let deliveryMode: 'webhook' | 'mailto-required' = 'mailto-required';

    if (webhookUrl) {
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'career_application',
            submittedAt: new Date().toISOString(),
            application: normalized,
          }),
        });
        if (!webhookResponse.ok) {
          res.status(502).json({
            error:
              'Our application relay could not complete delivery right now. Please send your application directly to info@skyars.in using the prepared email link.',
            mailtoUrl,
          });
          return;
        }
        deliveryMode = 'webhook';
      } catch {
        res.status(502).json({
          error:
            'Unable to reach the configured application relay. Please use the prepared email link to contact info@skyars.in directly.',
          mailtoUrl,
        });
        return;
      }
    }

    const record: StoredRecord<CareerApplicationInput> = {
      id: `app_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      payload: normalized,
      deliveryMode,
    };
    applications.push(record);

    res.status(201).json({
      status: 'validated',
      applicationId: record.id,
      deliveryMode,
      mailtoUrl,
      message:
        deliveryMode === 'webhook'
          ? 'Your application has been forwarded to the Skyars team.'
          : 'Your application details have been validated and formatted. To complete submission, please click "Send Application via Email" below to email info@skyars.in directly.',
    });
  });

  return { app, inquiries, applications };
}

export async function startServer(): Promise<void> {
  const { app } = createApp();
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Skyars server listening on http://0.0.0.0:${port}`);
  });
}

const isMainModule =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isMainModule) {
  startServer();
}

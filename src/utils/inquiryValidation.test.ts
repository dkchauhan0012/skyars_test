import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import {
  validateProjectInquiry,
  validateCareerApplication,
  buildProjectInquiryMailto,
  buildCareerApplicationMailto,
  filterCareerOpenings,
  isValidHttpUrl,
} from './inquiryValidation.ts';
import {
  CAREER_OPENINGS,
} from '../content/site.ts';
import {
  REPLAY_VIEWPORT,
  REPLAY_VIEWPORT_HERO,
  REPLAY_VIEWPORT_ITEM,
  computeClampedTiltRadians,
} from '../motion/variants.ts';
import {
  FLIGHTLINE_SVG_PATHS,
  parseFlightlineSvgGrammar,
} from '../components/brand/FlightlineMark.tsx';
import {
  MAX_ALLOWED_TILT_DEG,
  createShapesFromFlightlinePath,
  validateFlightlineSafeBounds,
} from '../components/visual/FlightlineScene.tsx';
import { CONDUIT_PATH_D } from '../sections/SignalInterlude.tsx';

test('validateProjectInquiry rejects empty or short inputs and returns firstInvalidField', () => {
  const result = validateProjectInquiry({
    name: 'A',
    email: 'invalid-email',
    organization: '',
    serviceArea: '',
    budgetRange: 'Full Product Build',
    timeline: 'Immediate priority',
    projectSummary: 'Too short',
  });

  assert.equal(result.valid, false);
  assert.equal(result.firstInvalidField, 'name');
  assert.ok(result.fieldErrors.name);
  assert.ok(result.fieldErrors.email);
  assert.ok(result.fieldErrors.serviceArea);
  assert.ok(result.fieldErrors.projectSummary);
});

test('validateProjectInquiry accepts a complete valid project inquiry including organization', () => {
  const result = validateProjectInquiry({
    name: 'Rohan Patel',
    email: 'rohan@patelmanufacturing.in',
    organization: 'Patel Manufacturing Pvt Ltd',
    serviceArea: 'Connected Hardware / IoT System',
    budgetRange: 'Focused Prototype / Small Engagement',
    timeline: 'Starting within 2–4 weeks',
    projectSummary: 'We need an ESP32 telemetry system for three shop-floor furnaces with a web dashboard.',
  });

  assert.equal(result.valid, true);
  assert.equal(result.firstInvalidField, null);
  assert.deepEqual(result.fieldErrors, {});
});

test('validateCareerApplication validates URL protocol and project experience note', () => {
  const invalid = validateCareerApplication({
    fullName: 'Aarav Shah',
    email: 'aarav@example.com',
    roleTitle: 'IoT & Embedded Systems Intern',
    portfolioUrl: 'ftp://invalid-protocol.com',
    experienceNote: 'Built a small board.',
  });

  assert.equal(invalid.valid, false);
  assert.equal(invalid.firstInvalidField, 'portfolioUrl');
  assert.ok(invalid.fieldErrors.portfolioUrl);

  const valid = validateCareerApplication({
    fullName: 'Aarav Shah',
    email: 'aarav@example.com',
    roleTitle: 'IoT & Embedded Systems Intern',
    portfolioUrl: 'https://github.com/aaravshah',
    experienceNote: 'Designed and programmed an ESP32-based water level sensor with MQTT telemetry.',
  });

  assert.equal(valid.valid, true);
  assert.equal(valid.firstInvalidField, null);
});

test('buildProjectInquiryMailto and buildCareerApplicationMailto include all submitted fields', () => {
  const inquiryMailto = buildProjectInquiryMailto({
    name: 'Karan Mehta',
    email: 'karan@mehtalogistics.in',
    organization: 'Mehta Logistics',
    serviceArea: 'Web & Mobile Application',
    budgetRange: 'Full Product Build',
    timeline: 'Starting within 2–4 weeks',
    projectSummary: 'Need a dispatch portal and driver companion app.',
  });

  assert.ok(inquiryMailto.startsWith('mailto:info@skyars.in?subject='));
  assert.ok(decodeURIComponent(inquiryMailto).includes('Mehta Logistics'));
  assert.ok(decodeURIComponent(inquiryMailto).includes('karan@mehtalogistics.in'));

  const careerMailto = buildCareerApplicationMailto({
    fullName: 'Priya Gohil',
    email: 'priya@example.com',
    roleTitle: 'Python & Workflow Automation Intern',
    portfolioUrl: 'https://github.com/priyagohil',
    experienceNote: 'Built FastAPI document OCR pipeline.',
  });

  assert.ok(careerMailto.startsWith('mailto:info@skyars.in?subject='));
  assert.ok(decodeURIComponent(careerMailto).includes('https://github.com/priyagohil'));
});

test('filterCareerOpenings filters by category accurately', () => {
  assert.equal(filterCareerOpenings(CAREER_OPENINGS, 'All').length, 4);
  assert.equal(filterCareerOpenings(CAREER_OPENINGS, 'Hardware & IoT').length, 1);
  assert.equal(
    filterCareerOpenings(CAREER_OPENINGS, 'Hardware & IoT')[0].id,
    'iot-embedded-intern'
  );
});

test('isValidHttpUrl accepts only http and https URLs', () => {
  assert.equal(isValidHttpUrl('https://github.com/skyars'), true);
  assert.equal(isValidHttpUrl('http://skyars.in'), true);
  assert.equal(isValidHttpUrl('javascript:alert(1)'), false);
  assert.equal(isValidHttpUrl('not-a-url'), false);
});

test('computeClampedTiltRadians clamps pointer offset to ±maxDegrees in radians', () => {
  const maxDeg = 2.4;
  const maxRad = (maxDeg * Math.PI) / 180;

  assert.equal(computeClampedTiltRadians(0, maxDeg), 0);

  const posClamp = computeClampedTiltRadians(5, maxDeg);
  const negClamp = computeClampedTiltRadians(-5, maxDeg);
  assert.ok(Math.abs(posClamp - maxRad) < 1e-6);
  assert.ok(Math.abs(negClamp + maxRad) < 1e-6);
});

test('FLIGHTLINE_SVG_PATHS defines valid canonical M/C/Z paths inside the safe stage and validates 3D bounds with rotation clearance', () => {
  const entries = Object.entries(FLIGHTLINE_SVG_PATHS);
  assert.ok(entries.length >= 12);

  // Build actual extruded 3D bounding box from all 6 fill paths and verify validateFlightlineSafeBounds
  const group = new THREE.Group();

  for (const [key, pathStr] of entries) {
    const commands = parseFlightlineSvgGrammar(pathStr);
    assert.ok(commands.length >= 2, `Expected commands in ${key}`);
    assert.equal(commands[0].type, 'M', `Expected ${key} to start with M`);

    for (const cmd of commands) {
      if (cmd.type === 'M') {
        assert.ok(
          cmd.x >= 55 && cmd.x <= 305,
          `${key} M.x=${cmd.x} outside canonical wing safe X bounds (55..305)`
        );
        assert.ok(
          cmd.y >= 30 && cmd.y <= 440,
          `${key} M.y=${cmd.y} outside canonical wing safe Y bounds (30..440)`
        );
      } else if (cmd.type === 'C') {
        assert.ok(
          cmd.x >= 55 && cmd.x <= 305,
          `${key} C.x=${cmd.x} outside canonical wing safe X bounds (55..305)`
        );
        assert.ok(
          cmd.y >= 30 && cmd.y <= 440,
          `${key} C.y=${cmd.y} outside canonical wing safe Y bounds (30..440)`
        );
      }
    }

    if (key.endsWith('Fill')) {
      assert.equal(commands[commands.length - 1].type, 'Z', `Expected ${key} to close with Z`);
      const shapes = createShapesFromFlightlinePath(pathStr);
      assert.ok(shapes.length >= 1, `Expected THREE.Shape for ${key}`);
      const geom = new THREE.ExtrudeGeometry(shapes, { depth: 0.018, bevelEnabled: false });
      group.add(new THREE.Mesh(geom));
    }
  }

  const fittedBox = new THREE.Box3().setFromObject(group);
  const boundsResult = validateFlightlineSafeBounds(fittedBox, MAX_ALLOWED_TILT_DEG);
  assert.equal(boundsResult.valid, true, '3D extruded wing must stay inside SAFE_STAGE_MIN_X..SAFE_STAGE_MAX_X and clear the callout rail');
  assert.ok(boundsResult.maxX <= boundsResult.safeMaxX, 'Wing maxX must not exceed safeMaxX');
  assert.ok(boundsResult.maxX < boundsResult.calloutRailX, 'Wing maxX must stay strictly left of calloutRailX');

  // Verify that an out-of-bounds box encroaching on SAFE_STAGE_MAX_X fails validation
  const encroachingBox = fittedBox.clone();
  encroachingBox.max.x = boundsResult.safeMaxX + 0.15;
  assert.equal(validateFlightlineSafeBounds(encroachingBox, MAX_ALLOWED_TILT_DEG).valid, false);

  assert.throws(() => parseFlightlineSvgGrammar('M 10 10 L 20 20'), /Unsupported SVG path command/);
});

test('Bidirectional REPLAY_VIEWPORT policies enforce once: false and SignalInterlude conduit knots align with domain nodes', () => {
  assert.equal(REPLAY_VIEWPORT.once, false);
  assert.equal(REPLAY_VIEWPORT_HERO.once, false);
  assert.equal(REPLAY_VIEWPORT_ITEM.once, false);

  // Verify CONDUIT_PATH_D starts at (12, 48), passes through (387, 16) and (773, 48), and ends at (1108, 16)
  assert.ok(CONDUIT_PATH_D.startsWith('M 12 48'));
  assert.ok(CONDUIT_PATH_D.includes('387 16'));
  assert.ok(CONDUIT_PATH_D.includes('773 48'));
  assert.ok(CONDUIT_PATH_D.endsWith('1108 16'));
});

test('Production SVG assets are strict valid XML, share canonical wing fill paths, and OG PNG raster card is 1200x630', () => {
  const rootDir = process.cwd();
  const svgFiles = [
    'public/favicon.svg',
    'public/og-card.svg',
    'public/assets/aistudio/skyars-wing-mark.svg',
  ];

  const fillKeys = [
    'blade1Fill',
    'blade2Fill',
    'blade3Fill',
    'blade4Fill',
    'baseFinFill',
    'sSpineFill',
  ] as const;

  for (const relPath of svgFiles) {
    const content = fs.readFileSync(path.join(rootDir, relPath), 'utf8');
    assert.ok(content.trim().startsWith('<svg'), `${relPath} must start with <svg`);
    assert.ok(content.trim().endsWith('</svg>'), `${relPath} must end with </svg>`);

    // Ensure no undefined HTML named entities (only standard XML entities &amp; &lt; &gt; &quot; &apos; or numeric &#...; are valid in XML)
    const entityMatches = content.match(/&([a-zA-Z0-9#]+);/g) || [];
    for (const entity of entityMatches) {
      const inner = entity.slice(1, -1);
      const isValidXmlEntity =
        inner.startsWith('#') ||
        ['amp', 'lt', 'gt', 'quot', 'apos'].includes(inner);
      assert.equal(
        isValidXmlEntity,
        true,
        `${relPath} contains invalid non-XML entity ${entity}`
      );
    }

    // Verify all 6 canonical wing fill paths in static SVG assets match FLIGHTLINE_SVG_PATHS
    for (const fillKey of fillKeys) {
      const canonicalD = FLIGHTLINE_SVG_PATHS[fillKey];
      assert.ok(
        content.includes(canonicalD),
        `${relPath} is out of sync with canonical FLIGHTLINE_SVG_PATHS.${fillKey}`
      );
    }
  }

  // Verify public/og-card.png exists, has a genuine PNG signature, and measures 1200x630
  const ogPngBuf = fs.readFileSync(path.join(rootDir, 'public/og-card.png'));
  assert.equal(
    ogPngBuf.subarray(0, 8).toString('hex'),
    '89504e470d0a1a0a',
    'public/og-card.png must have a valid PNG header signature'
  );
  const pngWidth = ogPngBuf.readUInt32BE(16);
  const pngHeight = ogPngBuf.readUInt32BE(20);
  assert.equal(pngWidth, 1200, 'public/og-card.png width must be 1200px');
  assert.equal(pngHeight, 630, 'public/og-card.png height must be 630px');

  // Verify official lockup PNG exists
  assert.equal(
    fs.existsSync(path.join(rootDir, 'public/assets/aistudio/logo_c23009d2.png')),
    true,
    'Official brand lockup PNG must exist'
  );

  // Verify index.html references https://skyars.in/og-card.png, has valid JSON-LD, and no .md files exist in public/
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  assert.ok(indexHtml.includes('content="https://skyars.in/og-card.png"'));
  assert.ok(indexHtml.includes('property="og:image:type" content="image/png"'));

  const jsonLdMatch = indexHtml.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
  );
  assert.ok(jsonLdMatch, 'index.html must include application/ld+json script');
  const parsedJsonLd = JSON.parse(jsonLdMatch[1]);
  assert.equal(parsedJsonLd.name, 'Skyars');
  assert.equal(parsedJsonLd.email, 'info@skyars.in');

  // Ensure no internal .md prompt files remain inside public/
  const checkNoMarkdownInDir = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        checkNoMarkdownInDir(full);
      } else {
        assert.equal(
          entry.name.endsWith('.md'),
          false,
          `Internal markdown file ${full} must not be inside public/`
        );
      }
    }
  };
  checkNoMarkdownInDir(path.join(rootDir, 'public'));
  if (fs.existsSync(path.join(rootDir, 'dist'))) {
    checkNoMarkdownInDir(path.join(rootDir, 'dist'));
  }
});

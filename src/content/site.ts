export type SectionId = 'services' | 'process' | 'about' | 'careers' | 'contact';

export interface NavItem {
  id: SectionId;
  label: string;
  href: `#${SectionId}`;
}

export interface ServiceOffering {
  id: string;
  title: string;
  summary: string;
  benefit: string;
  deliverables: string[];
  typicalScope: string;
}

export interface ProcessStep {
  stepNumber: string;
  title: string;
  summary: string;
  outcome: string;
}

export type CareerCategory = 'All' | 'Software' | 'Hardware & IoT' | 'AI & Automation';

export interface CareerOpening {
  id: string;
  title: string;
  category: Exclude<CareerCategory, 'All'>;
  location: string;
  engagement: string;
  summary: string;
  focusAreas: string[];
}

export const SITE_META = {
  brandName: 'Skyars',
  tagline: 'We Build Beyond the Bars',
  domain: 'skyars.in',
  email: 'info@skyars.in',
  location: 'Bhavnagar, Gujarat, India',
  heroHeadline: 'Software, connected hardware, and workflow systems built around your business.',
  heroSubheadline:
    'Skyars partners with founders and operating teams to design, build, and maintain reliable web and mobile applications, connected IoT devices, and practical AI-assisted workflows.',
} as const;

export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'services', label: 'Services', href: '#services' },
  { id: 'process', label: 'Process', href: '#process' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'careers', label: 'Careers', href: '#careers' },
  { id: 'contact', label: 'Contact', href: '#contact' },
] as const;

export const SERVICES: readonly ServiceOffering[] = [
  {
    id: 'web-mobile',
    title: 'Web & Mobile Product Engineering',
    summary:
      'Custom web applications, customer portals, and cross-platform mobile apps designed around clear user journeys and maintainable codebases.',
    benefit:
      'Replace fragmented spreadsheets or legacy tools with a single, well-tested application your team and customers can rely on daily.',
    deliverables: [
      'Responsive web applications and internal operations dashboards',
      'Cross-platform iOS and Android applications (React Native / Flutter)',
      'Backend APIs, relational data modeling, and role-based access control',
    ],
    typicalScope: 'New product builds, portal modernization, and API integrations',
  },
  {
    id: 'smart-iot',
    title: 'Connected Hardware & IoT Systems',
    summary:
      'End-to-end engineering connecting embedded microcontrollers and industrial sensors to cloud dashboards and mobile control apps.',
    benefit:
      'Gain direct visibility and control over field equipment, environmental sensors, and smart hardware products without manual data collection.',
    deliverables: [
      'Embedded firmware for ESP32, STM32, and custom microcontroller boards',
      'MQTT, HTTP, and BLE device-to-cloud communication pipelines',
      'Enclosure CAD prototyping and monitoring interfaces',
    ],
    typicalScope: 'Smart product prototypes, sensor networks, and equipment monitoring',
  },
  {
    id: 'ai-automation',
    title: 'Applied AI & Workflow Automation',
    summary:
      'Practical software automation, document extraction pipelines, and LLM-assisted tools integrated directly into your existing business software.',
    benefit:
      'Reduce repetitive manual data entry, triage, and reporting so your staff can focus on higher-judgment work.',
    deliverables: [
      'Automated data pipelines, webhook integrations, and scheduled jobs',
      'Document parsing, classification, and internal knowledge search tools',
      'Custom Python and TypeScript integration services with audit logging',
    ],
    typicalScope: 'Back-office automation, internal search tools, and API orchestration',
  },
  {
    id: 'mvp-scoping',
    title: 'Product Scoping & Rapid Prototyping',
    summary:
      'Focused technical discovery and working MVPs built to validate product assumptions with real users before committing to a larger rollout.',
    benefit:
      'Clarify technical feasibility, architecture trade-offs, and delivery milestones early so your budget goes toward proven priorities.',
    deliverables: [
      'System architecture specification and database schema design',
      'Clickable UI workflows and core-feature functional MVP',
      'Deployment setup, source repository handover, and technical documentation',
    ],
    typicalScope: 'Early-stage founder MVPs, proof-of-concept builds, and technical audits',
  },
] as const;

export const PROCESS_STEPS: readonly ProcessStep[] = [
  {
    stepNumber: '01',
    title: 'Scope & Technical Discovery',
    summary:
      'We start by reviewing your current workflow, business goals, and technical constraints. Together we define what needs to be built first and what can wait.',
    outcome: 'Written scope document, architecture outline, and milestone plan.',
  },
  {
    stepNumber: '02',
    title: 'System & Interface Design',
    summary:
      'Before writing production code, we map out data models, API contracts, hardware interfaces, and screen flows so every edge case is addressed early.',
    outcome: 'Approved data schema, screen layouts, and integration specification.',
  },
  {
    stepNumber: '03',
    title: 'Iterative Engineering',
    summary:
      'We build in structured milestones with regular working demos on a staging environment. You see real software progress and can provide direct feedback throughout.',
    outcome: 'Tested application code, automated checks, and staging deployments.',
  },
  {
    stepNumber: '04',
    title: 'Launch & Clean Handover',
    summary:
      'We deploy to your production environment, verify operational readiness, and provide clear documentation—whether we continue supporting you or hand off to your in-house team.',
    outcome: 'Production release, repository ownership, and operational runbook.',
  },
] as const;

export const CAREER_CATEGORIES: readonly CareerCategory[] = [
  'All',
  'Software',
  'Hardware & IoT',
  'AI & Automation',
] as const;

export const CAREER_OPENINGS: readonly CareerOpening[] = [
  {
    id: 'fullstack-web-intern',
    title: 'Full-Stack Web Engineering Intern / Junior Developer',
    category: 'Software',
    location: 'Bhavnagar, Gujarat (On-site / Hybrid)',
    engagement: 'Internship / Early-Career Track',
    summary:
      'Work alongside our engineering team to build responsive React/TypeScript interfaces, REST APIs, and relational database schemas for client and internal projects.',
    focusAreas: ['React & TypeScript', 'Node.js & PostgreSQL', 'HTML/CSS Accessibility'],
  },
  {
    id: 'mobile-app-intern',
    title: 'Cross-Platform Mobile Development Intern',
    category: 'Software',
    location: 'Bhavnagar, Gujarat (On-site / Hybrid)',
    engagement: 'Internship / Early-Career Track',
    summary:
      'Contribute to iOS and Android client applications, offline state handling, and hardware companion apps.',
    focusAreas: ['React Native or Flutter', 'REST & BLE Integration', 'Mobile UI Polish'],
  },
  {
    id: 'iot-embedded-intern',
    title: 'IoT & Embedded Systems Intern',
    category: 'Hardware & IoT',
    location: 'Bhavnagar, Gujarat (On-site)',
    engagement: 'Internship / Practical Lab Track',
    summary:
      'Assist in prototyping microcontroller firmware, sensor interfacing, enclosure layouts, and MQTT device communication.',
    focusAreas: ['ESP32 / Arduino / C++', 'Sensor Interfacing & PCB Basics', 'MQTT & Serial Debugging'],
  },
  {
    id: 'python-automation-intern',
    title: 'Python & Workflow Automation Intern',
    category: 'AI & Automation',
    location: 'Bhavnagar, Gujarat (On-site / Hybrid)',
    engagement: 'Internship / Early-Career Track',
    summary:
      'Build data processing scripts, API connectors, and practical LLM workflow utilities with clear validation and testing.',
    focusAreas: ['Python & FastAPI', 'API & Webhook Integration', 'Structured Data Extraction'],
  },
] as const;

export const SERVICE_AREA_OPTIONS = [
  'Web & Mobile Application',
  'Connected Hardware / IoT System',
  'Applied AI & Workflow Automation',
  'Product Scoping / Rapid Prototype',
  'General Technical Consultation',
] as const;

export const BUDGET_OPTIONS = [
  'To be discussed after initial scoping',
  'Focused Prototype / Small Engagement',
  'Full Product Build',
  'Ongoing Engineering Partnership',
] as const;

export const TIMELINE_OPTIONS = [
  'Exploring options / Flexible',
  'Starting within 2–4 weeks',
  'Immediate priority',
] as const;

import type { CareerCategory, CareerOpening } from '../content/site';

export interface ProjectInquiryInput {
  name: string;
  email: string;
  organization: string;
  serviceArea: string;
  budgetRange: string;
  timeline: string;
  projectSummary: string;
}

export type ProjectInquiryField = keyof ProjectInquiryInput;

export interface ValidationResult<FieldKey extends string> {
  valid: boolean;
  fieldErrors: Partial<Record<FieldKey, string>>;
  firstInvalidField: FieldKey | null;
}

export interface CareerApplicationInput {
  fullName: string;
  email: string;
  roleTitle: string;
  portfolioUrl: string;
  experienceNote: string;
}

export type CareerApplicationField = keyof CareerApplicationInput;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateProjectInquiry(
  input: ProjectInquiryInput
): ValidationResult<ProjectInquiryField> {
  const fieldErrors: Partial<Record<ProjectInquiryField, string>> = {};
  const orderedFields: ProjectInquiryField[] = [
    'name',
    'email',
    'organization',
    'serviceArea',
    'budgetRange',
    'timeline',
    'projectSummary',
  ];

  const name = (input.name ?? '').trim();
  const email = (input.email ?? '').trim();
  const organization = (input.organization ?? '').trim();
  const serviceArea = (input.serviceArea ?? '').trim();
  const projectSummary = (input.projectSummary ?? '').trim();

  if (name.length < 2) {
    fieldErrors.name = 'Please enter your name (at least 2 characters).';
  } else if (name.length > 120) {
    fieldErrors.name = 'Name must be 120 characters or fewer.';
  }

  if (!email) {
    fieldErrors.email = 'Please enter a valid email address so we can reply.';
  } else if (!EMAIL_PATTERN.test(email) || email.length > 160) {
    fieldErrors.email = 'Please enter a valid email address (for example, name@company.com).';
  }

  if (organization.length > 140) {
    fieldErrors.organization = 'Organization name must be 140 characters or fewer.';
  }

  if (!serviceArea) {
    fieldErrors.serviceArea = 'Please select the primary area you would like to discuss.';
  }

  if (projectSummary.length < 20) {
    fieldErrors.projectSummary =
      'Please share a short project summary (at least 20 characters) describing your goals.';
  } else if (projectSummary.length > 3000) {
    fieldErrors.projectSummary = 'Project summary must be 3,000 characters or fewer.';
  }

  const firstInvalidField = orderedFields.find((field) => Boolean(fieldErrors[field])) ?? null;

  return {
    valid: firstInvalidField === null,
    fieldErrors,
    firstInvalidField,
  };
}

export function validateCareerApplication(
  input: CareerApplicationInput
): ValidationResult<CareerApplicationField> {
  const fieldErrors: Partial<Record<CareerApplicationField, string>> = {};
  const orderedFields: CareerApplicationField[] = [
    'fullName',
    'email',
    'roleTitle',
    'portfolioUrl',
    'experienceNote',
  ];

  const fullName = (input.fullName ?? '').trim();
  const email = (input.email ?? '').trim();
  const roleTitle = (input.roleTitle ?? '').trim();
  const portfolioUrl = (input.portfolioUrl ?? '').trim();
  const experienceNote = (input.experienceNote ?? '').trim();

  if (fullName.length < 2) {
    fieldErrors.fullName = 'Please enter your full name (at least 2 characters).';
  } else if (fullName.length > 120) {
    fieldErrors.fullName = 'Full name must be 120 characters or fewer.';
  }

  if (!email || !EMAIL_PATTERN.test(email) || email.length > 160) {
    fieldErrors.email = 'Please enter a valid email address.';
  }

  if (!roleTitle) {
    fieldErrors.roleTitle = 'Please select a role or internship track.';
  }

  if (!portfolioUrl) {
    fieldErrors.portfolioUrl =
      'Please provide a GitHub, portfolio, or LinkedIn URL starting with https://.';
  } else if (!isValidHttpUrl(portfolioUrl) || portfolioUrl.length > 300) {
    fieldErrors.portfolioUrl = 'Please enter a complete URL starting with https:// or http://.';
  }

  if (experienceNote.length < 20) {
    fieldErrors.experienceNote =
      'Please briefly describe a project you have built or worked on (at least 20 characters).';
  } else if (experienceNote.length > 2500) {
    fieldErrors.experienceNote = 'Note must be 2,500 characters or fewer.';
  }

  const firstInvalidField = orderedFields.find((field) => Boolean(fieldErrors[field])) ?? null;

  return {
    valid: firstInvalidField === null,
    fieldErrors,
    firstInvalidField,
  };
}

export function buildProjectInquiryMailto(
  input: ProjectInquiryInput,
  recipientEmail = 'info@skyars.in'
): string {
  const subject = `[Project Inquiry] ${input.serviceArea || 'Software / IoT'} — ${
    input.organization?.trim() ? `${input.name.trim()} (${input.organization.trim()})` : input.name.trim()
  }`;

  const bodyLines = [
    'Hello Skyars team,',
    '',
    'I would like to discuss a project with Skyars:',
    '',
    `Name: ${input.name.trim()}`,
    `Email: ${input.email.trim()}`,
    `Organization: ${input.organization.trim() || 'Not specified'}`,
    `Service Area: ${input.serviceArea.trim()}`,
    `Estimated Scope / Budget: ${input.budgetRange.trim() || 'To be discussed'}`,
    `Target Timeline: ${input.timeline.trim() || 'Flexible'}`,
    '',
    'Project Summary & Goals:',
    input.projectSummary.trim(),
  ];

  return `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    bodyLines.join('\n')
  )}`;
}

export function buildCareerApplicationMailto(
  input: CareerApplicationInput,
  recipientEmail = 'info@skyars.in'
): string {
  const subject = `[Career / Internship Inquiry] ${input.roleTitle.trim()} — ${input.fullName.trim()}`;

  const bodyLines = [
    'Hello Skyars team,',
    '',
    `I am writing to apply for the ${input.roleTitle.trim()} track at Skyars in Bhavnagar.`,
    '',
    `Full Name: ${input.fullName.trim()}`,
    `Email: ${input.email.trim()}`,
    `Role / Track: ${input.roleTitle.trim()}`,
    `GitHub / Portfolio URL: ${input.portfolioUrl.trim()}`,
    '',
    'Relevant Project & Experience Summary:',
    input.experienceNote.trim(),
  ];

  return `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    bodyLines.join('\n')
  )}`;
}

export function filterCareerOpenings(
  openings: readonly CareerOpening[],
  category: CareerCategory
): CareerOpening[] {
  if (category === 'All') {
    return [...openings];
  }
  return openings.filter((item) => item.category === category);
}

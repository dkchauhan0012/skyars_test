import React, { useMemo, useRef, useState } from 'react';
import { ArrowUpRight, ExternalLink, Mail } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import {
  CAREER_CATEGORIES,
  CAREER_OPENINGS,
  SITE_META,
  type CareerCategory,
} from '../content/site';
import {
  buildCareerApplicationMailto,
  filterCareerOpenings,
  validateCareerApplication,
  type CareerApplicationField,
  type CareerApplicationInput,
} from '../utils/inquiryValidation';
import { Button } from '../components/site/Button';
import { FlightlineMark } from '../components/brand/FlightlineMark';
import {
  REPLAY_VIEWPORT,
  REPLAY_VIEWPORT_ITEM,
  activeRailTransition,
  revealGroup,
  revealLine,
  revealSection,
} from '../motion/variants';

interface ApplicationSubmissionResult {
  applicationId: string;
  deliveryMode: 'webhook' | 'mailto-required';
  mailtoUrl: string;
  message: string;
}

export const Careers: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [selectedCategory, setSelectedCategory] = useState<CareerCategory>('All');
  const [formState, setFormState] = useState<CareerApplicationInput>({
    fullName: '',
    email: '',
    roleTitle: CAREER_OPENINGS[0].title,
    portfolioUrl: '',
    experienceNote: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<CareerApplicationField, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<ApplicationSubmissionResult | null>(null);

  const formHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const fullNameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const roleTitleRef = useRef<HTMLSelectElement | null>(null);
  const portfolioUrlRef = useRef<HTMLInputElement | null>(null);
  const experienceNoteRef = useRef<HTMLTextAreaElement | null>(null);

  const focusCareerField = (field: CareerApplicationField) => {
    switch (field) {
      case 'fullName':
        fullNameRef.current?.focus();
        break;
      case 'email':
        emailRef.current?.focus();
        break;
      case 'roleTitle':
        roleTitleRef.current?.focus();
        break;
      case 'portfolioUrl':
        portfolioUrlRef.current?.focus();
        break;
      case 'experienceNote':
        experienceNoteRef.current?.focus();
        break;
    }
  };

  const filteredOpenings = useMemo(
    () => filterCareerOpenings(CAREER_OPENINGS, selectedCategory),
    [selectedCategory]
  );

  const handleSelectRoleForApplication = (roleTitle: string) => {
    setFormState((prev) => ({ ...prev, roleTitle }));
    setSubmissionResult(null);
    setSubmitError(null);
    formHeadingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      fullNameRef.current?.focus();
    }, 150);
  };

  const handleFieldChange = (
    field: CareerApplicationField,
    value: string
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleApplicationSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const validation = validateCareerApplication(formState);
    if (!validation.valid) {
      setFieldErrors(validation.fieldErrors);
      if (validation.firstInvalidField) {
        focusCareerField(validation.firstInvalidField);
      }
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        fieldErrors?: Partial<Record<CareerApplicationField, string>>;
        firstInvalidField?: CareerApplicationField;
        applicationId?: string;
        deliveryMode?: 'webhook' | 'mailto-required';
        mailtoUrl?: string;
        message?: string;
      };

      if (!response.ok) {
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
          if (data.firstInvalidField) {
            focusCareerField(data.firstInvalidField);
          }
        }
        setSubmitError(
          data.error ||
            `Could not complete submission automatically. You can email your application directly to ${SITE_META.email}.`
        );
        return;
      }

      setSubmissionResult({
        applicationId: data.applicationId || 'app_prepared',
        deliveryMode: data.deliveryMode || 'mailto-required',
        mailtoUrl: data.mailtoUrl || buildCareerApplicationMailto(formState),
        message:
          data.message ||
          `Your application details have been validated. Please use the email button below to send your application to ${SITE_META.email}.`,
      });
    } catch {
      setSubmitError(
        `Network error while validating application. Your entries are preserved below, or you can send them directly via ${SITE_META.email}.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="careers" aria-labelledby="careers-heading" className="site-section bg-[var(--color-bg)]">
      <div className="site-container">
        <motion.div
          variants={revealGroup}
          initial={prefersReducedMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={REPLAY_VIEWPORT}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-end mb-10"
        >
          <div className="lg:col-span-7 space-y-3">
            <motion.div variants={revealSection} className="flex items-center gap-2.5">
              <FlightlineMark variant="slash" className="h-3.5 w-6 text-[var(--color-accent)]" />
              <p className="type-label">Careers &amp; Internships</p>
            </motion.div>
            <h2
              id="careers-heading"
              aria-label="Early-career engineering and practical internships in Bhavnagar."
              className="type-h2"
            >
              <span aria-hidden="true" className="block overflow-hidden pb-1">
                <motion.span variants={revealLine} className="block">
                  Early-career engineering &amp;
                </motion.span>
              </span>
              <span aria-hidden="true" className="block overflow-hidden pb-1">
                <motion.span variants={revealLine} className="block text-[var(--color-metal)]">
                  practical internships in Bhavnagar.
                </motion.span>
              </span>
            </h2>
          </div>

          <motion.p variants={revealSection} className="lg:col-span-5 type-body">
            We welcome applications from students and developers who enjoy building real web,
            mobile, IoT, and automation projects. Select a track below to review focus areas or
            prepare an application for our team.
          </motion.p>
        </motion.div>

        {/* Segmented Text Filter Bar with Shared-Layout Flightline Active Rail */}
        <div
          role="group"
          aria-label="Filter career tracks by discipline"
          className="flex flex-wrap gap-6 border-b border-[var(--color-border)] mb-10"
        >
          {CAREER_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedCategory(category)}
                className={`relative pb-3 font-display text-xs font-semibold uppercase tracking-[0.08em] transition-colors duration-150 ${
                  isSelected
                    ? 'text-[var(--color-text)]'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {category}
                {isSelected && (
                  <motion.span
                    layoutId={prefersReducedMotion ? undefined : 'careers-filter-rail'}
                    transition={activeRailTransition}
                    aria-hidden="true"
                    className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[var(--color-accent)] [clip-path:polygon(0_0,100%_0,calc(100%-4px)_100%,0_100%)]"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Open Editorial Track Listings */}
          <ul
            className="lg:col-span-7 divide-y divide-[var(--color-border)] border-b border-[var(--color-border)]"
            aria-label="Open engineering and internship tracks"
          >
            {filteredOpenings.map((opening) => {
              const isSelectedTrack = formState.roleTitle === opening.title;
              return (
                <motion.li
                  key={opening.id}
                  layout={prefersReducedMotion ? false : 'position'}
                  variants={revealSection}
                  initial={prefersReducedMotion ? false : 'hidden'}
                  whileInView="visible"
                  viewport={REPLAY_VIEWPORT_ITEM}
                  className="group py-7 first:pt-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="font-display text-xs font-medium uppercase tracking-[0.06em] text-[var(--color-accent-hover)]">
                      {opening.category} &middot; {opening.engagement}
                    </span>
                    <span className="text-xs text-[var(--color-muted)]">{opening.location}</span>
                  </div>

                  <h3 className="type-h3 text-[var(--color-text)] mb-2 group-hover:text-[var(--color-accent-hover)] transition-colors duration-150">
                    {opening.title}
                  </h3>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-5">
                    {opening.summary}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <ul
                      className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[var(--color-text)]/90"
                      aria-label="Core technical focus areas"
                    >
                      {opening.focusAreas.map((area) => (
                        <li key={area} className="inline-flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="h-1 w-2 bg-[var(--color-accent)]"
                          />
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      type="button"
                      variant={isSelectedTrack ? 'primary' : 'secondary'}
                      onClick={() => handleSelectRoleForApplication(opening.title)}
                      className="px-4 py-2 text-xs"
                    >
                      {isSelectedTrack ? 'Selected for application' : 'Apply for this track'}
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                </motion.li>
              );
            })}
          </ul>

          {/* Truthful Single-Surface Application Form */}
          <div className="lg:col-span-5 border border-[var(--color-border)] bg-[var(--color-field)] p-6 md:p-8">
            <h3
              ref={formHeadingRef}
              tabIndex={-1}
              className="type-h3 text-[var(--color-text)] mb-2"
            >
              Submit an internship or career inquiry
            </h3>
            <p className="text-xs text-[var(--color-muted)] mb-6 leading-relaxed">
              Complete the fields below to validate your application details. If no external ATS
              webhook is configured on this server, we will prepare a pre-formatted email so you can
              send it directly to <strong className="text-[var(--color-text)]">{SITE_META.email}</strong>.
            </p>

            {submissionResult ? (
              <div
                role="status"
                aria-live="polite"
                className="space-y-4 border-t border-[var(--color-border)] pt-6"
              >
                <p className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-accent-hover)]">
                  {submissionResult.deliveryMode === 'webhook'
                    ? 'Application Forwarded'
                    : 'Step 2 Required: Complete Email Delivery'}
                </p>
                <p className="text-sm text-[var(--color-text)] leading-relaxed">
                  {submissionResult.message}
                </p>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Button
                    href={submissionResult.mailtoUrl}
                    variant="primary"
                    className="w-full sm:w-auto"
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    Send Application via Email
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setSubmissionResult(null)}
                  >
                    Edit details
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplicationSubmit} noValidate className="space-y-4">
                {submitError && (
                  <div
                    role="alert"
                    className="border-l-2 border-[var(--color-error)] bg-[var(--color-error-bg)] p-3.5 text-xs text-[var(--color-error)] space-y-2"
                  >
                    <p>{submitError}</p>
                    <a
                      href={buildCareerApplicationMailto(formState)}
                      className="inline-flex items-center gap-1.5 font-semibold underline text-[var(--color-text)]"
                    >
                      Open direct email to {SITE_META.email}
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="career-fullName"
                    className="block text-xs font-medium text-[var(--color-text)] mb-1.5"
                  >
                    Full name <span className="text-[var(--color-accent-hover)]">*</span>
                  </label>
                  <input
                    ref={fullNameRef}
                    id="career-fullName"
                    name="fullName"
                    type="text"
                    required
                    minLength={2}
                    maxLength={120}
                    autoComplete="name"
                    value={formState.fullName}
                    onChange={(e) => handleFieldChange('fullName', e.target.value)}
                    aria-invalid={Boolean(fieldErrors.fullName)}
                    aria-describedby={fieldErrors.fullName ? 'career-fullName-error' : undefined}
                    className="field-input"
                    placeholder="Your full name"
                  />
                  {fieldErrors.fullName && (
                    <p id="career-fullName-error" className="mt-1 text-xs text-[var(--color-error)]">
                      {fieldErrors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="career-email"
                    className="block text-xs font-medium text-[var(--color-text)] mb-1.5"
                  >
                    Email address <span className="text-[var(--color-accent-hover)]">*</span>
                  </label>
                  <input
                    ref={emailRef}
                    id="career-email"
                    name="email"
                    type="email"
                    required
                    maxLength={160}
                    autoComplete="email"
                    value={formState.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? 'career-email-error' : undefined}
                    className="field-input"
                    placeholder="you@example.com"
                  />
                  {fieldErrors.email && (
                    <p id="career-email-error" className="mt-1 text-xs text-[var(--color-error)]">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="career-roleTitle"
                    className="block text-xs font-medium text-[var(--color-text)] mb-1.5"
                  >
                    Selected track <span className="text-[var(--color-accent-hover)]">*</span>
                  </label>
                  <select
                    ref={roleTitleRef}
                    id="career-roleTitle"
                    name="roleTitle"
                    required
                    value={formState.roleTitle}
                    onChange={(e) => handleFieldChange('roleTitle', e.target.value)}
                    aria-invalid={Boolean(fieldErrors.roleTitle)}
                    aria-describedby={fieldErrors.roleTitle ? 'career-roleTitle-error' : undefined}
                    className="field-input"
                  >
                    {CAREER_OPENINGS.map((opening) => (
                      <option key={opening.id} value={opening.title}>
                        {opening.title}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.roleTitle && (
                    <p id="career-roleTitle-error" className="mt-1 text-xs text-[var(--color-error)]">
                      {fieldErrors.roleTitle}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="career-portfolioUrl"
                    className="block text-xs font-medium text-[var(--color-text)] mb-1.5"
                  >
                    GitHub, portfolio, or LinkedIn URL{' '}
                    <span className="text-[var(--color-accent-hover)]">*</span>
                  </label>
                  <input
                    ref={portfolioUrlRef}
                    id="career-portfolioUrl"
                    name="portfolioUrl"
                    type="url"
                    required
                    maxLength={300}
                    autoComplete="url"
                    value={formState.portfolioUrl}
                    onChange={(e) => handleFieldChange('portfolioUrl', e.target.value)}
                    aria-invalid={Boolean(fieldErrors.portfolioUrl)}
                    aria-describedby={
                      fieldErrors.portfolioUrl ? 'career-portfolioUrl-error' : undefined
                    }
                    className="field-input"
                    placeholder="https://github.com/yourusername"
                  />
                  {fieldErrors.portfolioUrl && (
                    <p id="career-portfolioUrl-error" className="mt-1 text-xs text-[var(--color-error)]">
                      {fieldErrors.portfolioUrl}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="career-experienceNote"
                    className="block text-xs font-medium text-[var(--color-text)] mb-1.5"
                  >
                    Project or coursework summary{' '}
                    <span className="text-[var(--color-accent-hover)]">*</span>
                  </label>
                  <textarea
                    ref={experienceNoteRef}
                    id="career-experienceNote"
                    name="experienceNote"
                    rows={3}
                    required
                    minLength={20}
                    maxLength={2500}
                    value={formState.experienceNote}
                    onChange={(e) => handleFieldChange('experienceNote', e.target.value)}
                    aria-invalid={Boolean(fieldErrors.experienceNote)}
                    aria-describedby={
                      fieldErrors.experienceNote ? 'career-experienceNote-error' : undefined
                    }
                    className="field-input"
                    placeholder="Briefly describe a software or hardware project you have built..."
                  />
                  {fieldErrors.experienceNote && (
                    <p
                      id="career-experienceNote-error"
                      className="mt-1 text-xs text-[var(--color-error)]"
                    >
                      {fieldErrors.experienceNote}
                    </p>
                  )}
                </div>

                <Button type="submit" variant="primary" disabled={submitting} className="w-full">
                  {submitting ? 'Validating application...' : 'Continue to Send Application'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, ExternalLink, Mail } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import {
  BUDGET_OPTIONS,
  SERVICE_AREA_OPTIONS,
  SITE_META,
  TIMELINE_OPTIONS,
} from '../content/site';
import {
  buildProjectInquiryMailto,
  validateProjectInquiry,
  type ProjectInquiryField,
  type ProjectInquiryInput,
} from '../utils/inquiryValidation';
import { Button } from '../components/site/Button';
import { FlightlineMark } from '../components/brand/FlightlineMark';
import {
  REPLAY_VIEWPORT,
  revealGroup,
  revealLine,
  revealSection,
} from '../motion/variants';

interface InquirySubmissionResult {
  inquiryId: string;
  deliveryMode: 'webhook' | 'mailto-required';
  mailtoUrl: string;
  message: string;
}

export const Contact: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [formState, setFormState] = useState<ProjectInquiryInput>({
    name: '',
    email: '',
    organization: '',
    serviceArea: SERVICE_AREA_OPTIONS[0],
    budgetRange: BUDGET_OPTIONS[0],
    timeline: TIMELINE_OPTIONS[0],
    projectSummary: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ProjectInquiryField, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<InquirySubmissionResult | null>(null);

  // Clipboard state with honest promise handling and timeout cleanup
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const copyTimeoutRef = useRef<number | null>(null);

  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const organizationRef = useRef<HTMLInputElement | null>(null);
  const serviceAreaRef = useRef<HTMLSelectElement | null>(null);
  const budgetRangeRef = useRef<HTMLSelectElement | null>(null);
  const timelineRef = useRef<HTMLSelectElement | null>(null);
  const projectSummaryRef = useRef<HTMLTextAreaElement | null>(null);

  const focusInquiryField = (field: ProjectInquiryField) => {
    switch (field) {
      case 'name':
        nameRef.current?.focus();
        break;
      case 'email':
        emailRef.current?.focus();
        break;
      case 'organization':
        organizationRef.current?.focus();
        break;
      case 'serviceArea':
        serviceAreaRef.current?.focus();
        break;
      case 'budgetRange':
        budgetRangeRef.current?.focus();
        break;
      case 'timeline':
        timelineRef.current?.focus();
        break;
      case 'projectSummary':
        projectSummaryRef.current?.focus();
        break;
    }
  };

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleCopyEmail = async () => {
    if (copyTimeoutRef.current !== null) {
      window.clearTimeout(copyTimeoutRef.current);
    }

    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
      setCopyState('failed');
      return;
    }

    try {
      await navigator.clipboard.writeText(SITE_META.email);
      setCopyState('copied');
      copyTimeoutRef.current = window.setTimeout(() => {
        setCopyState('idle');
      }, 3000);
    } catch {
      setCopyState('failed');
    }
  };

  const handleFieldChange = (field: ProjectInquiryField, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const validation = validateProjectInquiry(formState);
    if (!validation.valid) {
      setFieldErrors(validation.fieldErrors);
      if (validation.firstInvalidField) {
        focusInquiryField(validation.firstInvalidField);
      }
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        fieldErrors?: Partial<Record<ProjectInquiryField, string>>;
        firstInvalidField?: ProjectInquiryField;
        inquiryId?: string;
        deliveryMode?: 'webhook' | 'mailto-required';
        mailtoUrl?: string;
        message?: string;
      };

      if (!response.ok) {
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
          if (data.firstInvalidField) {
            focusInquiryField(data.firstInvalidField);
          }
        }
        setSubmitError(
          data.error ||
            `Unable to process the inquiry automatically. Please use the direct email link to reach ${SITE_META.email}.`
        );
        return;
      }

      setSubmissionResult({
        inquiryId: data.inquiryId || 'inq_prepared',
        deliveryMode: data.deliveryMode || 'mailto-required',
        mailtoUrl: data.mailtoUrl || buildProjectInquiryMailto(formState),
        message:
          data.message ||
          `Your project inquiry has been validated. Please click the button below to send it via your email client to ${SITE_META.email}.`,
      });
    } catch {
      setSubmitError(
        `Network request failed. Your form entries are preserved below, or you can email us directly at ${SITE_META.email}.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="site-section bg-[var(--color-field)]"
    >
      <div className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          {/* Left Column: Direct Contact Context & Flightline Counterweight */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div
              variants={revealGroup}
              initial={prefersReducedMotion ? false : 'hidden'}
              whileInView="visible"
              viewport={REPLAY_VIEWPORT}
              className="space-y-3"
            >
              <motion.div variants={revealSection} className="flex items-center gap-2.5">
                <FlightlineMark variant="slash" className="h-3.5 w-6 text-[var(--color-accent)]" />
                <p className="type-label">Start a Conversation</p>
              </motion.div>
              <h2
                id="contact-heading"
                aria-label="Tell us what you are building or improving."
                className="type-h2"
              >
                <span aria-hidden="true" className="block overflow-hidden pb-1">
                  <motion.span variants={revealLine} className="block">
                    Tell us what you are
                  </motion.span>
                </span>
                <span aria-hidden="true" className="block overflow-hidden pb-1">
                  <motion.span variants={revealLine} className="block text-[var(--color-metal)]">
                    building or improving.
                  </motion.span>
                </span>
              </h2>
              <motion.p variants={revealSection} className="type-body">
                Share a brief overview of your project, timeline, and technical goals. Whether you
                have a complete specification or a rough operational problem, we will help clarify
                a practical next step.
              </motion.p>
            </motion.div>

            <div className="border-t border-[var(--color-border)] pt-6 space-y-5">
              <div>
                <h3 className="font-display text-xs font-medium uppercase tracking-[0.06em] text-[var(--color-muted)]">
                  Direct Email
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <a
                    href={`mailto:${SITE_META.email}`}
                    className="font-display text-lg font-medium text-[var(--color-text)] underline decoration-[var(--color-accent)] underline-offset-4 hover:text-[var(--color-accent-hover)] transition-colors duration-150"
                  >
                    {SITE_META.email}
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="inline-flex items-center gap-1.5 rounded-[2px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] hover:border-[var(--color-accent-hover)] transition-colors duration-150"
                  >
                    {copyState === 'copied' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[var(--color-success)]" aria-hidden="true" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-[var(--color-muted)]" aria-hidden="true" />
                        <span>Copy address</span>
                      </>
                    )}
                  </button>
                </div>

                <div role="status" aria-live="polite" className="mt-1.5 text-xs">
                  {copyState === 'copied' && (
                    <span className="text-[var(--color-success)]">
                      Copied {SITE_META.email} to your clipboard.
                    </span>
                  )}
                  {copyState === 'failed' && (
                    <span className="text-[var(--color-error)]">
                      Clipboard access is unavailable in this browser. Please select or click{' '}
                      <a href={`mailto:${SITE_META.email}`} className="underline text-[var(--color-text)]">
                        {SITE_META.email}
                      </a>{' '}
                      directly.
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--color-divider)]">
                <h3 className="font-display text-xs font-medium uppercase tracking-[0.06em] text-[var(--color-muted)]">
                  Location
                </h3>
                <p className="mt-1 text-sm text-[var(--color-text)]">{SITE_META.location}</p>
              </div>
            </div>

            {/* Architectural Flightline Counterweight */}
            <div className="pt-4 max-w-xs opacity-90">
              <FlightlineMark variant="counterweight" />
            </div>
          </div>

          {/* Right Column: Single-Surface Project Inquiry Form */}
          <div className="lg:col-span-7 border-t-2 border-t-[var(--color-accent)] border-x border-b border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-8">
            {submissionResult ? (
              <motion.div
                role="status"
                aria-live="polite"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                className="space-y-5"
              >
                <div className="space-y-2 border-b border-[var(--color-divider)] pb-5">
                  <p className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-accent-hover)]">
                    {submissionResult.deliveryMode === 'webhook'
                      ? 'Project Inquiry Forwarded'
                      : 'Project Inquiry Validated — Send via Email Client'}
                  </p>
                  <h3 className="type-h3 text-[var(--color-text)]">
                    {submissionResult.deliveryMode === 'webhook'
                      ? 'Thank you for reaching out to Skyars.'
                      : 'Your project summary is ready to send.'}
                  </h3>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                    {submissionResult.message}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Button href={submissionResult.mailtoUrl} variant="primary">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    Open in Email Client ({SITE_META.email})
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setSubmissionResult(null)}
                  >
                    Edit inquiry details
                  </Button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="border-b border-[var(--color-divider)] pb-4">
                  <h3 className="type-h3 text-[var(--color-text)]">Project Inquiry Form</h3>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    Fields marked with <span className="text-[var(--color-accent-hover)]">*</span> are required.
                  </p>
                </div>

                {submitError && (
                  <div
                    role="alert"
                    className="border-l-2 border-[var(--color-error)] bg-[var(--color-error-bg)] p-4 text-xs text-[var(--color-error)] space-y-2"
                  >
                    <p>{submitError}</p>
                    <a
                      href={buildProjectInquiryMailto(formState)}
                      className="inline-flex items-center gap-1.5 font-semibold underline text-[var(--color-text)]"
                    >
                      Send prepared inquiry via {SITE_META.email}
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-medium text-[var(--color-text)] mb-1.5"
                    >
                      Your name <span className="text-[var(--color-accent-hover)]">*</span>
                    </label>
                    <input
                      ref={nameRef}
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      minLength={2}
                      maxLength={120}
                      autoComplete="name"
                      value={formState.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      aria-invalid={Boolean(fieldErrors.name)}
                      aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
                      className="field-input"
                      placeholder="Full name"
                    />
                    {fieldErrors.name && (
                      <p id="contact-name-error" className="mt-1.5 text-xs text-[var(--color-error)]">
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-medium text-[var(--color-text)] mb-1.5"
                    >
                      Work email <span className="text-[var(--color-accent-hover)]">*</span>
                    </label>
                    <input
                      ref={emailRef}
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      maxLength={160}
                      autoComplete="email"
                      value={formState.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
                      className="field-input"
                      placeholder="name@company.com"
                    />
                    {fieldErrors.email && (
                      <p id="contact-email-error" className="mt-1.5 text-xs text-[var(--color-error)]">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="contact-organization"
                      className="block text-xs font-medium text-[var(--color-text)] mb-1.5"
                    >
                      Company or organization <span className="text-[var(--color-muted)]">(optional)</span>
                    </label>
                    <input
                      ref={organizationRef}
                      id="contact-organization"
                      name="organization"
                      type="text"
                      maxLength={140}
                      autoComplete="organization"
                      value={formState.organization}
                      onChange={(e) => handleFieldChange('organization', e.target.value)}
                      aria-invalid={Boolean(fieldErrors.organization)}
                      aria-describedby={
                        fieldErrors.organization ? 'contact-organization-error' : undefined
                      }
                      className="field-input"
                      placeholder="Company name"
                    />
                    {fieldErrors.organization && (
                      <p
                        id="contact-organization-error"
                        className="mt-1.5 text-xs text-[var(--color-error)]"
                      >
                        {fieldErrors.organization}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-serviceArea"
                      className="block text-xs font-medium text-[var(--color-text)] mb-1.5"
                    >
                      Primary service area <span className="text-[var(--color-accent-hover)]">*</span>
                    </label>
                    <select
                      ref={serviceAreaRef}
                      id="contact-serviceArea"
                      name="serviceArea"
                      required
                      value={formState.serviceArea}
                      onChange={(e) => handleFieldChange('serviceArea', e.target.value)}
                      aria-invalid={Boolean(fieldErrors.serviceArea)}
                      aria-describedby={
                        fieldErrors.serviceArea ? 'contact-serviceArea-error' : undefined
                      }
                      className="field-input"
                    >
                      {SERVICE_AREA_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.serviceArea && (
                      <p
                        id="contact-serviceArea-error"
                        className="mt-1.5 text-xs text-[var(--color-error)]"
                      >
                        {fieldErrors.serviceArea}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="contact-budgetRange"
                      className="block text-xs font-medium text-[var(--color-text)] mb-1.5"
                    >
                      Engagement scope
                    </label>
                    <select
                      ref={budgetRangeRef}
                      id="contact-budgetRange"
                      name="budgetRange"
                      value={formState.budgetRange}
                      onChange={(e) => handleFieldChange('budgetRange', e.target.value)}
                      className="field-input"
                    >
                      {BUDGET_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-timeline"
                      className="block text-xs font-medium text-[var(--color-text)] mb-1.5"
                    >
                      Target timeline
                    </label>
                    <select
                      ref={timelineRef}
                      id="contact-timeline"
                      name="timeline"
                      value={formState.timeline}
                      onChange={(e) => handleFieldChange('timeline', e.target.value)}
                      className="field-input"
                    >
                      {TIMELINE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-projectSummary"
                    className="block text-xs font-medium text-[var(--color-text)] mb-1.5"
                  >
                    Project goals &amp; requirements{' '}
                    <span className="text-[var(--color-accent-hover)]">*</span>
                  </label>
                  <textarea
                    ref={projectSummaryRef}
                    id="contact-projectSummary"
                    name="projectSummary"
                    rows={4}
                    required
                    minLength={20}
                    maxLength={3000}
                    value={formState.projectSummary}
                    onChange={(e) => handleFieldChange('projectSummary', e.target.value)}
                    aria-invalid={Boolean(fieldErrors.projectSummary)}
                    aria-describedby={
                      fieldErrors.projectSummary ? 'contact-projectSummary-error' : undefined
                    }
                    className="field-input"
                    placeholder="Describe the problem you are solving, any existing systems or hardware involved, and what a successful outcome looks like..."
                  />
                  {fieldErrors.projectSummary && (
                    <p
                      id="contact-projectSummary-error"
                      className="mt-1.5 text-xs text-[var(--color-error)]"
                    >
                      {fieldErrors.projectSummary}
                    </p>
                  )}
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className="text-xs text-[var(--color-muted)]">
                    Validating this form prepares your inquiry for direct delivery to{' '}
                    <span className="text-[var(--color-text)]">{SITE_META.email}</span>.
                  </p>
                  <Button type="submit" variant="primary" disabled={submitting}>
                    {submitting ? 'Validating inquiry...' : 'Prepare & Send Inquiry'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

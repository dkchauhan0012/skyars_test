import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { SITE_META } from '../content/site';
import { FlightlineMark } from '../components/brand/FlightlineMark';
import {
  REPLAY_VIEWPORT,
  revealGroup,
  revealLine,
  revealSection,
} from '../motion/variants';

export const About: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="site-section bg-[var(--color-field)]"
    >
      <div className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <motion.div
            variants={revealGroup}
            initial={prefersReducedMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={REPLAY_VIEWPORT}
            className="lg:col-span-7 space-y-5"
          >
            <motion.div variants={revealSection} className="flex items-center gap-2.5">
              <FlightlineMark variant="slash" className="h-3.5 w-6 text-[var(--color-accent)]" />
              <p className="type-label">About {SITE_META.brandName}</p>
            </motion.div>
            <h2
              id="about-heading"
              aria-label="Rooted in Bhavnagar. Building dependable software and hardware systems."
              className="type-h2"
            >
              <span aria-hidden="true" className="block overflow-hidden pb-1">
                <motion.span variants={revealLine} className="block">
                  Rooted in Bhavnagar.
                </motion.span>
              </span>
              <span aria-hidden="true" className="block overflow-hidden pb-1">
                <motion.span variants={revealLine} className="block text-[var(--color-metal)]">
                  Building dependable software and hardware systems.
                </motion.span>
              </span>
            </h2>
            <motion.p variants={revealSection} className="type-body-lg">
              Skyars is a technology agency and product engineering studio based in{' '}
              {SITE_META.location}. We work with founders, growing businesses, and industrial
              operators who need custom software or connected hardware built carefully and
              documented properly.
            </motion.p>
            <motion.p variants={revealSection} className="type-body">
              Rather than separating strategy from implementation, our engineers work directly with
              you from the first technical scoping session through deployment—ensuring that what gets
              designed is practical to build, operate, and maintain over the long term.
            </motion.p>
          </motion.div>

          {/* Studio Profile with subtle static cropped canonical Flightline corner contour */}
          <motion.div
            variants={revealSection}
            initial={prefersReducedMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={REPLAY_VIEWPORT}
            className="relative lg:col-span-5 border-t-2 border-[var(--color-accent)] bg-[var(--color-bg)]/45 p-6 sm:p-7 overflow-hidden space-y-6"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -bottom-8 w-52 opacity-[0.14]"
            >
              <FlightlineMark variant="counterweight" />
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <h3 className="font-display text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text)]">
                Studio Profile
              </h3>
              <span className="font-display text-xs text-[var(--color-accent-hover)]">
                {SITE_META.domain}
              </span>
            </div>

            <dl className="relative z-10 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)] text-sm">
              <div className="py-4">
                <dt className="font-display text-xs uppercase tracking-[0.06em] text-[var(--color-muted)]">
                  Base of Operations
                </dt>
                <dd className="mt-1 font-medium text-[var(--color-text)]">{SITE_META.location}</dd>
              </div>

              <div className="py-4">
                <dt className="font-display text-xs uppercase tracking-[0.06em] text-[var(--color-muted)]">
                  Core Disciplines
                </dt>
                <dd className="mt-1 font-medium text-[var(--color-text)] leading-relaxed">
                  Web &amp; Mobile Software, Embedded IoT Hardware, Applied AI &amp; Automation
                </dd>
              </div>

              <div className="py-4">
                <dt className="font-display text-xs uppercase tracking-[0.06em] text-[var(--color-muted)]">
                  Code &amp; Handover Policy
                </dt>
                <dd className="mt-1 text-[var(--color-muted)] leading-relaxed">
                  Full repository access, clear environment setup docs, and clean handover at project
                  completion.
                </dd>
              </div>

              <div className="py-4">
                <dt className="font-display text-xs uppercase tracking-[0.06em] text-[var(--color-muted)]">
                  Direct Email
                </dt>
                <dd className="mt-1">
                  <a
                    href={`mailto:${SITE_META.email}`}
                    className="font-medium text-[var(--color-text)] underline decoration-[var(--color-accent)] underline-offset-4 hover:text-[var(--color-accent-hover)] transition-colors duration-150"
                  >
                    {SITE_META.email}
                  </a>
                </dd>
              </div>
            </dl>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

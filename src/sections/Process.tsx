import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { PROCESS_STEPS } from '../content/site';
import { FlightlineMark } from '../components/brand/FlightlineMark';
import {
  EASE_OUT_EXPO,
  REPLAY_VIEWPORT,
  revealGroup,
  revealLine,
  revealSection,
  serviceListVariants,
} from '../motion/variants';

export const Process: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className="site-section bg-[var(--color-bg)]"
    >
      <div className="site-container">
        <motion.div
          variants={revealGroup}
          initial={prefersReducedMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={REPLAY_VIEWPORT}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-end mb-12 md:mb-16"
        >
          <div className="lg:col-span-7 space-y-3">
            <motion.div variants={revealSection} className="flex items-center gap-2.5">
              <FlightlineMark variant="slash" className="h-3.5 w-6 text-[var(--color-accent)]" />
              <p className="type-label">How We Work</p>
            </motion.div>
            <h2
              id="process-heading"
              aria-label="Structured delivery from initial scope to production handover."
              className="type-h2"
            >
              <span aria-hidden="true" className="block overflow-hidden pb-1">
                <motion.span variants={revealLine} className="block">
                  Structured delivery from initial
                </motion.span>
              </span>
              <span aria-hidden="true" className="block overflow-hidden pb-1">
                <motion.span variants={revealLine} className="block text-[var(--color-metal)]">
                  scope to production handover.
                </motion.span>
              </span>
            </h2>
          </div>

          <motion.p variants={revealSection} className="lg:col-span-5 type-body">
            Good software comes from clear requirements, small milestones, and direct communication
            with the engineers writing the code.
          </motion.p>
        </motion.div>

        {/* Scroll-triggered Progress Datum Rule (replays on scroll down and scroll up) */}
        <div
          className="relative h-[1px] w-full bg-[var(--color-border)] mb-10 overflow-hidden"
          aria-hidden="true"
        >
          <motion.div
            initial={prefersReducedMotion ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={REPLAY_VIEWPORT}
            transition={{ duration: 0.85, ease: EASE_OUT_EXPO }}
            style={{ originX: 0 }}
            className="h-full w-full bg-[var(--color-accent)]"
          />
        </div>

        <motion.ol
          variants={serviceListVariants}
          initial={prefersReducedMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={REPLAY_VIEWPORT}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10"
        >
          {PROCESS_STEPS.map((step) => (
            <motion.li
              key={step.stepNumber}
              variants={revealSection}
              className="group relative flex flex-col justify-between border-t border-[var(--color-divider)] pt-5 md:border-t-0 md:border-l md:border-[var(--color-border)] hover:border-[var(--color-accent)] md:pl-6 md:pt-0 first:border-t-0 first:pt-0 transition-colors duration-150"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl font-semibold text-[var(--color-accent-hover)] tracking-tight block">
                    {step.stepNumber}
                  </span>
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-[var(--color-border)] transition-colors duration-150 group-hover:bg-[var(--color-accent-hover)]"
                  />
                </div>
                <h3 className="type-h3 text-[var(--color-text)] group-hover:text-[var(--color-accent-hover)] transition-colors duration-150">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">{step.summary}</p>
              </div>

              <p className="mt-6 pt-4 border-t border-[var(--color-divider)] group-hover:border-[var(--color-border)] transition-colors duration-150 text-xs text-[var(--color-text)]/90 leading-relaxed">
                <span className="font-display uppercase tracking-[0.06em] text-[var(--color-muted)] block mb-1">
                  Deliverable
                </span>
                {step.outcome}
              </p>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
};

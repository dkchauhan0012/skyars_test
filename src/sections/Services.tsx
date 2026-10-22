import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { SERVICES } from '../content/site';
import { FlightlineMark } from '../components/brand/FlightlineMark';
import {
  REPLAY_VIEWPORT,
  REPLAY_VIEWPORT_ITEM,
  revealGroup,
  revealLine,
  revealSection,
} from '../motion/variants';

export const Services: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="services" aria-labelledby="services-heading" className="site-section">
      <div className="site-container">
        <motion.div
          variants={revealGroup}
          initial={prefersReducedMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={REPLAY_VIEWPORT}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-end mb-12 md:mb-20"
        >
          <div className="lg:col-span-7 space-y-3">
            <motion.div variants={revealSection} className="flex items-center gap-2.5">
              <FlightlineMark variant="slash" className="h-3.5 w-6 text-[var(--color-accent)]" />
              <p className="type-label">Capabilities &amp; Deliverables</p>
            </motion.div>
            <h2
              id="services-heading"
              aria-label="Practical engineering across software, hardware, and automation."
              className="type-h2"
            >
              <span aria-hidden="true" className="block overflow-hidden pb-1">
                <motion.span variants={revealLine} className="block">
                  Practical engineering across
                </motion.span>
              </span>
              <span aria-hidden="true" className="block overflow-hidden pb-1">
                <motion.span variants={revealLine} className="block text-[var(--color-metal)]">
                  software, hardware, and automation.
                </motion.span>
              </span>
            </h2>
          </div>

          <motion.p variants={revealSection} className="lg:col-span-5 type-body">
            We focus on four core areas where software and physical operations meet. Every project
            is scoped around concrete deliverables rather than off-the-shelf templates.
          </motion.p>
        </motion.div>

        <ol className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
          {SERVICES.map((service, index) => {
            const indexLabel = String(index + 1).padStart(2, '0');
            return (
              <motion.li
                key={service.id}
                variants={revealSection}
                initial={prefersReducedMotion ? false : 'hidden'}
                whileInView="visible"
                viewport={REPLAY_VIEWPORT_ITEM}
                className="group relative py-9 sm:py-10 md:py-12 transition-colors duration-150 focus-within:bg-[var(--color-field)]/45"
              >
                {/* Right-edge tactile active/hover datum bar */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-0 top-0 bottom-0 w-[2px] bg-[var(--color-accent)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
                  {/* Left Column: Index, Title & Primary Benefit */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-xs font-semibold tracking-[0.08em] text-[var(--color-accent-hover)]">
                        {indexLabel}
                      </span>
                      <span
                        aria-hidden="true"
                        className="h-[1.5px] w-6 bg-[var(--color-border)] transition-all duration-200 group-hover:w-12 group-hover:bg-[var(--color-accent)] group-focus-within:w-12 group-focus-within:bg-[var(--color-accent)]"
                      />
                    </div>

                    <h3 className="font-display text-xl sm:text-2xl font-semibold text-[var(--color-text)] tracking-[-0.02em] group-hover:text-[var(--color-accent-hover)] group-focus-within:text-[var(--color-accent-hover)] transition-colors duration-150">
                      {service.title}
                    </h3>

                    <p className="text-sm text-[var(--color-muted)] leading-relaxed pt-1">
                      {service.benefit}
                    </p>
                  </div>

                  {/* Right Column: Summary, Deliverables & Typical Engagement */}
                  <div className="lg:col-span-7 space-y-5 sm:space-y-6 lg:pl-6 lg:border-l lg:border-[var(--color-divider)] group-hover:border-[var(--color-accent)]/50 group-focus-within:border-[var(--color-accent)]/50 transition-transform duration-200 group-hover:translate-x-0.5 group-focus-within:translate-x-0.5">
                    <p className="text-sm sm:text-base text-[var(--color-text)]/95 leading-relaxed">
                      {service.summary}
                    </p>

                    <div>
                      <h4 className="font-display text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)] mb-3">
                        What we deliver
                      </h4>
                      <ul className="grid grid-cols-1 gap-2.5 text-sm text-[var(--color-text)]">
                        {service.deliverables.map((item) => (
                          <li key={item} className="flex items-start gap-3">
                            <FlightlineMark
                              variant="slash"
                              className="mt-1.5 h-2.5 w-4 text-[var(--color-accent)] transition-transform duration-200 group-hover:translate-x-1 group-focus-within:translate-x-1"
                            />
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-[var(--color-divider)] flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--color-muted)]">
                      <p>
                        <strong className="font-medium text-[var(--color-text)]">
                          Typical engagement:
                        </strong>{' '}
                        {service.typicalScope}
                      </p>
                      <a
                        href="#contact"
                        className="inline-flex items-center gap-1 font-display font-medium text-[var(--color-accent-hover)] hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] transition-colors duration-150"
                      >
                        <span>Scope this capability</span>
                        <ArrowUpRight
                          className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          aria-hidden="true"
                        />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

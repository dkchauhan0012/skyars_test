import React, { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { FlightlineMark } from '../components/brand/FlightlineMark';
import {
  EASE_OUT_EXPO,
  REPLAY_VIEWPORT,
  pathDraw,
  revealGroup,
  revealLine,
  revealSection,
  serviceListVariants,
} from '../motion/variants';

const SIGNAL_DOMAINS = [
  {
    code: '01',
    domain: 'Interfaces',
    headline: 'Customer & Operator Software',
    description:
      'Responsive web portals, operational dashboards, and cross-platform iOS/Android apps designed around real human workflows.',
  },
  {
    code: '02',
    domain: 'Intelligence & Workflows',
    headline: 'APIs, Data & Applied AI',
    description:
      'Relational data models, automated document extraction, webhook pipelines, and internal LLM utilities that remove manual bottlenecks.',
  },
  {
    code: '03',
    domain: 'Connected Devices',
    headline: 'Embedded Firmware & IoT',
    description:
      'ESP32/STM32 microcontroller firmware, industrial sensors, and bidirectional MQTT/BLE telemetry tied directly into your software.',
  },
] as const;

/**
 * Desktop conduit path whose cubic Bézier knots pass directly through the three
 * domain column anchor nodes:
 * - Node 01: (12, 48)  [Column 1 start]
 * - Node 02: (387, 16) [Column 2 start]
 * - Node 03: (773, 48) [Column 3 start]
 * - Terminal: (1108, 16) [Column 3 end]
 */
export const CONDUIT_PATH_D =
  'M 12 48 C 150 48, 240 16, 387 16 C 534 16, 626 48, 773 48 C 910 48, 990 16, 1108 16';

export const SignalInterlude: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 85%', 'end 25%'],
  });

  // Scroll-linked progress for the single traveling signal highlight along the conduit (reverses naturally on scroll up)
  const pulseOffset = useTransform(scrollYProgress, [0.08, 0.88], [0, 0.92]);
  const mobilePulseTop = useTransform(scrollYProgress, [0.1, 0.88], ['0%', '84%']);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="signal-interlude-heading"
      className="relative border-t border-[var(--color-border)] bg-[var(--color-field)] py-16 sm:py-20 md:py-28 overflow-hidden"
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
              <p className="type-label">From Signal to System</p>
            </motion.div>
            <h2
              id="signal-interlude-heading"
              aria-label="One continuous engineering thread across screen, server, and hardware."
              className="type-h2 text-[var(--color-text)]"
            >
              <span aria-hidden="true" className="block overflow-hidden pb-1">
                <motion.span variants={revealLine} className="block">
                  One continuous engineering thread
                </motion.span>
              </span>
              <span aria-hidden="true" className="block overflow-hidden pb-1">
                <motion.span variants={revealLine} className="block text-[var(--color-metal)]">
                  across screen, server, and hardware.
                </motion.span>
              </span>
            </h2>
          </div>

          <motion.p
            variants={revealSection}
            className="lg:col-span-5 text-sm sm:text-base text-[var(--color-muted)] leading-relaxed"
          >
            Most projects stall in the handoff between frontend teams, backend integrators, and
            hardware vendors. Skyars architects all three layers under one roof in Bhavnagar.
          </motion.p>
        </motion.div>

        {/* Desktop Horizontal Swept Flightline Conduit SVG */}
        <div className="hidden md:block mb-8 overflow-hidden" aria-hidden="true">
          <svg
            data-testid="signal-conduit-svg"
            viewBox="0 0 1120 68"
            fill="none"
            className="w-full h-auto"
          >
            <defs>
              <linearGradient id="signalConduitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F5F2FA" />
                <stop offset="48%" stopColor="#C4B5FD" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>

            {/* Static Low-Contrast Structural Track */}
            <line x1="12" y1="48" x2="1108" y2="48" stroke="#262035" strokeWidth="1" />

            {/* Swept Flightline Signal Curve (replays on every viewport re-entry) */}
            <motion.path
              d={CONDUIT_PATH_D}
              stroke="url(#signalConduitGrad)"
              strokeWidth="2"
              strokeLinecap="round"
              variants={pathDraw}
              initial={prefersReducedMotion ? false : 'hidden'}
              whileInView="visible"
              viewport={REPLAY_VIEWPORT}
            />

            {/* Single scroll-linked signal pulse segment along the exact same path (reverses on scroll up) */}
            {!prefersReducedMotion && (
              <motion.path
                d={CONDUIT_PATH_D}
                stroke="#F5F2FA"
                strokeWidth="3"
                strokeLinecap="round"
                style={{
                  pathLength: 0.08,
                  pathOffset: pulseOffset,
                }}
              />
            )}

            {/* Domain 01 Anchor Node at (12, 48) */}
            <g data-testid="signal-node-01" transform="translate(12, 48)">
              <circle r="6" fill="#0B0812" stroke="#C4B5FD" strokeWidth="2" />
              <circle r="2.5" fill="#F5F2FA" />
            </g>

            {/* Domain 02 Anchor Node at (387, 16) */}
            <g data-testid="signal-node-02" transform="translate(387, 16)">
              <line x1="0" y1="6" x2="0" y2="32" stroke="#262035" strokeWidth="1" />
              <circle r="6" fill="#0B0812" stroke="#C4B5FD" strokeWidth="2" />
              <circle r="2.5" fill="#8B5CF6" />
            </g>

            {/* Domain 03 Anchor Node at (773, 48) */}
            <g data-testid="signal-node-03" transform="translate(773, 48)">
              <circle r="6" fill="#0B0812" stroke="#C4B5FD" strokeWidth="2" />
              <circle r="2.5" fill="#C4B5FD" />
            </g>

            {/* Terminal Anchor at (1108, 16) */}
            <g transform="translate(1108, 16)">
              <line x1="0" y1="4" x2="0" y2="32" stroke="#262035" strokeWidth="1" />
              <circle r="3.5" fill="#0B0812" stroke="#8B5CF6" strokeWidth="1.5" />
            </g>
          </svg>
        </div>

        {/* Three Connected Domains (with dead-center aligned vertical conduit rail on mobile) */}
        <div className="relative">
          {/* Mobile Vertical Signal Conduit centered at x=9px (left-[8px] w-[2px]) so it passes dead-center through each item's left-[3px] w-3 h-3 node */}
          <div
            aria-hidden="true"
            className="md:hidden absolute left-[8px] top-2 bottom-2 w-[2px] bg-[#262035] overflow-hidden pointer-events-none"
          >
            <motion.div
              initial={prefersReducedMotion ? false : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={REPLAY_VIEWPORT}
              transition={{ duration: 0.88, ease: EASE_OUT_EXPO }}
              style={{ originY: 0 }}
              className="w-full h-full bg-gradient-to-b from-[#F5F2FA] via-[#C4B5FD] to-[#8B5CF6]"
            />
            {!prefersReducedMotion && (
              <motion.div
                style={{ top: mobilePulseTop }}
                className="absolute left-0 w-full h-10 bg-white rounded-full"
              />
            )}
          </div>

          <motion.ol
            variants={serviceListVariants}
            initial={prefersReducedMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={REPLAY_VIEWPORT}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10"
          >
            {SIGNAL_DOMAINS.map((item, idx) => (
              <motion.li
                key={item.code}
                variants={revealSection}
                className="group relative pl-8 md:pl-0"
              >
                {/* Mobile Node Marker centered at x = 3px + 6px = 9px, matching the vertical rail at left-[8px] w-[2px] */}
                <span
                  aria-hidden="true"
                  className="md:hidden absolute left-[3px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-[#C4B5FD] bg-[#0B0812]"
                >
                  <span className="h-1 w-1 rounded-full bg-[#F5F2FA]" />
                </span>

                <div className="flex items-center justify-between gap-4 pb-3 mb-3 border-b border-[var(--color-border)] group-hover:border-[var(--color-accent)] transition-colors duration-150">
                  <span className="font-display text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-accent-hover)]">
                    {item.code} / {item.domain}
                  </span>
                  {idx < SIGNAL_DOMAINS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="hidden md:inline-block font-display text-xs text-[var(--color-muted)]"
                    >
                      &rarr;
                    </span>
                  )}
                </div>

                <h3 className="type-h3 text-[var(--color-text)] mb-2">{item.headline}</h3>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                  {item.description}
                </p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </div>
    </section>
  );
};

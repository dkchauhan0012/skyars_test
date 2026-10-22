import React, { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { SITE_META } from '../content/site';
import { Button } from '../components/site/Button';
import { FlightlineMark } from '../components/brand/FlightlineMark';
import { FlightlineHeroStage } from '../components/visual/FlightlineHeroStage';
import {
  EASE_OUT_EXPO,
  REPLAY_VIEWPORT_HERO,
  REPLAY_VIEWPORT_ITEM,
  revealGroup,
  revealLine,
  revealSection,
  serviceListVariants,
} from '../motion/variants';

const CAPABILITY_SIGNATURE_STRIP = [
  {
    index: '01',
    discipline: 'Software & Portals',
    summary: 'Customer web applications, internal operations platforms, and APIs.',
  },
  {
    index: '02',
    discipline: 'Mobile Engineering',
    summary: 'Cross-platform iOS and Android apps built for field and customer use.',
  },
  {
    index: '03',
    discipline: 'Connected Hardware / IoT',
    summary: 'ESP32/STM32 firmware, industrial sensors, and device control systems.',
  },
  {
    index: '04',
    discipline: 'AI & Workflow Automation',
    summary: 'Document extraction, webhook orchestration, and internal LLM utilities.',
  },
] as const;

const HEADLINE_ACCESSIBLE_TEXT =
  'Software, connected hardware, and workflow systems built around your business.';

const heroAccentBarVariants = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 0.52, delay: 0.18, ease: EASE_OUT_EXPO },
  },
};

export const Hero: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  // Store pointer tilt target in a mutable ref so mouse movement on the artwork stage causes zero React re-renders
  const tiltTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const wakeSceneRef = useRef<(() => void) | null>(null);

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 md:pt-16 md:pb-20 lg:pt-20 lg:pb-24 bg-[var(--color-bg)] overflow-hidden"
    >
      <div className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-8 items-center">
          {/* Left Column: Asymmetrical Editorial Proposition with Bidirectional Viewport Replay */}
          <motion.div
            variants={revealGroup}
            initial={prefersReducedMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={REPLAY_VIEWPORT_HERO}
            className="lg:col-span-7 min-w-0 space-y-5 sm:space-y-6"
          >
            <motion.div
              variants={revealSection}
              className="inline-flex items-center gap-3"
            >
              <FlightlineMark variant="slash" className="h-3.5 w-6 text-[var(--color-accent)]" />
              <p className="type-label">
                {SITE_META.tagline} &middot; {SITE_META.location}
              </p>
            </motion.div>

            <h1
              id="hero-heading"
              aria-label={HEADLINE_ACCESSIBLE_TEXT}
              className="type-h1 text-[var(--color-text)] max-w-[23ch]"
            >
              <span aria-hidden="true" className="block">
                <span className="block overflow-hidden pb-1">
                  <motion.span variants={revealLine} className="block">
                    Software, connected hardware,
                  </motion.span>
                </span>
                <span className="block overflow-hidden pb-1">
                  <motion.span variants={revealLine} className="block">
                    and workflow systems
                  </motion.span>
                </span>

                <span className="relative mt-2 block pl-4 sm:pl-5 overflow-hidden py-0.5">
                  <motion.span
                    variants={heroAccentBarVariants}
                    style={{ originY: 0 }}
                    className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--color-accent)]"
                  />
                  <motion.span
                    variants={revealLine}
                    className="block text-[var(--color-accent-hover)]"
                  >
                    built around your business.
                  </motion.span>
                </span>
              </span>
            </h1>

            <motion.p variants={revealSection} className="type-body-lg">
              {SITE_META.heroSubheadline}
            </motion.p>

            <motion.div
              variants={revealSection}
              className="pt-1 sm:pt-2 flex flex-wrap items-center gap-3.5 sm:gap-4"
            >
              <Button
                href="#contact"
                variant="primary"
                className="px-5 py-3 sm:px-6 sm:py-3.5 text-sm sm:text-base transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.99]"
              >
                Start a project
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                href="#services"
                variant="secondary"
                className="px-5 py-3 sm:px-6 sm:py-3.5 text-sm sm:text-base transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.99]"
              >
                Review our services
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Column: Flightline Cinema 3D Sculpture + Canonical SVG Architectural Stage */}
          <motion.div
            variants={revealSection}
            initial={prefersReducedMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={REPLAY_VIEWPORT_HERO}
            className="lg:col-span-5 min-w-0"
          >
            <figure
              aria-label="Skyars Flightline architectural diagram connecting client interfaces (Web & Mobile Products), intelligence workflows (APIs & AI Workflows), and physical edge hardware (Connected IoT Hardware)"
              className="relative mx-auto max-w-[440px] sm:max-w-[500px] lg:max-w-none"
            >
              <FlightlineHeroStage
                tiltTargetRef={tiltTargetRef}
                wakeSceneRef={wakeSceneRef}
              />

              <figcaption className="mt-2.5 sm:mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-muted)] border-t border-[var(--color-divider)] pt-2.5 sm:pt-3">
                <span>Architecture: Screen &rarr; API &rarr; Physical Edge</span>
                <span className="font-display text-[var(--color-accent-hover)]">
                  Bhavnagar Atelier
                </span>
              </figcaption>
            </figure>
          </motion.div>
        </div>

        {/* Compact Capability Signature Strip (1 col on very narrow <360px, 2x2 on phones, 4 cols on desktop) */}
        <div className="mt-10 sm:mt-14 md:mt-20 border-t border-[var(--color-border)] pt-6 sm:pt-8">
          <motion.dl
            variants={serviceListVariants}
            initial={prefersReducedMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={REPLAY_VIEWPORT_ITEM}
            className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-6 sm:gap-8"
          >
            {CAPABILITY_SIGNATURE_STRIP.map((item) => (
              <motion.div
                key={item.index}
                variants={revealSection}
                className="group relative min-w-0 pl-3.5 sm:pl-4 border-l border-[var(--color-border)] transition-colors duration-150 hover:border-[var(--color-accent)]"
              >
                <dt className="flex items-center gap-2 font-display text-xs sm:text-sm font-semibold text-[var(--color-text)]">
                  <span className="text-[11px] sm:text-xs text-[var(--color-accent-hover)] shrink-0">
                    {item.index}
                  </span>
                  <span className="break-words">{item.discipline}</span>
                </dt>
                <dd className="mt-1 text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed">
                  {item.summary}
                </dd>
              </motion.div>
            ))}
          </motion.dl>
        </div>
      </div>
    </section>
  );
};

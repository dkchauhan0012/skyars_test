import type { Transition, Variants } from 'motion/react';

export const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_OUT_QUART: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const MAX_ALLOWED_TILT_DEG = 2.4;

export const MOTION_DURATION = {
  micro: 0.18,
  rail: 0.22,
  section: 0.54,
  line: 0.58,
  wingStroke: 0.82,
  wingFill: 0.52,
  conduit: 0.95,
} as const;

/**
 * Reusable bidirectional viewport policies (`once: false`) so headings, lists,
 * and signature SVG marks reset cleanly when scrolled out of view and replay
 * smoothly when entering from either above (scroll down) or below (scroll up).
 */
export const REPLAY_VIEWPORT = {
  once: false,
  amount: 0.2,
  margin: '0px 0px -6% 0px',
} as const;

export const REPLAY_VIEWPORT_HERO = {
  once: false,
  amount: 0.18,
} as const;

export const REPLAY_VIEWPORT_ITEM = {
  once: false,
  amount: 0.15,
  margin: '0px 0px -4% 0px',
} as const;

/**
 * Shared-layout active rail transition for header nav & career category filters.
 */
export const activeRailTransition: Transition = {
  duration: MOTION_DURATION.rail,
  ease: EASE_OUT_QUART,
};

/**
 * Small stagger group for hero sequence, section headings, or 2-4 item lists.
 */
export const revealGroup: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.02,
    },
  },
};

/**
 * Overflow-clipped line/phrase reveal for hero & major section headings.
 */
export const revealLine: Variants = {
  hidden: {
    y: '105%',
    opacity: 0,
  },
  visible: {
    y: '0%',
    opacity: 1,
    transition: {
      duration: MOTION_DURATION.line,
      ease: EASE_OUT_EXPO,
    },
  },
};

/**
 * Restrained opacity + 10-12px translation for section intros and list items.
 */
export const revealSection: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATION.section,
      ease: EASE_OUT_QUART,
    },
  },
};

/**
 * Repeatable SVG path draw for the Flightline signal conduit.
 */
export const pathDraw: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0.25,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: MOTION_DURATION.conduit,
      ease: EASE_OUT_EXPO,
    },
  },
};

/**
 * Coherent sequence variants for the canonical 2D Skyars wing mark.
 * Outer sweep draws first, inner feathers follow in tight stagger, and the
 * central S-spine completes the flow with one finite follow-through highlight.
 */
export const wingChoreographyGroup: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export function createWingStrokeVariant(
  delaySeconds: number,
  durationSeconds: number = MOTION_DURATION.wingStroke
): Variants {
  return {
    hidden: {
      pathLength: 0,
      opacity: 0,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          duration: durationSeconds,
          delay: delaySeconds,
          ease: EASE_OUT_EXPO,
        },
        opacity: {
          duration: 0.2,
          delay: delaySeconds,
          ease: EASE_OUT_QUART,
        },
      },
    },
  };
}

export function createWingFillVariant(delaySeconds: number, targetOpacity = 1): Variants {
  return {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: targetOpacity,
      transition: {
        duration: MOTION_DURATION.wingFill,
        delay: delaySeconds,
        ease: EASE_OUT_QUART,
      },
    },
  };
}

export const wingSpineFollowThroughVariant: Variants = {
  hidden: {
    pathLength: 0,
    pathOffset: 0,
    opacity: 0,
  },
  visible: {
    pathLength: [0, 0.24, 0],
    pathOffset: [0, 0.76, 1],
    opacity: [0, 1, 0],
    transition: {
      duration: 0.95,
      delay: 0.62,
      ease: EASE_OUT_QUART,
    },
  },
};

/**
 * Tactile 1.5px lift & subtle press response for interactive controls.
 */
export const hoverLift = {
  whileHover: { y: -1.5, transition: { duration: MOTION_DURATION.micro, ease: EASE_OUT_QUART } },
  whileTap: { scale: 0.988, transition: { duration: 0.1, ease: EASE_OUT_QUART } },
} as const;

// Named aliases used across sections
export const heroStaggerContainer = revealGroup;
export const heroClippedLineVariants = revealLine;
export const heroFadeUpVariants = revealSection;
export const sectionHeadingVariants = revealSection;
export const serviceListVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.065,
    },
  },
};
export const serviceRowVariants = revealSection;

/**
 * Pure helper to compute clamped parallax tilt in radians (±maxDegrees).
 */
export function computeClampedTiltRadians(
  normalizedOffset: number,
  maxDegrees = 2.4
): number {
  const clamped = Math.max(-0.5, Math.min(0.5, normalizedOffset));
  const maxRad = (maxDegrees * Math.PI) / 180;
  return clamped * 2 * maxRad;
}

import React, { useId } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  REPLAY_VIEWPORT_HERO,
  createWingFillVariant,
  createWingStrokeVariant,
  wingChoreographyGroup,
  wingSpineFollowThroughVariant,
} from '../../motion/variants';

interface FlightlineMarkProps {
  variant?: 'hero' | 'counterweight' | 'slash';
  showCallouts?: boolean;
  /**
   * When true (3D WebGL sculpture is active and has rendered its first frame),
   * hides the 2D SVG wing polygons so only the crisp datum hairlines and
   * right-rail technical callouts are rendered.
   */
  annotationOnly?: boolean;
  /**
   * When true (mobile viewports < 640px), crops the viewBox tightly around the
   * canonical wing sculpture (48 24 276 420) so the wing renders large and
   * recognizable while the callouts are rendered as readable HTML below.
   */
  compactStage?: boolean;
  className?: string;
}

/**
 * Canonical Skyars wing contours traced directly from the official brand lockup
 * (`public/assets/aistudio/logo_c23009d2.png`, wing crop x: 146..655, y: 44..923)
 * using sub-pixel Marching Squares and Schneider least-squares cubic Bézier fitting,
 * mapped isotropically (scale = 396 / 879) into the 520x468 stage viewBox:
 * - Wing sculpture bounds: x: 63.8..293.9, y: 35.9..432.3
 * - Reserved right technical callout rail: x: 342..508
 */
export const FLIGHTLINE_SVG_PATHS = {
  // Blade 1: Primary upper swept wing crest
  blade1Fill:
    'M 67.6 35.93 C 69.82 39.57, 69.86 44.28, 71.28 48.32 C 74.21 56.62, 78.84 66.1, 84.75 72.68 C 98.05 87.46, 113.98 100.22, 130.52 111.17 C 136.55 115.16, 142.96 118.41, 149.11 122.3 C 171.37 136.38, 193.53 150.52, 215.67 164.78 C 228.23 172.88, 242.41 179.79, 253.66 189.86 C 266.29 201.16, 278.06 214.32, 283.63 230.62 C 285.95 237.43, 286.8 244.6, 287.38 251.73 C 288.07 260.3, 287.93 270.63, 284.3 278.55 C 279.17 274.65, 273.58 270.86, 267.84 268.01 C 267.65 261.15, 269.04 254.7, 267.29 247.85 C 264.17 235.59, 257.17 227.21, 248.54 218.4 C 244.63 214.41, 240.71 210.16, 236.11 206.95 C 232.02 204.1, 227.64 201.52, 223.31 199.03 C 221.65 198.08, 219.51 197.39, 218.04 196.19 C 209.43 189.19, 199.55 183.58, 190.03 177.8 C 182.78 173.41, 175.92 168.37, 168.62 164.07 C 160.16 159.09, 151.32 154.7, 142.9 149.69 C 133.4 144.05, 124.02 137.41, 115 131.2 C 114.12 130.6, 112.96 130.69, 112.06 130.09 C 107.53 127.06, 103.39 123.01, 98.96 119.75 C 87.4 111.25, 75.55 99.49, 69.08 86.56 C 64.41 77.24, 63.89 65.87, 64.47 55.68 C 64.81 49.83, 64 40.76, 67.6 35.93 Z',
  blade1LeadingEdge:
    'M 67.6 35.93 C 69.82 39.57, 69.86 44.28, 71.28 48.32 C 74.2 56.6, 78.77 65.78, 84.54 72.44 C 102.49 93.17, 125.83 107.96, 148.84 122.13 C 171.34 135.98, 193.45 150.47, 215.67 164.78 C 227.05 172.12, 240.07 178.35, 250.5 187.15 C 264.43 198.91, 277.64 213.07, 283.63 230.62 C 286.45 238.9, 287.53 248.04, 287.62 256.75 C 287.69 264.02, 286.98 271.51, 284.49 278.38',

  // Blade 2: Second feather contour
  blade2Fill:
    'M 66.25 115.63 C 67.65 117.3, 68.04 121.07, 68.88 123.7 C 70.6 129.15, 72.53 134.84, 75.19 139.92 C 82.88 154.59, 95.52 167.57, 108.24 178.05 C 114.26 183, 120.96 186.49, 127.64 190.19 C 129.83 191.41, 131.81 193.29, 134.07 194.57 C 140.77 198.36, 147.87 201.56, 154.8 204.92 C 159.14 207.04, 163.45 209.29, 167.89 211.2 C 171.12 212.59, 174.64 213.62, 177.02 216.2 C 176.23 221.21, 174.83 226.06, 174.25 231.12 C 173.81 234.95, 174.01 239.18, 172.57 242.64 C 165.18 239.71, 158 236.09, 150.67 232.93 C 125.48 222.05, 98.9 209.62, 81.5 187.67 C 77.68 182.85, 73.84 178.43, 71.21 172.73 C 67.66 165.06, 65.47 156.14, 64.57 147.77 C 63.77 140.29, 63.96 132.65, 64.55 125.16 C 64.8 121.9, 64.66 118.54, 66.25 115.63 Z',
  blade2LeadingEdge:
    'M 66.25 115.63 C 67.65 117.3, 68.04 121.07, 68.88 123.7 C 70.6 129.15, 72.53 134.84, 75.19 139.92 C 80.8 150.62, 88.8 159.36, 97.34 167.77 C 101.94 172.29, 106.55 177.04, 111.82 180.78 C 116.94 184.41, 122.24 187.2, 127.64 190.19 C 129.93 191.46, 131.98 193.42, 134.36 194.73 C 142.18 199.05, 150.37 202.83, 158.4 206.73 C 162.78 208.85, 167.17 211, 171.69 212.81 C 173.03 213.35, 176.15 214.32, 176.82 215.75 C 177.67 217.55, 175.9 221.5, 175.48 223.4 C 174.12 229.65, 174.24 236.1, 172.97 242.33',

  // Blade 3: Third feather contour
  blade3Fill:
    'M 82.02 214.43 C 86.84 222.59, 90.65 231.19, 96.71 238.67 C 108.31 252.96, 124.36 262.6, 140.73 270.36 C 149.12 274.34, 158.58 277.2, 167.69 278.97 C 172.32 279.87, 178.87 279.55, 183.09 281.61 C 184.91 282.5, 186.42 285.86, 187.55 287.5 C 190.14 291.23, 192.63 295.04, 195.18 298.78 C 196.55 300.8, 198.44 301.77, 199.32 304.05 C 196.73 307.56, 191.04 307.33, 187 307.56 C 175.87 308.18, 164.48 306.88, 153.64 304.3 C 139.08 300.83, 123.17 294.62, 111.14 285.53 C 89.81 269.41, 78.87 240.67, 82.02 214.43 Z',
  blade3LeadingEdge:
    'M 82.02 214.43 C 86.84 222.59, 90.65 231.19, 96.71 238.67 C 108.39 253.06, 125.12 263.66, 141.96 270.92 C 150.25 274.49, 159.19 277.4, 168.08 279.04 C 171.68 279.71, 175.31 280.18, 178.91 280.81 C 180.25 281.04, 182.24 281, 183.37 281.78 C 184.71 282.69, 185.71 284.84, 186.64 286.16 C 188.8 289.26, 191.03 292.29, 193.15 295.42 C 195.03 298.21, 198.66 301.47, 199.18 304.51',

  // Blade 4 & Base Fin: Lower feathers
  blade4Fill:
    'M 114.91 318.7 C 135.28 328.46, 159.18 331.51, 181.59 332.52 C 193.91 333.08, 206.97 331.93, 219.15 333.85 C 223.59 334.55, 227.92 336.52, 232.15 337.96 C 243.38 341.8, 254.55 353.11, 257.97 364.39 C 259.16 368.29, 260.31 372.68, 259.07 376.49 C 247.6 360.02, 224.97 360.14, 206.91 359.92 C 187.04 359.67, 165.89 357.47, 147.23 350.34 C 140.53 347.78, 133.69 344.26, 128.21 339.64 C 125.28 337.17, 122.65 332.96, 120.46 329.81 C 118.22 326.59, 115.18 322.36, 114.91 318.7 Z',
  blade4LeadingEdge:
    'M 114.91 318.7 C 135.37 328.5, 159.51 331.63, 182.04 332.54 C 196.72 333.14, 212.77 331.37, 226.82 336.08 C 243.32 341.61, 261.63 356.71, 259.46 376.14',
  baseFinFill:
    'M 185.64 376.43 C 196.13 375.64, 207.62 374.9, 218.08 375.84 C 220.25 379.09, 221.97 382.78, 224.34 385.87 C 227.62 390.15, 232.21 393.62, 236.66 396.52 C 240.88 399.28, 246.43 400.37, 250.31 403.17 C 247.37 408.59, 242.9 416.67, 237.45 420.49 C 216.64 411.97, 194.44 397.73, 185.64 376.43 Z',
  baseFinLeadingEdge:
    'M 185.64 376.43 C 193.57 375.83, 201.52 376.24, 209.45 375.78 C 211.5 375.67, 213.57 375.81, 215.63 375.71 C 216.23 375.68, 217.57 375.41, 218.08 375.84 C 220.86 378.27, 222.1 382.95, 224.34 385.87 C 227.53 390.03, 231.74 392.46, 235.62 395.75 C 238.62 398.3, 242.84 400.27, 246.54 401.52 C 247.53 401.86, 250.48 402.09, 250.4 403.62 C 250.34 404.65, 248.11 406.66, 247.48 407.57 C 245.04 411.09, 242.7 414.69, 240.03 418.14',

  // Central S-Spine return
  sSpineFill:
    'M 193.75 209.6 C 198.72 210.66, 204.83 212.52, 208.81 215.75 C 208.52 219.54, 207.04 223.2, 206.66 227.04 C 205.88 234.73, 205.38 243.43, 207.4 250.97 C 208.81 256.27, 211.64 261.33, 214.48 265.98 C 217.89 271.57, 222.25 277.33, 227.2 281.64 C 234.91 288.37, 244.07 293.22, 252.06 299.57 C 258.45 304.65, 264.41 310.38, 270.17 316.16 C 274.02 320.02, 278.22 324.05, 281.07 328.69 C 286.7 337.87, 290.67 348.97, 292.5 359.58 C 293.91 367.78, 292.87 375.24, 291.23 383.3 C 289.42 392.25, 285.82 401.24, 280.68 408.78 C 278.31 412.27, 275.61 415.4, 273.09 418.77 C 269.4 423.71, 266.09 428.79, 260.87 432.26 C 257.04 430.7, 253 428.83, 249.81 426.14 C 252.95 419.33, 259.2 413.87, 262.89 407.21 C 273.51 388.04, 276.02 365.43, 264.72 345.93 C 255.24 329.56, 237.51 320.15, 223.29 308.53 C 206.48 294.79, 193 278.48, 188.61 256.71 C 187.5 251.24, 187.71 245.63, 187.67 240.08 C 187.63 232.89, 188.46 226.15, 190.18 219.18 C 190.99 215.91, 191.75 212.25, 193.75 209.6 Z',
  sSpineCenterline:
    'M 193.75 209.6 C 197.69 210.44, 201.47 211.94, 205.17 213.56 C 206.08 213.96, 208.45 214.71, 208.81 215.75 C 209.38 217.39, 207.99 220.1, 207.6 221.72 C 206.67 225.49, 206.31 229.45, 206.2 233.32 C 206.03 239, 205.97 245.06, 207.31 250.62 C 208.92 257.3, 212.88 263.94, 216.81 269.5 C 226.13 282.69, 239.32 289.8, 251.81 299.37 C 257.45 303.7, 262.56 308.78, 267.66 313.71 C 272.39 318.27, 277.63 323.09, 281.07 328.69 C 284.32 333.99, 286.61 339.92, 288.79 345.74 C 291.84 353.91, 294.11 363.35, 293.18 372.11 C 292.43 379.04, 291.17 386.64, 288.37 393.05 C 287.17 395.78, 286.51 398.9, 285.12 401.51 C 280.83 409.52, 274.93 416.53, 269.63 423.85',
} as const;

export const FLIGHTLINE_STAGE_CALLOUTS = [
  {
    code: '01 / INTERFACES',
    label: 'Web & Mobile Products',
    y: 136,
    leaderStartX: 232,
  },
  {
    code: '02 / INTELLIGENCE',
    label: 'APIs & AI Workflows',
    y: 254,
    leaderStartX: 294,
  },
  {
    code: '03 / PHYSICAL EDGE',
    label: 'Connected IoT Hardware',
    y: 368,
    leaderStartX: 300,
  },
] as const;

export type ParsedFlightlineCommand =
  | { type: 'M'; x: number; y: number }
  | { type: 'C'; c1x: number; c1y: number; c2x: number; c2y: number; x: number; y: number }
  | { type: 'Z' };

/**
 * Validates and tokenizes a canonical Flightline SVG path string.
 * Only absolute M, C, and Z commands are permitted; throws an explicit diagnostic error on invalid tokens.
 */
export function parseFlightlineSvgGrammar(pathData: string): ParsedFlightlineCommand[] {
  const tokens = pathData
    .replace(/,/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length === 0) {
    throw new Error('Flightline SVG path cannot be empty.');
  }

  const commands: ParsedFlightlineCommand[] = [];
  let i = 0;

  while (i < tokens.length) {
    const cmd = tokens[i];
    if (cmd === 'M') {
      const x = Number(tokens[i + 1]);
      const y = Number(tokens[i + 2]);
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        throw new Error(`Invalid M coordinate in Flightline path near token ${i}`);
      }
      commands.push({ type: 'M', x, y });
      i += 3;
    } else if (cmd === 'C') {
      const nums = tokens.slice(i + 1, i + 7).map(Number);
      if (nums.length < 6 || nums.some((n) => !Number.isFinite(n))) {
        throw new Error(`Invalid C cubic Bezier coordinates in Flightline path near token ${i}`);
      }
      commands.push({
        type: 'C',
        c1x: nums[0],
        c1y: nums[1],
        c2x: nums[2],
        c2y: nums[3],
        x: nums[4],
        y: nums[5],
      });
      i += 7;
    } else if (cmd === 'Z') {
      commands.push({ type: 'Z' });
      i += 1;
    } else {
      throw new Error(
        `Unsupported SVG path command "${cmd}" in Flightline path. Only absolute M, C, and Z commands are supported.`
      );
    }
  }

  return commands;
}

const blade1StrokeVar = createWingStrokeVariant(0.02, 0.84);
const blade1FillVar = createWingFillVariant(0.1, 1);

const blade2StrokeVar = createWingStrokeVariant(0.1, 0.76);
const blade2FillVar = createWingFillVariant(0.18, 1);

const blade3StrokeVar = createWingStrokeVariant(0.18, 0.72);
const blade3FillVar = createWingFillVariant(0.25, 1);

const blade4StrokeVar = createWingStrokeVariant(0.25, 0.68);
const blade4FillVar = createWingFillVariant(0.32, 1);

const baseFinStrokeVar = createWingStrokeVariant(0.31, 0.62);
const baseFinFillVar = createWingFillVariant(0.37, 1);

const spineStrokeVar = createWingStrokeVariant(0.36, 0.88);
const spineFillVar = createWingFillVariant(0.42, 1);

export const FlightlineMark: React.FC<FlightlineMarkProps> = ({
  variant = 'hero',
  showCallouts = true,
  annotationOnly = false,
  compactStage = false,
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');
  const prefersReducedMotion = useReducedMotion();

  if (variant === 'slash') {
    return (
      <svg
        viewBox="0 0 28 16"
        fill="none"
        aria-hidden="true"
        className={`inline-block shrink-0 ${className}`}
      >
        <path
          d="M2 14C8.5 14 14 9.5 19.5 2H26C20 10.5 13.5 14 2 14Z"
          fill="currentColor"
        />
        <path
          d="M9 14C14 14 18.5 10.5 23 4.5"
          stroke="#C4B5FD"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Counterweight uses the exact same canonical wing paths inside a focused viewBox
  if (variant === 'counterweight') {
    const gradId = `fl-counter-${uid}`;
    return (
      <svg
        viewBox="48 24 276 420"
        fill="none"
        aria-hidden="true"
        className={`w-full h-auto select-none pointer-events-none ${className}`}
      >
        <defs>
          <linearGradient id={gradId} x1="64" y1="36" x2="294" y2="432" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#F5F2FA" stopOpacity="0.72" />
            <stop offset="0.45" stopColor="#C4B5FD" stopOpacity="0.48" />
            <stop offset="0.85" stopColor="#8B5CF6" stopOpacity="0.22" />
            <stop offset="1" stopColor="#6D28D9" stopOpacity="0.06" />
          </linearGradient>
        </defs>

        <line x1="48" y1="432" x2="320" y2="432" stroke="#262035" strokeWidth="1" />
        <line x1="308" y1="28" x2="308" y2="438" stroke="#262035" strokeWidth="1" />

        <path d={FLIGHTLINE_SVG_PATHS.blade1Fill} fill={`url(#${gradId})`} />
        <path
          d={FLIGHTLINE_SVG_PATHS.blade2Fill}
          fill="#8B5CF6"
          fillOpacity="0.2"
          stroke="#C4B5FD"
          strokeOpacity="0.42"
          strokeWidth="1"
        />
        <path
          d={FLIGHTLINE_SVG_PATHS.blade3Fill}
          fill="#8B5CF6"
          fillOpacity="0.14"
          stroke="#8B5CF6"
          strokeOpacity="0.38"
          strokeWidth="1"
        />
        <path
          d={FLIGHTLINE_SVG_PATHS.blade4Fill}
          stroke="#C4B5FD"
          strokeOpacity="0.34"
          strokeWidth="1"
        />
        <path
          d={FLIGHTLINE_SVG_PATHS.baseFinFill}
          fill="#D9D5E3"
          fillOpacity="0.24"
        />
        <path
          d={FLIGHTLINE_SVG_PATHS.sSpineFill}
          fill={`url(#${gradId})`}
        />
        <path
          d={FLIGHTLINE_SVG_PATHS.sSpineCenterline}
          stroke="#F5F2FA"
          strokeOpacity="0.7"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle cx="308" cy="432" r="3" fill="#8B5CF6" />
      </svg>
    );
  }

  const primaryGradId = `fl-hero-primary-${uid}`;
  const bladeGradId = `fl-hero-blade-${uid}`;
  const spineGradId = `fl-hero-spine-${uid}`;

  // When compactStage is active (mobile < 640px), crop viewBox around the wing (48..324, 24..444)
  // so the wing emblem remains large and prominent while callouts render as readable HTML below.
  const heroViewBox = compactStage ? '44 24 276 424' : '0 0 520 468';

  return (
    <svg
      viewBox={heroViewBox}
      fill="none"
      aria-hidden="true"
      className={`w-full h-auto select-none ${className}`}
    >
      <defs>
        <linearGradient id={primaryGradId} x1="64" y1="36" x2="288" y2="278" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F5F2FA" stopOpacity="0.94" />
          <stop offset="0.44" stopColor="#D9D5E3" stopOpacity="0.78" />
          <stop offset="0.8" stopColor="#8B5CF6" stopOpacity="0.5" />
          <stop offset="1" stopColor="#262035" stopOpacity="0.2" />
        </linearGradient>

        <linearGradient id={bladeGradId} x1="64" y1="115" x2="199" y2="307" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#D9D5E3" stopOpacity="0.6" />
          <stop offset="0.58" stopColor="#8B5CF6" stopOpacity="0.32" />
          <stop offset="1" stopColor="#13101C" stopOpacity="0.14" />
        </linearGradient>

        <linearGradient id={spineGradId} x1="187" y1="209" x2="293" y2="432" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F5F2FA" stopOpacity="0.96" />
          <stop offset="0.48" stopColor="#C4B5FD" stopOpacity="0.84" />
          <stop offset="0.86" stopColor="#8B5CF6" stopOpacity="0.6" />
          <stop offset="1" stopColor="#6D28D9" stopOpacity="0.22" />
        </linearGradient>
      </defs>

      {/* Quiet Top, Bottom & Right-Rail Datum Hairlines */}
      <line
        x1={compactStage ? '48' : '24'}
        y1="28"
        x2={compactStage ? '316' : '496'}
        y2="28"
        stroke="#262035"
        strokeWidth="1"
      />
      <line
        x1={compactStage ? '48' : '24'}
        y1="444"
        x2={compactStage ? '316' : '496'}
        y2="444"
        stroke="#262035"
        strokeWidth="1"
      />
      {!compactStage && (
        <line x1="342" y1="28" x2="342" y2="444" stroke="#1B1626" strokeWidth="1" />
      )}

      {/* Subtle Outer Reference Arc framing the canonical wing sweep */}
      <path
        d="M 74 28 C 144 108, 246 158, 298 228 C 314 252, 314 336, 286 436"
        stroke="#262035"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Coherent Motion-choreographed 2D SVG Wing Sculpture (crossfades smoothly when 3D WebGL frame is ready) */}
      <motion.g
        data-testid="flightline-svg-wings"
        data-hidden-by-3d={annotationOnly ? 'true' : 'false'}
        variants={wingChoreographyGroup}
        initial={prefersReducedMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={REPLAY_VIEWPORT_HERO}
        className={`transition-opacity duration-300 ${
          annotationOnly ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Blade 1: Outer leading sweep */}
        <g>
          <motion.path
            d={FLIGHTLINE_SVG_PATHS.blade1Fill}
            fill={`url(#${primaryGradId})`}
            variants={blade1FillVar}
          />
          <motion.path
            d={FLIGHTLINE_SVG_PATHS.blade1LeadingEdge}
            stroke="#F5F2FA"
            strokeOpacity="0.95"
            strokeWidth="1.5"
            strokeLinecap="round"
            variants={blade1StrokeVar}
          />
        </g>

        {/* Blade 2: Second feather */}
        <g>
          <motion.path
            d={FLIGHTLINE_SVG_PATHS.blade2Fill}
            fill={`url(#${bladeGradId})`}
            stroke="#C4B5FD"
            strokeOpacity="0.58"
            strokeWidth="1.1"
            strokeLinejoin="round"
            variants={blade2FillVar}
          />
          <motion.path
            d={FLIGHTLINE_SVG_PATHS.blade2LeadingEdge}
            stroke="#F5F2FA"
            strokeOpacity="0.82"
            strokeWidth="1.3"
            strokeLinecap="round"
            variants={blade2StrokeVar}
          />
        </g>

        {/* Blade 3: Third feather */}
        <g>
          <motion.path
            d={FLIGHTLINE_SVG_PATHS.blade3Fill}
            fill={`url(#${bladeGradId})`}
            stroke="#8B5CF6"
            strokeOpacity="0.58"
            strokeWidth="1.1"
            strokeLinejoin="round"
            variants={blade3FillVar}
          />
          <motion.path
            d={FLIGHTLINE_SVG_PATHS.blade3LeadingEdge}
            stroke="#C4B5FD"
            strokeOpacity="0.8"
            strokeWidth="1.25"
            strokeLinecap="round"
            variants={blade3StrokeVar}
          />
        </g>

        {/* Blade 4 & Base Fin: Lower feathers */}
        <g>
          <motion.path
            d={FLIGHTLINE_SVG_PATHS.blade4Fill}
            fill="#8B5CF6"
            fillOpacity="0.28"
            stroke="#C4B5FD"
            strokeOpacity="0.52"
            strokeWidth="1.05"
            strokeLinejoin="round"
            variants={blade4FillVar}
          />
          <motion.path
            d={FLIGHTLINE_SVG_PATHS.blade4LeadingEdge}
            stroke="#C4B5FD"
            strokeOpacity="0.76"
            strokeWidth="1.2"
            strokeLinecap="round"
            variants={blade4StrokeVar}
          />
          <motion.path
            d={FLIGHTLINE_SVG_PATHS.baseFinFill}
            fill="#D9D5E3"
            fillOpacity="0.4"
            variants={baseFinFillVar}
          />
          <motion.path
            d={FLIGHTLINE_SVG_PATHS.baseFinLeadingEdge}
            stroke="#D9D5E3"
            strokeOpacity="0.68"
            strokeWidth="1.1"
            strokeLinecap="round"
            variants={baseFinStrokeVar}
          />
        </g>

        {/* Central Skyars S-Spine completing the flow */}
        <g>
          <motion.path
            d={FLIGHTLINE_SVG_PATHS.sSpineFill}
            fill={`url(#${spineGradId})`}
            variants={spineFillVar}
          />
          <motion.path
            d={FLIGHTLINE_SVG_PATHS.sSpineCenterline}
            stroke="#F5F2FA"
            strokeOpacity="0.94"
            strokeWidth="1.65"
            strokeLinecap="round"
            variants={spineStrokeVar}
          />
          {/* Single finite follow-through highlight along the spine, then stops */}
          {!prefersReducedMotion && (
            <motion.path
              d={FLIGHTLINE_SVG_PATHS.sSpineCenterline}
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              variants={wingSpineFollowThroughVariant}
            />
          )}
        </g>
      </motion.g>

      {/* Reserved Right-Rail Technical Callouts (x: 342..504; hidden when compactStage renders HTML callouts) */}
      {showCallouts && !compactStage && (
        <g data-testid="flightline-svg-callouts">
          {FLIGHTLINE_STAGE_CALLOUTS.map((node, index) => (
            <g key={node.code}>
              <line
                x1={node.leaderStartX}
                y1={node.y}
                x2="358"
                y2={node.y}
                stroke="#8B5CF6"
                strokeOpacity="0.5"
                strokeWidth="1"
              />
              <circle
                cx="342"
                cy={node.y}
                r="3.5"
                fill={index === 1 ? '#8B5CF6' : '#050507'}
                stroke={index === 1 ? '#F5F2FA' : '#C4B5FD'}
                strokeWidth={index === 1 ? '1.5' : '1.75'}
              />
              <text
                x="366"
                y={node.y - 5}
                fill="#C4B5FD"
                fontSize="10"
                fontWeight="600"
                letterSpacing="1.3"
                fontFamily="Space Grotesk, system-ui, sans-serif"
              >
                {node.code}
              </text>
              <text
                x="366"
                y={node.y + 13}
                fill="#F5F2FA"
                fontSize="12"
                fontWeight="500"
                fontFamily="Plus Jakarta Sans, system-ui, sans-serif"
              >
                {node.label}
              </text>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
};

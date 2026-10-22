import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import {
  FLIGHTLINE_STAGE_CALLOUTS,
  FlightlineMark,
} from '../brand/FlightlineMark';
import {
  MAX_ALLOWED_TILT_DEG,
  computeClampedTiltRadians,
} from '../../motion/variants';

const LazyFlightlineScene = lazy(() => import('./FlightlineScene'));

export interface FlightlineHeroStageProps {
  tiltTargetRef: React.MutableRefObject<{ x: number; y: number }>;
  wakeSceneRef: React.MutableRefObject<(() => void) | null>;
}

/**
 * Lightweight capability check without creating throwaway WebGL contexts.
 * The actual WebGLRenderer is created once inside FlightlineScene, which
 * triggers onFallback() if context creation fails.
 */
function canAttemptWebGLScene(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  // Use canonical animated SVG as first-class artwork on small mobile viewports (< 640px)
  if (window.innerWidth < 640) {
    return false;
  }
  return 'WebGLRenderingContext' in window || 'WebGL2RenderingContext' in window;
}

export const FlightlineHeroStage: React.FC<FlightlineHeroStageProps> = ({
  tiltTargetRef,
  wakeSceneRef,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [enable3D, setEnable3D] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [fallbackTriggered, setFallbackTriggered] = useState(false);
  const [isCompactMobile, setIsCompactMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const evaluateStageMode = () => {
      const compact = window.innerWidth < 640;
      setIsCompactMobile(compact);

      if (prefersReducedMotion || fallbackTriggered || compact) {
        setEnable3D(false);
        setSceneReady(false);
        return;
      }
      if (canAttemptWebGLScene()) {
        setEnable3D(true);
      } else {
        setEnable3D(false);
        setSceneReady(false);
      }
    };

    evaluateStageMode();
    window.addEventListener('resize', evaluateStageMode);
    return () => window.removeEventListener('resize', evaluateStageMode);
  }, [prefersReducedMotion, fallbackTriggered]);

  const handleSceneReady = useCallback(() => {
    setSceneReady(true);
  }, []);

  const handleSceneFallback = useCallback(() => {
    setFallbackTriggered(true);
    setSceneReady(false);
    setEnable3D(false);
  }, []);

  // Scope pointer tilt strictly to the visual artwork container (ignoring mouse moves on headline/CTAs)
  const handleStagePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || event.pointerType !== 'mouse' || isCompactMobile) {
      if (tiltTargetRef.current.x !== 0 || tiltTargetRef.current.y !== 0) {
        tiltTargetRef.current.x = 0;
        tiltTargetRef.current.y = 0;
        wakeSceneRef.current?.();
      }
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const normX = (event.clientX - rect.left) / rect.width - 0.5;
    const normY = (event.clientY - rect.top) / rect.height - 0.5;

    tiltTargetRef.current.x = computeClampedTiltRadians(normY, MAX_ALLOWED_TILT_DEG);
    tiltTargetRef.current.y = computeClampedTiltRadians(normX, MAX_ALLOWED_TILT_DEG);
    wakeSceneRef.current?.();
  };

  const handleStagePointerReset = () => {
    if (tiltTargetRef.current.x !== 0 || tiltTargetRef.current.y !== 0) {
      tiltTargetRef.current.x = 0;
      tiltTargetRef.current.y = 0;
      wakeSceneRef.current?.();
    }
  };

  const show3DOverlay = enable3D && !prefersReducedMotion && !fallbackTriggered;
  const is3DActive = show3DOverlay && sceneReady;

  return (
    <div className="w-full select-none">
      <div
        data-testid="flightline-hero-stage"
        data-scene-mode={is3DActive ? 'webgl-3d' : 'svg-fallback'}
        onPointerMove={handleStagePointerMove}
        onPointerLeave={handleStagePointerReset}
        onPointerCancel={handleStagePointerReset}
        className={`relative w-full mx-auto ${
          isCompactMobile
            ? 'aspect-[276/424] max-w-[240px]'
            : 'aspect-[520/468] max-w-[500px] lg:max-w-[520px]'
        }`}
      >
        {/* Progressive-enhancement Three.js satin-titanium/obsidian Flightline sculpture at z-10 */}
        {show3DOverlay && (
          <div
            aria-hidden="true"
            className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-300 ${
              sceneReady ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Suspense fallback={null}>
              <LazyFlightlineScene
                tiltTargetRef={tiltTargetRef}
                wakeSceneRef={wakeSceneRef}
                onReady={handleSceneReady}
                onFallback={handleSceneFallback}
              />
            </Suspense>
          </div>
        )}

        {/* Canonical 2D SVG wing crossfades smoothly with the 3D WebGL stage; on <640px mobile it crops around the wing */}
        <FlightlineMark
          variant="hero"
          showCallouts={!isCompactMobile}
          compactStage={isCompactMobile}
          annotationOnly={is3DActive}
          className="relative z-20 w-full h-full pointer-events-none"
        />
      </div>

      {/* Readable HTML technical callout list on small viewports (< 640px) instead of tiny scaled SVG text */}
      {isCompactMobile && (
        <ul
          aria-hidden="true"
          data-testid="flightline-mobile-callouts"
          className="mt-4 grid grid-cols-1 gap-2 border-t border-[var(--color-divider)] pt-3"
        >
          {FLIGHTLINE_STAGE_CALLOUTS.map((node, index) => (
            <li
              key={node.code}
              className="flex items-center justify-between gap-3 text-xs leading-snug"
            >
              <span className="inline-flex items-center gap-2 font-display text-[11px] font-semibold tracking-[0.08em] text-[var(--color-accent-hover)]">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    index === 1
                      ? 'bg-[var(--color-accent)]'
                      : 'border border-[var(--color-accent-hover)] bg-[var(--color-bg)]'
                  }`}
                />
                {node.code}
              </span>
              <span className="font-medium text-[var(--color-text)]">{node.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

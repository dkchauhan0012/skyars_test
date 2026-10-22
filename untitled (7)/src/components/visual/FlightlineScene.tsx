import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  FLIGHTLINE_SVG_PATHS,
  parseFlightlineSvgGrammar,
} from '../brand/FlightlineMark';

export interface FlightlineSceneProps {
  tiltTargetRef: React.MutableRefObject<{ x: number; y: number }>;
  wakeSceneRef: React.MutableRefObject<(() => void) | null>;
  onReady?: () => void;
  onFallback?: () => void;
}

export const VIEWBOX_WIDTH = 520;
export const VIEWBOX_HEIGHT = 468;
export const CAMERA_FOV_DEG = 24;
export const CAMERA_Z = 6.5;
// Exact frustum height at z=0 so 520x468 SVG coordinates map 1:1 into the 3D stage
export const FRUSTUM_HEIGHT = 2 * CAMERA_Z * Math.tan((CAMERA_FOV_DEG * Math.PI) / 360);
export const SCENE_SCALE = FRUSTUM_HEIGHT / VIEWBOX_HEIGHT;

// Reserved left sculpture safe area in 520x468 viewBox coordinates (keeps x >= 342 callout rail 100% clear)
export const SAFE_STAGE_MIN_X = 44;
export const SAFE_STAGE_MAX_X = 320;
export const SAFE_STAGE_MIN_Y = 28;
export const SAFE_STAGE_MAX_Y = 444;
export const CALLOUT_RAIL_X = 342;
export const MAX_ALLOWED_TILT_DEG = 2.4;

/**
 * Inspect the active WebGLRenderingContext directly without creating a second throwaway context.
 */
function isSoftwareWebGLContext(gl: WebGLRenderingContext | WebGL2RenderingContext): boolean {
  try {
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
}

/**
 * Convert 2D SVG coordinates (520x468 viewBox) into centered 3D scene units at z=0.
 */
export function svgToScene(x: number, y: number): [number, number] {
  const cx = VIEWBOX_WIDTH / 2;
  const cy = VIEWBOX_HEIGHT / 2;
  return [(x - cx) * SCENE_SCALE, (cy - y) * SCENE_SCALE];
}

/**
 * Convert a validated canonical SVG path (`M ... C ... Z`) into `THREE.Shape[]`
 * using `THREE.ShapePath` and `.toShapes()` (compatible with Three.js 0.185+ and Node unit tests).
 */
export function createShapesFromFlightlinePath(pathData: string): THREE.Shape[] {
  const commands = parseFlightlineSvgGrammar(pathData);
  const shapePath = new THREE.ShapePath();

  for (const cmd of commands) {
    if (cmd.type === 'M') {
      const [sx, sy] = svgToScene(cmd.x, cmd.y);
      shapePath.moveTo(sx, sy);
    } else if (cmd.type === 'C') {
      const [c1x, c1y] = svgToScene(cmd.c1x, cmd.c1y);
      const [c2x, c2y] = svgToScene(cmd.c2x, cmd.c2y);
      const [ex, ey] = svgToScene(cmd.x, cmd.y);
      shapePath.bezierCurveTo(c1x, c1y, c2x, c2y, ex, ey);
    } else if (cmd.type === 'Z') {
      if (shapePath.currentPath) {
        shapePath.currentPath.closePath();
      }
    }
  }

  return shapePath.toShapes();
}

export interface FlightlineBoundsCheckResult {
  valid: boolean;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  safeMinX: number;
  safeMaxX: number;
  safeMinY: number;
  safeMaxY: number;
  calloutRailX: number;
}

/**
 * Validates that a 3D bounding box (including worst-case ±maxTiltDegrees rotation excursion)
 * stays strictly inside the safe artwork bounds (`SAFE_STAGE_MIN_X..SAFE_STAGE_MAX_X`,
 * `SAFE_STAGE_MIN_Y..SAFE_STAGE_MAX_Y`) and never crosses the right-hand callout rail (`x = 342`).
 */
export function validateFlightlineSafeBounds(
  box: THREE.Box3,
  maxTiltDegrees: number = MAX_ALLOWED_TILT_DEG
): FlightlineBoundsCheckResult {
  const [safeMinX, safeMaxY] = svgToScene(SAFE_STAGE_MIN_X, SAFE_STAGE_MIN_Y);
  const [safeMaxX, safeMinY] = svgToScene(SAFE_STAGE_MAX_X, SAFE_STAGE_MAX_Y);
  const [calloutRailX] = svgToScene(CALLOUT_RAIL_X, SAFE_STAGE_MAX_Y);

  const tiltRad = (Math.abs(maxTiltDegrees) * Math.PI) / 180;
  const maxAbsZ = Math.max(Math.abs(box.min.z), Math.abs(box.max.z), 0.02);
  // Worst-case horizontal/vertical excursion when rotated by ±maxTiltDegrees
  const rotationMargin = Math.sin(tiltRad) * maxAbsZ + (1 - Math.cos(tiltRad)) * 1.2;

  const minX = box.min.x - rotationMargin;
  const maxX = box.max.x + rotationMargin;
  const minY = box.min.y - rotationMargin;
  const maxY = box.max.y + rotationMargin;

  const valid =
    minX >= safeMinX - 0.01 &&
    maxX <= safeMaxX + 0.01 &&
    maxX < calloutRailX &&
    minY >= safeMinY - 0.01 &&
    maxY <= safeMaxY + 0.01;

  return {
    valid,
    minX,
    maxX,
    minY,
    maxY,
    safeMinX,
    safeMaxX,
    safeMinY,
    safeMaxY,
    calloutRailX,
  };
}

export const FlightlineScene: React.FC<FlightlineSceneProps> = ({
  tiltTargetRef,
  wakeSceneRef,
  onReady,
  onFallback,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onReadyRef = useRef(onReady);
  const onFallbackRef = useRef(onFallback);
  onReadyRef.current = onReady;
  onFallbackRef.current = onFallback;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      });
    } catch {
      onFallbackRef.current?.();
      return;
    }

    const gl = renderer.getContext();
    if (!gl) {
      renderer.dispose();
      onFallbackRef.current?.();
      return;
    }

    const isSoftwareGl = isSoftwareWebGLContext(gl);

    const computeAdaptiveDpr = () => {
      if (isSoftwareGl || window.innerWidth < 768) {
        return 1.0;
      }
      return Math.min(window.devicePixelRatio || 1, 1.5);
    };

    renderer.setPixelRatio(computeAdaptiveDpr());
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = false;

    const width = container.clientWidth || 468;
    const height = container.clientHeight || 421;
    renderer.setSize(width, height, false);

    const canvas = renderer.domElement;
    canvas.setAttribute('aria-hidden', 'true');
    canvas.className = 'w-full h-full block pointer-events-none select-none';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAMERA_FOV_DEG, width / height, 0.1, 30);
    camera.position.set(0, 0, CAMERA_Z);

    // Studio PBR environment reflection with complete disposal of temporary RoomEnvironment resources
    let envTexture: THREE.Texture | null = null;
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const roomEnv = new RoomEnvironment();
      envTexture = pmremGenerator.fromScene(roomEnv, 0.04).texture;
      scene.environment = envTexture;
      roomEnv.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose?.();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose?.());
        } else {
          mesh.material?.dispose?.();
        }
      });
      pmremGenerator.dispose();
    } catch {
      // Proceed with direct studio lights if PMREM fails
    }

    const rootGroup = new THREE.Group();
    const meshGroup = new THREE.Group();
    rootGroup.add(meshGroup);
    scene.add(rootGroup);

    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [];

    // Restrained PBR material setup: satin titanium/porcelain face, darker anodized obsidian sides
    const satinTitaniumFaceMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#383446'),
      metalness: 0.86,
      roughness: 0.24,
      emissive: new THREE.Color('#130E20'),
      emissiveIntensity: 0.06,
    });
    const porcelainChamferMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#EAE6F5'),
      metalness: 0.92,
      roughness: 0.16,
      emissive: new THREE.Color('#3B1F70'),
      emissiveIntensity: 0.16,
    });

    const matteObsidianFaceMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1E1A2B'),
      metalness: 0.58,
      roughness: 0.4,
      emissive: new THREE.Color('#0F0B1A'),
      emissiveIntensity: 0.05,
    });
    const irisChamferMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#C4B5FD'),
      metalness: 0.88,
      roughness: 0.2,
      emissive: new THREE.Color('#4C1D95'),
      emissiveIntensity: 0.18,
    });

    const spinePolishedFaceMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2E2648'),
      metalness: 0.9,
      roughness: 0.18,
      emissive: new THREE.Color('#321760'),
      emissiveIntensity: 0.14,
    });

    materialsToDispose.push(
      satinTitaniumFaceMat,
      porcelainChamferMat,
      matteObsidianFaceMat,
      irisChamferMat,
      spinePolishedFaceMat
    );

    const baseDepth = 0.016;
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: baseDepth,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.0018,
      bevelThickness: 0.0024,
      curveSegments: 36,
    };

    // Match the canonical SVG silhouette 1:1 in front projection:
    // No per-blade rotY or X/Y spreading; subtle disjoint Z-depth separation centered around z=0.
    const ribbonLayers: {
      fillPath: string;
      zCenter: number;
      materials: [THREE.Material, THREE.Material];
      depth?: number;
    }[] = [
      {
        fillPath: FLIGHTLINE_SVG_PATHS.blade1Fill,
        zCenter: 0.008,
        materials: [satinTitaniumFaceMat, porcelainChamferMat],
      },
      {
        fillPath: FLIGHTLINE_SVG_PATHS.blade2Fill,
        zCenter: 0.003,
        materials: [matteObsidianFaceMat, irisChamferMat],
      },
      {
        fillPath: FLIGHTLINE_SVG_PATHS.blade3Fill,
        zCenter: -0.002,
        materials: [matteObsidianFaceMat, irisChamferMat],
      },
      {
        fillPath: FLIGHTLINE_SVG_PATHS.blade4Fill,
        zCenter: -0.006,
        materials: [satinTitaniumFaceMat, irisChamferMat],
      },
      {
        fillPath: FLIGHTLINE_SVG_PATHS.baseFinFill,
        zCenter: -0.01,
        materials: [matteObsidianFaceMat, irisChamferMat],
      },
      {
        fillPath: FLIGHTLINE_SVG_PATHS.sSpineFill,
        zCenter: 0.012,
        materials: [spinePolishedFaceMat, porcelainChamferMat],
        depth: 0.018,
      },
    ];

    for (const layer of ribbonLayers) {
      const layerDepth = layer.depth ?? baseDepth;
      const shapes = createShapesFromFlightlinePath(layer.fillPath);
      const geom = new THREE.ExtrudeGeometry(shapes, {
        ...extrudeSettings,
        depth: layerDepth,
      });
      geom.computeVertexNormals();
      geometriesToDispose.push(geom);

      const mesh = new THREE.Mesh(geom, layer.materials);
      mesh.position.z = layer.zCenter - layerDepth / 2;
      meshGroup.add(mesh);
    }

    // Verify canonical 3D bounds stay strictly inside SAFE_STAGE_MIN_X..SAFE_STAGE_MAX_X and clear the callout rail
    const fittedBox = new THREE.Box3().setFromObject(rootGroup);
    const boundsCheck = validateFlightlineSafeBounds(fittedBox, MAX_ALLOWED_TILT_DEG);
    container.dataset.boundsValid = String(boundsCheck.valid);

    // Controlled studio lighting rig: cool silver key + hemisphere fill + thin violet rim
    const hemiLight = new THREE.HemisphereLight('#F2EFFA', '#0D0A14', 1.05);
    scene.add(hemiLight);

    const studioKeyLight = new THREE.DirectionalLight('#F5F2FA', 3.0);
    studioKeyLight.position.set(-2.2, 2.6, 3.8);
    scene.add(studioKeyLight);

    const violetRimLight = new THREE.DirectionalLight('#8B5CF6', 2.2);
    violetRimLight.position.set(2.6, -1.3, 2.4);
    scene.add(violetRimLight);

    const sweepLight = new THREE.PointLight('#EDE9FE', 4.2, 5.5, 1.5);
    sweepLight.position.set(-0.55, 0.38, 1.35);
    scene.add(sweepLight);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Single render-on-demand scheduler:
    // 1.8s finite entrance highlight sweep (replayed on viewport re-entry), then 0 FPS idle
    let sweepStartTime = performance.now();
    const SWEEP_DURATION_MS = isSoftwareGl ? 0 : 1800;
    let currentRotX = 0;
    let currentRotY = 0;
    let lastTime = sweepStartTime;
    let isVisible = true;
    let isTabVisible = document.visibilityState === 'visible';
    let frameId: number | null = null;
    let contextLost = false;
    let hasRenderedFirstFrame = false;

    const renderFrame = (now: number) => {
      frameId = null;
      if (!renderer || contextLost || !isVisible || !isTabVisible) return;

      const dt = Math.min(0.1, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const elapsed = now - sweepStartTime;
      const sweepProgress =
        SWEEP_DURATION_MS > 0 ? Math.min(1, elapsed / SWEEP_DURATION_MS) : 1;
      const easedSweep = 1 - Math.pow(1 - sweepProgress, 3);

      sweepLight.position.set(
        -1.05 + easedSweep * 1.15,
        0.85 - easedSweep * 1.15,
        1.35
      );
      sweepLight.intensity = 4.2 - easedSweep * 1.7;

      const targetX = tiltTargetRef.current.x;
      const targetY = tiltTargetRef.current.y;

      if (isSoftwareGl) {
        currentRotX = targetX;
        currentRotY = targetY;
      } else {
        currentRotX = THREE.MathUtils.damp(currentRotX, targetX, 9, dt);
        currentRotY = THREE.MathUtils.damp(currentRotY, targetY, 9, dt);
      }

      rootGroup.rotation.x = currentRotX;
      rootGroup.rotation.y = currentRotY;

      renderer.render(scene, camera);

      // Signal ready only AFTER the first frame has actually rendered into the canvas buffer
      if (!hasRenderedFirstFrame) {
        hasRenderedFirstFrame = true;
        onReadyRef.current?.();
      }

      const tiltDelta =
        isSoftwareGl
          ? 0
          : Math.abs(targetX - currentRotX) + Math.abs(targetY - currentRotY);
      if (sweepProgress < 1 || tiltDelta > 0.0005) {
        frameId = window.requestAnimationFrame(renderFrame);
      }
    };

    const scheduleRender = () => {
      if (frameId === null && !contextLost && isVisible && isTabVisible) {
        frameId = window.requestAnimationFrame(renderFrame);
      }
    };

    wakeSceneRef.current = scheduleRender;

    // Render first frame immediately so there is no blank canvas flash
    renderFrame(performance.now());

    const updateSize = () => {
      if (!container || !renderer || contextLost) return;
      const nextW = container.clientWidth || 468;
      const nextH = container.clientHeight || 421;
      camera.aspect = nextW / nextH;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(computeAdaptiveDpr());
      renderer.setSize(nextW, nextH, false);
      scheduleRender();
    };

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateSize();
      });
      resizeObserver.observe(container);
    }

    const handleVisibilityChange = () => {
      isTabVisible = document.visibilityState === 'visible';
      if (isTabVisible) {
        lastTime = performance.now();
        scheduleRender();
      } else if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
      }
    };

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
      }
      const stageEl = container.closest('[data-testid="flightline-hero-stage"]');
      if (stageEl) {
        stageEl.setAttribute('data-scene-mode', 'svg-fallback');
      }
      onFallbackRef.current?.();
    };

    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          const wasVisible = isVisible;
          isVisible = entry.isIntersecting;
          if (isVisible) {
            const now = performance.now();
            lastTime = now;
            // Replay the finite 1.8s studio highlight sweep when re-entering the viewport
            if (!wasVisible) {
              sweepStartTime = now;
            }
            scheduleRender();
          } else if (frameId !== null) {
            window.cancelAnimationFrame(frameId);
            frameId = null;
          }
        },
        { threshold: 0.08 }
      );
      intersectionObserver.observe(container);
    }

    window.addEventListener('resize', updateSize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    canvas.addEventListener('webglcontextlost', handleContextLost, false);

    return () => {
      wakeSceneRef.current = null;
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener('resize', updateSize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();

      envTexture?.dispose();
      for (const geom of geometriesToDispose) {
        geom.dispose();
      }
      for (const mat of materialsToDispose) {
        mat.dispose();
      }
      renderer?.dispose();
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, [tiltTargetRef, wakeSceneRef]);

  return (
    <div
      ref={containerRef}
      data-testid="flightline-webgl-mount"
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
    />
  );
};

export default FlightlineScene;

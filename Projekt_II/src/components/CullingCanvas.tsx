import { useEffect, useRef } from 'react';

import { Camera, type CameraSnapshot } from '../engine/Camera';
import { CullingRenderer } from '../engine/CullingRenderer';
import { CullingEngine } from '../engine/CullingEngine';
import { CullingScene } from '../engine/CullingScene';
import { useKeyboard } from '../hooks/useKeyboard';
import { useAnimationFrame } from '../hooks/useAnimationFrame';
import { applyKeyboardToCamera } from '../hooks/useCamera';
import { computeCullingStats } from '../hooks/useCullingStats';
import type { CullingStats, CullingSettings } from '../types';

interface CullingCanvasProps {
  settings: CullingSettings;
  onStats?: (
    cameraSnap: CameraSnapshot,
    cullingStats: CullingStats,
    fps: number,
  ) => void;
  onActiveKeysChange?: (keys: Set<string>) => void;
}

export function CullingCanvas({
  settings,
  onStats,
  onActiveKeysChange,
}: CullingCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<Camera | null>(null);
  const rendererRef = useRef<CullingRenderer | null>(null);
  const engineRef = useRef<CullingEngine | null>(null);
  const sceneRef = useRef<CullingScene | null>(null);

  const keysRef = useKeyboard();
  const fpsRef = useRef({ acc: 0, frames: 0, fps: 0 });

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const camera = new Camera();
    const renderer = new CullingRenderer(canvasRef.current);
    const engine = new CullingEngine();
    const scene = new CullingScene();

    cameraRef.current = camera;
    rendererRef.current = renderer;
    engineRef.current = engine;
    sceneRef.current = scene;

    const updateSize = () => {
      const rect = containerRef.current!.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      renderer.resize(w, h);
      camera.setAspect(w / h);
    };
    updateSize();

    const ro = new ResizeObserver(updateSize);
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      renderer.dispose();
      cameraRef.current = null;
      rendererRef.current = null;
      engineRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  useAnimationFrame((dt) => {
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const engine = engineRef.current;
    const scene = sceneRef.current;
    if (!camera || !renderer || !engine || !scene) return;

    engine.settings = settingsRef.current;

    applyKeyboardToCamera(camera, keysRef.current!, dt);

    engine.updateFrustum(camera);
    engine.cullScene(scene.polygons, camera.position);

    renderer.render(
      scene.polygons,
      camera,
      settingsRef.current.showCulled,
      settingsRef.current.showNormals,
    );

    const fps = fpsRef.current;
    fps.acc += dt;
    fps.frames += 1;
    if (fps.acc >= 0.5) {
      fps.fps = fps.frames / fps.acc;
      fps.acc = 0;
      fps.frames = 0;
    }

    const stats = computeCullingStats(scene.polygons);
    onStats?.(camera.snapshot(), stats, fps.fps);

    if (onActiveKeysChange) {
      onActiveKeysChange(new Set(keysRef.current!));
    }
  });

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}

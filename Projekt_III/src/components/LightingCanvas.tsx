import { useEffect, useRef } from 'react';
import { Camera, type CameraSnapshot } from '../engine/Camera';
import { LightSource } from '../engine/LightSource';
import { LightingScene } from '../engine/LightingScene';
import { LightingRenderer } from '../engine/LightingRenderer';
import { useKeyboard } from '../hooks/useKeyboard';
import { useAnimationFrame } from '../hooks/useAnimationFrame';
import { applyKeyboardToCamera } from '../hooks/useCamera';
import { applyKeyboardToLight } from '../hooks/useLightControl';

export interface LightingFrameData {
  cameraSnap: CameraSnapshot;
  lightPos: [number, number, number];
  lightColor: [number, number, number];
  lightIntensity: number;
  fps: number;
}

interface Props {
  onFrame?: (data: LightingFrameData) => void;
  onActiveKeysChange?: (keys: Set<string>) => void;
  cameraRef: React.RefObject<Camera | null>;
  lightRef: React.RefObject<LightSource | null>;
  sceneRef: React.RefObject<LightingScene | null>;
}

export function LightingCanvas({
  onFrame,
  onActiveKeysChange,
  cameraRef,
  lightRef,
  sceneRef,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<LightingRenderer | null>(null);

  const keysRef = useKeyboard();
  const fpsRef = useRef({ acc: 0, frames: 0, fps: 0 });

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const renderer = new LightingRenderer(canvasRef.current);
    rendererRef.current = renderer;

    const updateSize = () => {
      const rect = containerRef.current!.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      renderer.resize(w, h);
      cameraRef.current?.setAspect(w / h);
    };
    updateSize();

    const ro = new ResizeObserver(updateSize);
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      renderer.dispose();
      rendererRef.current = null;
    };
  }, [cameraRef]);

  useAnimationFrame((dt) => {
    const camera = cameraRef.current;
    const light = lightRef.current;
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    if (!camera || !light || !scene || !renderer) return;

    const keys = keysRef.current!;

    if (keys.has('r')) {
      camera.reset();
      light.reset();
    }

    applyKeyboardToCamera(camera, keys, dt);
    applyKeyboardToLight(light, keys, dt);

    // Gouraud: recompute per-vertex colors each frame
    scene.updateLighting(light, camera);

    renderer.render(scene, camera, light);

    const fps = fpsRef.current;
    fps.acc += dt;
    fps.frames += 1;
    if (fps.acc >= 0.5) {
      fps.fps = fps.frames / fps.acc;
      fps.acc = 0;
      fps.frames = 0;
    }

    onFrame?.({
      cameraSnap: camera.snapshot(),
      lightPos: [light.position[0], light.position[1], light.position[2]],
      lightColor: [light.color[0], light.color[1], light.color[2]],
      lightIntensity: light.intensity,
      fps: fps.fps,
    });

    if (onActiveKeysChange) {
      onActiveKeysChange(new Set(keys));
    }
  });

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}

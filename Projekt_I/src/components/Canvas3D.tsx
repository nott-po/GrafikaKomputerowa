// Canvas + kamera + pętla renderowania

import { useEffect, useRef } from 'react';

import { Camera, type CameraSnapshot } from '../engine/Camera';
import { Renderer } from '../engine/Renderer';
import { useKeyboard } from '../hooks/useKeyboard';
import { useAnimationFrame } from '../hooks/useAnimationFrame';
import { applyKeyboardToCamera } from '../hooks/useCamera';

interface Canvas3DProps {
  onStats?: (snapshot: CameraSnapshot, fps: number) => void;
  onActiveKeysChange?: (keys: Set<string>) => void;
}

export function Canvas3D({ onStats, onActiveKeysChange }: Canvas3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<Camera | null>(null);
  const rendererRef = useRef<Renderer | null>(null);

  const keysRef = useKeyboard();

  // wygładzanie FPS
  const fpsRef = useRef({ acc: 0, frames: 0, fps: 0 });

  // init + resize
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const camera = new Camera();
    const renderer = new Renderer(canvasRef.current);
    cameraRef.current = camera;
    rendererRef.current = renderer;

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
    };
  }, []);

  // co klatkę: input → kamera → renderuj → wyślij statsy
  useAnimationFrame((dt) => {
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    if (!camera || !renderer) return;

    applyKeyboardToCamera(camera, keysRef.current!, dt);
    renderer.render(camera);

    // FPS liczone co ~0.5s
    const fps = fpsRef.current;
    fps.acc += dt;
    fps.frames += 1;
    if (fps.acc >= 0.5) {
      fps.fps = fps.frames / fps.acc;
      fps.acc = 0;
      fps.frames = 0;
    }

    onStats?.(camera.snapshot(), fps.fps);
    // klon klawiszy żeby React odświeżył
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

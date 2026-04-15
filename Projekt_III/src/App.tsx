import { useState, useCallback, useRef } from 'react';

import { Camera, type CameraSnapshot } from './engine/Camera';
import { LightSource, type ColorPreset } from './engine/LightSource';
import { LightingScene } from './engine/LightingScene';
import { LightingCanvas, type LightingFrameData } from './components/LightingCanvas';
import { CameraInfo } from './components/CameraInfo';
import { LightControls } from './components/LightControls';

function App() {
  const cameraRef = useRef<Camera | null>(new Camera());
  const lightRef = useRef<LightSource | null>(new LightSource());
  const sceneRef = useRef<LightingScene | null>(new LightingScene());

  const [cameraSnap, setCameraSnap] = useState<CameraSnapshot>({
    position: [0, 2, 8],
    yawDeg: 0,
    pitchDeg: -10,
    fov: 60,
  });
  const [lightPos, setLightPos] = useState<[number, number, number]>([3, 3, 3]);
  const [lightColor, setLightColor] = useState<[number, number, number]>([1, 1, 1]);
  const [lightIntensity, setLightIntensity] = useState(1.0);
  const [fps, setFps] = useState(0);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());

  const handleFrame = useCallback((data: LightingFrameData) => {
    setCameraSnap(data.cameraSnap);
    setLightPos(data.lightPos);
    setLightColor(data.lightColor);
    setLightIntensity(data.lightIntensity);
    setFps(data.fps);
  }, []);

  const handleColorChange = useCallback((preset: ColorPreset) => {
    lightRef.current?.setColorPreset(preset);
  }, []);

  const handleIntensityChange = useCallback((value: number) => {
    lightRef.current?.setIntensity(value);
  }, []);

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col">
      {/* Top bar */}
      <header className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-block w-2 h-2 bg-neutral-100" />
          <span className="text-sm tracking-[0.2em] uppercase text-neutral-100">
            Phong Lighting
          </span>
        </div>
        <div className="text-sm text-neutral-500 tracking-wider">
          PROJEKT 3 · GK
        </div>
      </header>

      {/* Canvas area */}
      <main className="flex-1 relative">
        <LightingCanvas
          cameraRef={cameraRef}
          lightRef={lightRef}
          sceneRef={sceneRef}
          onFrame={handleFrame}
          onActiveKeysChange={setActiveKeys}
        />

        {/* Controls overlay — top left */}
        <aside className="absolute top-5 left-5 pointer-events-none space-y-3">
          <div className="pointer-events-auto">
            <LightControls
              lightPos={lightPos}
              lightColor={lightColor}
              lightIntensity={lightIntensity}
              onColorChange={handleColorChange}
              onIntensityChange={handleIntensityChange}
            />
          </div>

          {/* Keyboard reference */}
          <div className="border border-neutral-700 bg-black/70 backdrop-blur-md px-5 py-4 text-sm leading-relaxed min-w-[260px]">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800">
              <span className="text-neutral-300 tracking-widest text-xs uppercase">
                Controls
              </span>
            </div>
            <div className="space-y-2">
              <KeyRow label="translate" keys={['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']} display={['←', '→', '↑', '↓']} active={activeKeys} />
              <KeyRow label="up / down" keys={['Space', 'Shift']} display={['␣', '⇧']} active={activeKeys} />
              <KeyRow label="rotate" keys={['w', 'a', 's', 'd']} display={['W', 'A', 'S', 'D']} active={activeKeys} />
              <KeyRow label="zoom" keys={['z', 'x']} display={['Z', 'X']} active={activeKeys} />
              <div className="pt-2 border-t border-neutral-800" />
              <KeyRow label="light h" keys={['j', 'l', 'i', 'k']} display={['J', 'L', 'I', 'K']} active={activeKeys} />
              <KeyRow label="light v" keys={['u', 'o']} display={['U', 'O']} active={activeKeys} />
              <KeyRow label="reset" keys={['r']} display={['R']} active={activeKeys} />
            </div>
          </div>
        </aside>

        {/* Stats overlay — top right */}
        <aside className="absolute top-5 right-5 pointer-events-none space-y-3">
          <CameraInfo snapshot={cameraSnap} fps={fps} />
        </aside>

        {/* Crosshair */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-4 h-px bg-neutral-700" />
          <div className="w-px h-4 bg-neutral-700 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Sphere labels */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-20 text-xs text-neutral-500 pointer-events-none tracking-wider uppercase">
          <span>Metal</span>
          <span>Matte</span>
          <span>Plastic</span>
          <span>Wood</span>
        </div>

        {/* Bottom status bar */}
        <footer className="absolute bottom-0 left-0 right-0 border-t border-neutral-900 px-6 py-2.5 flex items-center justify-between text-xs text-neutral-500 bg-black/50 backdrop-blur-sm pointer-events-none">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
              ready
            </span>
            <span>WebGL</span>
          </div>
          <div className="flex items-center gap-4">
            <span>phong reflection model</span>
            <span className="text-neutral-700">|</span>
            <span>gouraud shading (per-vertex)</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

function KeyRow({
  label,
  keys,
  display,
  active,
}: {
  label: string;
  keys: string[];
  display: string[];
  active: Set<string>;
}) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-neutral-500">{label}</span>
      <div className="flex gap-1">
        {keys.map((k, i) => {
          const isActive = active.has(k);
          return (
            <span
              key={k}
              className={
                'inline-flex items-center justify-center px-1.5 min-w-[22px] h-5 border text-[11px] transition-colors ' +
                (isActive
                  ? 'border-neutral-200 bg-neutral-200 text-black'
                  : 'border-neutral-700 text-neutral-300')
              }
            >
              {display[i]}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default App;

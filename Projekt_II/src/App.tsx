import { useState, useCallback } from 'react';

import { CullingCanvas } from './components/CullingCanvas';
import { StatsPanel } from './components/StatsPanel';
import { DebugControls } from './components/DebugControls';
import type { CameraSnapshot } from './engine/Camera';
import type { CullingStats, CullingSettings } from './types';

const INITIAL_STATS: CullingStats = {
  total: 0,
  visible: 0,
  backfaceCulled: 0,
  frustumCulled: 0,
  cullingRate: 0,
};

function App() {
  const [cameraSnap, setCameraSnap] = useState<CameraSnapshot>({
    position: [0, 2, 8],
    yawDeg: 0,
    pitchDeg: -10,
    fov: 60,
  });
  const [cullingStats, setCullingStats] = useState<CullingStats>(INITIAL_STATS);
  const [fps, setFps] = useState(0);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [settings, setSettings] = useState<CullingSettings>({
    enableBackFace: true,
    enableFrustum: true,
    showCulled: false,
    showNormals: false,
  });

  const handleToggle = useCallback((key: keyof CullingSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col">
      <header className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-block w-2 h-2 bg-neutral-100" />
          <span className="text-sm tracking-[0.2em] uppercase text-neutral-100">
            Polygon Culling
          </span>
        </div>
        <div className="text-sm text-neutral-500 tracking-wider">
          PROJEKT 2 · GK
        </div>
      </header>

      <main className="flex-1 relative">
        <CullingCanvas
          settings={settings}
          onStats={(snap, stats, f) => {
            setCameraSnap(snap);
            setCullingStats(stats);
            setFps(f);
          }}
          onActiveKeysChange={setActiveKeys}
        />

        <aside className="absolute top-5 left-5 pointer-events-none space-y-3">
          <div className="pointer-events-auto">
            <DebugControls settings={settings} onToggle={handleToggle} />
          </div>

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
              <KeyRow label="reset" keys={['r']} display={['R']} active={activeKeys} />
            </div>
          </div>
        </aside>

        <aside className="absolute top-5 right-5 pointer-events-none space-y-3">
          <StatsPanel stats={cullingStats} fps={fps} />

          <div className="border border-neutral-800 bg-black/70 backdrop-blur-md px-5 py-4 text-sm leading-relaxed min-w-[240px]">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800">
              <span className="text-neutral-300 tracking-widest text-xs uppercase">
                Camera
              </span>
              <span className="text-neutral-600 text-xs">live</span>
            </div>
            <div className="space-y-1.5">
              <Stat label="pos" value={fmtVec(cameraSnap.position)} />
              <Stat label="yaw" value={fmtDeg(cameraSnap.yawDeg)} />
              <Stat label="pitch" value={fmtDeg(cameraSnap.pitchDeg)} />
              <Stat label="fov" value={`${cameraSnap.fov.toFixed(0)}°`} />
            </div>
          </div>
        </aside>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-4 h-px bg-neutral-700" />
          <div className="w-px h-4 bg-neutral-700 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>

        <footer className="absolute bottom-0 left-0 right-0 border-t border-neutral-900 px-6 py-2.5 flex items-center justify-between text-xs text-neutral-500 bg-black/50 backdrop-blur-sm pointer-events-none">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
              ready
            </span>
            <span>WebGL</span>
          </div>
          <div className="flex items-center gap-4">
            <span>back-face + frustum culling</span>
            <span className="text-neutral-700">|</span>
            <span>geometric methods only</span>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-neutral-500">{label}</span>
      <span className="text-neutral-100 tabular-nums">{value}</span>
    </div>
  );
}

function fmtVec(v: [number, number, number]): string {
  return `${v[0].toFixed(2)}, ${v[1].toFixed(2)}, ${v[2].toFixed(2)}`;
}

function fmtDeg(d: number): string {
  const sign = d >= 0 ? ' ' : '';
  return `${sign}${d.toFixed(1)}°`;
}

export default App;

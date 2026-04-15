import { useState } from 'react';

import { Canvas3D } from './components/Canvas3D';
import { ControlsPanel } from './components/ui/ControlsPanel';
import { StatsPanel } from './components/ui/StatsPanel';
import { Crosshair } from './components/ui/Crosshair';
import { StatusBar } from './components/ui/StatusBar';
import type { CameraSnapshot } from './engine/Camera';

const INITIAL_STATS: CameraSnapshot = {
  position: [0, 2, 8],
  yawDeg: 0,
  pitchDeg: -10,
  fov: 60,
};

function App() {
  const [stats, setStats] = useState<CameraSnapshot>(INITIAL_STATS);
  const [fps, setFps] = useState(0);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col">
      {/* Top bar */}
      <header className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-block w-2 h-2 bg-neutral-100" />
          <span className="text-sm tracking-[0.2em] uppercase text-neutral-100">
            Virtual Camera
          </span>
        </div>
        <div className="text-sm text-neutral-500 tracking-wider">
          PROJEKT 1 · GK
        </div>
      </header>

      {/* Canvas area */}
      <main className="flex-1 relative">
        <Canvas3D
          onStats={(snap, frames) => {
            setStats(snap);
            setFps(frames);
          }}
          onActiveKeysChange={setActiveKeys}
        />

        <ControlsPanel activeKeys={activeKeys} />
        <StatsPanel stats={stats} fps={fps} />
        <Crosshair />
        <StatusBar />
      </main>
    </div>
  );
}

export default App;

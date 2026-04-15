import type { CameraSnapshot } from '../../engine/Camera';
import { Stat } from './Stat';

function fmtVec(v: [number, number, number]): string {
  return `${v[0].toFixed(2)}, ${v[1].toFixed(2)}, ${v[2].toFixed(2)}`;
}

function fmtDeg(d: number): string {
  const sign = d >= 0 ? ' ' : '';
  return `${sign}${d.toFixed(1)}°`;
}

export function StatsPanel({
  stats,
  fps,
}: {
  stats: CameraSnapshot;
  fps: number;
}) {
  return (
    <aside className="absolute top-5 right-5 border border-neutral-800 bg-black/70 backdrop-blur-md px-5 py-4 text-sm leading-relaxed min-w-[240px] pointer-events-none">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800">
        <span className="text-neutral-300 tracking-widest text-xs uppercase">
          Camera
        </span>
        <span className="text-neutral-600 text-xs">live</span>
      </div>
      <div className="space-y-1.5">
        <Stat label="pos" value={fmtVec(stats.position)} />
        <Stat label="yaw" value={fmtDeg(stats.yawDeg)} />
        <Stat label="pitch" value={fmtDeg(stats.pitchDeg)} />
        <Stat label="fov" value={`${stats.fov.toFixed(0)}°`} />
        <Stat label="fps" value={fps.toFixed(0)} />
      </div>
    </aside>
  );
}

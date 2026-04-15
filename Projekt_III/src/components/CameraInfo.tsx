import type { CameraSnapshot } from '../engine/Camera';

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

interface Props {
  snapshot: CameraSnapshot;
  fps: number;
}

export function CameraInfo({ snapshot, fps }: Props) {
  return (
    <div className="border border-neutral-800 bg-black/70 backdrop-blur-md px-5 py-4 text-sm leading-relaxed min-w-[240px]">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800">
        <span className="text-neutral-300 tracking-widest text-xs uppercase">
          Camera
        </span>
        <span className="text-neutral-600 text-xs">live</span>
      </div>
      <div className="space-y-1.5">
        <Stat label="pos" value={fmtVec(snapshot.position)} />
        <Stat label="yaw" value={fmtDeg(snapshot.yawDeg)} />
        <Stat label="pitch" value={fmtDeg(snapshot.pitchDeg)} />
        <Stat label="fov" value={`${snapshot.fov.toFixed(0)}°`} />
        <div className="pt-2 border-t border-neutral-800">
          <Stat label="fps" value={fps.toFixed(0)} />
        </div>
      </div>
    </div>
  );
}

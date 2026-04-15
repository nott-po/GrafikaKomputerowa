import type { CullingStats } from '../types';

interface Props {
  stats: CullingStats;
  fps: number;
}

function StatRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-neutral-500">{label}</span>
      <span className={`tabular-nums ${color}`}>{value}</span>
    </div>
  );
}

export function StatsPanel({ stats, fps }: Props) {
  const culled = stats.total - stats.visible;
  const visiblePct = stats.total > 0 ? ((stats.visible / stats.total) * 100).toFixed(0) : '0';
  const culledPct = stats.cullingRate.toFixed(0);

  return (
    <div className="border border-neutral-700 bg-black/70 backdrop-blur-md px-5 py-4 text-sm leading-relaxed min-w-[260px]">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800">
        <span className="text-neutral-300 tracking-widest text-xs uppercase">
          Culling Stats
        </span>
        <span className="text-neutral-600 text-xs">live</span>
      </div>

      <div className="space-y-1.5">
        <StatRow label="total polygons" value={stats.total} color="text-neutral-300" />
        <StatRow
          label="visible"
          value={`${stats.visible} (${visiblePct}%)`}
          color="text-emerald-400"
        />
        <StatRow
          label="culled"
          value={`${culled} (${culledPct}%)`}
          color="text-red-400"
        />

        <div className="ml-3 space-y-1 text-xs">
          <StatRow
            label="back-face"
            value={stats.backfaceCulled}
            color="text-red-300"
          />
          <StatRow
            label="frustum"
            value={stats.frustumCulled}
            color="text-cyan-300"
          />
        </div>

        <div className="pt-2 border-t border-neutral-800">
          <StatRow
            label="performance gain"
            value={`${stats.cullingRate.toFixed(1)}%`}
            color="text-blue-400"
          />
          <StatRow label="fps" value={fps.toFixed(0)} color="text-neutral-400" />
        </div>
      </div>
    </div>
  );
}

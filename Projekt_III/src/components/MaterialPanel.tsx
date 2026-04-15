import type { Material } from '../engine/Material';

function fmtVec3(v: { [index: number]: number }): string {
  return `${v[0].toFixed(2)}, ${v[1].toFixed(2)}, ${v[2].toFixed(2)}`;
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

interface Props {
  materials: Material[];
}

export function MaterialPanel({ materials }: Props) {
  return (
    <div className="border border-neutral-700 bg-black/70 backdrop-blur-md px-5 py-4 text-sm leading-relaxed min-w-[260px]">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800">
        <span className="text-neutral-300 tracking-widest text-xs uppercase">
          Materials
        </span>
      </div>

      <div className="space-y-3">
        {materials.map(mat => (
          <div key={mat.name}>
            <div className="text-neutral-200 text-xs font-medium mb-1">{mat.name}</div>
            <div className="space-y-0.5 text-xs ml-2">
              <StatRow label="k_a" value={fmtVec3(mat.ambient)} color="text-neutral-400" />
              <StatRow label="k_d" value={fmtVec3(mat.diffuse)} color="text-neutral-300" />
              <StatRow label="k_s" value={fmtVec3(mat.specular)} color="text-neutral-300" />
              <StatRow label="shininess" value={mat.shininess} color="text-neutral-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

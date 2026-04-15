import type { CullingSettings } from '../types';

interface Props {
  settings: CullingSettings;
  onToggle: (key: keyof CullingSettings) => void;
}

function Toggle({
  label,
  checked,
  color,
  onChange,
}: {
  label: string;
  checked: boolean;
  color: string;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer select-none">
      <span className="text-neutral-400 text-sm">{label}</span>
      <button
        type="button"
        onClick={onChange}
        className={
          'relative w-9 h-5 rounded-full transition-colors ' +
          (checked ? color : 'bg-neutral-700')
        }
      >
        <span
          className={
            'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ' +
            (checked ? 'translate-x-4' : 'translate-x-0')
          }
        />
      </button>
    </label>
  );
}

export function DebugControls({ settings, onToggle }: Props) {
  return (
    <div className="border border-neutral-700 bg-black/70 backdrop-blur-md px-5 py-4 text-sm min-w-[260px]">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800">
        <span className="text-neutral-300 tracking-widest text-xs uppercase">
          Culling Controls
        </span>
      </div>

      <div className="space-y-2.5">
        <Toggle
          label="Back-Face Culling"
          checked={settings.enableBackFace}
          color="bg-red-500/80"
          onChange={() => onToggle('enableBackFace')}
        />
        <Toggle
          label="Frustum Culling"
          checked={settings.enableFrustum}
          color="bg-cyan-500/80"
          onChange={() => onToggle('enableFrustum')}
        />
        <Toggle
          label="Show Culled"
          checked={settings.showCulled}
          color="bg-amber-500/80"
          onChange={() => onToggle('showCulled')}
        />
        <Toggle
          label="Show Normals"
          checked={settings.showNormals}
          color="bg-yellow-500/80"
          onChange={() => onToggle('showNormals')}
        />
      </div>

      <div className="mt-3 pt-3 border-t border-neutral-800 space-y-1 text-xs text-neutral-600">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-0.5 bg-white" /> visible
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-0.5 bg-red-400" /> back-face culled
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-0.5 bg-cyan-400" /> frustum culled
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-0.5 bg-yellow-400" /> normal vector
        </div>
      </div>
    </div>
  );
}

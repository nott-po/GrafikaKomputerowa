import { KeyRow } from './KeyRow';

export function ControlsPanel({ activeKeys }: { activeKeys: Set<string> }) {
  return (
    <aside className="absolute top-5 left-5 border border-neutral-700 bg-black/70 backdrop-blur-md px-5 py-4 text-sm leading-relaxed min-w-[260px] pointer-events-none">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800">
        <span className="text-neutral-300 tracking-widest text-xs uppercase">
          Controls
        </span>
        <span className="text-neutral-600 text-xs">[?]</span>
      </div>
      <div className="space-y-2">
        <KeyRow
          label="translate"
          keys={['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']}
          display={['←', '→', '↑', '↓']}
          active={activeKeys}
        />
        <KeyRow
          label="up / down"
          keys={['Space', 'Shift']}
          display={['␣', '⇧']}
          active={activeKeys}
        />
        <KeyRow
          label="rotate"
          keys={['w', 'a', 's', 'd']}
          display={['W', 'A', 'S', 'D']}
          active={activeKeys}
        />
        <KeyRow
          label="zoom"
          keys={['z', 'x']}
          display={['Z', 'X']}
          active={activeKeys}
        />
        <KeyRow
          label="reset"
          keys={['r']}
          display={['R']}
          active={activeKeys}
        />
      </div>
    </aside>
  );
}

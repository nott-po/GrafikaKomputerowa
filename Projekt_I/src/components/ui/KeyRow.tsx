export function KeyRow({
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

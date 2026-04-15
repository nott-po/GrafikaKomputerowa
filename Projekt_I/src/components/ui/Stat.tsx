export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-neutral-500">{label}</span>
      <span className="text-neutral-100 tabular-nums">{value}</span>
    </div>
  );
}

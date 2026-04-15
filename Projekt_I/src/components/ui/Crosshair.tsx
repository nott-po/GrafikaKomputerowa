export function Crosshair() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      <div className="w-4 h-px bg-neutral-700" />
      <div className="w-px h-4 bg-neutral-700 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
  );
}

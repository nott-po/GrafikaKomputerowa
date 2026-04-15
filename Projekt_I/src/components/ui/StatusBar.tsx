export function StatusBar() {
  return (
    <footer className="absolute bottom-0 left-0 right-0 border-t border-neutral-900 px-6 py-2.5 flex items-center justify-between text-xs text-neutral-500 bg-black/50 backdrop-blur-sm pointer-events-none">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
          ready
        </span>
        <span>WebGL</span>
      </div>
      <div className="flex items-center gap-4">
        <span>perspective</span>
        <span className="text-neutral-700">|</span>
        <span>local-space</span>
      </div>
    </footer>
  );
}

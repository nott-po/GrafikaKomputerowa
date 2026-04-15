import type { ColorPreset } from '../engine/LightSource';

const COLOR_PRESETS: { name: ColorPreset; label: string; css: string }[] = [
  { name: 'white', label: 'White', css: 'bg-white' },
  { name: 'warm', label: 'Warm', css: 'bg-yellow-300' },
  { name: 'cool', label: 'Cool', css: 'bg-blue-200' },
  { name: 'red', label: 'Red', css: 'bg-red-500' },
  { name: 'blue', label: 'Blue', css: 'bg-blue-500' },
];

interface Props {
  lightPos: [number, number, number];
  lightColor: [number, number, number];
  lightIntensity: number;
  onColorChange: (preset: ColorPreset) => void;
  onIntensityChange: (value: number) => void;
}

export function LightControls({
  lightPos,
  lightIntensity,
  onColorChange,
  onIntensityChange,
}: Props) {
  return (
    <div className="border border-neutral-700 bg-black/70 backdrop-blur-md px-5 py-4 text-sm leading-relaxed min-w-[260px]">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800">
        <span className="text-neutral-300 tracking-widest text-xs uppercase">
          Light Source
        </span>
        <span className="text-neutral-600 text-xs">live</span>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between gap-4">
          <span className="text-neutral-500">pos</span>
          <span className="text-neutral-100 tabular-nums">
            {lightPos[0].toFixed(2)}, {lightPos[1].toFixed(2)}, {lightPos[2].toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-neutral-500">intensity</span>
          <span className="text-neutral-100 tabular-nums">
            {lightIntensity.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Intensity slider */}
      <div className="mt-3 pt-3 border-t border-neutral-800">
        <input
          type="range"
          min="0.1"
          max="2.0"
          step="0.1"
          value={lightIntensity}
          onChange={e => onIntensityChange(parseFloat(e.target.value))}
          className="w-full h-1 accent-neutral-400"
        />
      </div>

      {/* Color presets */}
      <div className="mt-3 pt-3 border-t border-neutral-800">
        <span className="text-neutral-500 text-xs block mb-2">color preset</span>
        <div className="flex gap-2">
          {COLOR_PRESETS.map(preset => (
            <button
              key={preset.name}
              onClick={() => onColorChange(preset.name)}
              className={`w-5 h-5 rounded-full ${preset.css} border border-neutral-600
                hover:ring-1 hover:ring-neutral-400 transition-all cursor-pointer`}
              title={preset.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

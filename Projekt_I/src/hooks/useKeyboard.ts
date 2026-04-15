// Set aktualnie wciśniętych klawiszy (ref, nie state — żeby nie triggerować renderów)
// używa e.code (fizyczny klawisz, niezależny od layoutu)

import { useEffect, useRef } from 'react';

// "KeyW" → "w", "ArrowUp" → "ArrowUp", "ShiftLeft"/"ShiftRight" → "Shift"
function normaliseCode(code: string): string | null {
  if (code.startsWith('Key') && code.length === 4) {
    return code.charAt(3).toLowerCase(); // "KeyW" -> "w"
  }
  if (code.startsWith('Arrow')) return code; // "ArrowUp" stays
  if (code === 'Space') return 'Space';
  if (code === 'ShiftLeft' || code === 'ShiftRight') return 'Shift';
  return null;
}

export function useKeyboard(): React.RefObject<Set<string>> {
  const keysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // ignoruj jeśli focus na input/textarea
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      const normal = normaliseCode(e.code);
      if (normal === null) return;

      keysRef.current.add(normal);

      // blokuj scrollowanie strzałkami/spacją
      if (normal.startsWith('Arrow') || normal === 'Space') {
        e.preventDefault();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const normal = normaliseCode(e.code);
      if (normal === null) return;
      keysRef.current.delete(normal);
    };

    const onBlur = () => {
      // po alt-tab czyść wszystko żeby kamera nie driftowała
      keysRef.current.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  return keysRef;
}

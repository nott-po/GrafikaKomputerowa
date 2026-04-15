import { useEffect, useRef } from 'react';

function normaliseCode(code: string): string | null {
  if (code.startsWith('Key') && code.length === 4) {
    return code.charAt(3).toLowerCase();
  }
  if (code.startsWith('Arrow')) return code;
  if (code === 'Space') return 'Space';
  if (code === 'ShiftLeft' || code === 'ShiftRight') return 'Shift';
  return null;
}

export function useKeyboard(): React.RefObject<Set<string>> {
  const keysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      const normal = normaliseCode(e.code);
      if (normal === null) return;

      keysRef.current.add(normal);

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

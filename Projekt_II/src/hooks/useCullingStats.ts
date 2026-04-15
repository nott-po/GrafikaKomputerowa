import { useRef } from 'react';
import type { Polygon, CullingStats } from '../types';

export function computeCullingStats(polygons: Polygon[]): CullingStats {
  const total = polygons.length;
  let visible = 0;
  let backfaceCulled = 0;
  let frustumCulled = 0;

  for (const p of polygons) {
    if (p.visible) {
      visible++;
    } else if (p.cullingReason === 'backface') {
      backfaceCulled++;
    } else {
      frustumCulled++;
    }
  }

  return {
    total,
    visible,
    backfaceCulled,
    frustumCulled,
    cullingRate: total > 0 ? ((total - visible) / total) * 100 : 0,
  };
}

const EMPTY: CullingStats = {
  total: 0,
  visible: 0,
  backfaceCulled: 0,
  frustumCulled: 0,
  cullingRate: 0,
};

export function useCullingStats(): [CullingStats, (polygons: Polygon[]) => void] {
  const statsRef = useRef<CullingStats>(EMPTY);

  const update = (polygons: Polygon[]) => {
    statsRef.current = computeCullingStats(polygons);
  };

  return [statsRef.current, update];
}

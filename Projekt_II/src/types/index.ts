import type { vec3 } from 'gl-matrix';

export interface Polygon {
  id: string;
  vertices: vec3[];
  normal: vec3;
  center: vec3;
  color?: number;
  visible: boolean;
  cullingReason: 'visible' | 'backface' | 'frustum';
}

export interface CullingStats {
  total: number;
  visible: number;
  backfaceCulled: number;
  frustumCulled: number;
  cullingRate: number;
}

export interface CullingSettings {
  enableBackFace: boolean;
  enableFrustum: boolean;
  showCulled: boolean;
  showNormals: boolean;
}

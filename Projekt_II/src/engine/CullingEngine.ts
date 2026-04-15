import { vec3 } from 'gl-matrix';
import { Frustum } from './Frustum';
import type { Camera } from './Camera';
import type { Polygon, CullingSettings } from '../types';

export class CullingEngine {
  private frustum: Frustum;
  settings: CullingSettings;

  constructor() {
    this.frustum = new Frustum();
    this.settings = {
      enableBackFace: true,
      enableFrustum: true,
      showCulled: false,
      showNormals: false,
    };
  }

  updateFrustum(camera: Camera): void {
    this.frustum.extractFromCamera(camera);
  }

  isBackFacing(polygon: Polygon, cameraPos: vec3): boolean {
    const viewVector = vec3.subtract(vec3.create(), cameraPos, polygon.center);
    vec3.normalize(viewVector, viewVector);
    return vec3.dot(polygon.normal, viewVector) < 0;
  }

  isOutsideFrustum(polygon: Polygon): boolean {
    return !this.frustum.testPolygon(polygon);
  }

  cullScene(polygons: Polygon[], cameraPos: vec3): void {
    for (const polygon of polygons) {
      polygon.visible = true;
      polygon.cullingReason = 'visible';

      if (this.settings.enableBackFace && this.isBackFacing(polygon, cameraPos)) {
        polygon.visible = false;
        polygon.cullingReason = 'backface';
        continue;
      }

      if (this.settings.enableFrustum && this.isOutsideFrustum(polygon)) {
        polygon.visible = false;
        polygon.cullingReason = 'frustum';
      }
    }
  }
}

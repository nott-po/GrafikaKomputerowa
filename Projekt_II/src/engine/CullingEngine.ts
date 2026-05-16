import { vec3, mat4 } from 'gl-matrix';
import { Frustum } from './Frustum';
import type { Camera } from './Camera';
import type { Polygon, CullingSettings } from '../types';

export class CullingEngine {
  private frustum: Frustum;
  private viewMatrix: mat4 = mat4.create();
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
    this.viewMatrix = camera.getViewMatrix();
  }

  isBackFacing(polygon: Polygon, cameraPos: vec3): boolean {
    const viewVector = vec3.subtract(vec3.create(), cameraPos, polygon.center);
    vec3.normalize(viewVector, viewVector);
    return vec3.dot(polygon.normal, viewVector) < 0;
  }

  isOutsideFrustum(polygon: Polygon): boolean {
    return !this.frustum.testPolygon(polygon);
  }

  computeDepth(polygon: Polygon): number {
    // Use the farthest vertex Z in camera space (not centroid) — Newell painter's algorithm
    // In camera space, Z is negative for objects in front; more negative = farther from camera
    const m = this.viewMatrix;
    let minZ = Infinity;
    for (const v of polygon.vertices) {
      const z = m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14];
      if (z < minZ) minZ = z;
    }
    return minZ;
  }

  cullScene(polygons: Polygon[], cameraPos: vec3): void {
    for (const polygon of polygons) {
      polygon.visible = true;
      polygon.cullingReason = 'visible';
      polygon.depth = this.computeDepth(polygon);

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

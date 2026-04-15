import { mat4, vec3 } from 'gl-matrix';
import type { Camera } from './Camera';
import type { Polygon } from '../types';

export class Plane {
  normal: vec3;
  distance: number;

  constructor(a: number, b: number, c: number, d: number) {
    const len = Math.sqrt(a * a + b * b + c * c);
    this.normal = vec3.fromValues(a / len, b / len, c / len);
    this.distance = d / len;
  }

  distanceToPoint(point: vec3): number {
    return vec3.dot(this.normal, point) + this.distance;
  }
}

export class Frustum {
  planes: Plane[] = [];

  extractFromCamera(camera: Camera): void {
    const view = camera.getViewMatrix();
    const proj = camera.getProjectionMatrix();
    const m = mat4.multiply(mat4.create(), proj, view);

    // Gribb-Hartmann: extract 6 planes from VP matrix (column-major)
    this.planes = [
      new Plane(m[3] + m[0], m[7] + m[4], m[11] + m[8],  m[15] + m[12]), // left
      new Plane(m[3] - m[0], m[7] - m[4], m[11] - m[8],  m[15] - m[12]), // right
      new Plane(m[3] + m[1], m[7] + m[5], m[11] + m[9],  m[15] + m[13]), // bottom
      new Plane(m[3] - m[1], m[7] - m[5], m[11] - m[9],  m[15] - m[13]), // top
      new Plane(m[3] + m[2], m[7] + m[6], m[11] + m[10], m[15] + m[14]), // near
      new Plane(m[3] - m[2], m[7] - m[6], m[11] - m[10], m[15] - m[14]), // far
    ];
  }

  testPolygon(polygon: Polygon): boolean {
    for (const plane of this.planes) {
      let allOutside = true;

      for (const vertex of polygon.vertices) {
        if (plane.distanceToPoint(vertex) >= 0) {
          allOutside = false;
          break;
        }
      }

      if (allOutside) {
        return false;
      }
    }

    return true;
  }
}

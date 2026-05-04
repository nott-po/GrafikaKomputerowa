import { vec3 } from 'gl-matrix';
import type { Polygon } from '../types';

let nextId = 0;

function computeNormal(vertices: vec3[]): vec3 {
  const edge1 = vec3.subtract(vec3.create(), vertices[1], vertices[0]);
  const edge2 = vec3.subtract(vec3.create(), vertices[2], vertices[0]);
  const normal = vec3.cross(vec3.create(), edge1, edge2);
  vec3.normalize(normal, normal);
  return normal;
}

function computeCenter(vertices: vec3[]): vec3 {
  const center = vec3.create();
  for (const v of vertices) {
    vec3.add(center, center, v);
  }
  vec3.scale(center, center, 1 / vertices.length);
  return center;
}

export function createTriangle(v0: vec3, v1: vec3, v2: vec3, color?: number): Polygon {
  const vertices = [vec3.clone(v0), vec3.clone(v1), vec3.clone(v2)];
  return {
    id: `poly_${nextId++}`,
    vertices,
    normal: computeNormal(vertices),
    center: computeCenter(vertices),
    color,
    visible: true,
    cullingReason: 'visible',
    depth: 0,
  };
}

export function createQuad(v0: vec3, v1: vec3, v2: vec3, v3: vec3, color?: number): Polygon {
  const vertices = [vec3.clone(v0), vec3.clone(v1), vec3.clone(v2), vec3.clone(v3)];
  return {
    id: `poly_${nextId++}`,
    vertices,
    normal: computeNormal(vertices),
    center: computeCenter(vertices),
    color,
    visible: true,
    cullingReason: 'visible',
    depth: 0,
  };
}

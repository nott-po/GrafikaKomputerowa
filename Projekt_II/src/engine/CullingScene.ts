import { vec3 } from 'gl-matrix';
import { createQuad, createTriangle } from './Polygon';
import type { Polygon } from '../types';

export class CullingScene {
  polygons: Polygon[] = [];

  constructor() {
    this.createTestScene();
  }

  private createTestScene(): void {
    this.createCube(vec3.fromValues(0, 1, 0), 2, 0x4488ff);
    this.createCube(vec3.fromValues(-4.5, 0.75, 1), 1.5, 0x44cc88);
    this.createCube(vec3.fromValues(4.5, 0.75, 1), 1.5, 0xff6688);

    this.createCube(vec3.fromValues(0, 0.5, -12), 1, 0x8888ff);
    this.createCube(vec3.fromValues(-14, 1, 0), 2, 0xff8844);
    this.createCube(vec3.fromValues(14, 1, 0), 2, 0x44ffcc);

    this.createPyramid(vec3.fromValues(-2.5, 0, -4), 2.2, 0xaa66ff);
    this.createPyramid(vec3.fromValues(2.5, 0, -4), 2.2, 0xffaa44);

    this.createOctahedron(vec3.fromValues(0, 3.5, -2), 1.2, 0xff44ff);

    this.createWedge(vec3.fromValues(-7, 0, -5), 2, 1.5, 3, 0x66ddaa);

    this.createCube(vec3.fromValues(7, 1.5, -5), 1.5, 0xdd8866);
    this.createCube(vec3.fromValues(8.5, 0.5, -5), 1, 0xdd8866);
  }

  private createCube(center: vec3, size: number, color: number): void {
    const s = size / 2;
    const [x, y, z] = [center[0], center[1], center[2]];

    const v = [
      vec3.fromValues(x - s, y - s, z - s),
      vec3.fromValues(x + s, y - s, z - s),
      vec3.fromValues(x + s, y + s, z - s),
      vec3.fromValues(x - s, y + s, z - s),
      vec3.fromValues(x - s, y - s, z + s),
      vec3.fromValues(x + s, y - s, z + s),
      vec3.fromValues(x + s, y + s, z + s),
      vec3.fromValues(x - s, y + s, z + s),
    ];

    this.polygons.push(
      createQuad(v[0], v[3], v[2], v[1], color), // -Z front
      createQuad(v[5], v[6], v[7], v[4], color), // +Z back
      createQuad(v[4], v[7], v[3], v[0], color), // -X left
      createQuad(v[1], v[2], v[6], v[5], color), // +X right
      createQuad(v[3], v[7], v[6], v[2], color), // +Y top
      createQuad(v[4], v[0], v[1], v[5], color), // -Y bottom
    );
  }

  private createPyramid(base: vec3, size: number, color: number): void {
    const s = size / 2;
    const [x, y, z] = [base[0], base[1], base[2]];
    const apex = vec3.fromValues(x, y + size, z);

    const b = [
      vec3.fromValues(x - s, y, z - s),
      vec3.fromValues(x + s, y, z - s),
      vec3.fromValues(x + s, y, z + s),
      vec3.fromValues(x - s, y, z + s),
    ];

    this.polygons.push(
      createTriangle(b[1], b[0], apex, color),
      createTriangle(b[2], b[1], apex, color),
      createTriangle(b[3], b[2], apex, color),
      createTriangle(b[0], b[3], apex, color),
    );

    this.polygons.push(createQuad(b[0], b[1], b[2], b[3], color));
  }

  private createOctahedron(center: vec3, r: number, color: number): void {
    const [cx, cy, cz] = [center[0], center[1], center[2]];

    const top    = vec3.fromValues(cx, cy + r, cz);
    const bottom = vec3.fromValues(cx, cy - r, cz);
    const front  = vec3.fromValues(cx, cy, cz - r);
    const back   = vec3.fromValues(cx, cy, cz + r);
    const left   = vec3.fromValues(cx - r, cy, cz);
    const right  = vec3.fromValues(cx + r, cy, cz);

    // upper 4 faces
    this.polygons.push(
      createTriangle(front, right, top, color),
      createTriangle(right, back,  top, color),
      createTriangle(back,  left,  top, color),
      createTriangle(left,  front, top, color),
    );
    // lower 4 faces
    this.polygons.push(
      createTriangle(right, front, bottom, color),
      createTriangle(back,  right, bottom, color),
      createTriangle(left,  back,  bottom, color),
      createTriangle(front, left,  bottom, color),
    );
  }

  private createWedge(
    origin: vec3, w: number, h: number, d: number, color: number,
  ): void {
    const [ox, oy, oz] = [origin[0], origin[1], origin[2]];

    const v = [
      vec3.fromValues(ox,     oy,     oz),
      vec3.fromValues(ox + w, oy,     oz),
      vec3.fromValues(ox,     oy + h, oz),
      vec3.fromValues(ox,     oy,     oz - d),
      vec3.fromValues(ox + w, oy,     oz - d),
      vec3.fromValues(ox,     oy + h, oz - d),
    ];

    this.polygons.push(createTriangle(v[1], v[2], v[0], color)); // front cap
    this.polygons.push(createTriangle(v[3], v[5], v[4], color)); // back cap
    this.polygons.push(createQuad(v[3], v[4], v[1], v[0], color)); // bottom
    this.polygons.push(createQuad(v[0], v[2], v[5], v[3], color)); // left wall
    this.polygons.push(createQuad(v[2], v[1], v[4], v[5], color)); // slope
  }

  getPolygons(): Polygon[] {
    return this.polygons;
  }
}

import * as THREE from 'three';
import type { vec3 } from 'gl-matrix';
import type { Camera } from './Camera';
import type { Polygon } from '../types';

export class CullingRenderer {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly dummyCamera: THREE.PerspectiveCamera;

  private readonly visibleEdgeMat: THREE.LineBasicMaterial;
  private readonly visibleFillMat: THREE.MeshBasicMaterial;

  private readonly backfaceEdgeMat: THREE.LineBasicMaterial;
  private readonly backfaceFillMat: THREE.MeshBasicMaterial;
  private readonly frustumEdgeMat: THREE.LineBasicMaterial;
  private readonly frustumFillMat: THREE.MeshBasicMaterial;

  private readonly normalMat: THREE.LineBasicMaterial;
  private readonly gridHelper: THREE.GridHelper;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, depth: false });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x080810, 1);
    this.renderer.sortObjects = false;

    this.scene = new THREE.Scene();

    this.dummyCamera = new THREE.PerspectiveCamera();
    this.dummyCamera.matrixAutoUpdate = false;

    this.visibleEdgeMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      depthTest: false,
      depthWrite: false,
    });
    this.visibleFillMat = new THREE.MeshBasicMaterial({
      color: 0x1a2a40,
      side: THREE.FrontSide,
      depthTest: false,
      depthWrite: false,
    });

    this.backfaceEdgeMat = new THREE.LineBasicMaterial({
      color: 0xff4444,
      transparent: true,
      opacity: 0.35,
      depthTest: false,
    });
    this.backfaceFillMat = new THREE.MeshBasicMaterial({
      color: 0x441111,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: false,
    });

    this.frustumEdgeMat = new THREE.LineBasicMaterial({
      color: 0x44dddd,
      transparent: true,
      opacity: 0.35,
      depthTest: false,
    });
    this.frustumFillMat = new THREE.MeshBasicMaterial({
      color: 0x114444,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: false,
    });

    this.normalMat = new THREE.LineBasicMaterial({ color: 0xffee44 });

    this.gridHelper = new THREE.GridHelper(28, 28, 0x222233, 0x151520);
    this.gridHelper.position.y = 0.001;
  }

  resize(width: number, height: number): void {
    this.renderer.setSize(width, height, false);
  }

  render(
    polygons: Polygon[],
    camera: Camera,
    showCulled: boolean,
    showNormals: boolean,
  ): void {
    while (this.scene.children.length > 0) {
      const child = this.scene.children[0];
      this.scene.remove(child);
      if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
        child.geometry.dispose();
      }
    }

    const view = camera.getViewMatrix();
    const projection = camera.getProjectionMatrix();

    this.dummyCamera.projectionMatrix.fromArray(projection as unknown as number[]);
    this.dummyCamera.projectionMatrixInverse
      .copy(this.dummyCamera.projectionMatrix)
      .invert();
    this.dummyCamera.matrixWorldInverse.fromArray(view as unknown as number[]);
    this.dummyCamera.matrixWorld
      .copy(this.dummyCamera.matrixWorldInverse)
      .invert();

    const grid = this.gridHelper.clone();
    const gridMat = grid.material as THREE.Material | THREE.Material[];
    if (Array.isArray(gridMat)) {
      gridMat.forEach((mat) => {
        mat.depthTest = false;
        mat.depthWrite = false;
      });
    } else {
      gridMat.depthTest = false;
      gridMat.depthWrite = false;
    }
    this.scene.add(grid);

    // Newell's painter's algorithm: plane-separation comparator
    // In camera space, Z is negative for objects in front; more negative = farther.
    const getZ = (v: vec3): number =>
      view[2] * v[0] + view[6] * v[1] + view[10] * v[2] + view[14];

    // Signed distance of point p from the plane of polygon poly
    // (poly.normal points toward camera for front-facing polygons)
    const planeDist = (poly: Polygon, p: vec3): number =>
      poly.normal[0] * (p[0] - poly.vertices[0][0]) +
      poly.normal[1] * (p[1] - poly.vertices[0][1]) +
      poly.normal[2] * (p[2] - poly.vertices[0][2]);

    const newell = (a: Polygon, b: Polygon): number => {
      const aZs = a.vertices.map(getZ);
      const bZs = b.vertices.map(getZ);
      const aMinZ = Math.min(...aZs); // farthest vertex of A
      const aMaxZ = Math.max(...aZs); // nearest vertex of A
      const bMinZ = Math.min(...bZs); // farthest vertex of B
      const bMaxZ = Math.max(...bZs); // nearest vertex of B

      // Test 1: Z-extents don't overlap → trivial order
      if (aMaxZ < bMinZ) return -1; // A entirely farther → draw A first
      if (bMaxZ < aMinZ) return 1;  // B entirely farther → draw B first

      // Test 2: plane of A separates B
      // negative dist → vertex is behind A's plane (farther from camera)
      if (b.vertices.every(v => planeDist(a, v) < 0)) return 1;  // B behind A → B drawn first
      if (b.vertices.every(v => planeDist(a, v) > 0)) return -1; // B in front of A → A drawn first

      // Test 3: plane of B separates A
      if (a.vertices.every(v => planeDist(b, v) < 0)) return -1; // A behind B → A drawn first
      if (a.vertices.every(v => planeDist(b, v) > 0)) return 1;  // A in front of B → B drawn first

      // Fallback: farthest vertex Z (polygon.depth already stores this)
      return a.depth - b.depth;
    };

    const drawList = polygons.filter((p) => p.visible || showCulled);
    drawList.sort((a, b) => {
      if (a.visible !== b.visible) return a.visible ? -1 : 1;
      if (!a.visible) return a.depth - b.depth; // culled ghosts: simple order is fine
      return newell(a, b);
    });

    for (const polygon of drawList) {
      let edgeMat: THREE.LineBasicMaterial;
      let fillMat: THREE.MeshBasicMaterial;

      if (polygon.visible) {
        edgeMat = this.visibleEdgeMat;
        fillMat = this.visibleFillMat;
      } else if (polygon.cullingReason === 'backface') {
        edgeMat = this.backfaceEdgeMat;
        fillMat = this.backfaceFillMat;
      } else {
        edgeMat = this.frustumEdgeMat;
        fillMat = this.frustumFillMat;
      }

      const faceVerts: number[] = [];
      for (let i = 1; i < polygon.vertices.length - 1; i++) {
        const a = polygon.vertices[0];
        const b = polygon.vertices[i];
        const c = polygon.vertices[i + 1];
        faceVerts.push(
          a[0], a[1], a[2],
          b[0], b[1], b[2],
          c[0], c[1], c[2],
        );
      }
      const faceGeo = new THREE.BufferGeometry();
      faceGeo.setAttribute('position', new THREE.Float32BufferAttribute(faceVerts, 3));
      this.scene.add(new THREE.Mesh(faceGeo, fillMat));

      const edgeVerts: number[] = [];
      for (let i = 0; i < polygon.vertices.length; i++) {
        const a = polygon.vertices[i];
        const b = polygon.vertices[(i + 1) % polygon.vertices.length];
        edgeVerts.push(a[0], a[1], a[2], b[0], b[1], b[2]);
      }
      const edgeGeo = new THREE.BufferGeometry();
      edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgeVerts, 3));
      this.scene.add(new THREE.LineSegments(edgeGeo, edgeMat));

      if (showNormals && polygon.visible) {
        const c = polygon.center;
        const n = polygon.normal;
        const len = 0.6;
        const nVerts = [
          c[0], c[1], c[2],
          c[0] + n[0] * len, c[1] + n[1] * len, c[2] + n[2] * len,
        ];
        const nGeo = new THREE.BufferGeometry();
        nGeo.setAttribute('position', new THREE.Float32BufferAttribute(nVerts, 3));
        this.scene.add(new THREE.LineSegments(nGeo, this.normalMat));
      }
    }

    this.renderer.render(this.scene, this.dummyCamera);
  }

  dispose(): void {
    this.visibleEdgeMat.dispose();
    this.visibleFillMat.dispose();
    this.backfaceEdgeMat.dispose();
    this.backfaceFillMat.dispose();
    this.frustumEdgeMat.dispose();
    this.frustumFillMat.dispose();
    this.normalMat.dispose();
    this.renderer.dispose();
  }
}

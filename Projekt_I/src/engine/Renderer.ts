// Three.js tylko rysuje — kamera jest atrapa, co klatkę wrzucamy własne macierze View/Projection

import * as THREE from 'three';

import type { Camera } from './Camera';
import { buildScene } from './Scene';

export class Renderer {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly dummyCamera: THREE.PerspectiveCamera;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 1);

    this.scene = buildScene();

    // matrixAutoUpdate = false żeby Three.js nie nadpisywał naszych macierzy
    this.dummyCamera = new THREE.PerspectiveCamera();
    this.dummyCamera.matrixAutoUpdate = false;
  }

  resize(width: number, height: number): void {
    this.renderer.setSize(width, height, false);
  }

  render(camera: Camera): void {
    const view = camera.getViewMatrix();
    const projection = camera.getProjectionMatrix();

    // wrzuć nasze macierze do atrapy
    this.dummyCamera.projectionMatrix.fromArray(projection as unknown as number[]);
    this.dummyCamera.projectionMatrixInverse
      .copy(this.dummyCamera.projectionMatrix)
      .invert();

    // Three.js chce matrixWorldInverse = view, a matrixWorld = odwrotność
    this.dummyCamera.matrixWorldInverse.fromArray(view as unknown as number[]);
    this.dummyCamera.matrixWorld
      .copy(this.dummyCamera.matrixWorldInverse)
      .invert();

    this.renderer.render(this.scene, this.dummyCamera);
  }

  dispose(): void {
    this.renderer.dispose();
  }
}

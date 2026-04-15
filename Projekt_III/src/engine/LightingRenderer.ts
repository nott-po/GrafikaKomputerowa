import * as THREE from 'three';
import type { LightingScene } from './LightingScene';
import type { Camera } from './Camera';
import type { LightSource } from './LightSource';

export class LightingRenderer {
  private renderer: THREE.WebGLRenderer;
  private threeCamera: THREE.PerspectiveCamera;
  private lightIndicator: THREE.Mesh;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });
    // Linear space — avoid double gamma on our manual Phong colors
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.setClearColor(0x1a1a1a);

    this.threeCamera = new THREE.PerspectiveCamera();
    this.threeCamera.matrixAutoUpdate = false;

    const lightGeom = new THREE.SphereGeometry(0.15, 16, 16);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    this.lightIndicator = new THREE.Mesh(lightGeom, lightMat);
  }

  render(
    lightingScene: LightingScene,
    camera: Camera,
    light: LightSource,
    showLightIndicator: boolean = true,
  ): void {
    const scene = lightingScene.scene;

    // Sync Three camera from our Camera's matrices
    const proj = camera.getProjectionMatrix();
    const view = camera.getViewMatrix();

    this.threeCamera.projectionMatrix.fromArray(proj as number[]);
    this.threeCamera.projectionMatrixInverse.copy(
      this.threeCamera.projectionMatrix,
    ).invert();

    this.threeCamera.matrixWorldInverse.fromArray(view as number[]);
    this.threeCamera.matrixWorld.copy(
      this.threeCamera.matrixWorldInverse,
    ).invert();

    if (showLightIndicator) {
      this.lightIndicator.position.set(
        light.position[0],
        light.position[1],
        light.position[2],
      );
      const mat = this.lightIndicator.material as THREE.MeshBasicMaterial;
      mat.color.setRGB(light.color[0], light.color[1], light.color[2]);

      if (!scene.children.includes(this.lightIndicator)) {
        scene.add(this.lightIndicator);
      }
    } else {
      scene.remove(this.lightIndicator);
    }

    this.renderer.render(scene, this.threeCamera);
  }

  resize(width: number, height: number): void {
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  dispose(): void {
    this.renderer.dispose();
  }
}

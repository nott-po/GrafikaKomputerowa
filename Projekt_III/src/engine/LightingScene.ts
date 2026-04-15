import * as THREE from 'three';
import { vec3 } from 'gl-matrix';
import { Material } from './Material';
import { PhongLighting } from './PhongLighting';
import type { LightSource } from './LightSource';
import type { Camera } from './Camera';

export interface Sphere {
  mesh: THREE.Mesh;
  material: Material;
  geometry: THREE.SphereGeometry;
}

export class LightingScene {
  spheres: Sphere[] = [];
  scene: THREE.Scene;

  constructor() {
    this.scene = new THREE.Scene();
    this.createSpheres();
  }

  private createSpheres(): void {
    const materials = Material.ALL;

    const positions: [number, number, number][] = [
      [-4.5, 0, 0],
      [-1.5, 0, 0],
      [1.5, 0, 0],
      [4.5, 0, 0],
    ];

    materials.forEach((material, i) => {
      const geometry = new THREE.SphereGeometry(1, 64, 64);

      const meshMaterial = new THREE.MeshBasicMaterial({
        vertexColors: true,
      });

      const mesh = new THREE.Mesh(geometry, meshMaterial);
      mesh.position.set(positions[i][0], positions[i][1], positions[i][2]);
      mesh.updateMatrixWorld(true);

      this.spheres.push({ mesh, material, geometry });
      this.scene.add(mesh);
    });
  }

  updateLighting(light: LightSource, camera: Camera): void {
    for (const sphere of this.spheres) {
      this.updateSphereColors(sphere, light, camera);
    }
  }

  private updateSphereColors(
    sphere: Sphere,
    light: LightSource,
    camera: Camera,
  ): void {
    const { geometry, material, mesh } = sphere;

    const positions = geometry.attributes.position;
    const normals = geometry.attributes.normal;
    const vertexCount = positions.count;

    const colors = new Float32Array(vertexCount * 3);

    const localPos = vec3.create();
    const worldPos = vec3.create();
    const localNormal = vec3.create();
    const worldNormal = vec3.create();

    const meshPos = mesh.position;

    for (let i = 0; i < vertexCount; i++) {
      vec3.set(localPos,
        positions.getX(i),
        positions.getY(i),
        positions.getZ(i),
      );

      // Translation-only transform to world space
      vec3.set(worldPos,
        localPos[0] + meshPos.x,
        localPos[1] + meshPos.y,
        localPos[2] + meshPos.z,
      );

      vec3.set(localNormal,
        normals.getX(i),
        normals.getY(i),
        normals.getZ(i),
      );
      vec3.normalize(worldNormal, localNormal);

      const color = PhongLighting.calculateLighting(
        worldPos,
        worldNormal,
        material,
        light,
        camera.position,
      );

      colors[i * 3 + 0] = color[0];
      colors[i * 3 + 1] = color[1];
      colors[i * 3 + 2] = color[2];
    }

    geometry.setAttribute('color',
      new THREE.Float32BufferAttribute(colors, 3),
    );
    geometry.attributes.color.needsUpdate = true;
  }
}

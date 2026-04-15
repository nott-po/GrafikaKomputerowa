// Scena — 4 wireframe boxy + siatka podłogi

import * as THREE from 'three';

interface BoxSpec {
  size: [number, number, number];
  position: [number, number, number];
}

const BOX_SPECS: BoxSpec[] = [
  { size: [2, 2, 2],     position: [-3, 1,    0] },  // left, large
  { size: [1, 3, 1],     position: [ 0, 1.5, -2] },  // back, tall
  { size: [1.5, 1, 1.5], position: [ 2, 0.5,  0] },  // right, medium
  { size: [1, 1, 1],     position: [ 0, 0.5,  2] },  // front, small
];

export interface SceneOptions {
  showGrid?: boolean;
}

export function buildScene(options: SceneOptions = {}): THREE.Scene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

  for (const spec of BOX_SPECS) {
    const geometry = new THREE.BoxGeometry(...spec.size);
    const edges = new THREE.EdgesGeometry(geometry);
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    wireframe.position.set(...spec.position);
    wireframe.frustumCulled = false;
    scene.add(wireframe);
    // BoxGeometry już niepotrzebne po wyciągnięciu krawędzi
    geometry.dispose();
  }

  if (options.showGrid ?? true) {
    const grid = new THREE.GridHelper(20, 20, 0x222222, 0x161616);
    grid.position.y = -0.005;
    grid.frustumCulled = false;
    scene.add(grid);
  }

  return scene;
}

import type { Camera } from '../engine/Camera';

export function applyKeyboardToCamera(
  camera: Camera,
  keys: Set<string>,
  deltaSeconds: number,
): void {
  const moveStep = camera.moveSpeed * deltaSeconds;
  const rotStep = camera.rotateSpeed * deltaSeconds;
  const zoomStep = camera.zoomSpeed * deltaSeconds;

  if (keys.has('ArrowUp'))    camera.moveForward( moveStep);
  if (keys.has('ArrowDown'))  camera.moveForward(-moveStep);
  if (keys.has('ArrowRight')) camera.moveRight(  moveStep);
  if (keys.has('ArrowLeft'))  camera.moveRight( -moveStep);
  if (keys.has('Space'))      camera.moveUp(     moveStep);
  if (keys.has('Shift'))      camera.moveUp(    -moveStep);

  if (keys.has('w')) camera.rotate(0,  rotStep);
  if (keys.has('s')) camera.rotate(0, -rotStep);
  if (keys.has('a')) camera.rotate(-rotStep, 0);
  if (keys.has('d')) camera.rotate( rotStep, 0);

  if (keys.has('z')) camera.zoom(-zoomStep);
  if (keys.has('x')) camera.zoom( zoomStep);

  if (keys.has('r')) camera.reset();
}

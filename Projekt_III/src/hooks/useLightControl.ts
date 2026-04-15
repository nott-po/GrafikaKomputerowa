import { vec3 } from 'gl-matrix';
import type { LightSource } from '../engine/LightSource';

const FORWARD: vec3 = vec3.fromValues(0, 0, -1);
const BACKWARD: vec3 = vec3.fromValues(0, 0, 1);
const LEFT: vec3 = vec3.fromValues(-1, 0, 0);
const RIGHT: vec3 = vec3.fromValues(1, 0, 0);
const UP: vec3 = vec3.fromValues(0, 1, 0);
const DOWN: vec3 = vec3.fromValues(0, -1, 0);

export function applyKeyboardToLight(
  light: LightSource,
  keys: Set<string>,
  deltaSeconds: number,
): void {
  const speed = 4 * deltaSeconds;

  if (keys.has('i')) light.move(FORWARD, speed);
  if (keys.has('k')) light.move(BACKWARD, speed);
  if (keys.has('j')) light.move(LEFT, speed);
  if (keys.has('l')) light.move(RIGHT, speed);
  if (keys.has('u')) light.move(UP, speed);
  if (keys.has('o')) light.move(DOWN, speed);
}

import { vec3 } from 'gl-matrix';

export function getForwardVector(yaw: number, pitch: number): vec3 {
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);

  const out = vec3.create();
  out[0] = sy * cp;
  out[1] = sp;
  out[2] = -cy * cp;
  return out;
}

export function getRightVector(yaw: number): vec3 {
  const out = vec3.create();
  out[0] = Math.cos(yaw);
  out[1] = 0;
  out[2] = Math.sin(yaw);
  return out;
}

export function getUpVector(right: vec3, forward: vec3): vec3 {
  const out = vec3.create();
  vec3.cross(out, right, forward);
  vec3.normalize(out, out);
  return out;
}

// Wektory kamery — prawoskrętny układ (OpenGL)
// yaw = obrót wokół Y (od -Z, w prawo rośnie), pitch = obrót wokół lok. X (w górę +)
// yaw=0, pitch=0 → kamera patrzy w -Z

import { vec3 } from 'gl-matrix';

// wektor "do przodu" z kątów yaw/pitch
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

// wektor "w prawo" — zawsze poziomy (niezależny od pitch, żeby strafe nie driftował w pionie)
export function getRightVector(yaw: number): vec3 {
  const out = vec3.create();
  out[0] = Math.cos(yaw);
  out[1] = 0;
  out[2] = Math.sin(yaw);
  return out;
}

// lokalny "up" kamery = right × forward
export function getUpVector(right: vec3, forward: vec3): vec3 {
  const out = vec3.create();
  vec3.cross(out, right, forward);
  vec3.normalize(out, out);
  return out;
}

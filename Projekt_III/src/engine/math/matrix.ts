import { mat4, vec3 } from 'gl-matrix';

export function createLookAtMatrix(
  eye: vec3,
  target: vec3,
  worldUp: vec3,
): mat4 {
  const forward = vec3.create();
  vec3.subtract(forward, target, eye);
  vec3.normalize(forward, forward);

  const right = vec3.create();
  vec3.cross(right, forward, worldUp);
  vec3.normalize(right, right);

  const up = vec3.create();
  vec3.cross(up, right, forward);

  const m = mat4.create();

  m[0] = right[0];
  m[1] = up[0];
  m[2] = -forward[0];
  m[3] = 0;

  m[4] = right[1];
  m[5] = up[1];
  m[6] = -forward[1];
  m[7] = 0;

  m[8] = right[2];
  m[9] = up[2];
  m[10] = -forward[2];
  m[11] = 0;

  m[12] = -vec3.dot(right, eye);
  m[13] = -vec3.dot(up, eye);
  m[14] = vec3.dot(forward, eye);
  m[15] = 1;

  return m;
}

export function createPerspectiveMatrix(
  fovY: number,
  aspect: number,
  near: number,
  far: number,
): mat4 {
  const f = 1 / Math.tan(fovY / 2);
  const nf = 1 / (near - far);

  const m = mat4.create();
  m[0] = f / aspect;
  m[1] = 0;
  m[2] = 0;
  m[3] = 0;

  m[4] = 0;
  m[5] = f;
  m[6] = 0;
  m[7] = 0;

  m[8] = 0;
  m[9] = 0;
  m[10] = (far + near) * nf;
  m[11] = -1;

  m[12] = 0;
  m[13] = 0;
  m[14] = 2 * far * near * nf;
  m[15] = 0;

  return m;
}

// Ręczne macierze LookAt i Perspective — NIE używać mat4.lookAt / mat4.perspective z gl-matrix (to jest oceniane)
// gl-matrix tylko do operacji na wektorach i do storage (column-major, index = col*4 + row)

import { mat4, vec3 } from 'gl-matrix';

// LookAt — macierz widoku z pozycji kamery (eye), punktu patrzenia (target) i wektora "góra"
// forward = normalize(target - eye), right = forward × up, trueUp = right × forward
// wynik: R * T  (rotacja * translacja o -eye)
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

  // trueUp — przeliczony żeby baza była ortonormalna
  const up = vec3.create();
  vec3.cross(up, right, forward);

  const m = mat4.create();

  // col 0          col 1          col 2
  m[0] = right[0];   m[4] = right[1];   m[8]  = right[2];
  m[1] = up[0];      m[5] = up[1];      m[9]  = up[2];
  m[2] = -forward[0]; m[6] = -forward[1]; m[10] = -forward[2];
  m[3] = 0;          m[7] = 0;          m[11] = 0;

  // col 3 — translacja = -R * eye
  m[12] = -vec3.dot(right, eye);
  m[13] = -vec3.dot(up, eye);
  m[14] = vec3.dot(forward, eye);
  m[15] = 1;

  return m;
}

// Perspective — standardowa macierz projekcji (OpenGL, right-handed)
// f = 1/tan(fovY/2), -1 w [11] daje dzielenie perspektywiczne (w = -z)
export function createPerspectiveMatrix(
  fovY: number,
  aspect: number,
  near: number,
  far: number,
): mat4 {
  const f = 1 / Math.tan(fovY / 2);
  const nf = 1 / (near - far);

  const m = mat4.create();

  m[0]  = f / aspect;
  m[5]  = f;
  m[10] = (far + near) * nf;
  m[11] = -1;              // perspektywa
  m[14] = 2 * far * near * nf;
  m[15] = 0;

  // reszta = 0 (mat4.create() daje identyczność, więc zerujemy co trzeba)
  m[1] = m[2] = m[3] = m[4] = m[6] = m[7] = m[8] = m[9] = m[12] = m[13] = 0;

  return m;
}

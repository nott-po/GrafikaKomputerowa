import { mat4, vec3 } from 'gl-matrix';

import {
  getForwardVector,
  getRightVector,
} from './math/vector';
import {
  createLookAtMatrix,
  createPerspectiveMatrix,
} from './math/matrix';

const DEG_TO_RAD = Math.PI / 180;
const PITCH_LIMIT = 89 * DEG_TO_RAD;

const WORLD_UP: vec3 = vec3.fromValues(0, 1, 0);

export interface CameraSnapshot {
  position: [number, number, number];
  yawDeg: number;
  pitchDeg: number;
  fov: number;
}

export class Camera {
  position: vec3;
  yaw: number;
  pitch: number;

  fov: number;
  aspect: number;
  near: number;
  far: number;

  moveSpeed = 4;
  rotateSpeed = 1.6;
  zoomSpeed = 30;

  private readonly defaults: {
    position: vec3;
    yaw: number;
    pitch: number;
    fov: number;
  };

  constructor() {
    this.position = vec3.fromValues(0, 2, 8);
    this.yaw = 0;
    this.pitch = -10 * DEG_TO_RAD;
    this.fov = 60;
    this.aspect = 16 / 9;
    this.near = 0.1;
    this.far = 200;

    this.defaults = {
      position: vec3.clone(this.position),
      yaw: this.yaw,
      pitch: this.pitch,
      fov: this.fov,
    };
  }

  getViewMatrix(): mat4 {
    const forward = getForwardVector(this.yaw, this.pitch);
    const target = vec3.create();
    vec3.add(target, this.position, forward);
    return createLookAtMatrix(this.position, target, WORLD_UP);
  }

  getProjectionMatrix(): mat4 {
    return createPerspectiveMatrix(
      this.fov * DEG_TO_RAD,
      this.aspect,
      this.near,
      this.far,
    );
  }

  moveForward(distance: number): void {
    const forward = getForwardVector(this.yaw, this.pitch);
    vec3.scaleAndAdd(this.position, this.position, forward, distance);
  }

  moveRight(distance: number): void {
    const right = getRightVector(this.yaw);
    vec3.scaleAndAdd(this.position, this.position, right, distance);
  }

  moveUp(distance: number): void {
    this.position[1] += distance;
  }

  rotate(deltaYaw: number, deltaPitch: number): void {
    this.yaw += deltaYaw;
    this.pitch += deltaPitch;
    if (this.pitch > PITCH_LIMIT) this.pitch = PITCH_LIMIT;
    if (this.pitch < -PITCH_LIMIT) this.pitch = -PITCH_LIMIT;
  }

  zoom(deltaFovDegrees: number): void {
    this.fov += deltaFovDegrees;
    if (this.fov < 15) this.fov = 15;
    if (this.fov > 100) this.fov = 100;
  }

  setAspect(aspect: number): void {
    this.aspect = aspect;
  }

  reset(): void {
    vec3.copy(this.position, this.defaults.position);
    this.yaw = this.defaults.yaw;
    this.pitch = this.defaults.pitch;
    this.fov = this.defaults.fov;
  }

  snapshot(): CameraSnapshot {
    return {
      position: [this.position[0], this.position[1], this.position[2]],
      yawDeg: this.yaw / DEG_TO_RAD,
      pitchDeg: this.pitch / DEG_TO_RAD,
      fov: this.fov,
    };
  }
}

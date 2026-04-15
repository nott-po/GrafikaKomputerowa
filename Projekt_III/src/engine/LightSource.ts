import { vec3 } from 'gl-matrix';

export type ColorPreset = 'white' | 'warm' | 'cool' | 'red' | 'blue';

export class LightSource {
  position: vec3;
  color: vec3;
  intensity: number;

  constantAttenuation: number;
  linearAttenuation: number;
  quadraticAttenuation: number;

  private readonly defaults: {
    position: vec3;
    color: vec3;
    intensity: number;
  };

  constructor() {
    this.position = vec3.fromValues(0, 4, 5);
    this.color = vec3.fromValues(1, 1, 1);
    this.intensity = 1.0;

    this.constantAttenuation = 1.0;
    this.linearAttenuation = 0.09;
    this.quadraticAttenuation = 0.032;

    this.defaults = {
      position: vec3.clone(this.position),
      color: vec3.clone(this.color),
      intensity: this.intensity,
    };
  }

  calculateAttenuation(distance: number): number {
    return 1.0 / (
      this.constantAttenuation +
      this.linearAttenuation * distance +
      this.quadraticAttenuation * distance * distance
    );
  }

  move(direction: vec3, amount: number): void {
    vec3.scaleAndAdd(this.position, this.position, direction, amount);
  }

  setColorPreset(preset: ColorPreset): void {
    switch (preset) {
      case 'white':
        vec3.set(this.color, 1, 1, 1);
        break;
      case 'warm':
        vec3.set(this.color, 1, 0.9, 0.7);
        break;
      case 'cool':
        vec3.set(this.color, 0.8, 0.9, 1);
        break;
      case 'red':
        vec3.set(this.color, 1, 0.3, 0.3);
        break;
      case 'blue':
        vec3.set(this.color, 0.3, 0.3, 1);
        break;
    }
  }

  setIntensity(value: number): void {
    this.intensity = Math.max(0.1, Math.min(2.0, value));
  }

  reset(): void {
    vec3.copy(this.position, this.defaults.position);
    vec3.copy(this.color, this.defaults.color);
    this.intensity = this.defaults.intensity;
  }
}

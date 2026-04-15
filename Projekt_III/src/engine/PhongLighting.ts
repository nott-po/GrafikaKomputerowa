import { vec3 } from 'gl-matrix';
import type { Material } from './Material';
import type { LightSource } from './LightSource';

export class PhongLighting {
  static GLOBAL_AMBIENT: vec3 = vec3.fromValues(0.1, 0.1, 0.1);

  static calculateLighting(
    position: vec3,
    normal: vec3,
    material: Material,
    light: LightSource,
    cameraPos: vec3,
  ): vec3 {
    const color = vec3.create();

    // Ambient: k_a * I_a
    const ambient = this.calculateAmbient(material);
    vec3.add(color, color, ambient);

    const lightDir = vec3.create();
    vec3.subtract(lightDir, light.position, position);
    const distance = vec3.length(lightDir);
    vec3.normalize(lightDir, lightDir);

    const viewDir = vec3.create();
    vec3.subtract(viewDir, cameraPos, position);
    vec3.normalize(viewDir, viewDir);

    const attenuation = light.calculateAttenuation(distance);

    // Diffuse: k_d * I * max(0, N.L) * att
    const diffuse = this.calculateDiffuse(normal, lightDir, material, light, attenuation);
    vec3.add(color, color, diffuse);

    // Specular: k_s * I * max(0, R.V)^n * att
    const specular = this.calculateSpecular(normal, lightDir, viewDir, material, light, attenuation);
    vec3.add(color, color, specular);

    color[0] = Math.min(1, Math.max(0, color[0]));
    color[1] = Math.min(1, Math.max(0, color[1]));
    color[2] = Math.min(1, Math.max(0, color[2]));

    return color;
  }

  private static calculateAmbient(material: Material): vec3 {
    const ambient = vec3.create();
    vec3.multiply(ambient, material.ambient, this.GLOBAL_AMBIENT);
    return ambient;
  }

  private static calculateDiffuse(
    normal: vec3,
    lightDir: vec3,
    material: Material,
    light: LightSource,
    attenuation: number,
  ): vec3 {
    const NdotL = vec3.dot(normal, lightDir);

    if (NdotL <= 0) {
      return vec3.create();
    }

    const diffuse = vec3.create();
    vec3.multiply(diffuse, material.diffuse, light.color);
    vec3.scale(diffuse, diffuse, NdotL * attenuation * light.intensity);

    return diffuse;
  }

  private static calculateSpecular(
    normal: vec3,
    lightDir: vec3,
    viewDir: vec3,
    material: Material,
    light: LightSource,
    attenuation: number,
  ): vec3 {
    const NdotL = vec3.dot(normal, lightDir);

    if (NdotL <= 0) {
      return vec3.create();
    }

    // Reflection vector: R = 2(N . L)N - L
    const reflection = vec3.create();
    vec3.scale(reflection, normal, 2 * NdotL);
    vec3.subtract(reflection, reflection, lightDir);
    vec3.normalize(reflection, reflection);

    const RdotV = vec3.dot(reflection, viewDir);

    if (RdotV <= 0) {
      return vec3.create();
    }

    const specularFactor = Math.pow(RdotV, material.shininess);

    const specular = vec3.create();
    vec3.multiply(specular, material.specular, light.color);
    vec3.scale(specular, specular, specularFactor * attenuation * light.intensity);

    return specular;
  }
}

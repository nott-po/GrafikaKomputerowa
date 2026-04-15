import { vec3 } from 'gl-matrix';

export interface MaterialProperties {
  name: string;
  ambient: vec3;
  diffuse: vec3;
  specular: vec3;
  shininess: number;
}

export class Material {
  name: string;
  ambient: vec3;
  diffuse: vec3;
  specular: vec3;
  shininess: number;

  constructor(props: MaterialProperties) {
    this.name = props.name;
    this.ambient = vec3.clone(props.ambient);
    this.diffuse = vec3.clone(props.diffuse);
    this.specular = vec3.clone(props.specular);
    this.shininess = props.shininess;
  }

  // Metal: very low diffuse, dominant sharp specular (mirror-like)
  static METAL = new Material({
    name: 'Metal',
    ambient: vec3.fromValues(0.05, 0.05, 0.06),
    diffuse: vec3.fromValues(0.12, 0.12, 0.15),
    specular: vec3.fromValues(1.0, 1.0, 1.0),
    shininess: 128,
  });

  // Matte wall: strong diffuse, virtually no specular (chalk-like)
  static MATTE = new Material({
    name: 'Matte',
    ambient: vec3.fromValues(0.2, 0.2, 0.2),
    diffuse: vec3.fromValues(0.9, 0.85, 0.8),
    specular: vec3.fromValues(0.02, 0.02, 0.02),
    shininess: 2,
  });

  // Plastic: balanced diffuse/specular, medium shininess
  static PLASTIC = new Material({
    name: 'Plastic',
    ambient: vec3.fromValues(0.1, 0.02, 0.02),
    diffuse: vec3.fromValues(0.55, 0.12, 0.12),
    specular: vec3.fromValues(0.7, 0.7, 0.7),
    shininess: 40,
  });

  // Polished wood: warm diffuse tones, subtle specular
  static WOOD = new Material({
    name: 'Wood',
    ambient: vec3.fromValues(0.12, 0.07, 0.02),
    diffuse: vec3.fromValues(0.55, 0.35, 0.15),
    specular: vec3.fromValues(0.25, 0.2, 0.15),
    shininess: 15,
  });

  static ALL: Material[] = [
    Material.METAL,
    Material.MATTE,
    Material.PLASTIC,
    Material.WOOD,
  ];
}

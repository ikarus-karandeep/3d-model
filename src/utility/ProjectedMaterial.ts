import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';

const vertexShader = /* glsl */`
  // This varying will pass the world position of the vertex to the fragment shader
  varying vec3 vWorldPosition;

  void main() {
    // Standard model-view-projection transform
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    
    // Calculate the world position of the vertex and pass it to the fragment shader
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  }
`;

const fragmentShader = /* glsl */`
  #define PI 3.141592653589793
  
  // The varying coming from the vertex shader
  varying vec3 vWorldPosition;

  // Uniforms passed from our React component
  uniform sampler2D uHdriMap;
  uniform vec3 uProjectionCenter;
  uniform float uOpacity;

  void main() {
    // 1. Calculate the direction vector from the projection center to the fragment's world position
    vec3 direction = normalize(vWorldPosition - uProjectionCenter);

    // 2. Convert the 3D direction vector to spherical coordinates (theta, phi)
    //    - theta is the polar angle (from the Y+ axis), maps to V
    //    - phi is the azimuthal angle (around the Y axis), maps to U
    float theta = acos(direction.y);
    float phi = atan(direction.z, direction.x); // atan2 is crucial for getting the full -PI to PI range

    // 3. Map the spherical coordinates to 2D UV coordinates for the equirectangular texture
    //    - u goes from 0 to 1, representing the full 360 degrees of phi
    //    - v goes from 0 to 1, representing the 180 degrees of theta
    float u = (phi / PI) * 0.5 + 0.5;
    float v = theta / PI;

    vec2 uv = vec2(u, v);

    // 4. Sample the texture using our calculated UV coordinates
    vec4 color = texture2D(uHdriMap, uv);
    
    // Apply the opacity for fading transitions
    color.a *= uOpacity;

    gl_FragColor = color;
  }
`;

// Create a reusable material component with the shaderMaterial helper
export const ProjectedMaterial = shaderMaterial(
  {
    // Uniforms
    uHdriMap: new THREE.Texture(),
    uProjectionCenter: new THREE.Vector3(),
    uOpacity: 1.0,
  },
  // Vertex Shader
  vertexShader,
  // Fragment Shader
  fragmentShader
);
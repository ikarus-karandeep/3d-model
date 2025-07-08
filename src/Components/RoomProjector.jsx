import React, { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

export function RoomProjector(t) {
  // 1. Load the 3D model (your room scan)

  const { nodes } = useGLTF(t.pointInfo.meshPath);
  // Find the first mesh in the loaded GLTF. You might need to adjust this
  // if your GLTF has multiple meshes or a different structure.
  const roomMesh = Object.values(nodes).find((node) => node.isMesh);

  // 2. Load the HDRI texture
  const hdriMap = useLoader(RGBELoader, t.pointInfo.hdriPath);
  hdriMap.colorSpace = THREE.SRGBColorSpace;

  // 3. The new projection shader
  const shader = useMemo(
    () => ({
      uniforms: {
        // The HDRI texture
        tEquirect: { value: hdriMap },
        // The 3D position where the HDRI was captured
        uHdriCapturePoint: { value: t.pointInfo.position },
      },
      vertexShader: /* glsl */ `
      // We need to pass the world position of the vertex to the fragment shader
      varying vec3 vWorldPosition;

      void main() {
        // Calculate world position and pass it to the fragment shader
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        
        // Standard projection
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
      fragmentShader: /* glsl */ `
      // The world position of the fragment, from the vertex shader
      varying vec3 vWorldPosition;

      // Uniforms passed from our React component
      uniform sampler2D tEquirect;
      uniform vec3 uHdriCapturePoint;

      // Define PI for cleaner math
      const float PI = 3.141592653589793;

      void main() {
        // CORE LOGIC: Calculate the direction from the capture point to the fragment's position
        vec3 direction = normalize(vWorldPosition - uHdriCapturePoint);

        // Convert the 3D direction vector to 2D UV coordinates for the equirectangular map
        vec2 uv = vec2(
          atan(direction.z, direction.x) / (2.0 * PI) + 0.5,
          asin(direction.y) / PI + 0.5
        );

        // Sample the texture
        vec3 color = texture2D(tEquirect, uv).rgb;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    }),
    [hdriMap, t.pointInfo.position]
  );

  if (!roomMesh) {
    console.warn("No mesh found in the provided GLTF file.");
    return null;
  }

  return (
    <mesh geometry={roomMesh.geometry} position={[...t.pointInfo.position]}>
      {/* Apply the custom shader material. Use a key to force re-creation if props change. */}
      <shaderMaterial
        args={[shader]}
        side={THREE.BackSide}
        key={shader.uniforms.uHdriCapturePoint.value.toArray().join()}
      />
    </mesh>
  );
}

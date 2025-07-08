import React, { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

// Helper component to load a single GLTF mesh.
// This is necessary because React hooks like useGLTF cannot be called inside loops.
function RoomMesh({ meshPath, material, position }) {
  const { nodes } = useGLTF(meshPath);
  const roomMesh = useMemo(
    () => Object.values(nodes).find((node) => node.isMesh),
    [nodes]
  );

  if (!roomMesh) {
    console.warn(`No mesh found in GLTF file: ${meshPath}`);
    return null;
  }

  // The mesh uses the shared material and is placed at the specified position
  return (
    <mesh
      geometry={roomMesh.geometry}
      material={material}
      position={position}
    />
  );
}

export function RoomProjector({
  tourStops,
  currentStop,
  nextStop,
  transitionProgress,
}) {
  // 1. Load the HDRI textures for the current view and the upcoming view.
  const currentHdriMap = useLoader(RGBELoader, currentStop.hdriPath);
  currentHdriMap.colorSpace = THREE.SRGBColorSpace;

  // To prevent errors, if there's no nextStop, we load the current one again as a placeholder.
  const nextHdriMap = useLoader(
    RGBELoader,
    nextStop ? nextStop.hdriPath : currentStop.hdriPath
  );
  if (nextStop) {
    nextHdriMap.colorSpace = THREE.SRGBColorSpace;
  }

  // 2. The projection shader with blending capabilities.
  // We use useMemo to create the material only once and update its uniforms on re-renders.
  const sharedMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: {
          tEquirect: { value: null },
          uHdriCapturePoint: { value: new THREE.Vector3() },
          tEquirectNext: { value: null },
          uHdriCapturePointNext: { value: new THREE.Vector3() },
          uTransitionProgress: { value: 0.0 },
        },
        vertexShader: /* glsl */ `
        varying vec3 vWorldPosition;
        void main() {
          // modelMatrix takes the mesh's position into account, giving us the correct world position.
          vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
        fragmentShader: /* glsl */ `
        varying vec3 vWorldPosition;
        uniform sampler2D tEquirect;
        uniform vec3 uHdriCapturePoint;
        uniform sampler2D tEquirectNext;
        uniform vec3 uHdriCapturePointNext;
        uniform float uTransitionProgress;
        
        const float PI = 3.141592653589793;

        // Calculates the color for a fragment from a given texture and capture point
        vec3 getColorFromEquirect(sampler2D tex, vec3 capturePoint) {
            vec3 direction = normalize(vWorldPosition - capturePoint);
            vec2 uv = vec2(
                atan(direction.z, direction.x) / (2.0 * PI) + 0.5,
                asin(direction.y) / PI + 0.5
            );
            return texture2D(tex, uv).rgb;
        }

        void main() {
          vec3 color1 = getColorFromEquirect(tEquirect, uHdriCapturePoint);
          vec3 color2 = getColorFromEquirect(tEquirectNext, uHdriCapturePointNext);

          // Linearly interpolate (blend) between the two colors
          vec3 finalColor = mix(color1, color2, uTransitionProgress);

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      }),
    []
  );

  // Update uniforms on every render with the latest props
  sharedMaterial.uniforms.tEquirect.value = currentHdriMap;
  sharedMaterial.uniforms.uHdriCapturePoint.value = currentStop.position;
  sharedMaterial.uniforms.tEquirectNext.value = nextHdriMap;
  sharedMaterial.uniforms.uHdriCapturePointNext.value = nextStop
    ? nextStop.position
    : currentStop.position;
  sharedMaterial.uniforms.uTransitionProgress.value = transitionProgress;

  // 3. Render all meshes, each using the same shared material and positioned correctly
  return (
    <group>
      {tourStops.map((stop) => (
        <RoomMesh
          key={stop.id}
          meshPath={stop.meshPath}
          material={sharedMaterial}
          position={stop.position}
        />
      ))}
    </group>
  );
}

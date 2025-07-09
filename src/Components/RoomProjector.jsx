import React, { useMemo, useRef } from "react";
import { useLoader } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

function RoomMesh({ meshPath, material, position, onClick }) {
  const { nodes } = useGLTF(meshPath);
  const meshRef = useRef();

  const roomMesh = useMemo(
    () => Object.values(nodes).find((node) => node.isMesh),
    [nodes]
  );

  if (!roomMesh) {
    console.warn(`No mesh found in GLTF file: ${meshPath}`);
    return null;
  }

  return (
    <mesh
      ref={meshRef}
      geometry={roomMesh.geometry}
      material={material}
      position={position}
      onClick={onClick}
      onPointerMove={(e) => {
        document.body.style.cursor = "crosshair";
      }}
      onPointerLeave={() => {
        document.body.style.cursor = "default";
      }}
    />
  );
}

export function RoomProjector({
  tourStops,
  currentStop,
  nextStop,
  transitionProgress,
  onMeshClick,
}) {
  const currentHdriMap = useLoader(RGBELoader, currentStop.hdriPath);
  // For HDRI textures, use LinearSRGBColorSpace instead of SRGBColorSpace
  currentHdriMap.colorSpace = THREE.LinearSRGBColorSpace;
  currentHdriMap.mapping = THREE.EquirectangularReflectionMapping;

  const nextHdriMap = useLoader(
    RGBELoader,
    nextStop ? nextStop.hdriPath : currentStop.hdriPath
  );
  if (nextStop) {
    nextHdriMap.colorSpace = THREE.LinearSRGBColorSpace;
    nextHdriMap.mapping = THREE.EquirectangularReflectionMapping;
  }

  const sharedMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        uniforms: {
          tEquirect: { value: null },
          uHdriCapturePoint: { value: new THREE.Vector3() },
          tEquirectNext: { value: null },
          uHdriCapturePointNext: { value: new THREE.Vector3() },
          uTransitionProgress: { value: 0.0 },
          uTime: { value: 0.0 },
          uOpacity: { value: 1.0 },
          uExposure: { value: 2.0 },
        },
        vertexShader: `
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        void main() {
          vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          vNormal = normalize(normalMatrix * normal);
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
        fragmentShader: `
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        uniform sampler2D tEquirect;
        uniform vec3 uHdriCapturePoint;
        uniform sampler2D tEquirectNext;
        uniform vec3 uHdriCapturePointNext;
        uniform float uTransitionProgress;
        uniform float uTime;
        uniform float uOpacity;
        uniform float uExposure;
        
        const float PI = 3.141592653589793;

        // Simple tone mapping function
        vec3 aces(vec3 x) {
          const float a = 2.51;
          const float b = 0.03;
          const float c = 2.43;
          const float d = 0.59;
          const float e = 0.14;
          return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
        }

        // Calculates the color for a fragment from a given texture and capture point
        vec3 getColorFromEquirect(sampler2D tex, vec3 capturePoint) {
            vec3 direction = normalize(vWorldPosition - capturePoint);
            vec2 uv = vec2(
                atan(direction.z, direction.x) / (2.0 * PI) + 0.5,
                asin(direction.y) / PI + 0.5
            );
            vec3 color = texture2D(tex, uv).rgb;
            
            // Apply exposure
            color *= uExposure;
            
            // Apply tone mapping to prevent over-bright areas
            color = aces(color);
            
            return color;
        }

        // Enhanced blending with smooth falloff
        vec3 smoothBlend(vec3 color1, vec3 color2, float progress) {
            // Smooth step for more natural transition
            float smoothProgress = smoothstep(0.0, 1.0, progress);
            return mix(color1, color2, smoothProgress);
        }

        void main() {
          vec3 color1 = getColorFromEquirect(tEquirect, uHdriCapturePoint);
          vec3 color2 = getColorFromEquirect(tEquirectNext, uHdriCapturePointNext);

          // Enhanced blending with smooth transitions
          vec3 finalColor = smoothBlend(color1, color2, uTransitionProgress);
          
          // Reduce the distance-based brightness variation (was too aggressive)
          float distanceFromCenter = length(vWorldPosition - uHdriCapturePoint);
          float brightness = 1.0 - (distanceFromCenter * 0.005); // Reduced from 0.01
          brightness = clamp(brightness, 0.95, 1.0); // Less aggressive range
          
          finalColor *= brightness;

          gl_FragColor = vec4(finalColor, uOpacity);
        }
      `,
        transparent: true,
      }),
    []
  );

  sharedMaterial.uniforms.tEquirect.value = currentHdriMap;
  sharedMaterial.uniforms.uHdriCapturePoint.value = currentStop.position;
  sharedMaterial.uniforms.tEquirectNext.value = nextHdriMap;
  sharedMaterial.uniforms.uHdriCapturePointNext.value = nextStop
    ? nextStop.position
    : currentStop.position;
  sharedMaterial.uniforms.uTransitionProgress.value = transitionProgress;
  sharedMaterial.uniforms.uTime.value = performance.now() * 0.001;
  sharedMaterial.uniforms.uExposure.value = 1.2; // Adjust this value to brighten/darken

  // Handle mesh click events
  const handleMeshClick = (event) => {
    if (onMeshClick) {
      const point = event.point;
      const face = event.face;
      const object = event.object;

      onMeshClick({
        point,
        face,
        object,
        uv: event.uv,
        distance: event.distance,
        normal: face ? face.normal : new THREE.Vector3(0, 1, 0),
      });
    }
  };

  return (
    <group name="room-projector">
      {tourStops.map((stop) => (
        <RoomMesh
          key={stop.id}
          meshPath={stop.meshPath}
          material={sharedMaterial}
          position={stop.position}
          onClick={handleMeshClick}
        />
      ))}
    </group>
  );
}

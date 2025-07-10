import React, { useMemo, useRef, useEffect, useState } from "react";
import { useLoader } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { TextureLoader } from "three";

function RoomMesh({ meshPath, material, position, onClick, currentStopId }) {
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
      userData={currentStopId}
    />
  );
}

export function RoomProjector({
  tourStops,
  currentStop,
  nextStop,
  transitionProgress,
  onMeshClick,
  onSceneReady,
}) {
  const [isHdriLoaded, setIsHdriLoaded] = useState(false);

  // Preload HDRI maps
  useEffect(() => {
    tourStops.forEach((stop) => {
      useLoader.preload(TextureLoader, stop.hdriPath);
    });

    if (onSceneReady) {
      onSceneReady();
    }
  }, [tourStops]);
  useEffect(() => {
  if (onSceneReady) {
    // Delay occlusion check until one frame after mount
    requestAnimationFrame(() => {
      onSceneReady();
    });
  }
}, []);


  const currentHdriMap = useLoader(TextureLoader, currentStop.hdriPath);
  currentHdriMap.mapping = THREE.EquirectangularReflectionMapping;

  const nextHdriMap = useLoader(
    TextureLoader,
    nextStop ? nextStop.hdriPath : currentStop.hdriPath
  );
  nextHdriMap.mapping = THREE.EquirectangularReflectionMapping;

  // Wait for both HDRIs to load
  useEffect(() => {
    if (currentHdriMap?.image && nextHdriMap?.image) {
      setIsHdriLoaded(true);
    } else {
      console.warn("❌ HDRI not fully loaded");
    }
  }, [currentHdriMap, nextHdriMap, currentStop, nextStop]);

  const sharedMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        wireframe: false,
        uniforms: {
          tEquirect: { value: null },
          uHdriCapturePoint: { value: new THREE.Vector3() },
          tEquirectNext: { value: null },
          uHdriCapturePointNext: { value: new THREE.Vector3() },
          uTransitionProgress: { value: 0.0 },
          uTime: { value: 0.0 },
          uOpacity: { value: 1.0 },
          uExposure: { value: 1.0 },
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

          vec3 aces(vec3 x) {
            const float a = 2.51;
            const float b = 0.03;
            const float c = 2.43;
            const float d = 0.59;
            const float e = 0.14;
            return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
          }

          vec3 getColorFromEquirect(sampler2D tex, vec3 capturePoint) {
              vec3 direction = normalize(vWorldPosition - capturePoint);
              vec2 uv = vec2(
                  atan(direction.z, direction.x) / (2.0 * PI) + 0.5,
                  asin(direction.y) / PI + 0.5
              );
              vec3 color = texture2D(tex, uv).rgb;
              color *= uExposure;
              return color;
          }

          vec3 smoothBlend(vec3 color1, vec3 color2, float progress) {
              float smoothProgress = smoothstep(0.0, 1.0, progress);
              return mix(color1, color2, smoothProgress);
          }

          void main() {
            vec3 color1 = getColorFromEquirect(tEquirect, uHdriCapturePoint);
            vec3 color2 = getColorFromEquirect(tEquirectNext, uHdriCapturePointNext);
            vec3 finalColor = smoothBlend(color1, color2, uTransitionProgress);

            float distanceFromCenter = length(vWorldPosition - uHdriCapturePoint);
            float brightness = 1.0 - (distanceFromCenter * 0.005);
            brightness = clamp(brightness, 0.95, 1.0);
            finalColor *= brightness;

            gl_FragColor = vec4(finalColor, uOpacity);
          }
        `,
        transparent: true,
      }),
    []
  );

  // Update material uniforms
  sharedMaterial.uniforms.tEquirect.value = currentHdriMap;
  sharedMaterial.uniforms.uHdriCapturePoint.value = currentStop.position;
  sharedMaterial.uniforms.tEquirectNext.value = nextHdriMap;
  sharedMaterial.uniforms.uHdriCapturePointNext.value = nextStop
    ? nextStop.position
    : currentStop.position;
  sharedMaterial.uniforms.uTransitionProgress.value = isHdriLoaded
    ? transitionProgress
    : 0;
  sharedMaterial.uniforms.uTime.value = performance.now() * 0.001;
  sharedMaterial.uniforms.uExposure.value = 1.2;

  // leaving this for now, will come back to it later
  const handleMeshClick = (id) => {
    if (onMeshClick) {
      // onMeshClick(id.object.userData);
    }
  };

  return (
    <group name="room-projector">
      {isHdriLoaded &&
        tourStops.map((stop) => (
          <RoomMesh
            key={stop.id}
            currentStopId={stop.id}
            meshPath={stop.meshPath}
            material={sharedMaterial}
            position={stop.position}
            onClick={handleMeshClick}
          />
        ))}
    </group>
  );
}

import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { tourStops, tourConfig } from "../tourData";
import { gsap } from "gsap";
import { RoomProjector } from "./RoomProjector";

const MouseCursorRing = ({ position, normal, visible }) => {
  const ringRef = useRef();

  useFrame(() => {
    if (ringRef.current && visible) {
      const time = Date.now() * tourConfig.animation.hotspotPulseSpeed;
      const scale = 1 + Math.sin(time) * 0.1;
      ringRef.current.scale.setScalar(scale);
    }
  });

  if (!visible || !position) return null;

  const quaternion = new THREE.Quaternion();
  if (normal) {
    const up = new THREE.Vector3(0, 0, 1);
    quaternion.setFromUnitVectors(up, normal.clone().normalize());
  }

  const minifiedNormal = normal.multiplyScalar(0.01);
  const finalPosition = position.add(minifiedNormal);

  return (
    <group position={finalPosition} quaternion={quaternion}>
      <mesh ref={ringRef}>
        <ringGeometry args={[0.08, 0.12, 32]} />
        <meshBasicMaterial
          color={0xffffff}
          transparent={true}
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

const NavigationHotspot = ({
  position,
  targetStopId,
  onTransition,
  isVisible,
  cursorstate,
  isNotOccluded = true,
}) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();
  const targetStop = tourStops.find((stop) => stop.id === targetStopId);

  useFrame(() => {
    if (meshRef.current) {
      const time = Date.now() * tourConfig.animation.hotspotPulseSpeed;
      const scale = 1 + Math.sin(time) * 0.1;
      meshRef.current.scale.setScalar(scale);

      if (hovered) {
        meshRef.current.material.color.setHex(0x4a90e2);
      } else {
        meshRef.current.material.color.setHex(0xffffff);
      }
    }
  });

  if (!isVisible) return null;

  return (
    <group position={position}>
      {/* Clickable hotspot ring */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        ref={meshRef}
        onClick={() => onTransition(targetStopId)}
        onPointerOver={() => {
          setHovered(true);
          cursorstate(false);
        }}
        onPointerOut={() => {
          setHovered(false);
          cursorstate(true);
        }}
        userData={{ isHotspot: true }}>
        <ringGeometry args={[0, 0.075, 32]} />
        <meshBasicMaterial color={0xffffff} transparent={true} opacity={0.8} />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        userData={{ isHotspot: true }}
        onPointerOver={() => {
          cursorstate(false);
        }}
        onPointerOut={() => {
          cursorstate(true);
        }}>
        <ringGeometry args={[0.08, 0.09, 32]} />
        <meshBasicMaterial color={0xffffff} transparent={true} opacity={0.4} />
      </mesh>

      {/* Label - only show when hotspot is not occluded */}
      {isNotOccluded && (
        <Html position={[0, 0.1, 0]} center>
          <div className="hotspot-label">
            {`${targetStop.name}: ${targetStop.description}`}
          </div>
        </Html>
      )}
    </group>
  );
};

const Scene = () => {
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [nextStopIndex, setNextStopIndex] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [hotspotVisibility, setHotspotVisibility] = useState({});
  const [currentFov, setCurrentFov] = useState(tourConfig.camera.defaultFov);

  const [cursorInfo, setCursorInfo] = useState({
    position: new THREE.Vector3(),
    normal: new THREE.Vector3(),
    visible: true,
  });

  const setCursorVisibility = (state) => {
    setCursorInfo((prev) => ({
      ...prev,
      visible: state,
    }));
  };

  const controlsRef = useRef(null);
  const transitionDataRef = useRef(null);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const scroll = useRef(0);

  const { camera, scene, gl } = useThree();

  const checkHotspotOcclusion = () => {
    console.log("Called 'checkHotspotOcclusion'!!!");
    const visibility = {};

    tourStops.forEach((stop) => {
      if (stop.id === currentStopIndex) {
        visibility[stop.id] = true;
        return;
      }

      const hotspotPosition = stop.hotspotPosition || stop.position;

      const direction = new THREE.Vector3().subVectors(
        hotspotPosition,
        camera.position
      );
      const distance = direction.length();
      direction.normalize();

      raycaster.current.set(camera.position, direction);

      const intersects = raycaster.current.intersectObjects(
        scene.children,
        true
      );

      let occluded = false;
      for (let i = 0; i < intersects.length; i++) {
        const intersection = intersects[i];

        if (intersection.object.userData.isHotspot) {
          continue;
        }

        if (intersection.distance < distance - 0.1) {
          occluded = true;
          break;
        }
      }

      visibility[stop.id] = !occluded;
    });

    setHotspotVisibility(visibility);
  };

  useEffect(() => {
    if (controlsRef.current && tourStops.length > 1) {
      const controls = controlsRef.current;
      const camera = controls.object;
      camera.lookAt(
        tourStops[tourConfig.default.initialHotspotFacingIndex].position
      );

      const lookDirection = new THREE.Vector3();
      camera.getWorldDirection(lookDirection);
      const initialTarget = new THREE.Vector3()
        .copy(camera.position)
        .add(lookDirection.multiplyScalar(0.01));

      controls.target.copy(initialTarget);
      controls.update();

      checkHotspotOcclusion();
    }
  }, []);

  // handle mouse events
  useEffect(() => {
    const handleMouseMove = (event) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

      if (isTransitioning) return;

      raycaster.current.setFromCamera(mouse.current, camera);

      const intersects = raycaster.current.intersectObjects(
        scene.children,
        true
      );

      if (intersects.length > 0) {
        const intersection = intersects[0];

        setCursorInfo((prev) => ({
          ...prev,
          position: intersection.point,
          normal: intersection.normal,
        }));
      }
    };

    // handle mouse scroll
    const handleMouseScroll = (event) => {
      event.preventDefault(); // Prevent page scroll

      const zoomSpeed = 0.5;
      const deltaY = event.deltaY;

      setCurrentFov((prev) => {
        const newFov = prev + (deltaY > 0 ? zoomSpeed : -zoomSpeed);

        const clampedFov = Math.max(
          tourConfig.camera.minFov,
          Math.min(tourConfig.camera.maxFov, newFov)
        );

        // Update camera FOV
        camera.fov = clampedFov;
        camera.updateProjectionMatrix();

        return clampedFov;
      });
    };

    const canvas = gl.domElement;
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("wheel", handleMouseScroll);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("wheel", handleMouseScroll);
    };
  }, [camera, scene, gl, isTransitioning]);

  useFrame(() => {
    if (!controlsRef.current) return;

    const camera = controlsRef.current.object;
    const controls = controlsRef.current;

    if (isTransitioning && transitionDataRef.current) {
      const { startPosition, endPosition, startTarget, endTarget, progress } =
        transitionDataRef.current;

      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const currentPos = new THREE.Vector3().lerpVectors(
        startPosition,
        endPosition,
        easeProgress
      );
      camera.position.copy(currentPos);

      const currentTarget = new THREE.Vector3().lerpVectors(
        startTarget,
        endTarget,
        easeProgress
      );
      controls.target.copy(currentTarget);
      controls.update();
    } else if (!isTransitioning) {
      const lookDirection = new THREE.Vector3();
      camera.getWorldDirection(lookDirection);

      const newTarget = new THREE.Vector3()
        .copy(camera.position)
        .add(lookDirection.multiplyScalar(0.001));

      controls.target.lerp(newTarget, 0.1);
      controls.update();
    }
  });

  const handleTransition = (toStopId) => {
    if (isTransitioning || !controlsRef.current) return;

    const fromStop = tourStops[currentStopIndex];
    const toStop = tourStops.find((s) => s.id === toStopId);
    if (!toStop || toStop.id === currentStopIndex) {
      console.warn("Try to transition to Same stop. Aborting!!!");
      return;
    }

    setIsTransitioning(true);
    setNextStopIndex(toStop.id);

    const controls = controlsRef.current;
    const camera = controls.object;

    const startPosition = camera.position.clone();
    const startTarget = controls.target.clone();

    const directionToDestination = new THREE.Vector3()
      .subVectors(toStop.position, fromStop.position)
      .normalize();

    const endTarget = new THREE.Vector3()
      .copy(toStop.position)
      .add(directionToDestination.multiplyScalar(0.01));

    transitionDataRef.current = {
      startPosition: startPosition,
      endPosition: toStop.position.clone(),
      startTarget: startTarget,
      endTarget: endTarget,
      progress: 0,
    };

    const tl = gsap.timeline({
      onComplete: () => {
        setCurrentStopIndex(toStop.id);
        setNextStopIndex(null);
        setTransitionProgress(0);
        setIsTransitioning(false);
        setCursorVisibility(true);
        transitionDataRef.current = null;

        checkHotspotOcclusion();
      },
      onStart: () => {
        setCursorVisibility(false);
      },
    });

    tl.to(
      transitionDataRef.current,
      {
        progress: 1,
        duration: tourConfig.animation.transitionDuration,
        ease: tourConfig.animation.easeType,
      },
      0
    );

    tl.to(
      { value: 0 },
      {
        value: 1,
        duration: tourConfig.animation.transitionDuration,
        ease: tourConfig.animation.easeType,
        onUpdate: function () {
          setTransitionProgress(this.targets()[0].value);
        },
      },
      0
    );
  };

  const currentStop = tourStops[currentStopIndex];
  const nextStop = nextStopIndex !== null ? tourStops[nextStopIndex] : null;

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={false}
        rotateSpeed={-0.2}
        enabled={!isTransitioning}
        minPolarAngle={tourConfig.camera.minPolarAngle}
        maxPolarAngle={tourConfig.camera.maxPolarAngle}
        enableDamping={tourConfig.camera.damping}
        dampingFactor={tourConfig.camera.dampingFactor}
      />

      <RoomProjector
        tourStops={tourStops}
        currentStopId={stop.id}
        currentStop={currentStop}
        nextStop={nextStop}
        transitionProgress={transitionProgress}
        onMeshClick={handleTransition}
      />

      <MouseCursorRing
        position={cursorInfo.position}
        normal={cursorInfo.normal}
        visible={cursorInfo.visible}
      />

      {!isTransitioning &&
        tourStops.map((stop) => {
          if (stop.id === currentStopIndex) return null;

          return (
            <NavigationHotspot
              key={stop.id}
              position={stop.hotspotPosition || stop.position}
              targetStopId={stop.id}
              onTransition={handleTransition}
              cursorstate={setCursorVisibility}
              isVisible={true}
              isNotOccluded={hotspotVisibility[stop.id] !== false}
            />
          );
        })}
    </>
  );
};

export const VirtualTour = () => {
  const initialPos = tourStops[0].position;

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Canvas
        camera={{ position: initialPos, fov: tourConfig.camera.defaultFov }}>
        <Scene />
      </Canvas>
    </div>
  );
};

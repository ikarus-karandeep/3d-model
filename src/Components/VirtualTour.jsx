import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { tourStops } from "../tourData";
import { gsap } from "gsap";
import { RoomProjector } from "./RoomProjector";

const Hotspot = ({ position, onClick, label }) => {
  return (
    <Html position={position}>
      <div className="hotspot" onClick={onClick}>
        <div className="hotspot-label">{label}</div>
      </div>
    </Html>
  );
};

const Scene = () => {
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [nextStopIndex, setNextStopIndex] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);

  const controlsRef = useRef(null);
  const transitionDataRef = useRef(null); // Store transition interpolation data

  useEffect(() => {
    if (controlsRef.current && tourStops.length > 1) {
      const controls = controlsRef.current;
      const camera = controls.object;
      camera.lookAt(tourStops[1].position);

      const lookDirection = new THREE.Vector3();
      camera.getWorldDirection(lookDirection);
      const initialTarget = new THREE.Vector3()
        .copy(camera.position)
        .add(lookDirection.multiplyScalar(0.01));

      controls.target.copy(initialTarget);
      controls.update();
    }
  }, []);

  useFrame(() => {
    if (!controlsRef.current) return;

    const camera = controlsRef.current.object;
    const controls = controlsRef.current;

    if (isTransitioning && transitionDataRef.current) {
      // During transition, smoothly interpolate both position and target
      const { startPosition, endPosition, startTarget, endTarget, progress } =
        transitionDataRef.current;

      // Smooth interpolation using easing
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out for smoother feeling

      // Interpolate camera position
      const currentPos = new THREE.Vector3().lerpVectors(
        startPosition,
        endPosition,
        easeProgress
      );
      camera.position.copy(currentPos);

      // Interpolate camera target for smooth rotation
      const currentTarget = new THREE.Vector3().lerpVectors(
        startTarget,
        endTarget,
        easeProgress
      );
      controls.target.copy(currentTarget);
      controls.update();
    } else if (!isTransitioning) {
      // During idle "look around" state, keep the target just in front of the camera.
      const lookDirection = new THREE.Vector3();
      camera.getWorldDirection(lookDirection);

      const newTarget = new THREE.Vector3()
        .copy(camera.position)
        .add(lookDirection.multiplyScalar(0.01));

      // Use a gentle lerp to avoid any potential snapping from user input.
      controls.target.lerp(newTarget, 0.1);
      controls.update();
    }
  });

  const handleTransition = (toStopId) => {
    if (isTransitioning || !controlsRef.current) return;

    const fromStop = tourStops[currentStopIndex];
    const toStop = tourStops.find((s) => s.id === toStopId);
    if (!toStop || toStop.id === currentStopIndex) return;

    setIsTransitioning(true);
    setNextStopIndex(toStop.id);

    const controls = controlsRef.current;
    const camera = controls.object;

    // Capture the current camera state
    const startPosition = camera.position.clone();
    const startTarget = controls.target.clone();

    // Calculate the end target - look towards the destination
    const directionToDestination = new THREE.Vector3()
      .subVectors(toStop.position, fromStop.position)
      .normalize();

    const endTarget = new THREE.Vector3()
      .copy(toStop.position)
      .add(directionToDestination.multiplyScalar(0.01));

    // Store transition data for useFrame
    transitionDataRef.current = {
      startPosition: startPosition,
      endPosition: toStop.position.clone(),
      startTarget: startTarget,
      endTarget: endTarget,
      progress: 0,
    };

    // Create animation timeline
    const tl = gsap.timeline({
      onComplete: () => {
        setCurrentStopIndex(toStop.id);
        setNextStopIndex(null);
        setTransitionProgress(0);
        setIsTransitioning(false);
        transitionDataRef.current = null;
      },
    });

    // Animate the progress value that useFrame will use for interpolation
    tl.to(
      transitionDataRef.current,
      {
        progress: 1,
        duration: 2.0, // Slightly longer for smoother feeling
        ease: "power2.inOut",
      },
      0
    );

    // Animate the shader blend factor separately
    tl.to(
      { value: 0 },
      {
        value: 1,
        duration: 2.0,
        ease: "power2.inOut",
        onUpdate: function () {
          setTransitionProgress(this.targets()[0].value);
        },
      },
      0
    );
  };

  const currentStop = tourStops[currentStopIndex];
  const nextStop = nextStopIndex !== null ? tourStops[nextStopIndex] : null;
  const displayedStops = tourStops.filter((s) => s.id !== currentStop.id);

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={false}
        enabled={!isTransitioning}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI - Math.PI / 4}
        enableDamping={true}
        dampingFactor={0.05}
      />

      <RoomProjector
        tourStops={tourStops}
        currentStop={currentStop}
        nextStop={nextStop}
        transitionProgress={transitionProgress}
      />

      {!isTransitioning &&
        displayedStops.map((stop) => (
          <Hotspot
            key={stop.id}
            position={stop.position}
            label={stop.name}
            onClick={() => handleTransition(stop.id)}
          />
        ))}
    </>
  );
};

export const VirtualTour = () => {
  const initialPos = tourStops[0].position;

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: initialPos, fov: 55 }}>
        <Scene />
      </Canvas>
    </div>
  );
};

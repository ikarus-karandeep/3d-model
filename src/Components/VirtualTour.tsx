import { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Html, useGLTF } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { tourStops } from '../tourData';
import { gsap } from 'gsap';

interface HotspotProps {
  position: THREE.Vector3;
  onClick: () => void;
  label: string;
}

const Hotspot = ({ position, onClick, label }: HotspotProps) => {
  return (
    <Html position={position}>
      <div className="hotspot" onClick={onClick}>
        <div className="hotspot-label">{label}</div>
      </div>
    </Html>
  );
};

interface ModelProps {
  url: string;
  position: THREE.Vector3;
}

const Model = ({url, position}: ModelProps) => {
  const glb = useGLTF(url);
  const mesh = useRef<THREE.Mesh>(null);

  // if(mesh.current) {
  //   mesh.current.position.set(position.x, position.y, position.z);
  // }

  return (
    <primitive object={glb.scene} ref={mesh} position={[...position]}/>
  );
}

const Scene = () => {
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const controlsRef = useRef<OrbitControlsImpl>(null);

  let cameraDirection = new THREE.Vector3;
  const { camera } = useThree();
  camera.getWorldDirection(cameraDirection);

  if (controlsRef.current) {
    let targetPos = camera.position.clone();
    targetPos.add(cameraDirection);
    controlsRef.current.target.set(
      targetPos.x,
      targetPos.y,
      targetPos.z,
    )
  }

  const materials = useMemo(() => [
    new THREE.MeshBasicMaterial({ side: THREE.BackSide, transparent: true }),
    new THREE.MeshBasicMaterial({ side: THREE.BackSide, transparent: true, opacity: 0 }),
  ], []);

  const [activeMaterialIndex, setActiveMaterialIndex] = useState(0);
  
  const textureLoader = useMemo(() => new RGBELoader(), []);

  useEffect(() => {
    const initialStop = tourStops[0];
    const initialTexturePath = initialStop.hdriPath;
    
    if(controlsRef.current) {
      controlsRef.current.target.set(
        initialStop.position.x, 
        initialStop.position.y, 
        initialStop.position.z
      )
    }
    
    textureLoader.load(initialTexturePath, (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      materials[0].map = texture;
      materials[0].needsUpdate = true;
    });
  }, [materials, textureLoader]);


  const handleTransition = (toStopId: number) => {
    if (isTransitioning || !controlsRef.current) return;

    const toStop = tourStops.find(s => s.id === toStopId);
    if (!toStop || toStop.id === currentStopIndex) return;

    setIsTransitioning(true);

    const activeMaterial = materials[activeMaterialIndex];
    const inactiveMaterial = materials[activeMaterialIndex === 0 ? 1 : 0];

    camera.getWorldDirection(cameraDirection);
    cameraDirection.multiplyScalar(-1);
    const newTargetPosition = new THREE.Vector3(
      toStop.position.x, 
      toStop.position.y, 
      toStop.position.z
    )
    newTargetPosition.add(cameraDirection);

    textureLoader.load(toStop.hdriPath, (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      inactiveMaterial.map = texture;
      inactiveMaterial.needsUpdate = true;
      
      const controls = controlsRef.current!;

      const tl = gsap.timeline({
        onComplete: () => {
          setActiveMaterialIndex(prevIndex => (prevIndex === 0 ? 1 : 0));
          setCurrentStopIndex(toStop.id);
          setIsTransitioning(false);
        }
      });
      
      // Animate the camera to the new position
      tl.to(controls.object.position, { ...newTargetPosition, duration: 1.5, ease: 'power2.inOut' }, 0);
      
      // Animate the target to the new "look-at" point
      tl.to(controls.target, { ...toStop.position, duration: 1.5, ease: 'power2.inOut' }, 0);

      // Animate the material cross-fade
      tl.to(activeMaterial, { opacity: 0, duration: 1.5, ease: 'power2.inOut' }, 0);
      tl.to(inactiveMaterial, { opacity: 1, duration: 1.5, ease: 'power2.inOut' }, 0);
    });
  };

  const currentStop = tourStops[currentStopIndex];
  const displayedStops = tourStops.filter(s => s.id !== currentStop.id);

  return (
    <>
      <OrbitControls ref={controlsRef} enablePan={false} enableZoom={false} enabled={!isTransitioning} />
      <Model url={tourStops[0].meshPath} position={tourStops[0].position}/>
      <Model url={tourStops[1].meshPath} position={tourStops[1].position}/>
      <Model url={tourStops[2].meshPath} position={tourStops[2].position}/>

      <mesh material={materials[0]}>
        <sphereGeometry args={[500, 60, 40]} />
      </mesh>
      <mesh material={materials[1]}>
        <sphereGeometry args={[500, 60, 40]} />
      </mesh>

      {!isTransitioning && displayedStops.map((stop) => (
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
  const initialPos = tourStops[0].position.clone();
  
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: initialPos, fov: 75 }}>
        <Scene />
      </Canvas>
    </div>
  );
};
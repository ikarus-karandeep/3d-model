import * as THREE from 'three';

export interface TourStop {
  id: number;
  name: string;
  position: THREE.Vector3;
  hdriPath: string;
  meshPath: string;
}

export const tourStops: TourStop[] = [
  {
    id: 0,
    name: 'Entrance',
    position: new THREE.Vector3(0, 1.5, 0),
    hdriPath: '/photoStudio.hdr',
    meshPath: '/models/entrance.glb',
  },
  {
    id: 1,
    name: 'Living Room',
    position: new THREE.Vector3(5, 1.5, 2),
    hdriPath: '/photoStudio2.hdr',
    meshPath: '/models/livingRoom.glb',
  },
  {
    id: 2,
    name: 'Kitchen',
    position: new THREE.Vector3(-3, 1.5, 4),
    hdriPath: '/entryRoom.hdr',
    meshPath: '/models/kitchen.glb',
  },
];
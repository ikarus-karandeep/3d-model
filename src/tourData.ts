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
    name: '01',
    position: new THREE.Vector3(0.0,
            1.803259015083313,
            -0.0),
    hdriPath: '/hdri/01.hdr',
    meshPath: '/models/01.glb',
  },
  {
    id: 1,
    name: '02',
    position: new THREE.Vector3(0.0,
            1.7201064825057983,
            -6.481420040130615),
    hdriPath: '/hdri/02.hdr',
    meshPath: '/models/02.glb',
  },
  {
    id: 2,
    name: '03',
    position: new THREE.Vector3(8.37006950378418,
            1.7201064825057983,
            -6.481420040130615),
    hdriPath: '/hdri/03.hdr',
    meshPath: '/models/03.glb',
  },
  {
    id: 3,
    name: '04',
    position: new THREE.Vector3(0.0,
            1.7201064825057983,
            -13.179499626159668),
    hdriPath: '/hdri/04.hdr',
    meshPath: '/models/04.glb',
  },
];
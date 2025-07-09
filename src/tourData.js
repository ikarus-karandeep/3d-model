import * as THREE from "three";

export const tourStops = [
  {
    id: 0,
    name: "01",
    hdriPath: "/hdri/01.hdr",
    meshPath: "/models/Geo_01.glb",
    position: new THREE.Vector3(
      -1.6115844249725342,
      1.1764272451400757,
      1.4716463088989258
    ),
    hotspotPosition: new THREE.Vector3(
      -1.6115844249725342,
      0.1,
      1.4716463088989258
    ),
    description: "Temporary Description",
    tags: ["entrance", "modern", "spacious"],
    connectedStops: [2, 3],
  },
  {
    id: 1,
    name: "02",
    hdriPath: "/hdri/02.hdr",
    meshPath: "/models/Geo_02.glb",
    position: new THREE.Vector3(
      0.295840859413147,
      1.1764272451400757,
      1.4640165567398071
    ),
    hotspotPosition: new THREE.Vector3(
      0.295840859413147,
      0.1,
      1.4640165567398071
    ),
    description: "Temporary Description",
    tags: ["entrance", "modern", "spacious"],
    connectedStops: [1, 3],
  },
  {
    id: 2,
    name: "03",
    hdriPath: "/hdri/03.hdr",
    meshPath: "/models/Geo_03.glb",
    position: new THREE.Vector3(
      -1.870994210243225,
      1.1764272451400757,
      -0.46629810333251953
    ),
    hotspotPosition: new THREE.Vector3(
      -1.870994210243225,
      0.1,
      -0.46629810333251953
    ),
    description: "Temporary Description",
    tags: ["entrance", "modern", "spacious"],
    connectedStops: [1, 2, 4],
  },
  {
    id: 3,
    name: "04",
    hdriPath: "/hdri/04.hdr",
    meshPath: "/models/Geo_04.glb",
    position: new THREE.Vector3(
      -0.9325409531593323,
      1.1764272451400757,
      -1.687050461769104
    ),
    hotspotPosition: new THREE.Vector3(
      -0.9325409531593323,
      0.1,
      -1.687050461769104
    ),
    description: "Temporary Description",
    tags: ["entrance", "modern", "spacious"],
    connectedStops: [3, 5],
  },
  {
    id: 4,
    name: "05",
    hdriPath: "/hdri/05.hdr",
    meshPath: "/models/Geo_05.glb",
    position: new THREE.Vector3(
      -0.9783191680908203,
      1.1764272451400757,
      -3.579216480255127
    ),
    hotspotPosition: new THREE.Vector3(
      -0.9783191680908203,
      0.1,
      -3.579216480255127
    ),
    description: "Temporary Description",
    tags: ["entrance", "modern", "spacious"],
    connectedStops: [4, 6],
  },
  {
    id: 5,
    name: "06",
    hdriPath: "/hdri/06.hdr",
    meshPath: "/models/Geo_06.glb",
    position: new THREE.Vector3(
      -3.007819652557373,
      1.1764272451400757,
      -2.6789116859436035
    ),
    hotspotPosition: new THREE.Vector3(
      -3.007819652557373,
      0.1,
      -2.6789116859436035
    ),
    description: "Temporary Description",
    tags: ["entrance", "modern", "spacious"],
    connectedStops: [5, 7],
  },
  {
    id: 6,
    name: "07",
    hdriPath: "/hdri/07.hdr",
    meshPath: "/models/Geo_07.glb",
    position: new THREE.Vector3(
      -4.823688507080078,
      1.1764272451400757,
      -2.717060089111328
    ),
    hotspotPosition: new THREE.Vector3(
      -4.823688507080078,
      0.1,
      -2.717060089111328
    ),
    description: "Temporary Description",
    tags: ["entrance", "modern", "spacious"],
    connectedStops: [6],
  },
  {
    id: 7,
    name: "08",
    hdriPath: "/hdri/08.hdr",
    meshPath: "/models/Geo_08.glb",
    position: new THREE.Vector3(
      -3.4884908199310303,
      1.1764272451400757,
      -0.9698584079742432
    ),
    hotspotPosition: new THREE.Vector3(
      -3.4884908199310303,
      0.1,
      -0.9698584079742432
    ),
    description: "Temporary Description",
    tags: ["entrance", "modern", "spacious"],
    connectedStops: [6, 9, 10],
  },
  {
    id: 8,
    name: "09",
    hdriPath: "/hdri/09.hdr",
    meshPath: "/models/Geo_09.glb",
    position: new THREE.Vector3(
      -5.441694259643555,
      1.1764272451400757,
      -1.1453415155410767
    ),
    hotspotPosition: new THREE.Vector3(
      -5.441694259643555,
      0.1,
      -1.1453415155410767
    ),
    description: "Temporary Description",
    tags: ["entrance", "modern", "spacious"],
    connectedStops: [8, 10],
  },
  {
    id: 9,
    name: "10",
    hdriPath: "/hdri/10.hdr",
    meshPath: "/models/Geo_10.glb",
    position: new THREE.Vector3(
      -3.6181955337524414,
      1.1764272451400757,
      1.0596424341201782
    ),
    hotspotPosition: new THREE.Vector3(
      -3.6181955337524414,
      0.1,
      1.0596424341201782
    ),
    description: "Temporary Description",
    tags: ["entrance", "modern", "spacious"],
    connectedStops: [8, 11],
  },
  {
    id: 10,
    name: "11",
    hdriPath: "/hdri/11.hdr",
    meshPath: "/models/Geo_11.glb",
    position: new THREE.Vector3(
      -4.457462787628174,
      1.1764272451400757,
      2.524545192718506
    ),
    hotspotPosition: new THREE.Vector3(
      -4.457462787628174,
      0.1,
      2.524545192718506
    ),
    description: "Temporary Description",
    tags: ["entrance", "modern", "spacious"],
    connectedStops: [8, 10],
  },
];

export const tourConfig = {
  // Animation settings
  animation: {
    transitionDuration: 1.5,
    hotspotPulseSpeed: 0.003,
    easeType: "power2.inOut",
  },

  // Interaction settings
  interaction: {
    enableRaycastUI: true,
    raycastDistance: 50,
    hotspotClickDistance: 10,
  },

  // Camera settings
  camera: {
    fov: 65,
    minPolarAngle: Math.PI / 10,
    maxPolarAngle: Math.PI - Math.PI / 10,
    damping: true,
    dampingFactor: 0.1,
  },
};

import * as THREE from "three";

export const tourStops = [
  {
    id: 0,
    name: "First Stop",
    description: "Temporary Description",
    hdriPath: "/hdri/01.jpg",
    meshPath: "/models/Geo_01.glb",
    position: new THREE.Vector3(
      -1.6115844249725342,
      1.1764272451400757,
      1.4716463088989258
    ),
    hotspotPosition: new THREE.Vector3(
      -1.6115844249725342,
      0.2,
      1.4716463088989258
    ),
    tags: ["entrance", "modern", "spacious"],
  },
  {
    id: 1,
    name: "Second Stop",
    description: "Temporary Description",
    hdriPath: "/hdri/02.jpg",
    meshPath: "/models/Geo_02.glb",
    position: new THREE.Vector3(
      0.295840859413147,
      1.1764272451400757,
      1.4640165567398071
    ),
    hotspotPosition: new THREE.Vector3(
      0.295840859413147,
      0.2,
      1.4640165567398071
    ),
    tags: ["entrance", "modern", "spacious"],
  },
  {
    id: 2,
    name: "Third Stop",
    description: "Temporary Description",
    hdriPath: "/hdri/03.jpg",
    meshPath: "/models/Geo_03.glb",
    position: new THREE.Vector3(
      -1.870994210243225,
      1.1764272451400757,
      -0.46629810333251953
    ),
    hotspotPosition: new THREE.Vector3(
      -1.870994210243225,
      0.2,
      -0.46629810333251953
    ),
    tags: ["entrance", "modern", "spacious"],
  },
  {
    id: 3,
    name: "Fourth Stop",
    description: "Temporary Description",
    hdriPath: "/hdri/04.jpg",
    meshPath: "/models/Geo_04.glb",
    position: new THREE.Vector3(
      -0.9325409531593323,
      1.1764272451400757,
      -1.687050461769104
    ),
    hotspotPosition: new THREE.Vector3(
      -0.9325409531593323,
      0.2,
      -1.687050461769104
    ),
    tags: ["entrance", "modern", "spacious"],
  },
  {
    id: 4,
    name: "Fifth Stop",
    description: "Temporary Description",
    hdriPath: "/hdri/05.jpg",
    meshPath: "/models/Geo_05.glb",
    position: new THREE.Vector3(
      -0.9783191680908203,
      1.1764272451400757,
      -3.579216480255127
    ),
    hotspotPosition: new THREE.Vector3(
      -0.9783191680908203,
      0.2,
      -3.579216480255127
    ),
    tags: ["entrance", "modern", "spacious"],
  },
  {
    id: 5,
    name: "Sixth Stop",
    description: "Temporary Description",
    hdriPath: "/hdri/06.jpg",
    meshPath: "/models/Geo_06.glb",
    position: new THREE.Vector3(
      -3.007819652557373,
      1.1764272451400757,
      -2.6789116859436035
    ),
    hotspotPosition: new THREE.Vector3(
      -3.007819652557373,
      0.2,
      -2.6789116859436035
    ),
    tags: ["entrance", "modern", "spacious"],
  },
  {
    id: 6,
    name: "Seventh Stop",
    description: "Temporary Description",
    hdriPath: "/hdri/07.jpg",
    meshPath: "/models/Geo_07.glb",
    position: new THREE.Vector3(
      -4.823688507080078,
      1.1764272451400757,
      -2.717060089111328
    ),
    hotspotPosition: new THREE.Vector3(
      -4.823688507080078,
      0.2,
      -2.717060089111328
    ),
    tags: ["entrance", "modern", "spacious"],
  },
  {
    id: 7,
    name: "Eighth Stop",
    description: "Temporary Description",
    hdriPath: "/hdri/08.jpg",
    meshPath: "/models/Geo_08.glb",
    position: new THREE.Vector3(
      -3.4884908199310303,
      1.1764272451400757,
      -0.9698584079742432
    ),
    hotspotPosition: new THREE.Vector3(
      -3.4884908199310303,
      0.2,
      -0.9698584079742432
    ),
    tags: ["entrance", "modern", "spacious"],
  },
  {
    id: 8,
    name: "Ninth Stop",
    description: "Temporary Description",
    hdriPath: "/hdri/09.jpg",
    meshPath: "/models/Geo_09.glb",
    position: new THREE.Vector3(
      -5.441694259643555,
      1.1764272451400757,
      -1.1453415155410767
    ),
    hotspotPosition: new THREE.Vector3(
      -5.441694259643555,
      0.2,
      -1.1453415155410767
    ),
    tags: ["entrance", "modern", "spacious"],
  },
  {
    id: 9,
    name: "Tenth Stop",
    description: "Temporary Description",
    hdriPath: "/hdri/10.jpg",
    meshPath: "/models/Geo_10.glb",
    position: new THREE.Vector3(
      -3.6181955337524414,
      1.1764272451400757,
      1.0596424341201782
    ),
    hotspotPosition: new THREE.Vector3(
      -3.6181955337524414,
      0.2,
      1.0596424341201782
    ),
    tags: ["entrance", "modern", "spacious"],
  },
  {
    id: 10,
    name: "Eleventh Stop",
    description: "Temporary Description",
    hdriPath: "/hdri/11.jpg",
    meshPath: "/models/Geo_11.glb",
    position: new THREE.Vector3(
      -4.457462787628174,
      1.1764272451400757,
      2.524545192718506
    ),
    hotspotPosition: new THREE.Vector3(
      -4.457462787628174,
      0.2,
      2.524545192718506
    ),
    tags: ["entrance", "modern", "spacious"],
  },
];

export const tourConfig = {
  default: {
    initialHotspotFacingIndex: 3,
  },

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
    minPolarAngle: Math.PI / 4,
    maxPolarAngle: Math.PI - Math.PI / 4,
    damping: true,
    dampingFactor: 0.2,
  },
};

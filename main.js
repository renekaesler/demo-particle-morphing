import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";

function pointsFromGeometry(geometry, amount = 100_000) {
  const mesh = new THREE.Mesh(geometry);
  const sampler = new MeshSurfaceSampler(mesh).build();
  const pointsData = [];

  const vec = new THREE.Vector3();
  for (let i = 0; i < amount; i++) {
    sampler.sample(vec);
    vec.toArray(pointsData, i * 3);
  }

  return new THREE.Float32BufferAttribute(pointsData, 3);
}

function createMorphObject() {
  const torusKnot = new THREE.TorusKnotGeometry(5, 1, 100, 16);
  const torusKnotPoints = pointsFromGeometry(torusKnot);

  const torus = new THREE.TorusGeometry(5, 1, 16, 100);
  const torusPoints = pointsFromGeometry(torus);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", torusPoints);
  geometry.morphAttributes.position = [torusKnotPoints];

  const material = new THREE.PointsMaterial({ color: 0x00ffff, size: 0.1 });

  return new THREE.Points(geometry, material);
}

const aspect = innerWidth / innerHeight;
const camera = new THREE.PerspectiveCamera(45, aspect, 1, 100);
camera.position.set(0, 0, 25);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const object = createMorphObject();
const scene = new THREE.Scene();
scene.add(object);

renderer.setAnimationLoop(ms => {
  const t = ms / 1000;

  object.morphTargetInfluences[0] = Math.sin(t * 0.5) * 0.5 + 0.5;
  controls.update();
  renderer.render(scene, camera);
});

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

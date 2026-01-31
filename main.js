gsap.registerPlugin(ScrollTrigger);

const canvas = document.querySelector("#scene");

/* ======================
   SCENE SETUP
====================== */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0d10);

/* ======================
   CAMERA
====================== */
const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 1.5, 6);

/* ======================
   RENDERER (CRITICAL)
====================== */
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// CINEMATIC SETTINGS
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

/* ======================
   LIGHTING (THIS FIXES BLACK SCREEN)
====================== */

// Soft base light
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

// Key light (cinematic)
const keyLight = new THREE.DirectionalLight(0xffffff, 3);
keyLight.position.set(5, 10, 5);
scene.add(keyLight);

// Rim light (edge glow)
const rimLight = new THREE.DirectionalLight(0x88ccff, 1.5);
rimLight.position.set(-5, 3, -5);
scene.add(rimLight);

/* ======================
   MODEL LOADING
====================== */
let city;

const loader = new THREE.GLTFLoader();
loader.load(
  "city.glb",
  (gltf) => {
    city = gltf.scene;

    // IMPORTANT: Normalize scale
    city.scale.setScalar(1);
    city.position.set(0, -1, 0);

    // Ensure materials render correctly
    city.traverse(obj => {
      if (obj.isMesh) {
        obj.material.metalness = 0.3;
        obj.material.roughness = 0.6;
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    scene.add(city);
    camera.lookAt(0, 0, 0);
  },
  undefined,
  (error) => {
    console.error("Model load error:", error);
  }
);

/* ======================
   SCROLL CINEMATIC TIMELINE
====================== */
const timeline = gsap.timeline({
  scrollTrigger: {
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: 1
  }
});

// STEP 1 – Calm intro
timeline.to(camera.position, {
  z: 5,
  y: 1.5,
  ease: "power2.out"
});

// STEP 2 – Tension
timeline.to(camera.position, {
  x: 2,
  y: 2,
  z: 4,
  ease: "power3.out"
});

// STEP 3 – Break frame feel
timeline.to(camera.position, {
  x: -2,
  y: 2.8,
  z: 3,
  ease: "expo.out"
});

// STEP 4 – Resolution
timeline.to(camera.position, {
  x: 0,
  y: 1.8,
  z: 4,
  ease: "power2.inOut"
});

/* ======================
   TEXT ANIMATION
====================== */
document.querySelectorAll(".step").forEach(step => {
  gsap.fromTo(
    step.children,
    { y: 80, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      stagger: 0.15,
      ease: "power3.out",
      scrollTrigger: {
        trigger: step,
        start: "top 65%",
        toggleActions: "play none none reverse"
      }
    }
  );
});

/* ======================
   RENDER LOOP
====================== */
function animate() {
  if (city) {
    city.rotation.y += 0.0015; // subtle cinematic motion
  }
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

/* ======================
   RESIZE
====================== */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

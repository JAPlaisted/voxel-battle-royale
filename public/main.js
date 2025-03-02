// public/main.js

const socket = io();
let scene, camera, renderer;
let playerMesh;
const otherPlayers = {};
let selfPlayerData;

// Jump physics globals
let isJumping = false;
let jumpVelocity = 0;
const gravity = -0.03;
const jumpStrength = 0.7;
const baseY = 1.5; // Height at which the character sits
let jumpHorizontalVelocity = new THREE.Vector3(0, 0, 0);

// Expose globals for controls.js
window.isJumping = isJumping;
window.jumpVelocity = jumpVelocity;
window.gravity = gravity;
window.jumpStrength = jumpStrength;
window.baseY = baseY;
window.jumpHorizontalVelocity = jumpHorizontalVelocity;

// Build a blocky character from code.
function createCharacter() {
  const character = new THREE.Group();
  // Raise the entire character by baseY so that the legs (at y = -0.65) are fully visible.
  character.position.y = baseY;

  // Body (green)
  const bodyGeom = new THREE.BoxGeometry(1, 1.5, 0.5);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  body.position.set(0, 0.75, 0);
  character.add(body);

  // Head (skin color)
  const headGeom = new THREE.BoxGeometry(0.8, 0.8, 0.8);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffcc99 });
  const head = new THREE.Mesh(headGeom, headMat);
  head.position.set(0, 1.75, 0);
  character.add(head);

  // Left Arm (skin color)
  const leftArmGeom = new THREE.BoxGeometry(0.3, 1.2, 0.3);
  const leftArmMat = new THREE.MeshStandardMaterial({ color: 0xffcc99 });
  const leftArm = new THREE.Mesh(leftArmGeom, leftArmMat);
  leftArm.position.set(-0.65, 0.9, 0);
  character.add(leftArm);

  // Right Arm (skin color)
  const rightArmGeom = new THREE.BoxGeometry(0.3, 1.2, 0.3);
  const rightArmMat = new THREE.MeshStandardMaterial({ color: 0xffcc99 });
  const rightArm = new THREE.Mesh(rightArmGeom, rightArmMat);
  rightArm.position.set(0.65, 0.9, 0);
  character.add(rightArm);

  // Left Leg (blue)
  const leftLegGeom = new THREE.BoxGeometry(0.4, 1.3, 0.4);
  const leftLegMat = new THREE.MeshStandardMaterial({ color: 0x0000ff });
  const leftLeg = new THREE.Mesh(leftLegGeom, leftLegMat);
  leftLeg.position.set(-0.25, -0.65, 0);
  character.add(leftLeg);

  // Right Leg (blue)
  const rightLegGeom = new THREE.BoxGeometry(0.4, 1.3, 0.4);
  const rightLegMat = new THREE.MeshStandardMaterial({ color: 0x0000ff });
  const rightLeg = new THREE.Mesh(rightLegGeom, rightLegMat);
  rightLeg.position.set(0.25, -0.65, 0);
  character.add(rightLeg);

  // Save references to legs for animation.
  character.userData.leftLeg = leftLeg;
  character.userData.rightLeg = rightLeg;

  return character;
}

// Instead of a red cube, create our blocky character.
function createFallbackPlayer(selfPlayer) {
  console.log("Creating blocky character from code...");
  playerMesh = createCharacter();
  // Set the character's world position so its base is at selfPlayer.position.y + baseY.
  playerMesh.position.set(
    selfPlayer.position.x,
    selfPlayer.position.y + baseY,
    selfPlayer.position.z
  );
  scene.add(playerMesh);
  window.playerMesh = playerMesh;
}

function init(selfPlayer) {
  selfPlayerData = selfPlayer;
  scene = new THREE.Scene();

  // Setup camera.
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(
    selfPlayer.position.x,
    selfPlayer.position.y + 5,
    selfPlayer.position.z + 10
  );

  // Setup renderer with a sky-blue background.
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x87ceeb, 1);
  document.body.appendChild(renderer.domElement);

  window.addEventListener("resize", onWindowResize, false);

  // Load ground texture.
  const textureLoader = new THREE.TextureLoader();
  const groundTexture = textureLoader.load(
    "assets/textures/ground.jpg",
    () => { console.log("Ground texture loaded successfully"); },
    undefined,
    (error) => { console.error("Error loading ground texture:", error); }
  );
  groundTexture.wrapS = THREE.RepeatWrapping;
  groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(10, 10);

  const planeGeometry = new THREE.PlaneGeometry(200, 200);
  const planeMaterial = new THREE.MeshBasicMaterial({ map: groundTexture });
  const ground = new THREE.Mesh(planeGeometry, planeMaterial);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Add ambient and directional lights.
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(50, 50, 50);
  scene.add(directionalLight);

  // Create our blocky character.
  createFallbackPlayer(selfPlayer);

  // Update HUD.
  const hud = document.getElementById("hud");
  if (hud) {
    hud.innerText = `You are ${selfPlayer.state}. Health: ${selfPlayer.health}`;
  }

  animate();
}

function animate() {
  requestAnimationFrame(animate);

  // Call continuous movement update (if keys are held down).
  if (window.updateMovement) {
    window.updateMovement();
  }

  if (playerMesh && playerMesh.position) {
    // Jump physics.
    if (window.isJumping) {
      playerMesh.position.y += window.jumpVelocity;
      window.jumpVelocity += window.gravity;
      // Apply horizontal jump momentum.
      playerMesh.position.x += window.jumpHorizontalVelocity.x;
      playerMesh.position.z += window.jumpHorizontalVelocity.z;
      if (playerMesh.position.y <= window.baseY) {
        playerMesh.position.y = window.baseY;
        window.isJumping = false;
        window.jumpVelocity = 0;
        window.jumpHorizontalVelocity.set(0, 0, 0);
      }
    }

    // Animate legs if moving.
    if (window.isMoving && playerMesh.userData.leftLeg && playerMesh.userData.rightLeg) {
      const t = performance.now() * 0.005;
      const swingAngle = Math.sin(t) * 0.2; // Adjust amplitude (0.2 here)
      playerMesh.userData.leftLeg.rotation.x = swingAngle;
      playerMesh.userData.rightLeg.rotation.x = -swingAngle;
    } else {
      if (playerMesh.userData.leftLeg) playerMesh.userData.leftLeg.rotation.x = 0;
      if (playerMesh.userData.rightLeg) playerMesh.userData.rightLeg.rotation.x = 0;
    }

    // Compute the player's forward vector.
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyEuler(playerMesh.rotation);
    const cameraOffset = forward.clone().multiplyScalar(10);
    camera.position.copy(playerMesh.position)
      .add(new THREE.Vector3(0, 5, 0))
      .add(cameraOffset);
    camera.lookAt(playerMesh.position);
  } else {
    camera.lookAt(new THREE.Vector3(0, 0, 0));
  }
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- Socket.io event handlers (unchanged) ---
socket.on("init", (data) => {
  console.log("Received init data:", data);
  init(data.self);
  for (const id in data.players) {
    if (id !== data.self.id) {
      addOtherPlayer(data.players[id]);
    }
  }
});
socket.on("playerJoined", (player) => {
  addOtherPlayer(player);
});
socket.on("playerMoved", (update) => {
  const { id, data } = update;
  if (otherPlayers[id]) {
    otherPlayers[id].position.set(data.x, data.y, data.z);
  }
});
socket.on("playerDisconnected", (id) => {
  if (otherPlayers[id]) {
    scene.remove(otherPlayers[id]);
    delete otherPlayers[id];
  }
});
function addOtherPlayer(playerData) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0x0000ff });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(
    playerData.position.x,
    playerData.position.y + 0.5,
    playerData.position.z
  );
  otherPlayers[playerData.id] = mesh;
  scene.add(mesh);
}
function updateSelfPosition(newPos) {
  if (playerMesh) {
    playerMesh.position.set(newPos.x, newPos.y, newPos.z);
  }
  socket.emit("move", { x: newPos.x, y: newPos.y, z: newPos.z });
}
window.updateSelfPosition = updateSelfPosition;

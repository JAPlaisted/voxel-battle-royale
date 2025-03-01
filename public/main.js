// public/main.js

const socket = io();
let scene, camera, renderer;
let playerMesh;
const otherPlayers = {};
let selfPlayerData;

function init(selfPlayer) {
  selfPlayerData = selfPlayer;
  scene = new THREE.Scene();

  // Setup camera (its position is updated continuously in animate())
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  // Temporary initial position; will be updated in animate().
  camera.position.set(selfPlayer.position.x, selfPlayer.position.y + 5, selfPlayer.position.z + 10);

  // Setup renderer with a sky-blue background
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x87ceeb, 1); // Sky blue background
  document.body.appendChild(renderer.domElement);

  window.addEventListener("resize", onWindowResize, false);

  // Load ground texture
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

  // Add ambient and directional lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(50, 50, 50);
  scene.add(directionalLight);

  // Create the player using our fallback (red cube)
  createFallbackPlayer(selfPlayer);

  // Update HUD (assumes an element with id "hud" exists)
  document.getElementById("hud").innerText = `You are ${selfPlayer.state}. Health: ${selfPlayer.health}`;

  animate();
}

function createFallbackPlayer(selfPlayer) {
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  playerMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
  // Raise the cube slightly so it doesn't clip into the ground.
  playerMesh.position.set(
    selfPlayer.position.x,
    selfPlayer.position.y + 0.5,
    selfPlayer.position.z
  );
  scene.add(playerMesh);
  // Expose playerMesh globally for controls.js access.
  window.playerMesh = playerMesh;
}

function animate() {
  requestAnimationFrame(animate);
  
  if (playerMesh && playerMesh.position) {
    // Compute the player's forward vector.
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyEuler(playerMesh.rotation);
    // Position the camera ahead of the player so you see where you're headed.
    const cameraOffset = forward.clone().multiplyScalar(10);
    camera.position.copy(playerMesh.position)
      .add(new THREE.Vector3(0, 5, 0))
      .add(cameraOffset);
    // Have the camera look at the player.
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
  // The camera update occurs in animate().
  socket.emit("move", { x: newPos.x, y: newPos.y, z: newPos.z });
}
window.updateSelfPosition = updateSelfPosition;

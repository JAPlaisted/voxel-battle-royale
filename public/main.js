// Connect to the server using Socket.io
const socket = io();

// Wait for the 'spawn' event from the server
socket.on('spawn', (spawnPosition) => {
    console.log('Received spawn position:', spawnPosition);
    init(spawnPosition);
});

// Initialize the Three.js scene
function init(spawnPosition) {
    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add a simple ground plane
    const planeGeometry = new THREE.PlaneGeometry(200, 200);
    const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    // Set up ambient lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Create a basic cube to represent the player
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const player = new THREE.Mesh(cubeGeometry, cubeMaterial);
    player.position.set(spawnPosition.x, spawnPosition.y + 0.5, spawnPosition.z);
    scene.add(player);

    // Position the camera to see the player and surroundings
    camera.position.set(spawnPosition.x, spawnPosition.y + 10, spawnPosition.z + 15);
    camera.lookAt(player.position);

    // Render loop
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();

    // (Optional) Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

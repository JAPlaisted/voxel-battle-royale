// public/controls.js

document.addEventListener("DOMContentLoaded", () => {
    // --- Jump Input ---
    document.addEventListener("keydown", (event) => {
      if (event.code === "Space") {
        if (!window.isJumping) {
          // Capture horizontal momentum based on player's current forward direction.
          if (window.playerMesh) {
            const forward = new THREE.Vector3(0, 0, 1); // Default forward (+Z)
            forward.applyEuler(window.playerMesh.rotation);
            // Set jump horizontal velocity; adjust factor (0.1 here) for less forward jump.
            window.jumpHorizontalVelocity = forward.multiplyScalar(0.1);
          } else {
            window.jumpHorizontalVelocity = new THREE.Vector3(0, 0, 0);
          }
          window.isJumping = true;
          window.jumpVelocity = window.jumpStrength;
        }
      }
    });
  
    // --- Movement Joystick (Left Side, controlled by WASD) ---
    const movementJoystickContainer = document.createElement("div");
    movementJoystickContainer.id = "movementJoystickContainer";
    movementJoystickContainer.style.position = "absolute";
    movementJoystickContainer.style.bottom = "20px";
    movementJoystickContainer.style.left = "20px";
    movementJoystickContainer.style.width = "100px";
    movementJoystickContainer.style.height = "100px";
    movementJoystickContainer.style.background = "rgba(0, 0, 0, 0.3)";
    movementJoystickContainer.style.borderRadius = "50%";
    document.body.appendChild(movementJoystickContainer);
  
    const movementJoystick = document.createElement("div");
    movementJoystick.id = "movementJoystick";
    movementJoystick.style.position = "absolute";
    movementJoystick.style.top = "50%";
    movementJoystick.style.left = "50%";
    movementJoystick.style.width = "40px";
    movementJoystick.style.height = "40px";
    movementJoystick.style.background = "rgba(255, 255, 255, 0.7)";
    movementJoystick.style.borderRadius = "50%";
    movementJoystick.style.transform = "translate(-50%, -50%)";
    movementJoystickContainer.appendChild(movementJoystick);
  
    const joystickMaxDistance = movementJoystickContainer.clientWidth / 2;
    const moveSpeed = 0.2; // Movement step per update
  
    // Track WASD keys.
    const keyState = { w: 0, a: 0, s: 0, d: 0 };
  
    function updateMovementJoystickUI() {
      const uiVec = new THREE.Vector2(keyState.d - keyState.a, keyState.w - keyState.s);
      if (uiVec.length() > 0) uiVec.normalize();
      const offsetX = uiVec.x * joystickMaxDistance;
      const offsetY = uiVec.y * joystickMaxDistance;
      movementJoystick.style.left = `${50 + (offsetX / movementJoystickContainer.clientWidth) * 100}%`;
      movementJoystick.style.top = `${50 + (offsetY / movementJoystickContainer.clientHeight) * 100}%`;
    }
  
    function updateMovement() {
      if (!window.playerMesh) return;
      const R = window.playerMesh.rotation.y;
      // When R = 0, assume the player faces +Z.
      const forward = new THREE.Vector3(Math.sin(R), 0, Math.cos(R));
      const right = new THREE.Vector3(Math.cos(R), 0, -Math.sin(R));
      let move = new THREE.Vector3(0, 0, 0);
      move.add(forward.multiplyScalar(keyState.w - keyState.s));
      move.add(right.multiplyScalar(keyState.a - keyState.d));
      if (move.length() > 0) {
        move.normalize().multiplyScalar(moveSpeed);
        window.playerMesh.position.add(move);
        window.updateSelfPosition(window.playerMesh.position);
        window.isMoving = true;
      } else {
        window.isMoving = false;
      }
    }
  
    document.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d"].includes(key)) {
        keyState[key] = 1;
        updateMovementJoystickUI();
        updateMovement();
      }
    });
  
    document.addEventListener("keyup", (e) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d"].includes(key)) {
        keyState[key] = 0;
        updateMovementJoystickUI();
        updateMovement();
      }
    });
  
    // Expose updateMovement so main.js can call it continuously.
    window.updateMovement = updateMovement;
  
    // --- Rotation Joystick (Right Side, controlled by mouse) ---
    const rotationJoystickContainer = document.createElement("div");
    rotationJoystickContainer.id = "rotationJoystickContainer";
    rotationJoystickContainer.style.position = "absolute";
    rotationJoystickContainer.style.bottom = "20px";
    rotationJoystickContainer.style.right = "20px";
    rotationJoystickContainer.style.width = "100px";
    rotationJoystickContainer.style.height = "100px";
    rotationJoystickContainer.style.background = "rgba(0, 0, 0, 0.3)";
    rotationJoystickContainer.style.borderRadius = "50%";
    rotationJoystickContainer.style.touchAction = "none";
    document.body.appendChild(rotationJoystickContainer);
  
    const rotationJoystick = document.createElement("div");
    rotationJoystick.id = "rotationJoystick";
    rotationJoystick.style.position = "absolute";
    rotationJoystick.style.top = "50%";
    rotationJoystick.style.left = "50%";
    rotationJoystick.style.width = "40px";
    rotationJoystick.style.height = "40px";
    rotationJoystick.style.background = "rgba(255, 255, 255, 0.7)";
    rotationJoystick.style.borderRadius = "50%";
    rotationJoystick.style.transform = "translate(-50%, -50%)";
    rotationJoystickContainer.appendChild(rotationJoystick);
  
    let rotating = false;
    rotationJoystickContainer.addEventListener("mousedown", (e) => {
      rotating = true;
      e.preventDefault();
    });
    document.addEventListener("mousemove", (e) => {
      if (!rotating) return;
      const rect = rotationJoystickContainer.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      let offsetX = e.clientX - centerX;
      let offsetY = e.clientY - centerY;
      const maxDistance = rect.width / 2;
      const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
      if (distance > maxDistance) {
        const angle = Math.atan2(offsetY, offsetX);
        offsetX = Math.cos(angle) * maxDistance;
        offsetY = Math.sin(angle) * maxDistance;
      }
      rotationJoystick.style.left = `${50 + (offsetX / rect.width) * 100}%`;
      rotationJoystick.style.top = `${50 + (offsetY / rect.height) * 100}%`;
  
      // Compute the angle from center (in radians).
      const theta = Math.atan2(offsetY, offsetX);
      // Set player's rotation so that pushing upward (theta ≈ -π/2) yields rotation 0.
      if (window.playerMesh) {
        window.playerMesh.rotation.y = theta + Math.PI / 2;
      }
    });
    document.addEventListener("mouseup", () => {
      if (rotating) {
        rotating = false;
        rotationJoystick.style.left = "50%";
        rotationJoystick.style.top = "50%";
      }
    });
  });
  
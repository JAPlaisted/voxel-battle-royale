// gameState.js

// Generate a random spawn position for a player
function randomSpawn() {
    return {
      x: Math.random() * 100 - 50,
      y: 0,
      z: Math.random() * 100 - 50,
    };
  }
  
  // Create a new player object with default values
  function createInitialPlayer(id) {
    const spawn = randomSpawn();
    return {
      id,
      position: spawn,
      rotation: 0, // default rotation (could be extended)
      state: 'human', // "human" or "zombie"
      health: 100,
      inventory: [],
    };
  }
  
  // Update the player's state (position, rotation, etc.)
  // Extend this function as you add validations or physics logic.
  function updatePlayerState(id, data) {
    // For now, simply assume the data is valid.
    // (Later you can add collision checks, etc.)
  }
  
  // Remove a player from the game state (on disconnect)
  function removePlayer(id) {
    // Clean up any server-side data if needed.
  }
  
  module.exports = { createInitialPlayer, updatePlayerState, removePlayer, randomSpawn };
  
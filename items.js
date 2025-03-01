// items.js

// Define the available items in the game (weapons, utilities, premium items)
const items = [
    { id: 'pistol', type: 'weapon', name: 'Pistol', damage: 10 },
    { id: 'shotgun', type: 'weapon', name: 'Shotgun', damage: 20 },
    { id: 'rifle', type: 'weapon', name: 'Rifle', damage: 15 },
    { id: 'health_potion', type: 'utility', name: 'Health Potion', heal: 25 },
    { id: 'revive_kit', type: 'utility', name: 'Revive Kit', revive: true },
    // Premium items (purchased via Stripe)
    { id: 'premium_revive_kit', type: 'premium', name: 'Premium Revive Kit', revive: true },
    { id: 'flamethrower', type: 'premium', name: 'Flamethrower', damage: 25 }
  ];
  
  module.exports = items;
  
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create directories
const directories = [
  'public/assets/images',
  'public/assets/images/characters',
  'public/assets/images/tiles',
  'public/assets/images/weapons',
  'public/assets/images/gadgets',
  'public/assets/images/particles',
  'public/assets/images/ui',
  'public/assets/audio'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Function to create a simple image
function createImage(width, height, color, filePath) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filePath, buffer);
  console.log(`Created image: ${filePath}`);
}

// Create essential images
createImage(200, 100, '#222222', 'public/assets/images/logo.png');
createImage(300, 30, '#ffffff', 'public/assets/images/loading-bar.png');
createImage(32, 32, '#ff0000', 'public/assets/images/characters/player.png');
createImage(32, 32, '#0000ff', 'public/assets/images/characters/enemy.png');
createImage(32, 32, '#aaaaaa', 'public/assets/images/tiles/floor.png');
createImage(32, 32, '#555555', 'public/assets/images/tiles/wall.png');
createImage(32, 32, '#8B4513', 'public/assets/images/tiles/destructible-wall.png');
createImage(32, 32, '#000066', 'public/assets/images/tiles/reinforced-wall.png');
createImage(32, 32, '#D2B48C', 'public/assets/images/tiles/furniture.png');
createImage(32, 32, '#aaddff', 'public/assets/images/tiles/window.png');
createImage(32, 32, '#333333', 'public/assets/images/tiles/vent.png');
createImage(8, 8, '#ffff00', 'public/assets/images/weapons/bullet.png');
createImage(16, 16, '#ff6600', 'public/assets/images/gadgets/breach-charge.png');
createImage(16, 16, '#222222', 'public/assets/images/gadgets/camera.png');
createImage(8, 8, '#ffffff', 'public/assets/images/particles/impact.png');
createImage(8, 8, '#8B4513', 'public/assets/images/particles/debris.png');
createImage(8, 8, '#ff0000', 'public/assets/images/particles/blood.png');
createImage(200, 20, '#00ff00', 'public/assets/images/ui/health-bar.png');
createImage(32, 32, '#ffcc00', 'public/assets/images/ui/ammo-icon.png');
createImage(32, 32, '#ff6600', 'public/assets/images/ui/gadget-icon.png');

// Create empty audio files
['gunshot.mp3', 'reload.mp3', 'footstep.mp3', 'explosion.mp3'].forEach(file => {
  const filePath = `public/assets/audio/${file}`;
  fs.writeFileSync(filePath, '');
  console.log(`Created empty audio file: ${filePath}`);
});

console.log('All assets generated successfully!'); 
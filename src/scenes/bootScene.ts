import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    console.log('BootScene: preloading assets...');
    
    // Create fallback assets if loading fails
    this.load.on('loaderror', (fileObj) => {
      console.warn('Asset failed to load:', fileObj.key);
      
      try {
        // Create a simple canvas for the missing asset
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ff00ff'; // Magenta to make missing assets obvious
          ctx.fillRect(0, 0, 100, 100);
          ctx.fillStyle = '#000000';
          ctx.font = '10px Arial';
          ctx.fillText(fileObj.key, 5, 50);
          
          // Add the canvas as a texture
          this.textures.addCanvas(fileObj.key, canvas);
          console.log('Created fallback texture for:', fileObj.key);
        }
      } catch (error) {
        console.error('Failed to create fallback texture:', error);
      }
    });

    // Load minimal assets needed for loading screen
    this.load.image('logo', 'assets/images/logo.png');
    this.load.image('loading-bar', 'assets/images/loading-bar.png');
  }

  create() {
    console.log('BootScene: starting LoadingScene...');
    this.scene.start('LoadingScene');
  }
} 
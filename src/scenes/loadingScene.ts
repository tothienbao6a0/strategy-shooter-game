import Phaser from 'phaser';

export class LoadingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoadingScene' });
  }

  preload() {
    console.log('LoadingScene: preloading game assets...');
    
    try {
      // Create loading bar
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;
      
      const progressBar = this.add.graphics();
      const progressBox = this.add.graphics();
      progressBox.fillStyle(0x222222, 0.8);
      progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
      
      const loadingText = this.make.text({
        x: width / 2,
        y: height / 2 - 50,
        text: 'Loading...',
        style: {
          font: '20px monospace',
          color: '#ffffff'
        }
      });
      loadingText.setOrigin(0.5, 0.5);
      
      // Update progress bar as assets load
      this.load.on('progress', (value: number) => {
        progressBar.clear();
        progressBar.fillStyle(0xffffff, 1);
        progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      });
      
      this.load.on('complete', () => {
        progressBar.destroy();
        progressBox.destroy();
        loadingText.destroy();
        console.log('LoadingScene: all assets loaded');
      });
      
      // Load game assets
      this.loadAssets();
    } catch (error) {
      console.error('Error in LoadingScene preload:', error);
    }
  }

  create() {
    console.log('LoadingScene: all assets loaded');
    
    // Go directly to menu scene instead of debug
    this.scene.start('MenuScene');
    
    // Debug scene is still available but not shown by default
    // this.scene.start('DebugScene');
  }

  private loadAssets() {
    // Tiles
    this.load.image('floor', 'assets/images/tiles/floor.png');
    this.load.image('wall', 'assets/images/tiles/wall.png');
    this.load.image('destructible-wall', 'assets/images/tiles/destructible-wall.png');
    this.load.image('reinforced-wall', 'assets/images/tiles/reinforced-wall.png');
    this.load.image('furniture', 'assets/images/tiles/furniture.png');
    this.load.image('window', 'assets/images/tiles/window.png');
    this.load.image('vent', 'assets/images/tiles/vent.png');
    
    // Characters
    this.load.image('player', 'assets/images/characters/player.png');
    this.load.image('enemy', 'assets/images/characters/enemy.png');
    
    // Weapons
    this.load.image('bullet', 'assets/images/weapons/bullet.png');
    
    // Gadgets
    this.load.image('breach-charge', 'assets/images/gadgets/breach-charge.png');
    this.load.image('camera', 'assets/images/gadgets/camera.png');
    
    // Particles
    this.load.image('particle-impact', 'assets/images/particles/impact.png');
    this.load.image('particle-debris', 'assets/images/particles/debris.png');
    this.load.image('particle-blood', 'assets/images/particles/blood.png');
    
    // UI
    this.load.image('health-bar', 'assets/images/ui/health-bar.png');
    this.load.image('ammo-icon', 'assets/images/ui/ammo-icon.png');
    this.load.image('gadget-icon', 'assets/images/ui/gadget-icon.png');
    
    // Audio
    this.load.audio('gunshot', 'assets/audio/gunshot.mp3');
    this.load.audio('reload', 'assets/audio/reload.mp3');
    this.load.audio('footstep', 'assets/audio/footstep.mp3');
    this.load.audio('explosion', 'assets/audio/explosion.mp3');
    this.load.audio('impact', 'assets/audio/impact.mp3');
  }
} 
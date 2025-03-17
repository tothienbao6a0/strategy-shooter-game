import Phaser from 'phaser';

export class DebugScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DebugScene' });
  }
  
  create() {
    console.log('DebugScene: creating debug elements');
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Add background
    this.add.rectangle(width/2, height/2, width, height, 0x222222);
    
    // Add title
    this.add.text(width/2, 50, 'Debug Scene', {
      font: '32px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Add test sprites
    this.add.image(width/2 - 100, height/2, 'player').setScale(2);
    this.add.image(width/2, height/2, 'wall').setScale(2);
    this.add.image(width/2 + 100, height/2, 'floor').setScale(2);
    
    // Add labels
    this.add.text(width/2 - 100, height/2 + 50, 'Player', {
      font: '16px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    this.add.text(width/2, height/2 + 50, 'Wall', {
      font: '16px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    this.add.text(width/2 + 100, height/2 + 50, 'Floor', {
      font: '16px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Add button to continue to game
    const continueButton = this.add.text(width/2, height - 100, 'Continue to Game', {
      font: '24px Arial',
      color: '#ffffff',
      backgroundColor: '#007700',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();
    
    continueButton.on('pointerdown', () => {
      this.scene.start('GameScene', {
        team: 'attacker',
        operator: 'sledge'
      });
    });
    
    // Add this button to the create method
    const simpleTestButton = this.add.text(width/2, height - 150, 'Simple Test Environment', {
      font: '24px Arial',
      color: '#ffffff',
      backgroundColor: '#770077',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();
    
    simpleTestButton.on('pointerdown', () => {
      // Create a very simple test scene
      const testScene = new Phaser.Scene('TestScene');
      
      testScene.create = function() {
        // Create a simple background
        this.add.grid(0, 0, 800, 600, 32, 32, 0x000000, 0, 0x333333, 0.5)
          .setOrigin(0, 0);
        
        // Add a player sprite
        const player = this.matter.add.sprite(400, 300, 'player');
        player.setCircle(16);
        player.setFixedRotation();
        
        // Add some walls
        for (let i = 0; i < 10; i++) {
          const wall = this.matter.add.sprite(
            Phaser.Math.Between(100, 700),
            Phaser.Math.Between(100, 500),
            'wall'
          );
          wall.setStatic(true);
        }
        
        // Set up camera
        this.cameras.main.startFollow(player);
        
        // Set up controls
        const keys = this.input.keyboard.addKeys({
          up: 'W',
          down: 'S',
          left: 'A',
          right: 'D'
        });
        
        this.update = function() {
          // Handle movement
          const speed = 3;
          let vx = 0;
          let vy = 0;
          
          if (keys.up.isDown) vy -= speed;
          if (keys.down.isDown) vy += speed;
          if (keys.left.isDown) vx -= speed;
          if (keys.right.isDown) vx += speed;
          
          player.setVelocity(vx, vy);
        };
      };
      
      this.scene.add('TestScene', testScene, true);
    });
    
    console.log('DebugScene: setup complete');
  }
} 
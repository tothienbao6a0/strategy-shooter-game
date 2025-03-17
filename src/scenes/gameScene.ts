import Phaser from 'phaser';
import { Player } from '../entities/player';
import { MapGenerator } from '../systems/map/generator';
import { EnhancedParticleManager } from '../systems/rendering/enhancedParticles';
import { SoundManager } from '../systems/sound/soundManager';
import { ModernUIManager } from '../ui/modernHud';
import { Team, Operator, gameConfig } from '../core/constants';
import { BulletManager } from '../systems/weapons/bulletManager';

export class GameScene extends Phaser.Scene {
  // Game objects
  private player: Player;
  private map: MapGenerator;
  
  // Systems
  private particleManager: EnhancedParticleManager;
  private soundManager: SoundManager;
  private uiManager: ModernUIManager;
  private bulletManager: BulletManager;
  
  // Debug
  private debugText: Phaser.GameObjects.Text;
  private fpsText: Phaser.GameObjects.Text;
  
  constructor() {
    super({ key: 'GameScene' });
  }
  
  init(data: { team: Team, operator: Operator }) {
    console.log('GameScene init with data:', data);
    this.registry.set('team', data.team || Team.ATTACKER);
    this.registry.set('operator', data.operator || Operator.SLEDGE);
  }
  
  create() {
    console.log('GameScene create method started');
    
    try {
      // Create map first
      this.map = new MapGenerator(this, gameConfig.mapWidth, gameConfig.mapHeight);
      this.map.generateSimpleMap();
      
      console.log('Map created');
      
      // Get player spawn position
      const spawnPoint = this.map.getPlayerSpawnPoint();
      
      // Create player
      this.player = new Player(
        this,
        spawnPoint.x,
        spawnPoint.y,
        this.registry.get('team') as Team,
        this.registry.get('operator') as Operator
      );
      
      console.log('Player created');
      
      // Set up camera to follow player
      this.cameras.main.startFollow(this.player.sprite, true);
      this.cameras.main.setZoom(0.8);
      
      // Set up collision between player and walls
      this.physics.add.collider(this.player.sprite, this.map.wallsGroup);
      this.physics.add.collider(this.player.sprite, this.map.furnitureGroup);
      
      // Create systems
      this.particleManager = new EnhancedParticleManager(this);
      this.soundManager = new SoundManager(this);
      this.uiManager = new ModernUIManager(this, this.player);
      
      // Create bullet manager after map and player are set up
      this.bulletManager = new BulletManager(this);
      
      // Set up input handlers
      this.setupInputHandlers();
      
      // Create debug text
      this.createDebugText();
      
      // Show welcome message
      this.uiManager.showMessage(`Mission Started: ${this.registry.get('operator')}`, 3000);
      
      console.log('GameScene create method completed');
    } catch (error) {
      console.error('Error in GameScene create:', error);
    }
  }
  
  update(time: number, delta: number) {
    try {
      // Update player
      if (this.player) {
        this.player.update(time, delta);
      }
      
      // Update bullets
      if (this.bulletManager) {
        this.bulletManager.update(delta);
      }
      
      // Update UI
      if (this.uiManager) {
        this.uiManager.update();
      }
      
      // Update debug text
      this.updateDebugText();
      
    } catch (error) {
      console.error('Error in GameScene update:', error);
    }
  }
  
  private setupInputHandlers() {
    // Set up mouse input for shooting
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown() && this.player) {
        this.player.shoot();
      }
    });
    
    // Debug key to end game
    this.input.keyboard.on('keydown-END', () => {
      this.scene.start('GameOverScene', { victory: true });
    });
    
    // Escape key to return to menu
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });
    
    // Toggle debug info
    this.input.keyboard.on('keydown-F1', () => {
      this.debugText.setVisible(!this.debugText.visible);
      this.fpsText.setVisible(!this.fpsText.visible);
    });
  }
  
  private createDebugText() {
    // Create FPS counter
    this.fpsText = this.add.text(10, 10, 'FPS: 0', {
      font: '14px Arial',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.fpsText.setScrollFactor(0);
    this.fpsText.setDepth(1000);
    
    // Create debug info text
    this.debugText = this.add.text(10, 40, 'Debug Info', {
      font: '12px Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.debugText.setScrollFactor(0);
    this.debugText.setDepth(1000);
    
    // Add controls help text
    this.add.text(10, this.cameras.main.height - 60, 'Controls:\nWASD - Move\nMouse - Aim\nClick - Shoot\nR - Reload\nESC - Menu', {
      font: '12px Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    }).setScrollFactor(0).setDepth(1000);
  }
  
  private updateDebugText() {
    // Update FPS counter
    this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
    
    // Update debug info
    if (this.player && this.player.sprite && this.player.sprite.body) {
      this.debugText.setText(
        `Player: (${Math.floor(this.player.sprite.x)}, ${Math.floor(this.player.sprite.y)})\n` +
        `Velocity: (${Math.floor(this.player.sprite.body.velocity.x)}, ${Math.floor(this.player.sprite.body.velocity.y)})\n` +
        `Health: ${this.player.health}\n` +
        `Ammo: ${this.player.ammo.current}/${this.player.ammo.reserve}\n` +
        `Keys: ${this.player.keys.up.isDown ? 'W ' : ''}${this.player.keys.left.isDown ? 'A ' : ''}${this.player.keys.down.isDown ? 'S ' : ''}${this.player.keys.right.isDown ? 'D' : ''}`
      );
    }
  }
} 
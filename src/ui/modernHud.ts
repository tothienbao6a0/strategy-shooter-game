import Phaser from 'phaser';
import { Player } from '../entities/player';
import { OPERATORS_DATA } from '../core/constants';

export class ModernUIManager {
  private scene: Phaser.Scene;
  private player: Player;
  
  // UI elements
  private container: Phaser.GameObjects.Container;
  private healthBar: Phaser.GameObjects.Graphics;
  private ammoText: Phaser.GameObjects.Text;
  private operatorIcon: Phaser.GameObjects.Image;
  private weaponIcon: Phaser.GameObjects.Image;
  private gadgetIcon: Phaser.GameObjects.Image;
  private minimapContainer: Phaser.GameObjects.Container;
  private minimapVisible: boolean = false;
  
  // UI animations
  private tween: Phaser.Tweens.Tween;
  
  constructor(scene: Phaser.Scene, player: Player) {
    console.log('Initializing Modern UI Manager');
    
    this.scene = scene;
    this.player = player;
    
    // Create main container for all UI elements
    this.container = scene.add.container(0, 0);
    this.container.setDepth(100);
    
    // Create semi-transparent background panel
    const panel = scene.add.rectangle(
      10, 
      scene.cameras.main.height - 80, 
      300, 
      70, 
      0x000000, 
      0.7
    );
    panel.setOrigin(0, 0);
    panel.setStrokeStyle(1, 0x333333);
    
    // Create health bar
    this.healthBar = scene.add.graphics();
    this.healthBar.setPosition(20, scene.cameras.main.height - 70);
    
    // Create operator icon
    this.operatorIcon = scene.add.image(40, scene.cameras.main.height - 40, 'player');
    this.operatorIcon.setScale(1.5);
    
    // Create weapon icon
    this.weaponIcon = scene.add.image(100, scene.cameras.main.height - 40, 'ammo-icon');
    
    // Create ammo text
    this.ammoText = scene.add.text(
      130, 
      scene.cameras.main.height - 45,
      `${player.ammo.current}/${player.ammo.reserve}`,
      {
        font: '18px Arial',
        color: '#ffffff'
      }
    );
    
    // Create gadget icon
    this.gadgetIcon = scene.add.image(200, scene.cameras.main.height - 40, 'gadget-icon');
    
    // Add all elements to the container
    this.container.add([panel, this.healthBar, this.operatorIcon, this.weaponIcon, this.ammoText, this.gadgetIcon]);
    
    // Set up minimap
    this.setupMinimap();
    
    // Make UI elements fixed to camera
    this.container.setScrollFactor(0);
    
    console.log('Modern UI Manager initialized');
  }
  
  update() {
    if (!this.player || !this.player.sprite || !this.player.sprite.active) return;
    
    // Update health bar
    this.updateHealthBar();
    
    // Update ammo display
    this.updateAmmoDisplay();
    
    // Update minimap if visible
    if (this.minimapVisible) {
      this.updateMinimap();
    }
  }
  
  private updateHealthBar() {
    // Clear previous graphics
    this.healthBar.clear();
    
    // Calculate health percentage
    const healthPercent = Math.max(0, this.player.health) / 100;
    
    // Draw background
    this.healthBar.fillStyle(0x333333, 1);
    this.healthBar.fillRect(0, 0, 200, 20);
    
    // Draw health bar with color based on health
    let color = 0x00ff00; // Green
    if (healthPercent < 0.6) color = 0xffff00; // Yellow
    if (healthPercent < 0.3) color = 0xff0000; // Red
    
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(2, 2, 196 * healthPercent, 16);
  }
  
  private updateAmmoDisplay() {
    // Update ammo text
    this.ammoText.setText(`${this.player.ammo.current}/${this.player.ammo.reserve}`);
    
    // Change color if low on ammo
    if (this.player.ammo.current <= 5) {
      this.ammoText.setColor('#ff0000');
    } else {
      this.ammoText.setColor('#ffffff');
    }
    
    // Show reloading text if reloading
    if (this.player.reloading) {
      this.ammoText.setText('RELOADING...');
      this.ammoText.setColor('#ffff00');
    }
  }
  
  private setupMinimap() {
    // Create minimap container
    this.minimapContainer = this.scene.add.container(
      this.scene.cameras.main.width - 120,
      120
    );
    
    // Create minimap background
    const background = this.scene.add.rectangle(0, 0, 200, 200, 0x000000, 0.7);
    background.setOrigin(0.5);
    background.setStrokeStyle(2, 0xffffff);
    
    // Create minimap title
    const title = this.scene.add.text(0, -110, 'MINIMAP', {
      font: '14px Arial',
      color: '#ffffff'
    });
    title.setOrigin(0.5);
    
    // Add elements to container
    this.minimapContainer.add([background, title]);
    
    // Hide minimap by default
    this.minimapContainer.setVisible(false);
    
    // Add minimap to main UI container
    this.container.add(this.minimapContainer);
  }
  
  private updateMinimap() {
    // Clear previous content
    this.minimapContainer.getAll().forEach(child => {
      if (child.name === 'mapElement') {
        child.destroy();
      }
    });
    
    // Add player dot
    const playerDot = this.scene.add.circle(0, 0, 4, 0xff0000);
    playerDot.setName('mapElement');
    this.minimapContainer.add(playerDot);
    
    // TODO: Add other elements to minimap
  }
  
  toggleMinimap() {
    this.minimapVisible = !this.minimapVisible;
    this.minimapContainer.setVisible(this.minimapVisible);
    
    // Animate minimap appearance
    if (this.minimapVisible) {
      this.scene.tweens.add({
        targets: this.minimapContainer,
        scale: { from: 0.5, to: 1 },
        alpha: { from: 0, to: 1 },
        duration: 300,
        ease: 'Power2'
      });
    }
  }
  
  showMessage(message: string, duration: number = 3000) {
    // Create message text
    const text = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      100,
      message,
      {
        font: '24px Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center'
      }
    );
    text.setOrigin(0.5);
    text.setScrollFactor(0);
    text.setDepth(200);
    
    // Animate message
    this.scene.tweens.add({
      targets: text,
      y: 80,
      alpha: { from: 0, to: 1 },
      duration: 500,
      ease: 'Power2',
      yoyo: true,
      hold: duration - 1000,
      onComplete: () => {
        text.destroy();
      }
    });
  }
} 
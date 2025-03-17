import Phaser from 'phaser';
import { Player } from '../entities/player';

export class UIManager {
  private scene: Phaser.Scene;
  private player: Player;
  private healthBar: Phaser.GameObjects.Graphics;
  private ammoText: Phaser.GameObjects.Text;
  private minimapVisible: boolean = false;
  private minimap: Phaser.GameObjects.Graphics;
  
  constructor(scene: Phaser.Scene, player: Player) {
    console.log('Initializing UI Manager');
    
    this.scene = scene;
    this.player = player;
    
    // Create health bar
    this.healthBar = scene.add.graphics();
    this.healthBar.setScrollFactor(0);
    this.healthBar.setDepth(200);
    
    // Create ammo text
    this.ammoText = scene.add.text(
      scene.cameras.main.width - 100,
      scene.cameras.main.height - 50,
      `${player.ammo.current}/${player.ammo.reserve}`,
      {
        font: '24px Arial',
        color: '#ffffff'
      }
    );
    this.ammoText.setScrollFactor(0);
    this.ammoText.setDepth(200);
    
    // Create minimap
    this.minimap = scene.add.graphics();
    this.minimap.setScrollFactor(0);
    this.minimap.setDepth(200);
    this.minimap.setVisible(false);
    
    // Add debug text
    const debugText = scene.add.text(10, 10, 'UI Initialized', {
      font: '16px Arial',
      color: '#ffffff'
    });
    debugText.setScrollFactor(0);
    debugText.setDepth(200);
    
    console.log('UI Manager initialized');
  }
  
  update() {
    // Update health bar
    this.updateHealthBar();
    
    // Update ammo text
    this.updateAmmoText();
    
    // Update minimap if visible
    if (this.minimapVisible) {
      this.updateMinimap();
    }
  }
  
  private updateHealthBar() {
    this.healthBar.clear();
    
    // Draw background
    this.healthBar.fillStyle(0x000000, 0.5);
    this.healthBar.fillRect(20, 20, 200, 20);
    
    // Calculate health percentage
    const healthPercent = this.player.health / 100;
    
    // Choose color based on health
    let color = 0x00ff00; // Green
    if (healthPercent < 0.6) {
      color = 0xffff00; // Yellow
    }
    if (healthPercent < 0.3) {
      color = 0xff0000; // Red
    }
    
    // Draw health
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(20, 20, 200 * healthPercent, 20);
  }
  
  private updateAmmoText() {
    this.ammoText.setText(`${this.player.ammo.current}/${this.player.ammo.reserve}`);
    
    // Change color if low on ammo
    if (this.player.ammo.current < 5) {
      this.ammoText.setColor('#ff0000');
    } else {
      this.ammoText.setColor('#ffffff');
    }
    
    // Show reloading text
    if (this.player.reloading) {
      this.ammoText.setText('Reloading...');
      this.ammoText.setColor('#ffff00');
    }
  }
  
  private updateMinimap() {
    this.minimap.clear();
    
    // Draw background
    this.minimap.fillStyle(0x000000, 0.7);
    this.minimap.fillRect(
      this.scene.cameras.main.width - 220,
      20,
      200,
      200
    );
    
    // TODO: Draw map tiles and entities on minimap
    // This would require access to the map and entities
  }
  
  toggleMinimap() {
    this.minimapVisible = !this.minimapVisible;
    this.minimap.setVisible(this.minimapVisible);
  }
} 
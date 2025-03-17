import Phaser from 'phaser';

export class SoundManager {
  private scene: Phaser.Scene;
  private sounds: Map<string, Phaser.Sound.BaseSound>;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.sounds = new Map();
    
    // Initialize sounds
    this.initializeSounds();
    
    // Listen for sound events
    scene.events.on('createSound', this.playPositionalSound, this);
  }
  
  private initializeSounds() {
    // Add sounds to the map
    this.sounds.set('gunshot', this.scene.sound.add('gunshot', { volume: 0.5 }));
    this.sounds.set('reload', this.scene.sound.add('reload', { volume: 0.7 }));
    this.sounds.set('footstep', this.scene.sound.add('footstep', { volume: 0.3 }));
    this.sounds.set('explosion', this.scene.sound.add('explosion', { volume: 0.8 }));
    
    // Add UI sounds if they exist
    try {
      this.sounds.set('ui-select', this.scene.sound.add('ui-select', { volume: 0.5 }));
      this.sounds.set('ui-confirm', this.scene.sound.add('ui-confirm', { volume: 0.5 }));
    } catch (error) {
      console.warn('UI sounds not loaded:', error);
    }
  }
  
  playPositionalSound(data: { type: string, x: number, y: number, radius?: number }) {
    const sound = this.sounds.get(data.type);
    
    if (sound) {
      // Calculate volume based on distance from player
      let volume = 1;
      
      if (this.scene.player) {
        const distance = Phaser.Math.Distance.Between(
          data.x, data.y,
          this.scene.player.x, this.scene.player.y
        );
        
        const radius = data.radius || 300;
        volume = Math.max(0, 1 - (distance / radius));
      }
      
      // Play sound with calculated volume
      sound.play({ volume });
    }
  }
} 
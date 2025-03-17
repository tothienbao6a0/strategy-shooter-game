import Phaser from 'phaser';
import { ParticleType } from '../../core/constants';

interface BulletData {
  x: number;
  y: number;
  angle: number;
  shooterId: string;
  damage: number;
}

export class BulletManager {
  private scene: Phaser.Scene;
  private bullets: Phaser.Physics.Arcade.Group;
  private bulletSpeed: number = 600;
  private bulletLifespan: number = 1000; // milliseconds
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    // Create bullet group
    this.bullets = scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: 100,
      active: false,
      visible: false
    });
    
    // Listen for bullet creation events
    scene.events.on('createBullet', this.createBullet, this);
    
    // Set up collisions with walls
    if (scene.map && scene.map.wallsGroup) {
      scene.physics.add.collider(
        this.bullets, 
        scene.map.wallsGroup, 
        this.handleBulletWallCollision, 
        undefined, 
        this
      );
    }
    
    // Set up collisions with furniture
    if (scene.map && scene.map.furnitureGroup) {
      scene.physics.add.collider(
        this.bullets, 
        scene.map.furnitureGroup, 
        this.handleBulletFurnitureCollision, 
        undefined, 
        this
      );
    }
  }
  
  createBullet(data: BulletData) {
    // Get a bullet from the pool
    const bullet = this.bullets.get(data.x, data.y, 'bullet') as Phaser.Physics.Arcade.Sprite;
    
    if (!bullet) return;
    
    // Set up bullet
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.setDepth(5);
    bullet.setData('shooterId', data.shooterId);
    bullet.setData('damage', data.damage);
    bullet.setData('createdAt', this.scene.time.now);
    
    // Set velocity based on angle
    const vx = Math.cos(data.angle) * this.bulletSpeed;
    const vy = Math.sin(data.angle) * this.bulletSpeed;
    bullet.setVelocity(vx, vy);
    bullet.setRotation(data.angle);
    
    // Create bullet trail effect
    this.scene.events.emit('createParticle', {
      type: ParticleType.IMPACT,
      x: data.x,
      y: data.y,
      angle: data.angle
    });
  }
  
  update(delta: number) {
    // Check for expired bullets
    const now = this.scene.time.now;
    
    this.bullets.getChildren().forEach((bullet: Phaser.Physics.Arcade.Sprite) => {
      const createdAt = bullet.getData('createdAt');
      
      if (now - createdAt > this.bulletLifespan) {
        bullet.setActive(false);
        bullet.setVisible(false);
        this.bullets.remove(bullet, true, true);
      }
    });
  }
  
  handleBulletWallCollision(bullet: Phaser.Physics.Arcade.Sprite, wall: Phaser.Physics.Arcade.Sprite) {
    // Create impact particle
    this.scene.events.emit('createParticle', {
      type: ParticleType.IMPACT,
      x: bullet.x,
      y: bullet.y,
      angle: bullet.rotation
    });
    
    // Play impact sound
    this.scene.sound.play('impact', { volume: 0.3 });
    
    // Deactivate bullet
    bullet.setActive(false);
    bullet.setVisible(false);
    this.bullets.remove(bullet, true, true);
  }
  
  handleBulletFurnitureCollision(bullet: Phaser.Physics.Arcade.Sprite, furniture: Phaser.Physics.Arcade.Sprite) {
    // Create debris particle
    this.scene.events.emit('createParticle', {
      type: ParticleType.DEBRIS,
      x: bullet.x,
      y: bullet.y,
      angle: bullet.rotation
    });
    
    // Play impact sound
    this.scene.sound.play('impact', { volume: 0.3 });
    
    // Deactivate bullet
    bullet.setActive(false);
    bullet.setVisible(false);
    this.bullets.remove(bullet, true, true);
  }
} 
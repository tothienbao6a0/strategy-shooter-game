import Phaser from 'phaser';
import { v4 as uuidv4 } from 'uuid';
import { gameConfig } from '../core/config';

export class Bullet {
  public id: string;
  public sprite: Phaser.Physics.Matter.Sprite;
  public initialX: number;
  public initialY: number;
  public angle: number;
  public velX: number;
  public velY: number;
  public playerId: string;
  public age: number = 0;
  public damage: number;
  public distance: number = 0;
  public maxDistance: number = 1000;
  public penetration: number = 1;
  
  private scene: Phaser.Scene;
  
  constructor(scene: Phaser.Scene, x: number, y: number, angle: number, playerId: string, damage: number) {
    this.scene = scene;
    this.id = uuidv4();
    this.initialX = x;
    this.initialY = y;
    this.angle = angle;
    this.playerId = playerId;
    this.damage = damage;
    
    // Calculate velocity
    const speed = gameConfig.physics.bulletSpeed;
    this.velX = Math.cos(angle) * speed;
    this.velY = Math.sin(angle) * speed;
    
    // Create sprite
    this.sprite = scene.matter.add.sprite(x, y, 'bullet', 0);
    this.sprite.setCircle(2);
    this.sprite.setFixedRotation();
    this.sprite.setFriction(0);
    this.sprite.setDepth(5);
    this.sprite.setVelocity(this.velX, this.velY);
    this.sprite.rotation = angle;
    
    // Set up collision
    this.sprite.setCollisionCategory(2); // Bullet category
    this.sprite.setCollidesWith([1, 2]); // Collide with world and other bullets
    
    // Set up collision handler
    this.sprite.setOnCollide((data: Phaser.Types.Physics.Matter.MatterCollisionData) => {
      this.handleCollision(data);
    });
    
    // Add to update list
    scene.events.on('update', this.update, this);
    
    // Create bullet trail particle
    scene.events.emit('createParticle', {
      type: 'bullet_trail',
      x: x,
      y: y,
      angle: angle
    });
  }
  
  update(time: number, delta: number) {
    // Update age
    this.age += delta;
    
    // Apply gravity and air resistance
    this.velY += gameConfig.physics.bulletGravity * delta;
    this.velX *= (1 - gameConfig.physics.bulletAirResistance);
    this.velY *= (1 - gameConfig.physics.bulletAirResistance);
    
    // Update velocity
    this.sprite.setVelocity(this.velX, this.velY);
    
    // Update distance
    const dx = this.sprite.x - this.initialX;
    const dy = this.sprite.y - this.initialY;
    this.distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if bullet should be destroyed
    if (this.distance > this.maxDistance) {
      this.destroy();
    }
  }
  
  handleCollision(data: Phaser.Types.Physics.Matter.MatterCollisionData) {
    // Check what we hit
    const otherBody = data.bodyA === this.sprite.body ? data.bodyB : data.bodyA;
    
    // Create impact particle
    this.scene.events.emit('createParticle', {
      type: 'impact',
      x: this.sprite.x,
      y: this.sprite.y,
      angle: this.angle
    });
    
    // Handle different collision types
    if (otherBody.gameObject && otherBody.gameObject.name === 'player') {
      // Hit a player
      const player = otherBody.gameObject.getData('player');
      if (player && player.id !== this.playerId) {
        player.takeDamage(this.damage);
      }
    } else if (otherBody.gameObject && otherBody.gameObject.name === 'wall') {
      // Hit a wall
      const wall = otherBody.gameObject.getData('wall');
      if (wall) {
        wall.takeDamage(this.damage);
      }
    }
    
    // Reduce penetration
    this.penetration--;
    
    // Destroy if no more penetration
    if (this.penetration <= 0) {
      this.destroy();
    }
  }
  
  destroy() {
    // Remove from update list
    this.scene.events.removeListener('update', this.update, this);
    
    // Destroy sprite
    this.sprite.destroy();
  }
  
  get x() {
    return this.sprite.x;
  }
  
  get y() {
    return this.sprite.y;
  }
} 
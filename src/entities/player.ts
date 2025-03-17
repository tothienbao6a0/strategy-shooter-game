import Phaser from 'phaser';
import { v4 as uuidv4 } from 'uuid';
import { Team, Operator, OPERATORS_DATA, ParticleType } from '../core/constants';
import { Bullet } from './bullet';
import { gameConfig } from '../core/config';

export class Player {
  public id: string;
  public sprite: Phaser.Physics.Arcade.Sprite;
  public health: number;
  public team: Team;
  public operator: Operator;
  public spotted: boolean = false;
  public lastPing: number | null = null;
  public ammo: {
    current: number;
    reserve: number;
    capacity: number;
    rateOfFire: number;
  };
  public reloading: boolean = false;
  public lastShot: number = 0;
  public speed: number;
  public footstepTimer: number = 0;
  public reloadTime: number = 2000;
  
  private scene: Phaser.Scene;
  public keys: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    reload: Phaser.Input.Keyboard.Key;
  };
  
  private moveSpeed: number = 200;
  private isMoving: boolean = false;
  
  constructor(scene: Phaser.Scene, x: number, y: number, team: Team, operator: Operator) {
    console.log(`Creating player at (${x}, ${y}) with operator ${operator}`);
    
    this.scene = scene;
    this.id = uuidv4();
    this.team = team;
    this.operator = operator;
    
    // Get operator data
    const operatorData = OPERATORS_DATA[operator];
    
    // Set up player properties
    this.health = operatorData.health;
    this.speed = operatorData.speed;
    this.moveSpeed = 150 + (this.speed * 25); // Base speed + speed modifier
    
    this.ammo = {
      current: operatorData.weapon.capacity,
      reserve: operatorData.weapon.reserve,
      capacity: operatorData.weapon.capacity,
      rateOfFire: operatorData.weapon.rateOfFire
    };
    
    // Create player sprite
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(10);
    
    // Set up physics body
    this.sprite.body.setSize(24, 24); // Smaller hitbox than sprite
    this.sprite.body.offset.set(4, 4);
    
    // Set color based on team
    this.sprite.setTint(team === Team.ATTACKER ? 0xff0000 : 0x0000ff);
    
    // Set up input
    this.keys = {
      up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      reload: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
    };
    
    console.log('Player created successfully');
  }
  
  update(time: number, delta: number) {
    if (!this.sprite || !this.sprite.active || !this.sprite.body) return;
    
    // Handle movement
    this.handleMovement();
    
    // Handle rotation to follow mouse
    this.handleRotation();
    
    // Handle reload key press
    if (Phaser.Input.Keyboard.JustDown(this.keys.reload)) {
      this.reload();
    }
    
    // Handle reload cooldown
    if (this.reloading && time > this.lastShot + this.reloadTime) {
      this.completeReload();
    }
    
    // Handle footstep sounds
    if (this.isMoving) {
      this.footstepTimer -= delta;
      if (this.footstepTimer <= 0) {
        this.createFootstep();
        this.footstepTimer = 300; // Reset timer
      }
    }
  }
  
  private handleMovement() {
    // Reset movement flag
    this.isMoving = false;
    
    // Get movement direction
    let velX = 0;
    let velY = 0;
    
    if (this.keys.up.isDown) {
      velY = -this.moveSpeed;
      this.isMoving = true;
    } else if (this.keys.down.isDown) {
      velY = this.moveSpeed;
      this.isMoving = true;
    }
    
    if (this.keys.left.isDown) {
      velX = -this.moveSpeed;
      this.isMoving = true;
    } else if (this.keys.right.isDown) {
      velX = this.moveSpeed;
      this.isMoving = true;
    }
    
    // Normalize diagonal movement
    if (velX !== 0 && velY !== 0) {
      const factor = 1 / Math.sqrt(2);
      velX *= factor;
      velY *= factor;
    }
    
    // Set velocity
    this.sprite.setVelocity(velX, velY);
  }
  
  private handleRotation() {
    if (!this.sprite.active) return;
    
    // Get pointer position
    const pointer = this.scene.input.activePointer;
    
    // Calculate angle between player and pointer
    const angle = Phaser.Math.Angle.Between(
      this.sprite.x, 
      this.sprite.y,
      pointer.worldX, 
      pointer.worldY
    );
    
    // Set player rotation
    this.sprite.setRotation(angle);
  }
  
  shoot() {
    const time = this.scene.time.now;
    
    // Check if can shoot
    if (this.reloading || time - this.lastShot < (60000 / this.ammo.rateOfFire) || this.ammo.current <= 0) {
      return;
    }
    
    // Create bullet
    const angle = this.sprite.rotation;
    const offsetX = Math.cos(angle) * 20;
    const offsetY = Math.sin(angle) * 20;
    
    // Create bullet (implementation depends on your bullet system)
    this.scene.events.emit('createBullet', {
      x: this.sprite.x + offsetX,
      y: this.sprite.y + offsetY,
      angle: angle,
      shooterId: this.id,
      damage: OPERATORS_DATA[this.operator].weapon.damage
    });
    
    // Update ammo
    this.ammo.current--;
    this.lastShot = time;
    
    // Play sound
    this.scene.sound.play('gunshot', { volume: 0.5 });
    
    // Create muzzle flash particle
    this.scene.events.emit('createParticle', {
      type: ParticleType.MUZZLE_FLASH,
      x: this.sprite.x + offsetX,
      y: this.sprite.y + offsetY,
      angle: angle
    });
  }
  
  reload() {
    if (this.reloading || this.ammo.current === this.ammo.capacity || this.ammo.reserve <= 0) {
      return;
    }
    
    this.reloading = true;
    this.lastShot = this.scene.time.now;
    
    // Play reload sound
    this.scene.sound.play('reload', { volume: 0.5 });
  }
  
  completeReload() {
    const ammoNeeded = this.ammo.capacity - this.ammo.current;
    const ammoToAdd = Math.min(ammoNeeded, this.ammo.reserve);
    
    this.ammo.current += ammoToAdd;
    this.ammo.reserve -= ammoToAdd;
    this.reloading = false;
    
    // Play reload complete sound
    this.scene.sound.play('reload', { volume: 0.7 });
  }
  
  takeDamage(amount: number) {
    this.health -= amount;
    
    // Create blood particle
    this.scene.events.emit('createParticle', {
      type: ParticleType.BLOOD,
      x: this.sprite.x,
      y: this.sprite.y
    });
    
    if (this.health <= 0) {
      this.die();
    }
  }
  
  die() {
    this.sprite.destroy();
    this.scene.events.emit('playerDied');
  }
  
  private createFootstep() {
    // Play footstep sound
    this.scene.sound.play('footstep', { volume: 0.2 });
    
    // Create footstep particle
    this.scene.events.emit('createParticle', {
      type: ParticleType.FOOTSTEP,
      x: this.sprite.x,
      y: this.sprite.y
    });
  }
  
  get x() {
    return this.sprite.x;
  }
  
  get y() {
    return this.sprite.y;
  }
  
  get angle() {
    return this.sprite.rotation;
  }
  
  get reloadStartTime() {
    return this.lastShot;
  }
} 
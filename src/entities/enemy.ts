import Phaser from 'phaser';
import { v4 as uuidv4 } from 'uuid';
import { Team, Operator, AIState, OPERATORS_DATA } from '../core/constants';
import { Bullet } from './bullet';
import { Position } from '../types/entities';
import { gameConfig } from '../core/config';

export class Enemy {
  public id: string;
  public sprite: Phaser.Physics.Matter.Sprite;
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
  public state: AIState = AIState.PATROL;
  public alertness: number = 0;
  public lastStateChange: number = 0;
  public patrolPoints: Position[] = [];
  public currentPatrolIndex: number = 0;
  public heardSound: Position | null = null;
  public targetPosition: Position | null = null;
  
  private scene: Phaser.Scene;
  
  constructor(scene: Phaser.Scene, x: number, y: number, team: Team = Team.DEFENDER, operator: Operator = Operator.ROOK) {
    this.scene = scene;
    this.id = uuidv4();
    this.team = team;
    this.operator = operator;
    
    // Create sprite
    this.sprite = scene.matter.add.sprite(x, y, 'enemy', 0);
    this.sprite.setCircle(15);
    this.sprite.setFixedRotation();
    this.sprite.setFriction(0);
    this.sprite.setDepth(10);
    
    // Set color based on team
    this.sprite.setTint(team === Team.ATTACKER ? 0xff0000 : 0x0000ff);
    
    // Set up operator data
    const operatorData = OPERATORS_DATA[operator];
    this.health = operatorData.health;
    this.ammo = {
      current: operatorData.weapon.capacity,
      reserve: operatorData.weapon.reserve,
      capacity: operatorData.weapon.capacity,
      rateOfFire: operatorData.weapon.rateOfFire
    };
    
    // Store reference to this enemy on the sprite
    this.sprite.setData('enemy', this);
    
    // Set up collision
    this.sprite.setCollisionCategory(1); // World category
    this.sprite.setCollidesWith([1, 2]); // Collide with world and bullets
    
    // Initialize state
    this.lastStateChange = scene.time.now;
  }
  
  update(time: number, delta: number) {
    // Handle reloading
    if (this.reloading && time - this.lastShot > 2000) {
      this.finishReload();
    }
  }
  
  shoot() {
    if (this.reloading || this.ammo.current <= 0) {
      if (this.ammo.current <= 0 && !this.reloading) {
        this.reload();
      }
      return;
    }
    
    // Create bullet
    const angle = this.angle;
    const offsetX = Math.cos(angle) * 20;
    const offsetY = Math.sin(angle) * 20;
    
    new Bullet(
      this.scene,
      this.sprite.x + offsetX,
      this.sprite.y + offsetY,
      angle,
      this.id,
      20 // Damage
    );
    
    // Decrease ammo
    this.ammo.current--;
    
    // Update last shot time
    this.lastShot = this.scene.time.now;
    
    // Create muzzle flash particle
    this.scene.events.emit('createParticle', {
      type: 'muzzle_flash',
      x: this.sprite.x + offsetX,
      y: this.sprite.y + offsetY,
      angle: angle
    });
    
    // Create sound event
    this.scene.events.emit('createSound', {
      type: 'gunshot',
      x: this.sprite.x,
      y: this.sprite.y,
      radius: gameConfig.sound.gunshotRadius
    });
  }
  
  reload() {
    if (this.reloading || this.ammo.current === this.ammo.capacity || this.ammo.reserve <= 0) {
      return;
    }
    
    this.reloading = true;
    this.lastShot = this.scene.time.now;
  }
  
  finishReload() {
    const ammoNeeded = this.ammo.capacity - this.ammo.current;
    const ammoToAdd = Math.min(ammoNeeded, this.ammo.reserve);
    
    this.ammo.current += ammoToAdd;
    this.ammo.reserve -= ammoToAdd;
    this.reloading = false;
  }
  
  takeDamage(amount: number) {
    this.health -= amount;
    
    // Increase alertness
    this.alertness = 1.0;
    
    // Create blood particle
    this.scene.events.emit('createParticle', {
      type: 'blood',
      x: this.sprite.x,
      y: this.sprite.y,
      angle: Phaser.Math.FloatBetween(0, Math.PI * 2)
    });
    
    if (this.health <= 0) {
      this.die();
    }
  }
  
  die() {
    this.sprite.destroy();
    
    // Check if all enemies are dead
    const allEnemiesDead = true; // TODO: Check if all enemies are dead
    
    if (allEnemiesDead) {
      this.scene.scene.start('GameOverScene', { victory: true });
    }
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
  
  set angle(value: number) {
    this.sprite.rotation = value;
  }
} 
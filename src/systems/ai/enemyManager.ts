import Phaser from 'phaser';
import { Enemy } from '../../entities/enemy';
import { MapGenerator } from '../map/generator';
import { Player } from '../../entities/player';
import { AIState, Team, Operator } from '../../core/constants';
import { Position } from '../../types/entities';
import { gameConfig } from '../../core/config';

export class EnemyManager {
  private scene: Phaser.Scene;
  private map: MapGenerator;
  private player: Player;
  private enemies: Enemy[] = [];
  
  constructor(scene: Phaser.Scene, map: MapGenerator, player: Player) {
    this.scene = scene;
    this.map = map;
    this.player = player;
    
    // Listen for sound events
    scene.events.on('soundEvent', this.handleSoundEvent, this);
  }
  
  spawnEnemies() {
    // Get spawn points from map
    const spawnPoints = this.map.getEnemySpawnPoints(5);
    
    // Create enemies at spawn points
    spawnPoints.forEach((point, index) => {
      const enemy = new Enemy(
        this.scene,
        point.x,
        point.y,
        this.player.team === Team.ATTACKER ? Team.DEFENDER : Team.ATTACKER,
        Operator.ROOK // Default operator for enemies
      );
      
      // Set up patrol points
      enemy.patrolPoints = this.generatePatrolPoints(point, 3);
      enemy.currentPatrolIndex = 0;
      
      // Add to enemies list
      this.enemies.push(enemy);
    });
  }
  
  update(time: number, delta: number) {
    // Update each enemy
    this.enemies.forEach(enemy => {
      // Skip if enemy is dead
      if (enemy.health <= 0) return;
      
      // Check if player is visible to enemy
      const canSeePlayer = this.canSeePlayer(enemy);
      
      // Update enemy state based on conditions
      this.updateEnemyState(enemy, time, canSeePlayer);
      
      // Update enemy behavior based on state
      this.updateEnemyBehavior(enemy, time, delta);
    });
  }
  
  private canSeePlayer(enemy: Enemy): boolean {
    // Check if player is in line of sight
    return this.map.isTileVisible(
      this.player.x,
      this.player.y,
      enemy.x,
      enemy.y
    );
  }
  
  private updateEnemyState(enemy: Enemy, time: number, canSeePlayer: boolean) {
    // If enemy can see player, go to attack state
    if (canSeePlayer) {
      if (enemy.state !== AIState.ATTACK) {
        enemy.state = AIState.ATTACK;
        enemy.alertness = 1.0;
        enemy.lastStateChange = time;
      }
      return;
    }
    
    // Decrease alertness over time
    if (enemy.alertness > 0) {
      enemy.alertness -= gameConfig.ai.alertnessDecay * (time - enemy.lastStateChange) / 1000;
      enemy.alertness = Math.max(0, enemy.alertness);
    }
    
    // State transitions based on alertness
    if (enemy.alertness >= 0.8) {
      if (enemy.state !== AIState.SEARCH) {
        enemy.state = AIState.SEARCH;
        enemy.lastStateChange = time;
      }
    } else if (enemy.alertness >= 0.5) {
      if (enemy.state !== AIState.INVESTIGATE && enemy.heardSound) {
        enemy.state = AIState.INVESTIGATE;
        enemy.lastStateChange = time;
      }
    } else if (enemy.alertness >= 0.2) {
      if (enemy.state !== AIState.ALERT) {
        enemy.state = AIState.ALERT;
        enemy.lastStateChange = time;
      }
    } else {
      if (enemy.state !== AIState.PATROL) {
        enemy.state = AIState.PATROL;
        enemy.lastStateChange = time;
      }
    }
  }
  
  private updateEnemyBehavior(enemy: Enemy, time: number, delta: number) {
    switch (enemy.state) {
      case AIState.PATROL:
        this.updatePatrolBehavior(enemy, time, delta);
        break;
        
      case AIState.ALERT:
        this.updateAlertBehavior(enemy, time, delta);
        break;
        
      case AIState.INVESTIGATE:
        this.updateInvestigateBehavior(enemy, time, delta);
        break;
        
      case AIState.SEARCH:
        this.updateSearchBehavior(enemy, time, delta);
        break;
        
      case AIState.ATTACK:
        this.updateAttackBehavior(enemy, time, delta);
        break;
    }
  }
  
  private updatePatrolBehavior(enemy: Enemy, time: number, delta: number) {
    // Move between patrol points
    if (enemy.patrolPoints.length === 0) return;
    
    const target = enemy.patrolPoints[enemy.currentPatrolIndex];
    
    // Move towards target
    this.moveTowards(enemy, target, 0.7 * gameConfig.physics.playerSpeed);
    
    // Check if reached target
    const dx = enemy.x - target.x;
    const dy = enemy.y - target.y;
    const distSq = dx * dx + dy * dy;
    
    if (distSq < 100) { // Within 10 pixels
      // Move to next patrol point
      enemy.currentPatrolIndex = (enemy.currentPatrolIndex + 1) % enemy.patrolPoints.length;
    }
  }
  
  private updateAlertBehavior(enemy: Enemy, time: number, delta: number) {
    // Look around, move randomly
    if (Math.random() < 0.01) {
      // Pick a random nearby position
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 100 + 50;
      const targetX = enemy.x + Math.cos(angle) * distance;
      const targetY = enemy.y + Math.sin(angle) * distance;
      
      enemy.targetPosition = { x: targetX, y: targetY };
    }
    
    if (enemy.targetPosition) {
      // Move towards target
      this.moveTowards(enemy, enemy.targetPosition, 0.8 * gameConfig.physics.playerSpeed);
      
      // Check if reached target
      const dx = enemy.x - enemy.targetPosition.x;
      const dy = enemy.y - enemy.targetPosition.y;
      const distSq = dx * dx + dy * dy;
      
      if (distSq < 100) { // Within 10 pixels
        enemy.targetPosition = null;
      }
    }
  }
  
  private updateInvestigateBehavior(enemy: Enemy, time: number, delta: number) {
    // Move towards heard sound
    if (enemy.heardSound) {
      // Move towards sound
      this.moveTowards(enemy, enemy.heardSound, 0.9 * gameConfig.physics.playerSpeed);
      
      // Check if reached sound location
      const dx = enemy.x - enemy.heardSound.x;
      const dy = enemy.y - enemy.heardSound.y;
      const distSq = dx * dx + dy * dy;
      
      if (distSq < 100) { // Within 10 pixels
        enemy.heardSound = null;
      }
    } else {
      // If no sound to investigate, go back to alert state
      enemy.state = AIState.ALERT;
    }
  }
  
  private updateSearchBehavior(enemy: Enemy, time: number, delta: number) {
    // Search around last known player position
    if (!enemy.targetPosition) {
      // Pick a random position around player's last known position
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 150 + 50;
      const targetX = this.player.x + Math.cos(angle) * distance;
      const targetY = this.player.y + Math.sin(angle) * distance;
      
      enemy.targetPosition = { x: targetX, y: targetY };
    }
    
    if (enemy.targetPosition) {
      // Move towards target
      this.moveTowards(enemy, enemy.targetPosition, 0.9 * gameConfig.physics.playerSpeed);
      
      // Check if reached target
      const dx = enemy.x - enemy.targetPosition.x;
      const dy = enemy.y - enemy.targetPosition.y;
      const distSq = dx * dx + dy * dy;
      
      if (distSq < 100) { // Within 10 pixels
        enemy.targetPosition = null;
      }
    }
  }
  
  private updateAttackBehavior(enemy: Enemy, time: number, delta: number) {
    // Aim at player
    const dx = this.player.x - enemy.x;
    const dy = this.player.y - enemy.y;
    enemy.angle = Math.atan2(dy, dx);
    
    // Move to optimal distance
    const distSq = dx * dx + dy * dy;
    const optimalDistSq = 200 * 200; // 200 pixels
    
    if (distSq > optimalDistSq * 1.2) {
      // Too far, move closer
      this.moveTowards(enemy, this.player, gameConfig.physics.playerSpeed);
    } else if (distSq < optimalDistSq * 0.8) {
      // Too close, move away
      this.moveAway(enemy, this.player, gameConfig.physics.playerSpeed);
    }
    
    // Shoot at player
    if (time - enemy.lastShot > 1000 / (enemy.ammo.rateOfFire / 60)) {
      enemy.shoot();
    }
  }
  
  private moveTowards(enemy: Enemy, target: Position, speed: number) {
    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 0) {
      const velX = (dx / dist) * speed;
      const velY = (dy / dist) * speed;
      
      enemy.sprite.setVelocity(velX, velY);
      enemy.angle = Math.atan2(dy, dx);
    } else {
      enemy.sprite.setVelocity(0, 0);
    }
  }
  
  private moveAway(enemy: Enemy, target: Position, speed: number) {
    const dx = enemy.x - target.x;
    const dy = enemy.y - target.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 0) {
      const velX = (dx / dist) * speed;
      const velY = (dy / dist) * speed;
      
      enemy.sprite.setVelocity(velX, velY);
      // Keep facing the player
      enemy.angle = Math.atan2(-dy, -dx);
    } else {
      enemy.sprite.setVelocity(0, 0);
    }
  }
  
  private generatePatrolPoints(startPoint: Position, numPoints: number): Position[] {
    const points: Position[] = [startPoint];
    
    for (let i = 0; i < numPoints; i++) {
      const lastPoint = points[points.length - 1];
      
      // Generate a point in a random direction
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 100 + 100;
      const x = lastPoint.x + Math.cos(angle) * distance;
      const y = lastPoint.y + Math.sin(angle) * distance;
      
      points.push({ x, y });
    }
    
    return points;
  }
  
  handleSoundEvent(data: { type: string, x: number, y: number, radius: number }) {
    // Notify enemies about sound
    this.enemies.forEach(enemy => {
      // Calculate distance to sound
      const dx = enemy.x - data.x;
      const dy = enemy.y - data.y;
      const distSq = dx * dx + dy * dy;
      
      // Check if enemy can hear the sound
      if (distSq <= data.radius * data.radius) {
        // Increase alertness based on distance
        const alertIncrease = 1 - Math.sqrt(distSq) / data.radius;
        enemy.alertness = Math.min(1, enemy.alertness + alertIncrease);
        
        // Set heard sound position
        enemy.heardSound = { x: data.x, y: data.y };
      }
    });
  }
} 
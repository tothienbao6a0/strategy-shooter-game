import Phaser from 'phaser';
import { ParticleType } from '../../core/constants';

export class ParticleManager {
  private scene: Phaser.Scene;
  private emitters: Map<ParticleType, Phaser.GameObjects.Particles.ParticleEmitter> = new Map();
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    // Initialize particle emitters
    this.initEmitters();
    
    // Listen for particle creation events
    scene.events.on('createParticle', this.createParticle, this);
  }
  
  private initEmitters() {
    // Impact particles
    const impactParticles = this.scene.add.particles('particle-impact');
    const impactEmitter = impactParticles.createEmitter({
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 300,
      gravityY: 0,
      quantity: 5,
      on: false
    });
    this.emitters.set(ParticleType.IMPACT, impactEmitter);
    
    // Debris particles
    const debrisParticles = this.scene.add.particles('particle-debris');
    const debrisEmitter = debrisParticles.createEmitter({
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0.5 },
      lifespan: 1000,
      gravityY: 300,
      bounce: 0.5,
      quantity: 10,
      on: false
    });
    this.emitters.set(ParticleType.DEBRIS, debrisEmitter);
    
    // Blood particles
    const bloodParticles = this.scene.add.particles('particle-blood');
    const bloodEmitter = bloodParticles.createEmitter({
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 500,
      gravityY: 200,
      quantity: 8,
      on: false
    });
    this.emitters.set(ParticleType.BLOOD, bloodEmitter);
    
    // Bullet trail particles
    const bulletTrailParticles = this.scene.add.particles('particle-impact');
    const bulletTrailEmitter = bulletTrailParticles.createEmitter({
      speed: 0,
      scale: { start: 0.5, end: 0 },
      lifespan: 100,
      gravityY: 0,
      quantity: 1,
      frequency: 10,
      on: false
    });
    this.emitters.set(ParticleType.BULLET_TRAIL, bulletTrailEmitter);
    
    // Muzzle flash particles
    const muzzleFlashParticles = this.scene.add.particles('particle-impact');
    const muzzleFlashEmitter = muzzleFlashParticles.createEmitter({
      speed: { min: 10, max: 30 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 100,
      gravityY: 0,
      tint: 0xffff00,
      quantity: 10,
      on: false
    });
    this.emitters.set(ParticleType.MUZZLE_FLASH, muzzleFlashEmitter);
  }
  
  createParticle(data: { type: ParticleType, x: number, y: number, angle?: number }) {
    const emitter = this.emitters.get(data.type);
    
    if (emitter) {
      if (data.angle !== undefined) {
        emitter.setAngle(data.angle * Phaser.Math.RAD_TO_DEG);
      }
      
      emitter.explode(emitter.quantity, data.x, data.y);
    }
  }
} 
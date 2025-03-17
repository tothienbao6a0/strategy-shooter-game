import Phaser from 'phaser';
import { ParticleType } from '../../core/constants';

export class EnhancedParticleManager {
  private scene: Phaser.Scene;
  private emitters: Map<string, Phaser.GameObjects.Particles.ParticleEmitter>;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.emitters = new Map();
    
    // Initialize particle emitters
    this.initializeEmitters();
    
    // Listen for particle creation events
    scene.events.on('createParticle', this.createParticle, this);
  }
  
  private initializeEmitters() {
    // Muzzle flash emitter
    const muzzleFlashEmitter = this.scene.add.particles(0, 0, 'particle-impact', {
      lifespan: 200,
      speed: { min: 20, max: 50 },
      scale: { start: 0.5, end: 0 },
      quantity: 1,
      blendMode: 'ADD',
      tint: 0xffff00
    });
    this.emitters.set(ParticleType.MUZZLE_FLASH, muzzleFlashEmitter);
    
    // Impact emitter
    const impactEmitter = this.scene.add.particles(0, 0, 'particle-impact', {
      lifespan: 500,
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.4, end: 0 },
      quantity: 10,
      gravityY: 200
    });
    this.emitters.set(ParticleType.IMPACT, impactEmitter);
    
    // Debris emitter
    const debrisEmitter = this.scene.add.particles(0, 0, 'particle-debris', {
      lifespan: 1000,
      speed: { min: 50, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0.2 },
      rotate: { min: 0, max: 360 },
      quantity: 8,
      gravityY: 300,
      bounce: 0.5
    });
    this.emitters.set(ParticleType.DEBRIS, debrisEmitter);
    
    // Blood emitter
    const bloodEmitter = this.scene.add.particles(0, 0, 'particle-blood', {
      lifespan: 800,
      speed: { min: 30, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      quantity: 15,
      gravityY: 200
    });
    this.emitters.set(ParticleType.BLOOD, bloodEmitter);
    
    // Footstep emitter
    const footstepEmitter = this.scene.add.particles(0, 0, 'particle-impact', {
      lifespan: 500,
      speed: { min: 5, max: 20 },
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.3, end: 0 },
      tint: 0xaaaaaa,
      quantity: 3
    });
    this.emitters.set(ParticleType.FOOTSTEP, footstepEmitter);
    
    // Explosion emitter
    const explosionEmitter = this.scene.add.particles(0, 0, 'particle-impact', {
      lifespan: 1000,
      speed: { min: 100, max: 300 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      blendMode: 'ADD',
      tint: [0xff0000, 0xff6600, 0xffff00],
      quantity: 30
    });
    this.emitters.set(ParticleType.EXPLOSION, explosionEmitter);
  }
  
  createParticle(data: { type: ParticleType, x: number, y: number, angle?: number }) {
    const emitter = this.emitters.get(data.type);
    
    if (!emitter) {
      console.warn(`No emitter found for particle type: ${data.type}`);
      return;
    }
    
    // Set emitter position
    emitter.setPosition(data.x, data.y);
    
    // Set angle if provided
    if (data.angle !== undefined) {
      emitter.setAngle(Phaser.Math.RadToDeg(data.angle) - 90);
    }
    
    // Emit particles
    emitter.explode();
  }
  
  update() {
    // Update particle effects if needed
  }
} 
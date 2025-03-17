import Phaser from 'phaser';

export class Room {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public type: string;
  
  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, type: string) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
  }
  
  get centerX(): number {
    return this.x + this.width / 2;
  }
  
  get centerY(): number {
    return this.y + this.height / 2;
  }
} 
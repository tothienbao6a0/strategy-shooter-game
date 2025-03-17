import Phaser from 'phaser';
import { TileType } from '../../core/constants';

export class Tile {
  public type: TileType;
  public sprite: Phaser.Physics.Matter.Sprite | null = null;
  public visible: boolean = false;
  public explored: boolean = false;
  public health: number = 100;
  
  constructor(type: TileType) {
    this.type = type;
  }
  
  takeDamage(amount: number): boolean {
    if (this.type !== TileType.DESTRUCTIBLE_WALL) {
      return false;
    }
    
    this.health -= amount;
    
    if (this.health <= 0) {
      this.destroy();
      return true;
    }
    
    return false;
  }
  
  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
    
    this.type = TileType.FLOOR;
  }
} 
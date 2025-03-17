import Phaser from 'phaser';
import { MapGenerator } from '../map/generator';
import { Player } from '../../entities/player';
import { gameConfig } from '../../core/config';

export class VisibilitySystem {
  private scene: Phaser.Scene;
  private map: MapGenerator;
  private player: Player;
  private visibilityMap: boolean[][];
  private exploredMap: boolean[][];
  private visibilityGraphics: Phaser.GameObjects.Graphics;
  
  constructor(scene: Phaser.Scene, map: MapGenerator, player: Player) {
    this.scene = scene;
    this.map = map;
    this.player = player;
    
    // Initialize visibility map
    this.visibilityMap = Array(gameConfig.mapHeight).fill(0).map(() => 
      Array(gameConfig.mapWidth).fill(false)
    );
    
    // Initialize explored map
    this.exploredMap = Array(gameConfig.mapHeight).fill(0).map(() => 
      Array(gameConfig.mapWidth).fill(false)
    );
    
    // Create graphics for fog of war
    this.visibilityGraphics = scene.add.graphics();
    this.visibilityGraphics.setDepth(100);
  }
  
  update() {
    try {
      // Reset visibility map
      for (let y = 0; y < gameConfig.mapHeight; y++) {
        for (let x = 0; x < gameConfig.mapWidth; x++) {
          this.visibilityMap[y][x] = false;
        }
      }
      
      // Calculate visible tiles
      this.calculateVisibility();
      
      // Update tile visibility
      this.updateTileVisibility();
      
      // Render fog of war
      this.renderFogOfWar();
    } catch (error) {
      console.error('Error in VisibilitySystem update:', error);
    }
  }
  
  private calculateVisibility() {
    // Get player position in tile coordinates
    const playerTileX = Math.floor(this.player.x / gameConfig.tileSize);
    const playerTileY = Math.floor(this.player.y / gameConfig.tileSize);
    
    // Set player's tile as visible
    if (playerTileX >= 0 && playerTileX < gameConfig.mapWidth &&
        playerTileY >= 0 && playerTileY < gameConfig.mapHeight) {
      this.visibilityMap[playerTileY][playerTileX] = true;
      this.exploredMap[playerTileY][playerTileX] = true;
    }
    
    // Calculate visibility in a radius around the player
    const visibilityRadius = 10; // Tiles
    
    for (let y = Math.max(0, playerTileY - visibilityRadius); y < Math.min(gameConfig.mapHeight, playerTileY + visibilityRadius); y++) {
      for (let x = Math.max(0, playerTileX - visibilityRadius); x < Math.min(gameConfig.mapWidth, playerTileX + visibilityRadius); x++) {
        // Calculate world coordinates for the center of this tile
        const tileWorldX = (x + 0.5) * gameConfig.tileSize;
        const tileWorldY = (y + 0.5) * gameConfig.tileSize;
        
        // Check if this tile is visible from the player
        if (this.map.isTileVisible(tileWorldX, tileWorldY, this.player.x, this.player.y)) {
          this.visibilityMap[y][x] = true;
          this.exploredMap[y][x] = true;
        }
      }
    }
  }
  
  private updateTileVisibility() {
    // Update tile visibility
    for (let y = 0; y < gameConfig.mapHeight; y++) {
      for (let x = 0; x < gameConfig.mapWidth; x++) {
        const tile = this.map.getTileAt(x * gameConfig.tileSize, y * gameConfig.tileSize);
        
        if (tile) {
          tile.visible = this.visibilityMap[y][x];
          tile.explored = this.exploredMap[y][x];
          
          // Update sprite visibility
          if (tile.sprite) {
            tile.sprite.setAlpha(tile.visible ? 1 : (tile.explored ? 0.5 : 0));
          }
        }
      }
    }
  }
  
  private renderFogOfWar() {
    this.visibilityGraphics.clear();
    
    // Draw fog of war
    for (let y = 0; y < gameConfig.mapHeight; y++) {
      for (let x = 0; x < gameConfig.mapWidth; x++) {
        if (!this.visibilityMap[y][x]) {
          // Draw dark overlay for non-visible tiles
          this.visibilityGraphics.fillStyle(0x000000, this.exploredMap[y][x] ? 0.7 : 1);
          this.visibilityGraphics.fillRect(
            x * gameConfig.tileSize,
            y * gameConfig.tileSize,
            gameConfig.tileSize,
            gameConfig.tileSize
          );
        }
      }
    }
  }
  
  isTileVisible(x: number, y: number): boolean {
    // Convert world coordinates to tile coordinates
    const tileX = Math.floor(x / gameConfig.tileSize);
    const tileY = Math.floor(y / gameConfig.tileSize);
    
    // Check if coordinates are within bounds
    if (
      tileX >= 0 && tileX < gameConfig.mapWidth &&
      tileY >= 0 && tileY < gameConfig.mapHeight
    ) {
      return this.visibilityMap[tileY][tileX];
    }
    
    return false;
  }
} 
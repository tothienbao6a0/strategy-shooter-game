import Phaser from 'phaser';
import { TileType, gameConfig } from '../../core/constants';
import { Tile } from './tile';
import { Room } from './room';

export class MapGenerator {
  private scene: Phaser.Scene;
  private width: number;
  private height: number;
  private tileSize: number;
  private tiles: Tile[][];
  private rooms: Room[] = [];
  
  // Physics groups for collision
  public wallsGroup: Phaser.Physics.Arcade.StaticGroup;
  public furnitureGroup: Phaser.Physics.Arcade.StaticGroup;
  
  // Visual elements
  private mapContainer: Phaser.GameObjects.Container;
  
  constructor(scene: Phaser.Scene, width: number, height: number) {
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.tileSize = gameConfig.tileSize;
    
    // Initialize tiles array with floors
    this.tiles = Array(height).fill(0).map(() => 
      Array(width).fill(0).map(() => new Tile(TileType.FLOOR))
    );
    
    // Create physics groups
    this.wallsGroup = this.scene.physics.add.staticGroup();
    this.furnitureGroup = this.scene.physics.add.staticGroup();
    
    // Create container for visual elements
    this.mapContainer = this.scene.add.container(0, 0);
  }
  
  generateSimpleMap() {
    console.log('Generating simple test map...');
    
    // Clear any existing sprites
    this.wallsGroup.clear(true, true);
    this.furnitureGroup.clear(true, true);
    this.mapContainer.removeAll(true);
    
    // Create a simple room with walls around the edges
    this.tiles = Array(this.height).fill(0).map((_, y) => 
      Array(this.width).fill(0).map((_, x) => {
        if (x === 0 || y === 0 || x === this.width - 1 || y === this.height - 1) {
          return new Tile(TileType.WALL);
        } else {
          return new Tile(TileType.FLOOR);
        }
      })
    );
    
    // Add some random walls for testing
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(3, this.width - 4);
      const y = Phaser.Math.Between(3, this.height - 4);
      
      // Create small wall formations
      if (Math.random() < 0.5) {
        // Horizontal wall
        for (let dx = 0; dx < Phaser.Math.Between(2, 5); dx++) {
          if (x + dx < this.width - 1) {
            this.tiles[y][x + dx].type = TileType.WALL;
          }
        }
      } else {
        // Vertical wall
        for (let dy = 0; dy < Phaser.Math.Between(2, 5); dy++) {
          if (y + dy < this.height - 1) {
            this.tiles[y + dy][x].type = TileType.WALL;
          }
        }
      }
    }
    
    // Add some furniture
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(2, this.width - 3);
      const y = Phaser.Math.Between(2, this.height - 3);
      
      // Make sure we're not placing furniture on a wall
      if (this.tiles[y][x].type === TileType.FLOOR) {
        this.tiles[y][x].type = TileType.FURNITURE;
      }
    }
    
    // Render the map
    this.renderMap();
    
    console.log('Simple map generation complete');
    return this.tiles;
  }
  
  private renderMap() {
    console.log('Rendering map...');
    
    // Add a background
    const background = this.scene.add.rectangle(
      0, 0, 
      this.width * this.tileSize, 
      this.height * this.tileSize, 
      0x111111
    );
    background.setOrigin(0, 0);
    this.mapContainer.add(background);
    
    // Add a grid pattern
    const grid = this.scene.add.grid(
      0, 0,
      this.width * this.tileSize,
      this.height * this.tileSize,
      this.tileSize, this.tileSize,
      0x0, 0x0,
      0.1, 0x333333
    );
    grid.setOrigin(0, 0);
    this.mapContainer.add(grid);
    
    // Create sprites for each tile
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.tiles[y][x];
        
        if (!tile) continue;
        
        const worldX = x * this.tileSize + this.tileSize / 2;
        const worldY = y * this.tileSize + this.tileSize / 2;
        
        switch (tile.type) {
          case TileType.FLOOR:
            // Floor tiles are just the background
            break;
            
          case TileType.WALL:
            // Create a wall sprite
            const wall = this.scene.physics.add.sprite(worldX, worldY, 'wall');
            wall.setImmovable(true);
            wall.setDepth(5);
            
            // Add to physics group
            this.wallsGroup.add(wall);
            
            // Store reference
            tile.sprite = wall;
            break;
            
          case TileType.FURNITURE:
            // Create a furniture sprite
            const furniture = this.scene.physics.add.sprite(worldX, worldY, 'furniture');
            furniture.setImmovable(true);
            furniture.setDepth(3);
            
            // Add to physics group
            this.furnitureGroup.add(furniture);
            
            // Store reference
            tile.sprite = furniture;
            break;
            
          // Add other tile types as needed
        }
      }
    }
    
    // Make sure all physics bodies are updated
    this.wallsGroup.refresh();
    this.furnitureGroup.refresh();
    
    console.log('Map rendering complete');
  }
  
  getPlayerSpawnPoint(): { x: number, y: number } {
    console.log('Finding player spawn point...');
    
    // Find a valid floor tile away from walls
    let x = 0;
    let y = 0;
    let found = false;
    
    // Try to find a good spawn point
    for (let attempts = 0; attempts < 100; attempts++) {
      const testX = Phaser.Math.Between(5, this.width - 6);
      const testY = Phaser.Math.Between(5, this.height - 6);
      
      if (this.tiles[testY][testX].type === TileType.FLOOR) {
        // Check surrounding tiles to make sure we're not too close to walls
        let clear = true;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (this.tiles[testY + dy][testX + dx].type !== TileType.FLOOR) {
              clear = false;
              break;
            }
          }
          if (!clear) break;
        }
        
        if (clear) {
          x = testX;
          y = testY;
          found = true;
          break;
        }
      }
    }
    
    // If no good spot found, just use the center
    if (!found) {
      x = Math.floor(this.width / 2);
      y = Math.floor(this.height / 2);
      console.log('No good spawn point found, using center');
    }
    
    // Convert to world coordinates
    const worldX = x * this.tileSize + this.tileSize / 2;
    const worldY = y * this.tileSize + this.tileSize / 2;
    
    console.log(`Player spawn point: (${worldX}, ${worldY})`);
    return { x: worldX, y: worldY };
  }
} 
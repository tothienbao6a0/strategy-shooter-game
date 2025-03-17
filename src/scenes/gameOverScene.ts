import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  private victory: boolean;
  
  constructor() {
    super({ key: 'GameOverScene' });
  }
  
  init(data: { victory: boolean }) {
    this.victory = data.victory;
  }
  
  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Game over message
    const message = this.victory ? 'Victory!' : 'Defeat';
    const color = this.victory ? '#00ff00' : '#ff0000';
    
    this.add.text(width / 2, height / 2 - 50, message, {
      font: '64px Arial',
      color: color
    }).setOrigin(0.5);
    
    // Return to menu button
    const menuButton = this.add.text(width / 2, height / 2 + 50, 'Return to Menu', {
      font: '32px Arial',
      color: '#ffffff',
      backgroundColor: '#555555',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();
    
    menuButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
} 
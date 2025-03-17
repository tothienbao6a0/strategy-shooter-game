import Phaser from 'phaser';
import { BootScene } from '../scenes/bootScene';
import { LoadingScene } from '../scenes/loadingScene';
import { MenuScene } from '../scenes/menuScene';
import { GameScene } from '../scenes/gameScene';
import { GameOverScene } from '../scenes/gameOverScene';
import { DebugScene } from '../scenes/debugScene';

export class R6Siege2D extends Phaser.Game {
  constructor() {
    console.log('Initializing R6Siege2D game...');
    
    try {
      super({
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        backgroundColor: '#000000',
        parent: 'game',
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false
          }
        },
        scene: [
          BootScene,
          LoadingScene,
          MenuScene,
          GameScene,
          GameOverScene,
          DebugScene
        ],
        render: {
          pixelArt: false,
          antialias: true
        },
        fps: {
          target: 60,
          forceSetTimeOut: true
        },
        disableContextMenu: true,
        input: {
          keyboard: true,
          mouse: true,
          gamepad: false
        }
      });
      
      console.log('Game configuration loaded successfully');
    } catch (error) {
      console.error('Failed to initialize game:', error);
    }
  }
} 
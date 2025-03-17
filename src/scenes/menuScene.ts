import Phaser from 'phaser';
import { Team, Operator, OPERATORS_DATA } from '../core/constants';

export class MenuScene extends Phaser.Scene {
  private selectedTeam: Team = Team.ATTACKER;
  private selectedOperator: Operator = Operator.SLEDGE;
  private operatorButtons: Phaser.GameObjects.Text[] = [];
  
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    console.log('MenuScene: creating menu elements...');
    
    try {
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;
      
      // Create background with animated gradient
      const bg = this.add.graphics();
      bg.fillGradientStyle(0x000033, 0x000033, 0x000022, 0x000022, 1);
      bg.fillRect(0, 0, width, height);
      
      // Add animated particles in background
      this.add.particles(0, 0, 'particle-impact', {
        x: { min: 0, max: width },
        y: { min: 0, max: height },
        scale: { start: 0.2, end: 0 },
        alpha: { start: 0.2, end: 0 },
        speed: 20,
        lifespan: 3000,
        blendMode: 'ADD',
        frequency: 200
      });
      
      // Add logo with animation
      const logo = this.add.text(width / 2, 100, 'R6Siege-2D', {
        font: 'bold 64px Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6,
        shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 5, stroke: true, fill: true }
      }).setOrigin(0.5);
      
      // Animate logo
      this.tweens.add({
        targets: logo,
        y: 110,
        duration: 2000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
      
      // Team selection with improved visuals
      const teamTitle = this.add.text(width / 2, 200, 'SELECT TEAM', {
        font: '32px Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5);
      
      // Create team selection buttons
      this.createTeamButtons();
      
      // Create operator selection
      this.createOperatorSelection();
      
      // Create start button
      this.createStartButton();
      
      // Create debug button
      this.createDebugButton();
      
      console.log('MenuScene setup complete');
    } catch (error) {
      console.error('Error in MenuScene create:', error);
    }
  }
  
  private createTeamButtons() {
    const width = this.cameras.main.width;
    
    // Attacker button
    const attackerButton = this.add.container(width / 2 - 120, 250);
    
    const attackerBg = this.add.rectangle(0, 0, 200, 60, 
      this.selectedTeam === Team.ATTACKER ? 0x880000 : 0x330000, 
      this.selectedTeam === Team.ATTACKER ? 1 : 0.7
    );
    attackerBg.setStrokeStyle(2, 0xff0000);
    
    const attackerText = this.add.text(0, 0, 'ATTACKERS', {
      font: '24px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    attackerButton.add([attackerBg, attackerText]);
    attackerButton.setInteractive(new Phaser.Geom.Rectangle(-100, -30, 200, 60), Phaser.Geom.Rectangle.Contains);
    
    attackerButton.on('pointerdown', () => {
      this.selectedTeam = Team.ATTACKER;
      this.updateTeamSelection();
      this.updateOperatorSelection();
      
      // Add selection effect
      this.cameras.main.flash(200, 255, 0, 0, true);
      this.sound.play('ui-select');
    });
    
    // Defender button
    const defenderButton = this.add.container(width / 2 + 120, 250);
    
    const defenderBg = this.add.rectangle(0, 0, 200, 60, 
      this.selectedTeam === Team.DEFENDER ? 0x000088 : 0x000033, 
      this.selectedTeam === Team.DEFENDER ? 1 : 0.7
    );
    defenderBg.setStrokeStyle(2, 0x0000ff);
    
    const defenderText = this.add.text(0, 0, 'DEFENDERS', {
      font: '24px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    defenderButton.add([defenderBg, defenderText]);
    defenderButton.setInteractive(new Phaser.Geom.Rectangle(-100, -30, 200, 60), Phaser.Geom.Rectangle.Contains);
    
    defenderButton.on('pointerdown', () => {
      this.selectedTeam = Team.DEFENDER;
      this.updateTeamSelection();
      this.updateOperatorSelection();
      
      // Add selection effect
      this.cameras.main.flash(200, 0, 0, 255, true);
      this.sound.play('ui-select');
    });
  }
  
  private updateTeamSelection() {
    // Clear existing operator buttons
    this.operatorButtons.forEach(button => button.destroy());
    this.operatorButtons = [];
    
    const width = this.cameras.main.width;
    
    // Get operators for the selected team
    const operators = Object.keys(OPERATORS_DATA)
      .filter(op => OPERATORS_DATA[op as Operator]?.team === this.selectedTeam);
    
    console.log('Available operators:', operators);
    
    if (operators.length === 0) {
      console.warn('No operators found for team:', this.selectedTeam);
      // Add a message if no operators are found
      const noOpsText = this.add.text(width / 2, 380, 'No operators available', {
        font: '20px Arial',
        color: '#ff0000'
      }).setOrigin(0.5);
      this.operatorButtons.push(noOpsText);
      return;
    }
    
    // Update selected operator if needed
    if (!operators.includes(this.selectedOperator)) {
      this.selectedOperator = operators[0] as Operator;
    }
    
    // Create buttons for each operator
    operators.forEach((op, index) => {
      const x = width / 2 - ((operators.length - 1) * 50) + (index * 100);
      const y = 380;
      
      const operatorButton = this.add.text(x, y, op, {
        font: '20px Arial',
        color: '#ffffff',
        backgroundColor: this.selectedOperator === op ? '#555555' : '#222222',
        padding: { x: 10, y: 5 }
      }).setOrigin(0.5).setInteractive().setName(`operator-${op}`);
      
      operatorButton.on('pointerdown', () => {
        this.selectedOperator = op as Operator;
        this.updateOperatorSelection();
      });
      
      this.operatorButtons.push(operatorButton);
    });
  }
  
  private createOperatorSelection() {
    // Operator selection
    this.add.text(this.cameras.main.width / 2, 320, 'Select Operator', {
      font: '32px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);
  }
  
  private createStartButton() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Start button
    const startButton = this.add.text(width / 2, height - 100, 'Start Game', {
      font: '32px Arial',
      color: '#ffffff',
      backgroundColor: '#007700',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();
    
    startButton.on('pointerdown', () => {
      console.log('Starting game with:', { team: this.selectedTeam, operator: this.selectedOperator });
      this.scene.start('GameScene', {
        team: this.selectedTeam,
        operator: this.selectedOperator
      });
    });
  }
  
  private createDebugButton() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Create debug button (hidden in corner)
    const debugButton = this.add.text(width - 20, height - 20, 'DEBUG', {
      font: '16px Arial',
      color: '#555555'
    }).setOrigin(1);
    
    debugButton.setInteractive({ useHandCursor: true });
    
    debugButton.on('pointerdown', () => {
      this.scene.start('DebugScene');
    });
    
    // Make it pulse slightly to be noticeable
    this.tweens.add({
      targets: debugButton,
      alpha: { from: 0.5, to: 1 },
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }
} 
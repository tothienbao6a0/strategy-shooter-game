import { R6Siege2D } from './core/game';
// Remove the CSS import that's causing errors
// import './styles/main.css';

// Wait for DOM to be ready
window.addEventListener('DOMContentLoaded', () => {
  console.log('Starting R6Siege-2D...');
  
  try {
    // Create game instance
    const game = new R6Siege2D();
    
    // Add to global scope for debugging
    (window as any).game = game;
    
    console.log('Game initialized successfully');
  } catch (error) {
    console.error('Failed to initialize game:', error);
  }
}); 
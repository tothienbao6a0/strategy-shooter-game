export const gameConfig = {
  width: 1200,
  height: 900,
  tileSize: 30,
  mapWidth: 40,
  mapHeight: 30,
  debug: false,
  physics: {
    bulletSpeed: 10,
    bulletGravity: 0.05,
    bulletAirResistance: 0.01,
    playerSpeed: 3
  },
  ai: {
    pathfindingInterval: 500,
    decisionInterval: 200,
    alertnessDecay: 0.01
  },
  sound: {
    footstepRadius: 150,
    gunshotRadius: 800,
    wallBreakRadius: 500,
    glassBreakRadius: 600,
    explosionRadius: 1000
  }
}; 
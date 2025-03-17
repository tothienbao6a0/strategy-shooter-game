export enum TileType {
  FLOOR = 0,
  WALL = 1,
  DESTRUCTIBLE_WALL = 2,
  REINFORCED_WALL = 3,
  FURNITURE = 4,
  WINDOW = 5,
  VENT = 6
}

export enum Team {
  ATTACKER = 'attacker',
  DEFENDER = 'defender'
}

export enum AIState {
  PATROL = 'patrol',
  ALERT = 'alert',
  INVESTIGATE = 'investigate',
  SEARCH = 'search',
  ATTACK = 'attack'
}

export enum GadgetType {
  BREACH_CHARGE = 'breach_charge',
  EXOTHERMIC_CHARGE = 'exothermic_charge',
  CAMERA = 'camera',
  SIGNAL_JAMMER = 'signal_jammer',
  ADS = 'ads',
  EMP_GRENADE = 'emp_grenade',
  TACTICAL_HAMMER = 'tactical_hammer',
  ARMOR_PACK = 'armor_pack'
}

export enum ParticleType {
  MUZZLE_FLASH = 'muzzle_flash',
  IMPACT = 'impact',
  DEBRIS = 'debris',
  BLOOD = 'blood',
  FOOTSTEP = 'footstep',
  EXPLOSION = 'explosion'
}

export enum GameState {
  MENU = 'menu',
  PLAYING = 'playing',
  GAME_OVER = 'game_over'
}

export enum Operator {
  // Attackers
  SLEDGE = 'sledge',
  THATCHER = 'thatcher',
  ASH = 'ash',
  THERMITE = 'thermite',
  
  // Defenders
  MUTE = 'mute',
  ROOK = 'rook',
  JAGER = 'jager',
  VALKYRIE = 'valkyrie'
}

export const OPERATORS_DATA = {
  [Operator.SLEDGE]: {
    name: 'Sledge',
    team: Team.ATTACKER,
    health: 100,
    speed: 3,
    gadgets: [GadgetType.TACTICAL_HAMMER, GadgetType.BREACH_CHARGE],
    weapon: {
      damage: 45,
      rateOfFire: 600,
      capacity: 30,
      reserve: 150
    }
  },
  [Operator.THATCHER]: {
    name: 'Thatcher',
    team: Team.ATTACKER,
    health: 100,
    speed: 2,
    gadgets: [GadgetType.EMP_GRENADE, GadgetType.BREACH_CHARGE],
    weapon: {
      damage: 40,
      rateOfFire: 650,
      capacity: 30,
      reserve: 150
    }
  },
  [Operator.ASH]: {
    name: 'Ash',
    team: Team.ATTACKER,
    health: 90,
    speed: 3,
    gadgets: [GadgetType.BREACH_CHARGE],
    weapon: {
      damage: 35,
      rateOfFire: 800,
      capacity: 30,
      reserve: 150
    }
  },
  [Operator.THERMITE]: {
    name: 'Thermite',
    team: Team.ATTACKER,
    health: 100,
    speed: 2,
    gadgets: [GadgetType.EXOTHERMIC_CHARGE, GadgetType.BREACH_CHARGE],
    weapon: {
      damage: 40,
      rateOfFire: 600,
      capacity: 30,
      reserve: 150
    }
  },
  [Operator.MUTE]: {
    name: 'Mute',
    team: Team.DEFENDER,
    health: 100,
    speed: 2,
    gadgets: [GadgetType.SIGNAL_JAMMER],
    weapon: {
      damage: 40,
      rateOfFire: 600,
      capacity: 25,
      reserve: 125
    }
  },
  [Operator.ROOK]: {
    name: 'Rook',
    team: Team.DEFENDER,
    health: 110,
    speed: 1,
    gadgets: [GadgetType.ARMOR_PACK],
    weapon: {
      damage: 45,
      rateOfFire: 550,
      capacity: 30,
      reserve: 150
    }
  },
  [Operator.JAGER]: {
    name: 'Jager',
    team: Team.DEFENDER,
    health: 100,
    speed: 2,
    gadgets: [GadgetType.ADS],
    weapon: {
      damage: 40,
      rateOfFire: 700,
      capacity: 30,
      reserve: 150
    }
  },
  [Operator.VALKYRIE]: {
    name: 'Valkyrie',
    team: Team.DEFENDER,
    health: 90,
    speed: 2,
    gadgets: [GadgetType.CAMERA],
    weapon: {
      damage: 35,
      rateOfFire: 800,
      capacity: 30,
      reserve: 150
    }
  }
};

// Game configuration
export const gameConfig = {
  width: 800,
  height: 600,
  tileSize: 32,
  mapWidth: 50,
  mapHeight: 50,
  debug: false,
  physics: {
    bulletSpeed: 10,
    bulletGravity: 0.001,
    bulletAirResistance: 0.001
  }
}; 
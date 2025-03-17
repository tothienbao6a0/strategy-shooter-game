import { Team, AIState, Operator } from '../core/constants';

export interface Position {
  x: number;
  y: number;
}

export interface Player {
  id: string;
  x: number;
  y: number;
  angle: number;
  health: number;
  team: Team;
  operator: Operator;
  spotted: boolean;
  lastPing: number | null;
  ammo: {
    current: number;
    reserve: number;
    capacity: number;
  };
  reloading: boolean;
  lastShot: number;
  state: string;
  path: Position[];
  targetPosition: Position | null;
}

export interface Enemy extends Player {
  state: AIState;
  alertness: number;
  lastStateChange: number;
  patrolPoints: Position[];
  currentPatrolIndex: number;
  heardSound: Position | null;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  initialX: number;
  initialY: number;
  angle: number;
  velX: number;
  velY: number;
  playerId: string;
  age: number;
  damage: number;
  distance: number;
  maxDistance: number;
  penetration: number;
}

export interface Gadget {
  id: string;
  type: string;
  name: string;
  description: string;
  x: number;
  y: number;
  active: boolean;
  playerId: string;
  state: string;
  deployTime: number;
  effectRadius: number;
  duration: number;
  lastUpdate: number;
} 
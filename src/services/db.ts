import Dexie, { type Table } from 'dexie';
import { type Game } from '../types';

export class X9Database extends Dexie {
  games!: Table<Game>;

  constructor() {
    super('x9_game_hub_db');
    this.version(1).stores({
      games: '++id, name, importDate, engineType'
    });
  }
}

export const db = new X9Database();

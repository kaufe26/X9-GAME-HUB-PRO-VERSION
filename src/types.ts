export enum GameEngine {
  HTML = 'HTML',
  PHASER = 'PHASER',
  THREEJS = 'THREEJS',
  BABYLON = 'BABYLON',
  UNKNOWN = 'UNKNOWN'
}

export interface Game {
  id?: number;
  name: string;
  version: string;
  importDate: number; // timestamp
  size: number;
  playCount: number;
  thumbnail: string; // base64 or empty
  zipData: Blob;
  entryFile: string;
  engineType: GameEngine;
  htmlCode?: string;
}

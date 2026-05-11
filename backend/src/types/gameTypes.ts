export type Choice = 'rock' | 'paper' | 'scissors' | null;

export interface Player {
  id: string;
  alias: string;
  choice: Choice;
  timeTaken?: number; // ⏱️ ESTA ES LA LÍNEA QUE FALTA
}

export interface Room {
  id: string;
  players: Player[];
  status: 'waiting' | 'full' | 'finished';
  roundStartTime?: number; // ⏱️ Y esta para medir el tiempo de la ronda
}
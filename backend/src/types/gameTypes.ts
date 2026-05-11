export type Choice = 'rock' | 'paper' | 'scissors' | null;

export interface Player {
    id: string;
    alias: string;
    choice: Choice;
    timeTaken?: number;
}

export interface Room {
    id: string;
    players: Player[];
    status: 'waiting' | 'full' | 'finished';
    roundStartTime?: number;
}
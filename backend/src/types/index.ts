//opciones posibles
export type Choice = 'rock' | 'paper' | 'scissors' | null;
//jugador
export interface Player {
    id: string;
    alias: string;
    choice: Choice;
}
//sala
export interface Room {
    id: string;
    player: Player[]
    status: 'waiting' | 'full' | 'playing' | 'finished';
}
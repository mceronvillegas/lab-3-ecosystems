import { Choice } from '../types/gameTypes';

export const getWinner = (p1Choice: Choice, p2Choice: Choice): 'player1' | 'player2' | 'draw' => {

    // empate
    if (p1Choice === p2Choice) {
        return 'draw';
    }

    // gana player1
    if (
        (p1Choice === 'rock' && p2Choice === 'scissors') || 
        (p1Choice === 'paper' && p2Choice === 'rock') || 
        (p1Choice === 'scissors' && p2Choice === 'paper') 
    ) {
        return 'player1';
    }

    // gana player2
    return 'player2';
};
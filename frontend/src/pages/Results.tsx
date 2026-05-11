import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { socket } from '../services/socket';
import type { Room, Player } from '../types';

interface ResultState {
    result: { winner: string, players: Player[] };
    room: Room;
}

const Results = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as ResultState;

    useEffect(() => {
        if (!state) navigate('/');

        socket.on('room_updated', (updatedRoom: Room) => {
            if (updatedRoom.status === 'full' || updatedRoom.status === 'waiting') {
                navigate('/game', { state: { room: updatedRoom } });
            }
        });

        return () => {
            socket.off('room_updated');
        };
    }, [navigate, state]);

    if (!state) return null;

    const { result, room } = state;

    const handleRestart = () => {
        socket.emit('restart_game', room.id);
    };

    const handleLeave = () => {
        socket.emit('leave_room', room.id);
        navigate('/');
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <h1>Resultados Finales</h1>
            <h2>{result.winner === 'draw' ? '¡Es un empate! 🤝' : `¡Victoria de ${result.winner}! 🏆`}</h2>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '30px 0' }}>
                {result.players.map(p => (
                    <div key={p.id} style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px' }}>
                        <p style={{ fontSize: '1.2rem', margin: '0' }}><strong>{p.alias}</strong></p>
                        <p style={{ fontSize: '3rem', margin: '10px 0' }}>
                            {p.choice === 'rock' ? '🪨' : p.choice === 'paper' ? '📄' : '✂️'}
                        </p>
                        <p style={{ color: '#666' }}>⏱️ Tardó: {p.timeTaken}s</p>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                <button
                    onClick={handleRestart}
                    style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    Jugar de nuevo
                </button>
                <button
                    onClick={handleLeave}
                    style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    Salir de la sala
                </button>
            </div>
        </div>
    );
};

export default Results;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../services/socket';
import type { Room } from '../types';

const Landing = () => {
    const [alias, setAlias] = useState('');
    const [roomId, setRoomId] = useState('');
    const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        socket.on('available_rooms', (rooms: Room[]) => setAvailableRooms(rooms));

        socket.on('joined_room', (room: Room) => {
            navigate('/game', { state: { room } });
        });

        socket.on('room_updated', (room: Room) => {
            const amIHere = room.players.some(p => p.id === socket.id);
            if (amIHere) {
                navigate('/game', { state: { room } });
            }
        });

        return () => {
            socket.off('available_rooms');
            socket.off('joined_room');
            socket.off('room_updated');
        };
    }, [navigate]);

    const handleJoin = (idToJoin?: string) => {
        const finalRoomId = idToJoin || roomId;
        if (!alias.trim() || !finalRoomId.trim()) {
            return alert('Por favor ingresa tu Alias y el ID de la Sala');
        }
        socket.emit('join_room', { roomId: finalRoomId, alias });
    };

    return (
        <div style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <h1>Piedra, Papel o Tijera 🎮</h1>

            <div style={{ padding: '20px', border: '1px solid #ccc', marginBottom: '20px', borderRadius: '8px' }}>
                <h3>Crear o Unirse a Sala</h3>
                <input
                    placeholder="Tu Alias (Ej. Mariana)"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    style={{ display: 'block', width: '90%', margin: '10px auto', padding: '10px', borderRadius: '5px', border: '1px solid #aaa' }}
                />
                <input
                    placeholder="ID de la Sala"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    style={{ display: 'block', width: '90%', margin: '10px auto', padding: '10px', borderRadius: '5px', border: '1px solid #aaa' }}
                />
                <button
                    onClick={() => handleJoin()}
                    style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '95%' }}
                >
                    Entrar a Jugar
                </button>
            </div>

            <div style={{ textAlign: 'left' }}>
                <h3>Salas Activas:</h3>
                {availableRooms.length === 0 && <p style={{ color: '#666' }}>No hay salas creadas. ¡Crea la primera!. Si saliste de una sala en donde el jugador sigue activo y quiere volver a ingresar, solo pon el pin de nuevo...</p>}

                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {availableRooms.map((r) => (
                        <li key={r.id} style={{ margin: '10px 0', padding: '15px', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Sala: <strong>{r.id}</strong> - ({r.players.length}/2 jugadores)</span>
                            <button
                                disabled={r.players.length >= 2}
                                onClick={() => handleJoin(r.id)}
                                style={{
                                    padding: '8px 15px',
                                    backgroundColor: r.players.length >= 2 ? '#ccc' : '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: r.players.length >= 2 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {r.players.length >= 2 ? 'Llena' : 'Unirse'}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Landing;
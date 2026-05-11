import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { socket } from '../services/socket';
import type { Room, Choice } from '../types';

const Game = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [room, setRoom] = useState<Room | null>(location.state?.room || null);
  const [myChoice, setMyChoice] = useState<Choice>(null);
  const [opponentReady, setOpponentReady] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    if (!room) navigate('/');
  }, [room, navigate]);

  useEffect(() => {
    socket.on('room_updated', (updatedRoom: Room) => {
      setRoom(updatedRoom);
      if (updatedRoom.status === 'waiting') {
        setMyChoice(null);
        setOpponentReady(false);
        setSecondsElapsed(0);
      }
    });

    socket.on('player_ready', (data) => {
      if (data.playerId !== socket.id) setOpponentReady(true);
    });

    socket.on('game_result', (result) => {
      navigate('/results', { state: { result, room } });
    });

    return () => {
      socket.off('room_updated');
      socket.off('player_ready');
      socket.off('game_result');
    };
  }, [navigate, room]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined; 
    
    if (room?.status === 'full' && !myChoice) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [room?.status, myChoice]);

  const handleChoice = (choice: Choice) => {
    setMyChoice(choice);
    socket.emit('make_choice', { roomId: room?.id, choice });
  };

  if (!room) return null;

  const opponent = room.players.find(p => p.id !== socket.id);

  if (room.status === 'waiting') {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Sala: {room.id}</h1>
        <div style={{ padding: '20px', border: '2px dashed #ccc', borderRadius: '10px' }}>
          <p style={{ fontSize: '1.5rem' }}>⏳ Esperando oponente...</p>
          <p>Dile a tu rival que entre a la sala <strong>{room.id}</strong></p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Sala: {room.id}</h1>
      <div style={{ 
        backgroundColor: '#f8d7da', 
        color: '#721c24', 
        padding: '10px', 
        borderRadius: '5px', 
        display: 'inline-block',
        marginBottom: '20px'
      }}>
        <strong>⏱Tiempo: {secondsElapsed}s</strong>
      </div>
      
      <p style={{ fontSize: '1.2rem' }}>
        Rival: <strong>{opponent?.alias || 'Desconocido'}</strong> {opponentReady ? '✅' : '⏳'}
      </p>
      
      {!myChoice ? (
        <div style={{ marginTop: '30px' }}>
          <button onClick={() => handleChoice('rock')} style={{ fontSize: '3rem', margin: '10px', cursor: 'pointer' }}>🪨</button>
          <button onClick={() => handleChoice('paper')} style={{ fontSize: '3rem', margin: '10px', cursor: 'pointer' }}>📄</button>
          <button onClick={() => handleChoice('scissors')} style={{ fontSize: '3rem', margin: '10px', cursor: 'pointer' }}>✂️</button>
        </div>
      ) : (
        <div style={{ marginTop: '30px' }}>
          <h3>Seleccionaste: {myChoice}</h3>
          <p>Esperando a que {opponent?.alias} elija...</p>
        </div>
      )}
    </div>
  );
};

export default Game;
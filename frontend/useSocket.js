import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://metaspace-yhja.onrender.com';

export default function useSocket() {
  const socketRef = useRef(null);
  const playerRef = useRef({ position: [0, 0, 0], rotation: [0, 0, 0] });

  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [players, setPlayers] = useState({});
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      path: '/socket.io/',
    });

    const socket = socketRef.current;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('chat_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('users_count', setUsersCount);
    socket.on('players_update', setPlayers);

    const handleKeyDown = (e) => {
      const moveStep = 0.1;
      const rotStep = 5;
      const { position, rotation } = playerRef.current;

      switch (e.key) {
        case 'w': position[2] -= moveStep; break;
        case 's': position[2] += moveStep; break;
        case 'a': position[0] -= moveStep; break;
        case 'd': position[0] += moveStep; break;
        case 'ArrowLeft': rotation[1] -= rotStep; break;
        case 'ArrowRight': rotation[1] += rotStep; break;
        default: return;
      }

      movePlayer({
        nickname,
        position: [...position],
        rotation: [...rotation],
      });
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      socket.disconnect();
    };
  }, [nickname]);

  const sendMessage = ({ nickname, text }) => {
    socketRef.current?.emit('chat_message', { nickname, text });
  };

  const movePlayer = ({ nickname, position, rotation }) => {
    playerRef.current = { position, rotation };
    socketRef.current?.emit('player_move', { nickname, position, rotation });
  };

  const initPlayer = (name) => {
    setNickname(name);
    movePlayer({ nickname: name, position: [0, 0, 0], rotation: [0, 0, 0] });
  };

  return {
    connected,
    messages,
    usersCount,
    players,
    sendMessage,
    movePlayer,
    initPlayer,
    nickname,
  };
}

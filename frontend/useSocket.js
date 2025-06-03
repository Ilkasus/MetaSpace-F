import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = 'https://metaspace-yhja.onrender.com'

export default function useSocket() {
  const socket = useRef(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [usersCount, setUsersCount] = useState(0)
  const [players, setPlayers] = useState({})
  const [nickname, setNickname] = useState('')
  const playerRef = useRef({ position: [0, 0, 0], rotation: [0, 0, 0] })

  useEffect(() => {
    socket.current = io(SOCKET_URL, {
      transports: ['websocket'],
      path: '/socket.io/'
    })

    socket.current.on('connect', () => {
      setConnected(true)
    })

    socket.current.on('disconnect', () => {
      setConnected(false)
    })

    socket.current.on('chat_message', (msg) => {
      setMessages((prev) => [...prev, msg])
    })

    socket.current.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg])
    })

    socket.current.on('users_count', (count) => {
      setUsersCount(count)
    })

    socket.current.on('players_update', (data) => {
      setPlayers(data)
    })

    const handleKeyDown = (e) => {
      const moveStep = 0.1
      const rotStep = 5
      const p = playerRef.current.position
      const r = playerRef.current.rotation

      switch (e.key) {
        case 'w': p[2] -= moveStep; break
        case 's': p[2] += moveStep; break
        case 'a': p[0] -= moveStep; break
        case 'd': p[0] += moveStep; break
        case 'ArrowLeft': r[1] -= rotStep; break
        case 'ArrowRight': r[1] += rotStep; break
        default: break
      }

      movePlayer({ nickname, position: [...p], rotation: [...r] })
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      socket.current.disconnect()
    }
  }, [nickname])

  function sendMessage({ nickname, text }) {
    if (socket.current) {
      socket.current.emit('chat_message', { nickname, text })
    }
  }

  function movePlayer({ nickname, position, rotation }) {
    playerRef.current = { position, rotation }
    if (socket.current) {
      socket.current.emit('player_move', { nickname, position, rotation })
    }
  }

  function initPlayer(name) {
    setNickname(name)
    movePlayer({ nickname: name, position: [0, 0, 0], rotation: [0, 0, 0] })
  }

  return {
    connected,
    messages,
    usersCount,
    players,
    sendMessage,
    movePlayer,
    initPlayer,
    nickname
  }
}

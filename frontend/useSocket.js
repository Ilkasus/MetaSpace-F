import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = 'https://metaspace-yhja.onrender.com' 

export default function useSocket() {
  const socket = useRef(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [usersCount, setUsersCount] = useState(0)
  const [players, setPlayers] = useState({})

  useEffect(() => {
    socket.current = io(SOCKET_URL, {
      transports: ['websocket'],
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

    return () => {
      socket.current.disconnect()
    }
  }, [])

  function sendMessage({ nickname, text }) {
    if (socket.current) {
      socket.current.emit('chat_message', { nickname, text })
    }
  }

  function movePlayer({ nickname, position, rotation }) {
    if (socket.current) {
      socket.current.emit('player_move', { nickname, position, rotation })
    }
  }

  return { connected, messages, usersCount, players, sendMessage, movePlayer }
}

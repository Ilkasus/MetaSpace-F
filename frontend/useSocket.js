import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:5000'  // или твой продакшен url

export default function useSocket() {
  const socket = useRef(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [usersCount, setUsersCount] = useState(0)

  useEffect(() => {
    socket.current = io(SOCKET_URL, { transports: ['websocket'] })

    socket.current.on('connect', () => {
      setConnected(true)
    })

    socket.current.on('disconnect', () => {
      setConnected(false)
    })

    socket.current.on('message', (msg) => {
      setMessages((prev) => [...prev, msg])
    })

    socket.current.on('users_count', (count) => {
      setUsersCount(count)
    })

    return () => {
      socket.current.disconnect()
    }
  }, [])

  function sendMessage(msg) {
    if (socket.current) {
      socket.current.emit('message', msg)
    }
  }

  return { connected, messages, usersCount, sendMessage }
}

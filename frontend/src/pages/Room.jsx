import React, { useEffect, useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import io from 'socket.io-client'
import AncientRoom from '../three/AncientRoom'
import Avatar from '../three/Avatar'
import Player from '../components/Player'
import Chat from '../components/Chat'

const SOCKET_URL = 'https://metaspace-yhja.onrender.com'

function RemotePlayer({ position = [0, 0, 0], rotation = [0, 0, 0], nickname }) {
  return (
    <group position={position} rotation={rotation}>
      <Avatar nickname={nickname} scale={0.9} />
    </group>
  )
}

export default function Room() {
  const [socket, setSocket] = useState(null)
  const [players, setPlayers] = useState({})
  const [chatMessages, setChatMessages] = useState([])

  const nickname = localStorage.getItem('nickname')
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token || !nickname) {
      alert('Please login first')
      window.location.href = '/'
      return
    }

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      path: '/socket.io/',
      auth: { token },
    })

    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('[socket] Connected:', newSocket.id)
      newSocket.emit('join', { nickname })
    })

    newSocket.on('players_update', (playersData) => {
      setPlayers(playersData)
    })

    newSocket.on('chat_message', (message) => {
      setChatMessages((prev) => [...prev, message])
    })

    newSocket.on('disconnect', () => {
      console.log('[socket] Disconnected')
      setPlayers({})
      setChatMessages([])
    })

    newSocket.on('connect_error', (err) => {
      console.error('[socket] Connection error:', err.message)
    })

    return () => {
      newSocket.disconnect()
    }
  }, [nickname, token])

  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="flex-grow">
        <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
          <Suspense fallback={<mesh><boxGeometry /><meshStandardMaterial color="gray" /></mesh>}>
            <AncientRoom />

            {socket && <Player socket={socket} nickname={nickname} />}

            {Object.entries(players).map(([id, player]) =>
              id !== socket?.id &&
              player?.position &&
              player?.nickname ? (
                <RemotePlayer
                  key={id}
                  position={Object.values(player.position)}
                  rotation={player.rotation || [0, 0, 0]}
                  nickname={player.nickname}
                />
              ) : null
            )}
          </Suspense>
        </Canvas>
      </div>

      <div className="h-48 border-t">
        {socket && (
          <Chat socket={socket} messages={chatMessages} nickname={nickname} />
        )}
      </div>
    </div>
  )
}

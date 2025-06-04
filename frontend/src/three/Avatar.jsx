import React, { useEffect, useRef, useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import io from 'socket.io-client'
import * as THREE from 'three'

import AncientRoom from '../three/AncientRoom'
import Avatar from '../three/Avatar'
import Player from '../components/Player'
import Chat from '../components/Chat'
import { Text } from '@react-three/drei'

const SOCKET_URL = 'https://metaspace-yhja.onrender.com'

function PlayerAvatar({ position = [0, 0, 0], rotation = [0, 0, 0], nickname }) {
  const ref = useRef()

  useEffect(() => {
    if (ref.current) {
      ref.current.position.set(...position)
      ref.current.rotation.set(...rotation)
    }
  }, [position, rotation])

  return (
    <group ref={ref}>
      <Avatar scale={0.5} />
      <Text
        position={[0, 2.2, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {nickname}
      </Text>
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
      console.log('[socket] connected:', newSocket.id)
      newSocket.emit('join', { nickname })
    })

    newSocket.on('players_update', (playersData) => {
      setPlayers(playersData)
    })

    newSocket.on('chat_message', (message) => {
      setChatMessages((prev) => [...prev, message])
    })

    newSocket.on('disconnect', () => {
      console.log('[socket] disconnected')
      setPlayers({})
      setChatMessages([])
    })

    return () => {
      newSocket.disconnect()
    }
  }, [nickname, token])

  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="flex-grow">
        <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
          <Suspense fallback={null}>
            <AncientRoom />
            {socket && <Player socket={socket} nickname={nickname} />}
            {Object.entries(players).map(([id, player]) =>
              id !== socket?.id && player?.position ? (
                <PlayerAvatar
                  key={id}
                  position={player.position}
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

import React, { useEffect, useRef, useState, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import io from 'socket.io-client'

import AncientRoom from '../three/AncientRoom'
import Avatar from '../three/Avatar'
import Chat from '../components/Chat'
import { Text } from '@react-three/drei'

const SOCKET_URL = 'https://metaspace-yhja.onrender.com'

function PlayerControls({ socket, nickname }) {
  const { camera } = useThree()
  const ref = useRef()
  const position = useRef(new THREE.Vector3(0, 0, 0))
  const rotation = useRef(0)
  const keysPressed = useRef({})
  const speed = 0.1

  useEffect(() => {
    const downHandler = (e) => {
      keysPressed.current[e.key.toLowerCase()] = true
    }
    const upHandler = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false
    }

    window.addEventListener('keydown', downHandler)
    window.addEventListener('keyup', upHandler)

    return () => {
      window.removeEventListener('keydown', downHandler)
      window.removeEventListener('keyup', upHandler)
    }
  }, [])

  useFrame(() => {
    if (!ref.current) return

    const dir = new THREE.Vector3()
    if (keysPressed.current['w'] || keysPressed.current['arrowup']) dir.z -= 1
    if (keysPressed.current['s'] || keysPressed.current['arrowdown']) dir.z += 1
    if (keysPressed.current['a'] || keysPressed.current['arrowleft']) dir.x -= 1
    if (keysPressed.current['d'] || keysPressed.current['arrowright']) dir.x += 1

    if (dir.lengthSq() > 0) {
      dir.normalize()
      position.current.add(dir.multiplyScalar(speed))

      ref.current.position.copy(position.current)

      const camPos = new THREE.Vector3(
        position.current.x,
        position.current.y + 2,
        position.current.z + 5
      )
      camera.position.lerp(camPos, 0.1)
      camera.lookAt(position.current)

      if (socket && socket.connected) {
        socket.emit('player_move', {
          nickname,
          position: {
            x: position.current.x,
            y: position.current.y,
            z: position.current.z,
          }
        })
      }
    }
  })

  return (
    <group ref={ref} position={[0, 0, 0]}>
      <Avatar scale={0.5} />
      <Text
        position={[0, 2.2, 0]}
        fontSize={0.3}
        color="blue"
        anchorX="center"
        anchorY="middle"
      >
        {nickname}
      </Text>
    </group>
  )
}

function PlayerAvatar({ position, rotation, nickname }) {
  const ref = useRef()

  useFrame(() => {
    if (!ref.current) return

    ref.current.position.lerp(new THREE.Vector3(...position), 0.2)
    ref.current.rotation.y = rotation?.[1] ?? 0
  })

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
      auth: { token }
    })

    setSocket(newSocket)

    newSocket.on('players_update', setPlayers)
    newSocket.on('chat_message', (msg) => setChatMessages((prev) => [...prev, msg]))
    newSocket.on('connect', () => {
      console.log('[socket] connected:', newSocket.id)
      newSocket.emit('join', { nickname })
    })
    newSocket.on('disconnect', () => {
      console.log('[socket] disconnected')
    })

    return () => {
      newSocket.disconnect()
    }
  }, [token, nickname])

  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="flex-grow">
        <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
          <Suspense fallback={null}>
            <AncientRoom />

            {socket && <PlayerControls socket={socket} nickname={nickname} />}

            {/* Другие игроки */}
            {Object.entries(players).map(([id, player]) =>
              id !== socket?.id ? (
                <PlayerAvatar key={id} {...player} />
              ) : null
            )}
          </Suspense>
        </Canvas>
      </div>

      {/* Чат */}
      <div className="h-48 border-t">
        {socket && <Chat socket={socket} messages={chatMessages} nickname={nickname} />}
      </div>
    </div>
  )
}

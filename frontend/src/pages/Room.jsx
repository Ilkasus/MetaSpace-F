import React, { useEffect, useRef, useState, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import io from 'socket.io-client'

import AncientRoom from '../three/AncientRoom'
import Avatar from '../three/Avatar'
import Chat from '../components/Chat'
import { Text } from '@react-three/drei'

const SOCKET_URL = 'https://metaspace-yhja.onrender.com'

function PlayerControls({ socket }) {
  const { camera } = useThree()
  const ref = useRef()
  const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())
  const keysPressed = useRef({})
  const speed = 3

  useEffect(() => {
    const downHandler = (e) => keysPressed.current[e.key.toLowerCase()] = true
    const upHandler = (e) => keysPressed.current[e.key.toLowerCase()] = false

    window.addEventListener('keydown', downHandler)
    window.addEventListener('keyup', upHandler)

    return () => {
      window.removeEventListener('keydown', downHandler)
      window.removeEventListener('keyup', upHandler)
    }
  }, [])

  useFrame((_, delta) => {
    if (!ref.current) return

    velocity.current.set(0, 0, 0)
    if (keysPressed.current['w']) velocity.current.z -= speed * delta
    if (keysPressed.current['s']) velocity.current.z += speed * delta
    if (keysPressed.current['a']) velocity.current.x -= speed * delta
    if (keysPressed.current['d']) velocity.current.x += speed * delta

    direction.current.copy(velocity.current).applyEuler(camera.rotation)
    ref.current.position.add(direction.current)

    const pos = ref.current.position

    camera.position.lerp(new THREE.Vector3(pos.x, pos.y + 2, pos.z + 5), 0.1)
    camera.lookAt(pos)

    if (socket && socket.connected) {
      socket.emit('update_position', {
        position: [pos.x, pos.y, pos.z],
        rotation: [0, ref.current.rotation.y, 0]
      })
    }
  })

  return (
    <group ref={ref}>
      <Avatar scale={0.5} />
    </group>
  )
}

function PlayerAvatar({ position, rotation, nickname, isSelf }) {
  const ref = useRef()

  useFrame(() => {
    if (ref.current) {
      ref.current.position.lerp(new THREE.Vector3(...position), 0.2)
      ref.current.rotation.y = rotation[1]
    }
  })

  return (
    <group ref={ref}>
      <Avatar scale={0.5} />
      <Text
        position={[0, 2.2, 0]}
        fontSize={0.3}
        color={isSelf ? 'blue' : 'white'}
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
            {socket && <PlayerControls socket={socket} />}
            {Object.entries(players).map(([id, player]) => (
              id !== socket?.id && (
                <PlayerAvatar
                  key={id}
                  {...player}
                  isSelf={false}
                />
              )
            ))}
          </Suspense>
        </Canvas>
      </div>
      <div className="h-48 border-t">
        {socket && <Chat socket={socket} messages={chatMessages} nickname={nickname} />}
      </div>
    </div>
  )
}

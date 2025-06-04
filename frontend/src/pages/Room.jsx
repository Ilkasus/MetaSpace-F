import React, { useEffect, useRef, useState, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import AncientRoom from '../three/AncientRoom'
import Avatar from '../three/Avatar'
import Chat from '../components/Chat'
import io from 'socket.io-client'

const SOCKET_URL = 'https://metaspace-yhja.onrender.com'

function PlayerControls({ socket, playerId }) {
  const { camera } = useThree()
  const [position, setPosition] = useState(new THREE.Vector3(0, 0, 0))
  const [rotation, setRotation] = useState(new THREE.Euler(0, 0, 0))
  const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())
  const keysPressed = useRef({})

  useEffect(() => {
    function onKeyDown(e) {
      keysPressed.current[e.key.toLowerCase()] = true
    }
    function onKeyUp(e) {
      keysPressed.current[e.key.toLowerCase()] = false
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  useFrame((_, delta) => {
    const speed = 3
    velocity.current.set(0, 0, 0)

    if (keysPressed.current['w']) velocity.current.z -= speed * delta
    if (keysPressed.current['s']) velocity.current.z += speed * delta
    if (keysPressed.current['a']) velocity.current.x -= speed * delta
    if (keysPressed.current['d']) velocity.current.x += speed * delta

    direction.current.copy(velocity.current).applyEuler(camera.rotation)

    const newPos = position.clone().add(direction.current)
    setPosition(newPos)

    if (socket && playerId) {
      socket.emit('update_position', {
        position: [newPos.x, newPos.y, newPos.z],
        rotation: [camera.rotation.x, camera.rotation.y, camera.rotation.z]
      })
    }

    camera.position.copy(newPos).setY(1.6)
  })


  return null
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

    const socket = io(SOCKET_URL, { auth: { token } })
    setSocket(socket)

    socket.on('players_update', (players) => setPlayers(players))
    socket.on('chat_message', (message) => setChatMessages(prev => [...prev, message]))
    socket.on('connect', () => socket.emit('join', { nickname }))

    return () => socket.disconnect()
  }, [token, nickname])

  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="flex-grow">
        <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
          <Suspense fallback={null}>
            <AncientRoom />
            {socket && <PlayerControls socket={socket} playerId={socket.id} />}
            {Object.entries(players).map(([id, player]) => (
              <PlayerAvatar
                key={id}
                {...player}
                isSelf={id === socket?.id}
              />
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
      <mesh position={[0, 2.2, 0]}>
        <textGeometry args={[nickname, { size: 0.3, height: 0.05 }]} />
        <meshBasicMaterial color={isSelf ? 'blue' : 'white'} />
      </mesh>
    </group>
  )
}

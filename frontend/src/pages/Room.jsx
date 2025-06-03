import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState } from 'react'
import AncientRoom from '../three/AncientRoom'
import Avatar from '../three/Avatar'
import Chat from '../components/Chat'
import io from 'socket.io-client'
import * as THREE from 'three'
import { Text } from '@react-three/drei'

const SOCKET_URL = 'https://metaspace-yhja.onrender.com'

export default function Room() {
  const [socket, setSocket] = useState(null)
  const [players, setPlayers] = useState({}) // {id: {position, rotation, nickname}}
  const [chatMessages, setChatMessages] = useState([])
  const nickname = localStorage.getItem('nickname')
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token || !nickname) {
      alert('Please login first')
      window.location.href = '/'
      return
    }

    const socket = io(SOCKET_URL, {
      auth: { token }
    })

    setSocket(socket)

    socket.on('players_update', (players) => {
      setPlayers(players)
    })

    socket.on('chat_message', (message) => {
      setChatMessages((prev) => [...prev, message])
    })

    socket.on('connect', () => {
      socket.emit('join', { nickname })
    })

    return () => {
      socket.disconnect()
    }
  }, [token, nickname])

  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="flex-grow">
        <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
          <Suspense fallback={null}>
            <AncientRoom />
            {Object.entries(players).map(([id, player]) => (
              <PlayerAvatar
                key={id}
                id={id}
                {...player}
                isSelf={id === socket?.id}
                socket={socket}
              />
            ))}
          </Suspense>
        </Canvas>
      </div>
      <div className="h-48 border-t bg-gray-900">
        {socket && (
          <Chat socket={socket} messages={chatMessages} nickname={nickname} />
        )}
      </div>
    </div>
  )
}

function PlayerAvatar({ id, position, rotation, nickname, isSelf, socket }) {
  const ref = useRef()
  const velocity = useRef(new THREE.Vector3(0, 0, 0))
  const speed = 0.1

  useEffect(() => {
    if (!isSelf) return

    const keys = {}
    const onKeyDown = (e) => {
      keys[e.key.toLowerCase()] = true
    }
    const onKeyUp = (e) => {
      keys[e.key.toLowerCase()] = false
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [isSelf])

  useFrame(() => {
    if (!ref.current) return

    if (isSelf) {
      const direction = new THREE.Vector3()
      if (window.keys?.['w']) direction.z -= 1
      if (window.keys?.['s']) direction.z += 1
      if (window.keys?.['a']) direction.x -= 1
      if (window.keys?.['d']) direction.x += 1

      if (direction.length() > 0) {
        direction.normalize()
        direction.multiplyScalar(speed)

        ref.current.position.add(direction)

        const angle = Math.atan2(direction.x, direction.z)
        ref.current.rotation.y = angle

        socket.emit('update_position', {
          position: [ref.current.position.x, ref.current.position.y, ref.current.position.z],
          rotation: [ref.current.rotation.x, ref.current.rotation.y, ref.current.rotation.z],
        })
      }
    } else {
      ref.current.position.lerp(new THREE.Vector3(...position), 0.2)
      ref.current.rotation.y = rotation[1]
    }
  })

  return (
    <group ref={ref} position={isSelf ? undefined : position}>
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

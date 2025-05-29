import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState } from 'react'
import AncientRoom from '../three/AncientRoom'
import Avatar from '../three/Avatar' 
import Chat from '../components/Chat' 
import io from 'socket.io-client'
import * as THREE from 'three'

const SOCKET_URL = 'https://your-backend-domain.com' 

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
      setChatMessages(prev => [...prev, message])
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
              <PlayerAvatar key={id} {...player} isSelf={id === socket?.id} />
            ))}
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
      {/* Ник сверху аватара */}
      <mesh position={[0, 2.2, 0]}>
        <textGeometry args={[nickname, { size: 0.3, height: 0.05 }]} />
        <meshBasicMaterial color={isSelf ? 'blue' : 'white'} />
      </mesh>
    </group>
  )
}

import { useFrame } from '@react-three/fiber'
import { useRef, useEffect, useState } from 'react'
import { Vector3 } from 'three'

export default function Player({ socket, nickname }) {
  const ref = useRef()
  const keysPressed = useRef({})
  const [position, setPosition] = useState([0, 1, 0]) // немного выше пола
  const speed = 0.1

  const keyMap = {
    ArrowUp: 'forward',
    ArrowDown: 'backward',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    KeyW: 'forward',
    KeyS: 'backward',
    KeyA: 'left',
    KeyD: 'right'
  }

  useEffect(() => {
    const down = (e) => keysPressed.current[e.code] = true
    const up = (e) => keysPressed.current[e.code] = false

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)

    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useFrame(() => {
    if (!ref.current) return

    const direction = new Vector3()

    if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) direction.z -= 1
    if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) direction.z += 1
    if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) direction.x -= 1
    if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) direction.x += 1

    direction.normalize().multiplyScalar(speed)
    ref.current.position.add(direction)

    setPosition([
      ref.current.position.x,
      ref.current.position.y,
      ref.current.position.z
    ])

    if (socket && socket.connected) {
      socket.emit('player_move', {
        nickname,
        position: {
          x: ref.current.position.x,
          y: ref.current.position.y,
          z: ref.current.position.z
        }
      })
    }
  })

  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[1, 2, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

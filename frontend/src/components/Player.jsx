import { useFrame } from '@react-three/fiber'
import { useRef, useEffect, useState } from 'react'

export default function Player({ socket, nickname }) {
  const ref = useRef()
  const [position, setPosition] = useState([0, 1, 0]) // немного выше пола

  useFrame(() => {
    const speed = 0.1
    const keys = {
      ArrowUp: 'forward',
      ArrowDown: 'backward',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      KeyW: 'forward',
      KeyS: 'backward',
      KeyA: 'left',
      KeyD: 'right'
    }

    const pressed = {}
    for (const key in keys) {
      if (window.pressedKeys?.[key]) {
        pressed[keys[key]] = true
      }
    }

    if (pressed.forward) ref.current.position.z -= speed
    if (pressed.backward) ref.current.position.z += speed
    if (pressed.left) ref.current.position.x -= speed
    if (pressed.right) ref.current.position.x += speed

    setPosition([
      ref.current.position.x,
      ref.current.position.y,
      ref.current.position.z
    ])

    socket.emit('player_move', {
      nickname,
      position: {
        x: ref.current.position.x,
        y: ref.current.position.y,
        z: ref.current.position.z
      }
    })
  })

  useEffect(() => {
    const down = (e) => {
      if (!window.pressedKeys) window.pressedKeys = {}
      window.pressedKeys[e.code] = true
    }
    const up = (e) => {
      if (window.pressedKeys) window.pressedKeys[e.code] = false
    }

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)

    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[1, 2, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

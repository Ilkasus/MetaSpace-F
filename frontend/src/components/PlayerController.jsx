import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { Vector3 } from 'three'
import Avatar from '../three/Avatar'

export default function PlayerController({ socket }) {
  const ref = useRef()
  const { camera } = useThree()
  const speed = 0.05
  const [direction] = useState(new Vector3())

  const keys = useRef({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
  })

  useEffect(() => {
    const down = (e) => keys.current[e.code] = true
    const up = (e) => keys.current[e.code] = false
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useFrame(() => {
    if (!ref.current) return

    direction.set(0, 0, 0)
    if (keys.current.KeyW || keys.current.ArrowUp) direction.z -= 1
    if (keys.current.KeyS || keys.current.ArrowDown) direction.z += 1
    if (keys.current.KeyA || keys.current.ArrowLeft) direction.x -= 1
    if (keys.current.KeyD || keys.current.ArrowRight) direction.x += 1
    direction.normalize().multiplyScalar(speed)

    ref.current.position.add(direction)

    camera.position.lerp(
      new Vector3(
        ref.current.position.x,
        ref.current.position.y + 2,
        ref.current.position.z + 5
      ),
      0.1
    )
    camera.lookAt(ref.current.position)

    socket.emit('move', {
      position: [
        ref.current.position.x,
        ref.current.position.y,
        ref.current.position.z
      ],
      rotation: [0, ref.current.rotation.y, 0]
    })
  })

  return (
    <group ref={ref}>
      <Avatar scale={0.5} />
    </group>
  )
}

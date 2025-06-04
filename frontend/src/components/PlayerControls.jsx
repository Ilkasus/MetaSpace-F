import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import Avatar from '../three/Avatar'
import { Text } from '@react-three/drei'

export default function PlayerControls({ socket, nickname }) {
  const ref = useRef()
  const { camera } = useThree()
  const keys = useRef({})
  const direction = new THREE.Vector3()
  const speed = 0.1

  useEffect(() => {
    const handleKeyDown = (e) => (keys.current[e.code] = true)
    const handleKeyUp = (e) => (keys.current[e.code] = false)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame(() => {
    if (!ref.current) return

    direction.set(0, 0, 0)
    if (keys.current['KeyW'] || keys.current['ArrowUp']) direction.z -= 1
    if (keys.current['KeyS'] || keys.current['ArrowDown']) direction.z += 1
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) direction.x -= 1
    if (keys.current['KeyD'] || keys.current['ArrowRight']) direction.x += 1

    if (direction.lengthSq() > 0) {
      direction.normalize()
      ref.current.position.add(direction.clone().multiplyScalar(speed))

      const camTarget = new THREE.Vector3(
        ref.current.position.x,
        ref.current.position.y + 2,
        ref.current.position.z + 5
      )
      camera.position.lerp(camTarget, 0.1)
      camera.lookAt(ref.current.position)

      socket?.emit('player_move', {
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
    <group ref={ref}>
      <Avatar scale={0.5} />
      <Text position={[0, 2.2, 0]} fontSize={0.3} color="blue" anchorX="center" anchorY="middle">
        {nickname}
      </Text>
    </group>
  )
}

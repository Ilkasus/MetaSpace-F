import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import Avatar from '../three/Avatar'
import { Text } from '@react-three/drei'

export default function PlayerControls({ socket, nickname }) {
  const ref = useRef()
  const { camera } = useThree()
  const keysPressed = useRef({})
  const position = useRef(new THREE.Vector3(0, 0, 0))
  const speed = 0.1
  const direction = new THREE.Vector3()

  useEffect(() => {
    const downHandler = (e) => {
      keysPressed.current[e.code] = true
    }
    const upHandler = (e) => {
      keysPressed.current[e.code] = false
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

    direction.set(0, 0, 0)
    if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) direction.z -= 1
    if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) direction.z += 1
    if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) direction.x -= 1
    if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) direction.x += 1

    if (direction.lengthSq() > 0) {
      direction.normalize()
      position.current.add(direction.multiplyScalar(speed))
      ref.current.position.copy(position.current)

      // Камера плавно следует за игроком с небольшим смещением
      const camTargetPos = new THREE.Vector3(
        position.current.x,
        position.current.y + 2,
        position.current.z + 5
      )
      camera.position.lerp(camTargetPos, 0.1)
      camera.lookAt(position.current)

      // Отправляем позицию на сервер
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

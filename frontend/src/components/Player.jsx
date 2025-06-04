import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import Avatar from '../three/Avatar'
import { Text } from '@react-three/drei'

export default function Player({ socket, nickname }) {
  const group = useRef()
  const { camera } = useThree()
  const keys = useRef({})
  const velocity = useRef(new THREE.Vector3())

  const speed = 0.1
  const rotationSpeed = 0.05

  useEffect(() => {
    const onKeyDown = (e) => keys.current[e.code] = true
    const onKeyUp = (e) => keys.current[e.code] = false
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  useFrame((_, delta) => {
    if (!group.current) return

    const moveDirection = new THREE.Vector3()
    const rotation = group.current.rotation

    if (keys.current['KeyW']) moveDirection.z -= 1
    if (keys.current['KeyS']) moveDirection.z += 1
    if (keys.current['KeyA']) moveDirection.x -= 1
    if (keys.current['KeyD']) moveDirection.x += 1

    moveDirection.normalize().applyEuler(rotation)
    group.current.position.addScaledVector(moveDirection, speed)

    if (keys.current['ArrowLeft']) group.current.rotation.y += rotationSpeed
    if (keys.current['ArrowRight']) group.current.rotation.y -= rotationSpeed

    const camOffset = new THREE.Vector3(0, 2, 5).applyEuler(rotation)
    camera.position.lerp(group.current.position.clone().add(camOffset), 0.1)
    camera.lookAt(group.current.position)

    if (socket && socket.connected) {
      socket.emit('player_move', {
        nickname,
        position: {
          x: group.current.position.x,
          y: group.current.position.y,
          z: group.current.position.z
        },
        rotation: [
          group.current.rotation.x,
          group.current.rotation.y,
          group.current.rotation.z
        ]
      })
    }
  })

  return (
    <group ref={group} position={[0, 0, 0]}>
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

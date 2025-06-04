import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import Avatar from '../three/Avatar'
import { Text } from '@react-three/drei'

export default function Player({ socket, nickname }) {
  const ref = useRef()
  const { camera } = useThree()
  const keys = useRef({})
  const velocity = 0.12
  const turnSpeed = 0.05

  useEffect(() => {
    const handleKeyDown = (e) => keys.current[e.code] = true
    const handleKeyUp = (e) => keys.current[e.code] = false
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame(() => {
    if (!ref.current) return

    const direction = new THREE.Vector3()
    const rotation = ref.current.rotation
    const gp = navigator.getGamepads?.()[0]
    let axisX = 0, axisZ = 0, axisTurn = 0

    if (gp) {
      axisX = Math.abs(gp.axes[0]) > 0.1 ? gp.axes[0] : 0
      axisZ = Math.abs(gp.axes[1]) > 0.1 ? gp.axes[1] : 0
      axisTurn = Math.abs(gp.axes[2]) > 0.1 ? gp.axes[2] : 0
    }

    if (keys.current['KeyW']) direction.z -= 1
    if (keys.current['KeyS']) direction.z += 1
    if (keys.current['KeyA']) direction.x -= 1
    if (keys.current['KeyD']) direction.x += 1
    if (keys.current['ArrowLeft']) ref.current.rotation.y += turnSpeed
    if (keys.current['ArrowRight']) ref.current.rotation.y -= turnSpeed

    direction.x += axisX
    direction.z += axisZ
    ref.current.rotation.y -= axisTurn * turnSpeed

    direction.normalize().applyEuler(rotation)
    ref.current.position.addScaledVector(direction, velocity)

    const targetCamPos = ref.current.position.clone().add(new THREE.Vector3(0, 2, 5).applyEuler(rotation))
    camera.position.lerp(targetCamPos, 0.1)
    camera.lookAt(ref.current.position)

    socket?.connected && socket.emit('player_move', {
      nickname,
      position: {
        x: ref.current.position.x,
        y: ref.current.position.y,
        z: ref.current.position.z
      },
      rotation: [
        ref.current.rotation.x,
        ref.current.rotation.y,
        ref.current.rotation.z
      ]
    })
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

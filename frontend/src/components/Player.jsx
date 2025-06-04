import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Avatar from '../three/Avatar'

export default function Player({ socket, nickname }) {
  const ref = useRef()
  const { camera } = useThree()
  const keys = useRef({})
  const [thirdPerson, setThirdPerson] = useState(true)
  const velocity = 0.12
  const turnSpeed = 0.05
  const jumpSpeed = 0.18
  const gravity = 0.01
  const yVelocity = useRef(0)
  const isJumping = useRef(false)

  useEffect(() => {
    const handleKeyDown = e => {
      keys.current[e.code] = true
      if (e.code === 'KeyV') setThirdPerson(prev => !prev)
    }
    const handleKeyUp = e => keys.current[e.code] = false
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame(() => {
    if (!ref.current) return

    const dir = new THREE.Vector3()
    const rot = ref.current.rotation
    const gp = navigator.getGamepads?.()[0]
    let axisX = 0, axisZ = 0, axisTurn = 0
    let jumpPressed = keys.current['Space']

    if (gp) {
      axisX = Math.abs(gp.axes[0]) > 0.1 ? gp.axes[0] : 0
      axisZ = Math.abs(gp.axes[1]) > 0.1 ? gp.axes[1] : 0
      axisTurn = Math.abs(gp.axes[2]) > 0.1 ? gp.axes[2] : 0
      jumpPressed ||= gp.buttons?.[0]?.pressed
    }

    if (keys.current['KeyW']) dir.z -= 1
    if (keys.current['KeyS']) dir.z += 1
    if (keys.current['KeyA']) dir.x -= 1
    if (keys.current['KeyD']) dir.x += 1
    if (keys.current['ArrowLeft']) rot.y += turnSpeed
    if (keys.current['ArrowRight']) rot.y -= turnSpeed

    dir.x += axisX
    dir.z += axisZ
    rot.y -= axisTurn * turnSpeed
    dir.normalize().applyEuler(rot)
    ref.current.position.addScaledVector(dir, velocity)

    if (jumpPressed && !isJumping.current) {
      yVelocity.current = jumpSpeed
      isJumping.current = true
    }

    yVelocity.current -= gravity
    ref.current.position.y += yVelocity.current
    if (ref.current.position.y <= 0) {
      ref.current.position.y = 0
      yVelocity.current = 0
      isJumping.current = false
    }

    const camOffset = thirdPerson
      ? new THREE.Vector3(0, 2, 5)
      : new THREE.Vector3(0, 1.5, 0.1)
    const camTarget = ref.current.position.clone().add(camOffset.applyEuler(rot))
    camera.position.lerp(camTarget, 0.1)
    camera.lookAt(ref.current.position)

    socket?.connected && socket.emit('player_move', {
      nickname,
      position: {
        x: ref.current.position.x,
        y: ref.current.position.y,
        z: ref.current.position.z
      },
      rotation: [rot.x, rot.y, rot.z]
    })
  })

  return (
    <group ref={ref} position={[0, 0, 0]}>
      <Avatar nickname={nickname} />
    </group>
  )
}


import { useGLTF } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Avatar({ position = [0, 0, 0], nickname = 'Guest' }) {
  const { scene } = useGLTF('/models/Avatar.glb')
  const nameRef = useRef()

  useEffect(() => {
    if (nameRef.current) {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      context.font = '48px Arial'
      const textWidth = context.measureText(nickname).width
      canvas.width = textWidth
      canvas.height = 64
      context.font = '48px Arial'
      context.fillStyle = 'white'
      context.fillText(nickname, 0, 48)
      const texture = new THREE.CanvasTexture(canvas)
      nameRef.current.material.map = texture
      nameRef.current.material.transparent = true
      nameRef.current.material.needsUpdate = true
    }
  }, [nickname])

  return (
    <group position={position}>
      <primitive object={scene} scale={0.3} />
      <mesh ref={nameRef} position={[0, 2, 0]}>
        <planeGeometry args={[2, 0.5]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  )
}

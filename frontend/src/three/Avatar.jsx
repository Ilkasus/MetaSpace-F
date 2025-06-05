import { useGLTF } from '@react-three/drei'
import { useEffect, useRef, forwardRef } from 'react'
import * as THREE from 'three'

const Avatar = forwardRef(({ scale = 0.9, nickname = 'Guest' }, ref) => {
  const { scene } = useGLTF('/models/Avatar.glb')
  const clonedScene = scene.clone(true) 
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
    <group ref={ref}>
      <primitive object={clonedScene} scale={scale} />
      <mesh ref={nameRef} position={[0, 2.5, 0]}>
        <planeGeometry args={[2.5, 0.6]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  )
})

export default Avatar

import { useGLTF } from '@react-three/drei'
import { useEffect, useRef, forwardRef, useMemo } from 'react'
import * as THREE from 'three'

const Avatar = forwardRef(({ scale = 0.3, nickname = 'Guest' }, ref) => {
  const gltf = useGLTF('/models/Avatar.glb')

  const clonedScene = useMemo(() => gltf.scene.clone(true), [gltf.scene])

  const nameRef = useRef()

  useEffect(() => {
    if (!nickname || !nameRef.current) return

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
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.needsUpdate = true

    if (nameRef.current.material.map) {
      nameRef.current.material.map.dispose()
    }

    nameRef.current.material.map = texture
    nameRef.current.material.transparent = true
    nameRef.current.material.needsUpdate = true
  }, [nickname])

  return (
    <group ref={ref}>
      <primitive object={clonedScene} scale={scale * 3} />
      <mesh ref={nameRef} position={[0, 2, 0]}>
        <planeGeometry args={[2, 0.5]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  )
})

export default Avatar

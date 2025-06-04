import { Text } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

function PlayerAvatar({ position, rotation, nickname, isSelf }) {
  const ref = useRef()

  useFrame(() => {
    if (ref.current) {
      ref.current.position.lerp(new THREE.Vector3(...position), 0.2)
      ref.current.rotation.y = rotation[1]
    }
  })

  return (
    <group ref={ref}>
      <Avatar scale={0.5} />
      <Text
        position={[0, 2.2, 0]}
        fontSize={0.3}
        height={0.05}
        color={isSelf ? 'blue' : 'white'}
        anchorX="center"
        anchorY="middle"
      >
        {nickname}
      </Text>
    </group>
  )
}

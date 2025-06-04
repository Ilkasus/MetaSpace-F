import { useGLTF, extend } from '@react-three/drei'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import * as THREE from 'three'

extend({ TextGeometry })

export default function Avatar({ position = [0, 0, 0], nickname = "Guest" }) {
  const { scene } = useGLTF('/models/Avatar.glb')

  return (
    <group position={position}>
      <primitive object={scene} scale={0.3} />
      <mesh position={[0, 2, 0]}>
        <textGeometry args={[nickname, { size: 0.3, height: 0.05, curveSegments: 12 }]} />
        <meshBasicMaterial color="white" />
      </mesh>
    </group>
  )
}

import { useGLTF } from '@react-three/drei'

export default function AncientRoom() {
  const { scene } = useGLTF('/models/museum_room.glb')
  return <primitive object={scene} scale={0.5} />
}

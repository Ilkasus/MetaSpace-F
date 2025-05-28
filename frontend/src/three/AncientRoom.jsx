import { useGLTF } from '@react-three/drei'

export default function AncientRoom() {
  const { scene } = useGLTF('/museum_room.glb')
  return <primitive object={scene} scale={0.5} />
}

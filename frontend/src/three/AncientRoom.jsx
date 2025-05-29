import { useGLTF, OrbitControls } from '@react-three/drei'

export default function AncientRoom() {
  const { scene } = useGLTF('/models/museum_room.glb')

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 7]} intensity={1} />
      <primitive object={scene} scale={0.5} />
      <OrbitControls />
    </>
  )
}

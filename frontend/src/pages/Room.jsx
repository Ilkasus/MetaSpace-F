import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import AncientRoom from '../three/AncientRoom'

export default function Room() {
  return (
    <div className="w-screen h-screen">
      <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
        <Suspense fallback={null}>
          <AncientRoom />
        </Suspense>
      </Canvas>
    </div>
  )
}

import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-5xl font-bold mb-4">Welcome to MetaSpace</h1>
      <p className="text-lg text-gray-600 mb-8">
        Step into the future of professional collaboration in an ancient museum-inspired 3D metaverse.
      </p>
      <Link to="/room/1" className="bg-black text-white px-6 py-3 rounded-2xl hover:scale-105 transition">
        Enter Demo Room
      </Link>
    </div>
  )
}

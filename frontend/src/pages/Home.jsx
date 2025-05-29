import { useState } from "react"
import { useNavigate } from "react-router-dom"

const API_BASE = "https://metaspace-yhja.onrender.com"

export default function Home() {
  const [isLogin, setIsLogin] = useState(false)
  const [nickname, setNickname] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")

    const url = isLogin
  ? "https://metaspace-yhja.onrender.com/auth/login"
  : "https://metaspace-yhja.onrender.com/auth/register"


    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, password }),
      })

      let data
      try {
        data = await res.json()
      } catch {
        const text = await res.text()
        throw new Error(text || "Unknown error")
      }

      if (!res.ok) {
        throw new Error(data.detail || "Error")
      }

      localStorage.setItem("token", data.access_token)
      localStorage.setItem("nickname", data.nickname)
      navigate("/room/1") 
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white">
      <h1 className="text-5xl font-bold mb-4">Welcome to MetaSpace</h1>
      <p className="text-lg text-gray-300 mb-8 max-w-xl">
        Step into the future of professional collaboration in an ancient museum-inspired 3D metaverse.
      </p>

      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-2xl w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6">{isLogin ? "Login" : "Register"}</h2>

        <label className="block mb-4 text-left">
          <span className="text-gray-300">Nickname</span>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            className="w-full mt-1 p-2 rounded bg-gray-700 text-white"
          />
        </label>

        <label className="block mb-6 text-left">
          <span className="text-gray-300">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full mt-1 p-2 rounded bg-gray-700 text-white"
          />
        </label>

        {error && <div className="mb-4 text-red-400">{error}</div>}

        <button
          type="submit"
          className="w-full bg-indigo-600 py-3 rounded hover:bg-indigo-700 transition"
        >
          {isLogin ? "Login" : "Register"}
        </button>

        <button
          type="button"
          className="mt-4 underline text-sm text-gray-400 hover:text-gray-200"
          onClick={() => {
            setError("")
            setIsLogin(!isLogin)
          }}
        >
          {isLogin ? "Don't have an account? Register here" : "Already registered? Login here"}
        </button>
      </form>
    </div>
  )
}


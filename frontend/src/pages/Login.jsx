import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Login() {
  const [nickname, setNickname] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch("https://metaspace-yhja.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.detail || "Login failed")
        return
      }
      localStorage.setItem("token", data.access_token)
      localStorage.setItem("nickname", nickname)
      navigate("/")
    } catch {
      setError("Network error")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-20 p-6 border rounded">
      <h1 className="text-2xl mb-4">Login</h1>
      <input
        type="text"
        placeholder="Nickname"
        value={nickname}
        onChange={e => setNickname(e.target.value)}
        required
        className="w-full mb-4 p-2 border"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        className="w-full mb-4 p-2 border"
      />
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button type="submit" className="w-full p-2 bg-green-600 text-white rounded">Login</button>
    </form>
  )
}

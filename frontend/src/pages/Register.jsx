import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Register() {
  const [nickname, setNickname] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch("https://your-backend-domain.com/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.detail || "Registration failed")
        return
      }
      navigate("/login")
    } catch {
      setError("Network error")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-20 p-6 border rounded">
      <h1 className="text-2xl mb-4">Register</h1>
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
      <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded">Register</button>
    </form>
  )
}

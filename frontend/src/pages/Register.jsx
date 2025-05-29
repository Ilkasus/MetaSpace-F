import { useState } from "react"

export default function RegisterForm({ onSuccess, switchToLogin }) {
  const [nickname, setNickname] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch("https://metaspace-yhja.onrender.com/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.detail || "Registration failed")
        return
      }
      onSuccess()
    } catch {
      setError("Network error")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
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
      <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded mb-4">Register</button>
      <p className="text-center text-sm">
        Already have an account?{" "}
        <button type="button" onClick={switchToLogin} className="text-blue-600 underline">
          Login
        </button>
      </p>
    </form>
  )
}

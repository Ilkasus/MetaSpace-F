import { useState } from "react"

export default function LoginForm({ onSuccess, switchToRegister }) {
  const [nickname, setNickname] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)

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
      <button type="submit" className="w-full p-2 bg-green-600 text-white rounded mb-4">Login</button>
      <p className="text-center text-sm">
        Don't have an account?{" "}
        <button type="button" onClick={switchToRegister} className="text-green-600 underline">
          Register
        </button>
      </p>
    </form>
  )
}


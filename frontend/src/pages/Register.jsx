import { useState } from 'react'
import axios from 'axios'

export default function Register() {
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:8000/register', { nickname, password })
      alert('Registered successfully')
    } catch (err) {
      alert('Registration failed')
    }
  }

  return (
    <form onSubmit={handleRegister} className="p-4 space-y-2">
      <h2>Register</h2>
      <input placeholder="Nickname" value={nickname} onChange={e => setNickname(e.target.value)} className="border p-1" />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="border p-1" />
      <button type="submit" className="bg-blue-500 text-white p-1">Register</button>
    </form>
  )
}

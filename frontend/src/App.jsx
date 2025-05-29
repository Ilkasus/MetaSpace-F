import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Room from "./pages/Room"
import Login from "./pages/Login"
import Register from "./pages/Register"
import { useState, useEffect } from "react"
import { io } from "socket.io-client"

const socket = io("https://metaspace-yhja.onrender.com") 

export default function App() {
  const [players, setPlayers] = useState({})

  useEffect(() => {
    socket.on("players_update", (data) => {
      setPlayers(data)
    })

    return () => {
      socket.off("players_update")
    }
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:id" element={<Room socket={socket} players={players} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  )
}

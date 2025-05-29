import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Room from "./pages/Room"
import Login from "./pages/Login"
import Register from "./pages/Register"
import { useState, useEffect } from "react"
import { io } from "socket.io-client"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:id" element={<Room />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  )
}




const socket = io("https://your-backend-url:5000") // адрес backend/socket_server.py

function App() {
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
    <>
      {/*3D сцены и передача players*/}
    </>
  )
}

export default App

import { io } from 'socket.io-client'

const SOCKET_URL = 'https://metaspace-yhja.onrender.com:8000'

const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: true,
})

export default socket

import { useState, useEffect, useRef } from 'react'

export default function Chat({ socket, nickname }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    socket.on('receive_message', (msg) => {
      setMessages(prev => [...prev, msg])
    })

    return () => socket.off('receive_message')
  }, [socket])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function sendMessage(e) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return

    socket.emit('chat_message', { nickname, text: trimmed })
    setInput('')
  }

  return (
    <div className="flex flex-col h-full p-2 bg-gray-800 text-white">
      <div className="flex-grow overflow-auto mb-2">
        {messages.map((msg, i) => (
          <div key={i} className="mb-1">
            <strong>{msg.nickname}:</strong> {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-grow p-2 rounded text-black"
          placeholder="Type a message..."
        />
        <button type="submit" className="ml-2 px-4 bg-blue-600 rounded">
          Send
        </button>
      </form>
    </div>
  )
}

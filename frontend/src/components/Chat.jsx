import { useState, useEffect, useRef } from 'react'

export default function Chat({ socket, nickname }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const handleReceive = (msg) => {
      setMessages((prev) => [...prev, msg])
    }

    socket.on('receive_message', handleReceive)

    return () => {
      socket.off('receive_message', handleReceive)
    }
  }, [socket])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function sendMessage(e) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || !socket || !socket.connected) return

    const message = {
      nickname,
      text: trimmed,
      timestamp: Date.now()
    }

    socket.emit('chat_message', message)
    setInput('')
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-full p-2 bg-gray-800 text-white">
      <div className="flex-grow overflow-y-auto mb-2 space-y-1 text-sm">
        {messages.map((msg, i) => (
          <div key={i} className="flex flex-col">
            <span>
              <strong className="text-blue-400">{msg.nickname}</strong>{' '}
              <span className="text-gray-400 text-xs">
                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
              </span>
            </span>
            <span>{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="flex">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow p-2 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="ml-2 px-4 bg-blue-600 hover:bg-blue-700 rounded text-white"
        >
          Send
        </button>
      </form>
    </div>
  )
}

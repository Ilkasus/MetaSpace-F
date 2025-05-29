import { useState } from 'react'
import useSocket from '../hooks/useSocket'

export default function Chat() {
  const { connected, messages, usersCount, sendMessage } = useSocket()
  const [input, setInput] = useState('')

  const handleSend = (e) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage(input)
      setInput('')
    }
  }

  return (
    <div className="absolute bottom-4 left-4 w-80 p-3 bg-white/90 rounded-lg shadow-md text-sm text-black">
      <div className="font-bold mb-2">Live Chat ({usersCount} online)</div>
      <div className="h-40 overflow-y-auto border border-gray-300 p-2 bg-white rounded mb-2">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-1">
            {msg}
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="flex">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={connected ? 'Type a message...' : 'Connecting...'}
          className="flex-grow p-1 border border-gray-400 rounded-l"
          disabled={!connected}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 rounded-r disabled:bg-gray-400"
          disabled={!connected}
        >
          Send
        </button>
      </form>
    </div>
  )
}

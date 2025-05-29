import React, { useEffect, useState } from 'react'
import socket from '@/hooks/useSocket'

export default function LiveComments() {
  const [comments, setComments] = useState([])
  const [input, setInput] = useState('')

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to WS server')
    })

    socket.on('new_comment', (data) => {
      setComments((prev) => [...prev, data])
    })

    return () => {
      socket.off('connect')
      socket.off('new_comment')
    }
  }, [])

  function sendComment() {
    if (input.trim() === '') return

    const comment = { user: 'Guest', message: input }
    socket.emit('send_comment', comment)
    setInput('')
  }

  return (
    <div style={{ padding: 20, maxWidth: 400, background: '#eee', borderRadius: 8 }}>
      <h3>Live Comments</h3>
      <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 10 }}>
        {comments.map((c, i) => (
          <p key={i}><b>{c.user}:</b> {c.message}</p>
        ))}
      </div>
      <input
        type="text"
        placeholder="Enter comment"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 8 }}
      />
      <button onClick={sendComment} style={{ width: '100%', padding: 8 }}>
        Send
      </button>
    </div>
  )
}

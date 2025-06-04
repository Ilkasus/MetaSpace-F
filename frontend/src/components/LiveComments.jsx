import React, { useEffect, useState, useRef } from 'react'
import socket from '@/hooks/useSocket'

export default function LiveComments() {
  const [comments, setComments] = useState([])
  const [input, setInput] = useState('')
  const inputRef = useRef()
  const scrollRef = useRef()

  useEffect(() => {
    const handleConnect = () => {
      console.log('Connected to WS server')
    }

    const handleNewComment = (data) => {
      setComments((prev) => [...prev, data])
    }

    socket.on('connect', handleConnect)
    socket.on('new_comment', handleNewComment)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('new_comment', handleNewComment)
    }
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth'
    })
  }, [comments])

  function sendComment() {
    if (!input.trim()) return

    const comment = { user: 'Guest', message: input }

    if (socket && socket.connected) {
      socket.emit('send_comment', comment)
    }

    setInput('')
    inputRef.current?.focus()
  }

  return (
    <div style={{
      padding: 20,
      maxWidth: 400,
      background: '#f5f5f5',
      borderRadius: 8,
      fontFamily: 'sans-serif',
      boxShadow: '0 0 8px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ marginBottom: 10 }}>💬 Live Comments</h3>

      <div
        ref={scrollRef}
        style={{
          maxHeight: 200,
          overflowY: 'auto',
          marginBottom: 10,
          background: '#fff',
          padding: 10,
          borderRadius: 6,
          border: '1px solid #ccc'
        }}
      >
        {comments.map((c, i) => (
          <p key={i} style={{ margin: '4px 0' }}>
            <b>{c.user}:</b> {c.message}
          </p>
        ))}
      </div>

      <input
        ref={inputRef}
        type="text"
        placeholder="Enter comment"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{
          width: '100%',
          padding: 8,
          marginBottom: 8,
          borderRadius: 4,
          border: '1px solid #ccc'
        }}
        onKeyDown={(e) => e.key === 'Enter' && sendComment()}
      />
      <button
        onClick={sendComment}
        style={{
          width: '100%',
          padding: 8,
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer'
        }}
      >
        Send
      </button>
    </div>
  )
}

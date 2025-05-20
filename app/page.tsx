'use client' // si usas App Router

import api from '@/lib/axios'
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const socket = io('http://localhost:3003') // evitar reconexión múltiple

export default function Home() {
  const [mensaje, setMensaje] = useState('')
  const [mensajes, setMensajes] = useState<any[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    socket.on('connect', () => {
      setConnected(true)
      console.log('Conectado al socket:', socket.id)
    })

    socket.on('disconnect', () => {
      setConnected(false)
      console.log('Desconectado del socket')
    })

    socket.on('mensaje:recibido', (msg) => {
      setMensajes((prev) => [...prev, msg])
    })

    // Limpieza
    return () => {
      socket.off('mensaje:recibido')
    }
  }, [])

  const enviarMensaje = () => {
    if (mensaje.trim()) {
      socket.emit('mensaje:nuevo', mensaje.trim())
      setMensaje('')
    }
  }

  const getUsers = async () => {
    const res = await api.get('/api/users')
    return res.data
  }

  useEffect(() => {
    getUsers()
  }, [])

  return (
    <div style={{ padding: 32, maxWidth: 500, margin: '0 auto' }}>
      <h1>Chat en tiempo real</h1>
      <p>Estado: {connected ? 'Conectado ✅' : 'Desconectado ❌'}</p>

      <div style={{ margin: '20px 0' }}>
        <input
          type="text"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && enviarMensaje()}
          placeholder="Escribe tu mensaje"
          style={{ width: '100%', padding: 8 }}
        />
        <button onClick={enviarMensaje} style={{ marginTop: 8, padding: 8, width: '100%' }}>
          Enviar
        </button>
      </div>

      <div style={{ border: '1px solid #ccc', padding: 16, height: 300, overflowY: 'auto' }}>
        {mensajes.map((msg, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <strong>{msg.id === socket.id ? 'Yo' : msg.id.slice(0, 5)}:</strong>{' '}
            <span>{msg.texto}</span>
            <div style={{ fontSize: 10, color: '#888' }}>{new Date(msg.fecha).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

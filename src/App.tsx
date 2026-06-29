import { useEffect, useState } from 'react'
import './App.css'

type Health = { status: string; service: string }

function App() {
  const [health, setHealth] = useState<Health | null>(null)
  const [error, setError] = useState<string | null>(null)

  // On load, ask the backend if it's alive (proxied to :8080 by Vite).
  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: Health) => setHealth(data))
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div
      style={{
        fontFamily: 'system-ui, sans-serif',
        maxWidth: 640,
        margin: '4rem auto',
        padding: '0 1rem',
        lineHeight: 1.5,
      }}
    >
      <h1>TripStack 🧳</h1>
      <p>Trip-booking marketplace — frontend and backend are now connected.</p>

      <div
        style={{
          marginTop: '2rem',
          padding: '1rem 1.25rem',
          border: '1px solid #ddd',
          borderRadius: 8,
        }}
      >
        <strong>Backend status:</strong>{' '}
        {health ? (
          <span style={{ color: 'green' }}>
            ✅ connected — {health.service} ({health.status})
          </span>
        ) : error ? (
          <span style={{ color: 'crimson' }}>❌ not reachable — {error}</span>
        ) : (
          <span>⏳ checking…</span>
        )}
      </div>
    </div>
  )
}

export default App

import { useState } from 'react'

export default function App() {
  const [noticeText, setNoticeText] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const analyze = async () => {
    if (!noticeText.trim()) return
    
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noticeText })
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Notice Navigator</h1>
      <p>Understand your eviction notice in plain English</p>

      <textarea
        value={noticeText}
        onChange={(e) => setNoticeText(e.target.value)}
        placeholder="Paste your eviction notice here..."
        rows={10}
      />

      <button onClick={analyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze My Notice'}
      </button>

      {error && <p style={{color: 'red'}}>{error}</p>}

      {results && (
        <div>
          <h2>Summary</h2>
          <p>{results.summary}</p>

          <h2>Deadlines</h2>
          <ul>{results.deadlines.map((d, i) => <li key={i}>{d}</li>)}</ul>

          <h2>What Happens If You Do Nothing</h2>
          <p>{results.consequences}</p>

          <h2>Questions to Ask Legal Aid</h2>
          <ul>{results.questions.map((q, i) => <li key={i}>{q}</li>)}</ul>
        </div>
      )}
    </div>
  )
}
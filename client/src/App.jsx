import { useState } from 'react'
import './App.css'

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
    <div className="page">
      <div className="container">

        <div className="header">
          <h1>🏠 Notice Navigator</h1>
          <p className="tagline">Understand your eviction notice in plain English — quickly and clearly.</p>
        </div>

        <div className="disclaimer">
          ⚠️ <strong>This tool does not provide legal advice.</strong> It helps you understand
          what your notice says in plain language. Always verify with a licensed attorney
          or local legal aid organization. No data is stored.
        </div>

        <label className="label">Paste your eviction notice below</label>
        <textarea
          className="textarea"
          value={noticeText}
          onChange={(e) => setNoticeText(e.target.value)}
          placeholder="Paste the full text of your eviction notice here..."
        />

        <button
          className={`btn ${loading ? 'btn-disabled' : ''}`}
          onClick={analyze}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Analyze My Notice →'}
        </button>

        {error && <div className="error">⚠️ {error}</div>}

        {results && (
          <div className="results">

            <div className="card">
              <div className="card-title">📄 Plain English Summary</div>
              <p>{results.summary}</p>
            </div>

            <div className="card card-deadline">
              <div className="card-title">⏰ Critical Deadlines</div>
              <ul>
                {results.deadlines.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </div>

            <div className="card">
              <div className="card-title">⚠️ What Happens If You Do Nothing</div>
              <p>{results.consequences}</p>
            </div>

            <div className="card">
              <div className="card-title">💬 Questions to Ask Legal Aid</div>
              <ul>
                {results.questions.map((q, i) => <li key={i}>{q}</li>)}
              </ul>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
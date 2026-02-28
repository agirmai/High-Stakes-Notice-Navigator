import { useState } from 'react'
import './App.css'

export default function App() {
  const [noticeText, setNoticeText] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1]
      setImage({ base64, mimeType: file.type })
      setImagePreview(reader.result)
      setNoticeText('') // clear text if image is uploaded
    }
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    setImage(null)
    setImagePreview(null)
  }

  const analyze = async () => {
    if (!noticeText.trim() && !image) return

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const body = image
        ? { imageBase64: image.base64, mimeType: image.mimeType }
        : { noticeText }

      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
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
          onChange={(e) => {
            setNoticeText(e.target.value)
            if (e.target.value) clearImage()
          }}
          placeholder="Paste the full text of your eviction notice here..."
          disabled={!!image}
        />

        <div className="upload-row">
          <span className="or-text">or</span>
          <label className="upload-btn">
            📎 Upload a photo of your notice
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Uploaded notice" />
            <button className="clear-image" onClick={clearImage}>✕ Remove</button>
          </div>
        )}

        <button
          className={`btn ${loading ? 'btn-disabled' : ''}`}
          onClick={analyze}
          disabled={loading || (!noticeText.trim() && !image)}
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
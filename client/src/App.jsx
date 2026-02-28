import { useState } from 'react'
import './App.css'

const EXAMPLE_NOTICE = `UNLAWFUL DETAINER — NOTICE TO PAY RENT OR QUIT PURSUANT TO C.C.P. §1161(2)

TO: Occupant(s) and all persons in possession of the hereinafter described premises:

PREMISES: 247 Hollenbeck Avenue, Unit 3C, Los Angeles, California 90033

TAKE NOTICE that the rent for the above-described premises is in arrears in the following amount:

  Rental period: November 1, 2024 – November 30, 2024
  Monthly rental rate: $1,575.00
  Amount in default: $1,575.00
  Late fees accrued per Lease §6(b): $75.00
  TOTAL AMOUNT DUE AND OWING: $1,650.00

YOU ARE HEREBY REQUIRED, pursuant to California Civil Code §1946 and Code of Civil Procedure §1161 et seq., to do ONE of the following within THREE (3) DAYS after service of this notice, excluding Saturdays, Sundays, and judicial holidays:

  (1) Pay the full amount stated herein to the authorized agent of the lessor at the address designated below; OR
  (2) Vacate and surrender possession of the subject premises to the undersigned.

FAILURE TO COMPLY with the terms of this notice within the prescribed statutory period will result in the commencement of an Unlawful Detainer action against you in the Superior Court of the State of California, County of Los Angeles, wherein Lessor will seek:
  — Restitution of the premises
  — A writ of possession
  — A monetary judgment for all unpaid rent, holdover damages, attorney's fees pursuant to the subject lease agreement, and all costs of suit

Payment must be made in the form of cashier's check, money order, or certified funds only. Personal checks will NOT be accepted. Cash payments must be made in person at the address below and a receipt obtained.

Rent may be tendered to:
  Pacific Crest Property Associates, LLC
  Attn: Legal Collections Department
  8800 Wilshire Blvd., Suite 410
  Beverly Hills, CA 90211
  Hours: Monday–Friday, 9:00 AM – 4:00 PM

This notice has been served upon you in accordance with C.C.P. §1162 by the method indicated in the accompanying Proof of Service.

THIS IS A LEGAL DOCUMENT. IF YOU FAIL TO ACT WITHIN THE TIME STATED, YOU MAY BE EVICTED AND A COURT JUDGMENT MAY BE ENTERED AGAINST YOU, WHICH COULD AFFECT YOUR CREDIT AND YOUR ABILITY TO RENT IN THE FUTURE.

Dated this 5th day of November, 2024.

By: ___________________________
    Authorized Agent for Lessor
    Pacific Crest Property Associates, LLC`




const renderBold = (text) => {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  )
}
export default function App() {
  const [noticeText, setNoticeText] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [translated, setTranslated] = useState(false)


  const labels = translated ? {
  summary: '📄 Resumen en Español',
  deadlines: '⏰ Fechas Límite',
  consequences: '⚠️ Qué Pasa Si No Haces Nada',
  questions: '💬 Preguntas Para Pedir Ayuda Legal',
  legalAid: '🔍 Encuentra Ayuda Legal Cerca de Ti'
} : {
  summary: '📄 Plain English Summary',
  deadlines: '⏰ Critical Deadlines',
  consequences: '⚠️ What Happens If You Do Nothing',
  questions: '💬 Questions to Ask Legal Aid',
  legalAid: '🔍 Find Legal Help Near You'
}




  const translate = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:5000/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setResults(data)
      setTranslated(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1]
      setImage({ base64, mimeType: file.type })
      setImagePreview(reader.result)
      setNoticeText('')
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
    setTranslated(false)

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

        <div className="label-row">
          <label className="label">Paste your eviction notice below</label>
          <button className="example-btn" onClick={() => { setNoticeText(EXAMPLE_NOTICE); clearImage() }}>
            See an Example Notice!
          </button>
        </div>

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

            <div className="translate-row">
              {!translated
                ? <button className="translate-btn" onClick={translate} disabled={loading}>
                    🌐 Traducir al Español
                  </button>
                : <button className="translate-btn" onClick={() => { setTranslated(false); analyze() }} disabled={loading}>
                    🌐 Switch back to English
                  </button>
              }
            </div>

            <div className="card">
              <div className="card-title">{labels.summary}</div>
              <p>{renderBold(results.summary)}</p>
            </div>

            <div className="card card-deadline">
              <div className="card-title">{labels.deadlines}</div>
              <ul>
                {results.deadlines.map((d, i) => <li key={i}>{renderBold(d)}</li>)}
              </ul>
            </div>

            <div className="card">
              <div className="card-title">{labels.consequences}</div>
              <p>{renderBold(results.consequences)}</p>
            </div>

            <div className="card">
              <div className="card-title">{labels.questions}</div>
              <ul>
                {results.questions.map((q, i) => <li key={i}>{renderBold(q)}</li>)}
              </ul>
            </div>
            <div className="card card-legal-aid">
            <div className="card-title">{labels.legalAid}</div>
            <p>These organizations offer free or low-cost legal help for tenants facing eviction:</p>
            <ul>
              <li><a href="https://www.lawhelp.org" target="_blank" rel="noreferrer">LawHelp.org</a> — find free legal aid in your state</li>
              <li><a href="https://www.lsc.gov/about-lsc/what-legal-aid/get-legal-help" target="_blank" rel="noreferrer">Legal Services Corporation</a> — federally funded legal aid locator</li>
              <li><a href="https://www.illinoislegalaid.org" target="_blank" rel="noreferrer">Illinois Legal Aid Online</a> — if you're in Illinois</li>
            </ul>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
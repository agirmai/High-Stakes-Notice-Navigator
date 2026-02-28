import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

app.post('/analyze', async (req, res) => {
  const { noticeText } = req.body

  if (!noticeText) {
    return res.status(400).json({ error: 'No notice text provided' })
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `
      You are a plain-language legal translator helping a tenant understand an eviction notice.
      You do NOT give legal advice. You only explain what the notice says in simple terms.

      Analyze this eviction notice and respond ONLY with a JSON object in this exact format:
      {
        "summary": "A plain English summary written at a 6th grade reading level",
        "deadlines": ["deadline 1", "deadline 2"],
        "consequences": "What happens if the tenant does nothing",
        "questions": ["question to ask legal aid 1", "question 2", "question 3"]
      }

      Eviction notice:
      ${noticeText}
    `

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    res.json(parsed)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong analyzing the notice' })
  }
})

const PORT = 5000
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`)
})

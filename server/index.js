import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'

dotenv.config({ path: './server/.env' })
console.log('API KEY:', process.env.GEMINI_API_KEY)
const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const buildPrompt = (noticeText) => `
  You are helping a tenant who has no legal background understand an eviction notice.
  Write like you are explaining to a friend who is stressed and scared.
  Use simple, everyday words. Short sentences. No legal jargon.
  
  Use **double asterisks** around any deadlines, dollar amounts, and key action words (like "pay", "move out", "respond", "court").

  Analyze this eviction notice and respond ONLY with a JSON object in this exact format, no markdown backticks around the JSON itself:
  {
    "summary": "2-3 short sentences explaining what this notice means in plain everyday language",
    "deadlines": ["deadline 1 in plain language", "deadline 2 in plain language"],
    "consequences": "1-2 short sentences explaining what happens if they do nothing, in plain everyday language",
    "questions": ["simple question 1 to ask a lawyer", "simple question 2", "simple question 3"]
  }

  Eviction notice:
  ${noticeText}
`

app.post('/analyze', async (req, res) => {
  const { noticeText, imageBase64, mimeType } = req.body

  if (!noticeText && !imageBase64) {
    return res.status(400).json({ error: 'No notice text or image provided' })
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    let result

    if (imageBase64) {
      // vision mode — analyze the image directly
      result = await model.generateContent([
        {
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: imageBase64
          }
        },
        {
          text: `You are a plain-language legal translator helping a tenant understand an eviction notice.
          You do NOT give legal advice. You only explain what the notice says in simple terms.
          
          Read the eviction notice in this image and respond ONLY with a JSON object in this exact format, no markdown, no backticks:
          {
            "summary": "A plain English summary written at a 6th grade reading level",
            "deadlines": ["deadline 1", "deadline 2"],
            "consequences": "What happens if the tenant does nothing",
            "questions": ["question to ask legal aid 1", "question 2", "question 3"]
          }`
        }
      ])
    } else {
      // text mode
      result = await model.generateContent(buildPrompt(noticeText))
    }

    const text = result.response.text()
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    res.json(parsed)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong analyzing the notice' })
  }
})

app.post('/translate', async (req, res) => {
  const { results } = req.body

  if (!results) {
    return res.status(400).json({ error: 'No results to translate' })
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `
      Translate the following JSON object into Spanish.
      Keep the exact same JSON structure and keys.
      Only translate the values, not the keys.
      Respond ONLY with the JSON object, no markdown, no backticks.

      ${JSON.stringify(results)}
    `

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    res.json(parsed)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong translating' })
  }
})

const PORT = 5000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})
#  Notice Navigator

> Understand your eviction notice in plain English — quickly and clearly.

Notice Navigator is an AI-powered tool that helps tenants decode eviction notices. It transforms dense legal language into plain English summaries, extracts critical deadlines, explains consequences, and generates questions to bring to legal aid. Built for the people who need it most — renters with no legal background, facing the most time-sensitive moment of housing instability.

**This tool does not provide legal advice.** It provides clarity.

---

## Features

- **Plain English Summary** — rewrites the notice at a 6th grade reading level
- **Critical Deadlines** — extracts and highlights any dates or response windows
- **Consequences** — explains what happens if the tenant does nothing
- **Questions for Legal Aid** — generates clarifying questions to bring to a lawyer
- **Photo & PDF Upload** — analyze a notice from a photo or PDF using Gemini vision
- **Spanish Translation** — translate the full output with one click
- **No data stored** — everything is processed in memory, nothing is saved

---

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **AI:** Google Gemini API (`gemini-2.5-flash`)

---

## Getting Started

### Prerequisites
- Node.js installed
- A Google Gemini API key from [aistudio.google.com](https://aistudio.google.com)

### Installation

1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/notice-navigator.git
cd notice-navigator
```

2. Install dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

3. Add your API key
```bash
# Create server/.env
echo "GEMINI_API_KEY=your_key_here" > server/.env
```

4. Run the app
```bash
npm run dev
```

This starts both the frontend (`localhost:5173`) and backend (`localhost:5000`) with one command.

---

## Project Structure

```
notice-navigator/
  client/          ← React frontend
  server/
    index.js       ← Express server + Gemini API calls
    .env           ← API key (never committed)
  package.json     ← Root package with concurrently setup
```

---

## Why We Built This

Over 80% of low-income Americans face civil legal challenges without professional help. Eviction notices are written for courtrooms, not people — and tenants miss deadlines not because they don't care, but because they can't decode what's being asked of them.

Notice Navigator meets tenants at the moment before they know what questions to ask, and helps them take the first step toward getting real help.

---

## Disclaimer

This tool does not provide legal advice. It is intended as a first-step understanding tool only. Always verify information with a licensed attorney or local legal aid organization.

---

Built at EquiTech Hackathon 2026

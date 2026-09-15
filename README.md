# Edge Daily

AI-powered daily learning platform delivering beginner-friendly explanations of trending topics in AI, Web3, Fintech, and Energy.

## Overview

Edge Daily automatically generates educational content every weekday at 7:00 AM HKT, rotating through four key tech domains:
- **Monday:** AI
- **Tuesday:** Web3
- **Wednesday:** Fintech
- **Thursday:** Energy

Each post includes:
- Simple 2-3 paragraph explanation
- Real links to source articles for deeper learning
- AI-curated from recent news and developments

## Tech Stack

- **Frontend:** React + Vite + TypeScript + shadcn/ui
- **Backend:** Node.js + Express 5 + TypeScript
- **AI orchestration:** Mastra (agents + workflows)
- **Database:** SQLite
- **Models:** Anthropic Claude (Haiku + Sonnet) with web search
- **Automation:** node-cron for scheduled content generation

## Features

- 📅 Automated daily content generation
- 🔍 Web search integration for trending topics
- 📚 Archive with theme filtering
- 🎨 Clean, Notion-inspired UI
- ⚡ Breadcrumb navigation
- 📱 Responsive design

## Local Development

### Prerequisites
- Node.js v22.13+ (TypeScript in Node is used for Mastra)
- Anthropic API key

### Setup

1. Clone the repository:
```bash
git clone https://github.com/fabiooid/edge-daily.git
cd edge-daily
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd server
npm install
```

4. Create `.env` file in `server/` directory:
```
PORT=3001
ANTHROPIC_API_KEY=your_api_key_here
```

Optional later: Airtable vars for approved sources + eval logging.

5. Run the application:

Terminal 1 (Backend API + cron):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
npm run dev
```

Optional Terminal 3 (Mastra Studio, local):
```bash
cd server
npm run mastra:dev
```
Then open http://localhost:4111

Mastra HTTP endpoints are also mounted on the Express server at:
`http://localhost:3001/mastra` (agents, workflows, etc.)

6. Open http://localhost:5173 in your browser

### Manual Post Generation

```bash
cd server
npm run generate
# or with overrides:
node generate-post.ts Web3 2026-09-15
```

This runs the Mastra `generate-daily-post` workflow.

## Project Structure
```
edge-daily/
├── src/                         # React frontend (TypeScript)
├── server/
│   ├── server.ts                # Express API + Mastra adapter
│   ├── scheduler.ts             # Thin wrapper → Mastra workflow
│   ├── database.ts              # SQLite posts DB
│   ├── generate-post.ts         # CLI entry for generation
│   └── src/mastra/              # Mastra agents + workflow
│       ├── index.ts
│       ├── agents/
│       ├── workflows/
│       ├── tools/
│       └── lib/
└── README.md
```

## Deployment

Frontend: Vercel
Backend: Railway/Render

See deployment docs for detailed instructions.

## Built By

Created by Fabio Vella in Hong Kong, 2026

Powered by Anthropic Claude
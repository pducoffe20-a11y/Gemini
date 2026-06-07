<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Displacement Angle Finder — Claude Edition

A trigger-based sales sidekick for D2L AEs powered by Anthropic Claude. Ingests prospect spreadsheets, detects real-time competitor LMS displacement signals, and generates high-converting cold outreach emails.

## Models Used

- **Research & Web Search**: `claude-sonnet-4-6` with `web_search_20250305` server-side tool
- **Email & Data Generation**: `claude-haiku-4-5-20251001` via structured `tool_use`

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set `ANTHROPIC_API_KEY` in [.env.local](.env.local) to your Anthropic API key
3. Run the app:
   `npm run dev`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/research-lms` | Research competitor LMS for an organization |
| `POST` | `/api/parse-messy-file` | Parse uploaded CSV/JSON/PDF prospect files |
| `POST` | `/api/generate-outreach` | Generate personalized cold outreach email |
| `POST` | `/api/publish-email` | Save a generated email artifact (in-memory) |
| `GET` | `/api/email-artifacts` | List all saved email artifacts |
| `GET` | `/api/email-artifacts/:id` | Retrieve a specific email artifact |

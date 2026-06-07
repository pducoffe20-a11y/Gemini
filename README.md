<div align="center">
<img width="1200" height="475" alt="ClaudeBanner" src="https://www.anthropic.com/images/index/claude-og.jpg" />
</div>

# D2L Displacement Angle Finder — Claude Code Cloud Edition

This is the **Claude Code** rebuild of the original Gemini-based D2L outreach app.
It is a cloud-based, web-contained sales enablement tool for D2L AEs.

**What changed from the Gemini version:**
- `@google/genai` → `@anthropic-ai/sdk` (Anthropic Claude)
- `GEMINI_API_KEY` → `ANTHROPIC_API_KEY`
- `gemini-3.5-flash` → `claude-haiku-4-5-20251001` / `claude-sonnet-4-6`
- Structured output via `tool_use` instead of `responseMimeType: application/json`
- Web search via Claude's `web_search_20250305` server-side tool
- Added email artifact management (POST/GET `/api/email-artifacts`) adapted from the **Agents** repo `HtmlPublishingAgent`

**What stayed the same:**
- All business logic: LMS heuristics, pain points, customer stories, fallback generators
- All prompts (same sales email instructions)
- All UI components (React + Vite + Tailwind)
- Express server architecture

## Run Locally

**Prerequisites:** Node.js 20+

1. Install dependencies:
   ```
   npm install
   ```
2. Set `ANTHROPIC_API_KEY` in `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
3. Run the dev server:
   ```
   npm run dev
   ```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/research-lms` | Detect target org's LMS via Claude + web search |
| POST | `/api/generate-outreach` | Generate personalized cold email via Claude |
| POST | `/api/parse-messy-file` | Parse uploaded files into target list via Claude |
| POST | `/api/publish-email` | Save email as HTML artifact (Agents repo pattern) |
| GET | `/api/email-artifacts` | List all saved email artifacts |
| GET | `/api/email-artifacts/:id` | Retrieve a specific email artifact with HTML |

## Models Used

- **claude-sonnet-4-6** — research + web search (higher reasoning)
- **claude-haiku-4-5-20251001** — email generation + parsing (fast + cheap)

## Agents Repo Integration

The `/api/publish-email`, `/api/email-artifacts` endpoints implement the same
create/publish/list/retrieve semantics as `HtmlPublishingAgent` from the **Agents** repo,
adapted for cloud deployment using an in-memory store instead of the filesystem.

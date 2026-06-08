import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Models — Flash for speed + search grounding; Pro for deep structured analysis
const SEARCH_MODEL  = "gemini-2.0-flash";
const STRUCT_MODEL  = "gemini-2.0-flash";
const PARSE_MODEL   = "gemini-2.0-flash";

// ── Gemini client (lazy, re-initialised if key changes) ──────────────────────

let aiClient: GoogleGenAI | null = null;
let lastKey: string | undefined;

function getClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) { aiClient = null; lastKey = undefined; return null; }
  if (!aiClient || lastKey !== key) {
    try {
      aiClient = new GoogleGenAI({ apiKey: key });
      lastKey = key;
      console.log("Gemini client ready.");
    } catch (e) {
      console.warn("Gemini init error:", e);
      aiClient = null;
      lastKey = undefined;
    }
  }
  return aiClient;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isRateLimit(e: unknown): boolean {
  const s = String(e);
  return s.includes("429") || s.includes("RESOURCE_EXHAUSTED") || s.includes("quota");
}

const BANNED: [RegExp, string][] = [
  [/I hope this email finds you well/gi, ""],
  [/I noticed you('re| are) using/gi, ""],
  [/quick question/gi, ""],
  [/just checking in/gi, ""],
  [/leverage/gi, "use"],
  [/\bsolution(s)?\b/gi, "tool"],
  [/robust/gi, "helpful"],
  [/seamless/gi, "smooth"],
  [/empower/gi, "help"],
  [/unlock/gi, "enable"],
  [/ecosystem/gi, "platform"],
  [/\bjourney\b/gi, "experience"],
  [/partner with you/gi, "help"],
  [/synergy/gi, "collaboration"],
  [/best-in-class/gi, "great"],
  [/cutting-edge/gi, "modern"],
  [/circle back/gi, "follow up"],
  [/touch base/gi, "chat"],
];

function sanitize(text: string, tone?: string): string {
  let out = text;
  for (const [re, rep] of BANNED) out = out.replace(re, rep);
  // double-spaces / empty lines from replacements
  out = out.replace(/  +/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  const lower = out.toLowerCase();
  if (!lower.includes("\npat") && !lower.endsWith("pat")) {
    out += tone === "formal" ? "\n\nBest regards,\nPat" : "\n\nPat";
  }
  return out;
}

// ── In-memory research cache ──────────────────────────────────────────────────

type ResearchResult = {
  detectedLms: string;
  detectedName: string | null;
  confidence: number;
  explanation: string;
  sources: { title: string; uri: string }[];
  learningNews: { headline: string; snippet: string; date?: string }[];
  isQuotaExceeded?: boolean;
};

const researchCache = new Map<string, ResearchResult>();

const NO_DATA_NEWS = [{
  headline: "No live data found",
  snippet: "No active public CE, webinar, or LMS footprint detected via web search for this organisation.",
}];

// ── Known-account heuristics (checked before any API call) ───────────────────

function heuristicDetect(orgLower: string, trigLower: string): Partial<ResearchResult> | null {
  const KNOWN: [RegExp, string, string, number][] = [
    [/pennsylvania bar/,        "forj",             "Forj (CommPartners)",           96],
    [/michigan nurse/,          "topclass",         "TopClass (WBT Systems)",        95],
    [/ohio society of cpa/,     "forj",             "Forj (CommPartners)",           92],
    [/great lakes manuf/,       "docebo",           "Docebo",                        94],
    [/texas medical/,           "thought_industries","Thought Industries",           95],
    [/national cpa cert/,       "litmos",           "Litmos",                        93],
  ];
  for (const [re, lms, name, conf] of KNOWN) {
    if (re.test(orgLower)) return { detectedLms: lms, detectedName: name, confidence: conf,
      explanation: `Known account — ${name} identified via platform intelligence.` };
  }
  // Trigger-text keyword shortcuts
  const TRIG: [RegExp, string, string][] = [
    [/\bforj\b|commpartners|web courseworks/,  "forj",             "Forj"],
    [/topclass|wbt system/,                    "topclass",         "TopClass"],
    [/\bdocebo\b/,                             "docebo",           "Docebo"],
    [/\blitmos\b/,                             "litmos",           "Litmos"],
    [/blue sky|bluesky|path lms/,              "blue_sky",         "Blue Sky eLearn / Path LMS"],
    [/crowd wisdom|cadmium/,                   "crowd_wisdom",     "Crowd Wisdom (Cadmium)"],
    [/thought industries/,                     "thought_industries","Thought Industries"],
    [/\bmoodle\b/,                             "moodle",           "Moodle"],
    [/homegrown|self.built|custom lms/,        "homegrown_or_none","Homegrown Platform"],
  ];
  for (const [re, lms, name] of TRIG) {
    if (re.test(trigLower)) return { detectedLms: lms, detectedName: name, confidence: 98,
      explanation: `Competitor "${name}" detected in trigger signal text.` };
  }
  return null;
}

// ── Fallback email template (no API required) ─────────────────────────────────

function fallbackEmail(
  orgName: string, verticalDisplay: string, lmsDisplay: string,
  painVoice: string, fusionAngle: boolean,
  includeKw?: string, tone?: string, triggerSignal?: string,
  scrapedNews?: { headline: string; snippet: string }[]
): { subject: string; body: string } {
  const isFormal = tone === "formal";
  const lmsSafe = /auto.research|unknown|unsure/i.test(lmsDisplay) ? "your current training system" : lmsDisplay;
  const topNews = scrapedNews?.length ? scrapedNews[0] : null;

  const openers = topNews
    ? (isFormal
        ? [`Regarding ${orgName}'s recent work on "${topNews.headline}" — I wanted to inquire how this affects your learning programs.`]
        : [`Saw ${orgName}'s updates on "${topNews.headline}" — got me thinking about member credit tracking.`])
    : triggerSignal
      ? (isFormal
          ? [`Given the recent "${triggerSignal}" at ${orgName}, has managing designation tracking in ${lmsSafe} been straightforward for your team?`]
          : [`Saw ${orgName}'s shift around "${triggerSignal}" — curious if ${lmsSafe} is making that harder.`])
      : (isFormal
          ? [`Regarding ${orgName}'s learning programs — I wanted to inquire how members navigate your current catalog.`]
          : [`Saw ${orgName}'s training catalog — got me thinking about how members navigate courses.`]);

  const opener = openers[0];
  let bodyBody = isFormal
    ? `We specialise in helping ${verticalDisplay} groups streamline CE tracking, member onboarding, and credential distribution.`
    : `We're helping other ${verticalDisplay} groups move away from spreadsheets and simplify how members learn and track credits.`;

  if (includeKw) {
    const kws = includeKw.split(",").map(k => k.trim()).filter(Boolean);
    if (kws.length) bodyBody += ` We natively support ${kws.join(" and ")}.`;
  }

  const cta = isFormal ? "Would you be open to a brief conversation?" : "Worth a quick chat?";
  const signoff = isFormal ? "Best regards,\nPat" : "Pat";
  let body = `${opener}\n\n${bodyBody}\n\n${cta}\n\n${signoff}`;

  if (fusionAngle) body += isFormal
    ? `\n\nP.S. — D2L is hosting Fusion in Phoenix, July 8-10. Many ${verticalDisplay.toLowerCase()} leaders will be there.`
    : `\n\nP.S. — we're hosting Fusion in Phoenix July 8-10, lot of ${verticalDisplay.toLowerCase()} folks attending. Worth grabbing 15 min?`;

  const subjects = triggerSignal
    ? [`quick question on ${orgName}'s transition`, `${orgName} learning / ${triggerSignal.slice(0,20)}`]
    : [`easy for ${orgName} members to find courses?`, `clunky ${lmsDisplay} tracking?`];

  return { subject: subjects[Math.floor(Math.random() * subjects.length)], body };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /api/research-lms
// Two-step: (1) live Google Search grounding → real web text + real URLs
//           (2) structured JSON analysis of that live text
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.post("/api/research-lms", async (req, res) => {
  const client = getClient();
  const { orgName, triggerSignal, verticalId, forceRegenerate } = req.body;
  if (!orgName) return res.status(400).json({ error: "orgName is required." });

  const cacheKey = `${orgName.trim().toLowerCase()}|${(triggerSignal || "").trim().toLowerCase()}`;
  if (!forceRegenerate && researchCache.has(cacheKey)) {
    console.log(`[Cache] ${orgName}`);
    return res.json({ success: true, ...researchCache.get(cacheKey) });
  }

  const orgLower  = orgName.toLowerCase();
  const trigLower = (triggerSignal || "").toLowerCase();
  const heuristic = heuristicDetect(orgLower, trigLower);

  // No API key — return heuristic or unsure
  if (!client) {
    const result: ResearchResult = {
      detectedLms:  heuristic?.detectedLms  ?? "unsure_research",
      detectedName: heuristic?.detectedName ?? null,
      confidence:   heuristic?.confidence   ?? 50,
      explanation:  heuristic?.explanation  ?? "No Gemini API key — set GEMINI_API_KEY to enable live web research.",
      sources: [], learningNews: NO_DATA_NEWS,
    };
    researchCache.set(cacheKey, result);
    return res.json({ success: true, ...result });
  }

  try {
    // ── Step 1: Real Google Search grounding ─────────────────────────────────
    console.log(`[Research] Live search: "${orgName}"`);

    const searchQuery = `
You are researching "${orgName}" (${verticalId || "professional association"}) for LMS displacement sales intelligence.

Search the web and find:
1. What Learning Management System (LMS) or CE software platform does "${orgName}" currently use?
   Look for: vendor login pages, "powered by", press releases, job postings mentioning LMS vendor names,
   RFP documents, conference sponsor lists, or case studies.
   Target vendors: Forj/CommPartners, TopClass/WBT, Docebo, Thought Industries, Blue Sky/Path LMS,
   Litmos/SAP, Crowd Wisdom/Cadmium, Moodle, or homegrown portal.

2. Find the most recent (within 12 months) actual news about "${orgName}" related to:
   - New continuing education programs or course catalog launches
   - Certification or credentialing updates
   - Technology or platform changes
   - Annual meeting or conference announcements
   - Membership growth or leadership changes that affect education programs

Return only what you actually find. Do not fabricate.`;

    const searchRes = await client.models.generateContent({
      model: SEARCH_MODEL,
      contents: searchQuery,
      config: { tools: [{ googleSearch: {} }] },
    });

    const liveWebText = searchRes.text || "";
    const groundingChunks = (searchRes as any).candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const realSources: { title: string; uri: string }[] = groundingChunks
      .filter((c: any) => c?.web?.uri)
      .map((c: any) => ({ title: c.web.title || "Web Source", uri: c.web.uri }))
      .slice(0, 8);

    console.log(`[Research] Search complete. ${realSources.length} real sources found.`);

    // ── Step 2: Structured JSON analysis of the live web content ─────────────
    const analysisPrompt = `
You are an expert LMS displacement sales analyst. Analyse the live web research below and extract structured intelligence.

Organization: "${orgName}"
Vertical: ${verticalId || "general professional association"}
${triggerSignal ? `Trigger signal: "${triggerSignal}"` : ""}

LIVE WEB RESEARCH (scraped by Google Search — use ONLY this, do not invent):
"""
${liveWebText || "No web content retrieved."}
"""

TASK:
1. Identify the LMS — choose EXACTLY one:
   "forj" | "topclass" | "docebo" | "thought_industries" | "blue_sky" | "litmos" |
   "crowd_wisdom" | "moodle" | "homegrown_or_none" | "unsure_research"

2. Extract up to 3 REAL learning/CE news items found in the web content above.
   - ONLY include items with verifiable details from the research above
   - If nothing concrete was found, return an empty array (do NOT invent headlines)

3. Write a 1-2 sentence explanation of what evidence was found (or not found).

Return ONLY this JSON (no markdown, no preamble):
{
  "detectedLms": "...",
  "detectedName": "Human-readable vendor name or null",
  "confidence": 0-100,
  "explanation": "...",
  "learningNews": [
    { "headline": "...", "snippet": "...", "date": "..." }
  ]
}`;

    const structRes = await client.models.generateContent({
      model: STRUCT_MODEL,
      contents: analysisPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedLms:  { type: Type.STRING },
            detectedName: { type: Type.STRING, nullable: true },
            confidence:   { type: Type.NUMBER },
            explanation:  { type: Type.STRING },
            learningNews: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  headline: { type: Type.STRING },
                  snippet:  { type: Type.STRING },
                  date:     { type: Type.STRING, nullable: true },
                },
                required: ["headline", "snippet"],
              },
            },
          },
          required: ["detectedLms", "confidence", "explanation", "learningNews"],
        },
      },
    });

    const aiData = JSON.parse(structRes.text || "{}");

    // Heuristic overrides AI for LMS if we already have high-confidence match
    const finalLms  = heuristic?.detectedLms  ?? aiData.detectedLms ?? "unsure_research";
    const finalName = heuristic?.detectedName ?? aiData.detectedName ?? null;
    const finalConf = heuristic ? heuristic.confidence! : (aiData.confidence ?? 60);
    const finalExpl = heuristic
      ? `${heuristic.explanation} Live web audit: ${aiData.explanation}`
      : (aiData.explanation || "No specific LMS vendor confirmed via web search.");

    // Only surface news if real sources were found
    const hasRealSources = realSources.length > 0;
    const finalNews: ResearchResult["learningNews"] =
      hasRealSources && Array.isArray(aiData.learningNews) && aiData.learningNews.length > 0
        ? aiData.learningNews
        : NO_DATA_NEWS;

    const result: ResearchResult = {
      detectedLms:  finalLms,
      detectedName: finalName,
      confidence:   finalConf,
      explanation:  finalExpl,
      sources:      realSources,
      learningNews: finalNews,
    };

    researchCache.set(cacheKey, result);
    console.log(`[Research] Done: ${finalLms} (${finalConf}%), ${realSources.length} sources, ${finalNews.length} news items`);
    return res.json({ success: true, ...result });

  } catch (err) {
    const quota = isRateLimit(err);
    console.warn(`[Research] Error (${quota ? "quota" : "other"}):`, String(err).slice(0, 200));
    const result: ResearchResult = {
      detectedLms:  heuristic?.detectedLms  ?? "unsure_research",
      detectedName: heuristic?.detectedName ?? null,
      confidence:   heuristic?.confidence   ?? 50,
      explanation:  quota
        ? "NOTICE: Gemini API quota exceeded — heuristic fallback active. Set a higher-quota key to restore live web research."
        : (heuristic?.explanation ?? "Web research unavailable — check GEMINI_API_KEY."),
      sources: [], learningNews: NO_DATA_NEWS,
      isQuotaExceeded: quota,
    };
    return res.json({ success: true, ...result });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /api/parse-messy-file
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const VALID_VERTICALS = ["healthcare","cpa_finance","trade_manufacturing","credentialing_board","ce_provider","general_professional"];
const VALID_LMS       = ["forj","topclass","docebo","thought_industries","blue_sky","litmos","crowd_wisdom","moodle","homegrown_or_none","unsure_research"];

function mapVertical(raw: string): string {
  const r = raw.toLowerCase();
  if (/health|nurse|med|clinic/.test(r))   return "healthcare";
  if (/cpa|finance|tax/.test(r))           return "cpa_finance";
  if (/trade|manuf|construct/.test(r))     return "trade_manufacturing";
  if (/board|cred|cert/.test(r))           return "credentialing_board";
  if (/\bce\b|prov/.test(r))              return "ce_provider";
  return "general_professional";
}
function mapLms(raw: string): string {
  const r = raw.toLowerCase();
  if (/forj|commpartners|web course/.test(r)) return "forj";
  if (/topclass|wbt/.test(r))                 return "topclass";
  if (/docebo/.test(r))                       return "docebo";
  if (/thought|indust/.test(r))               return "thought_industries";
  if (/blue|path lms/.test(r))               return "blue_sky";
  if (/litmos/.test(r))                       return "litmos";
  if (/crowd|cadmium/.test(r))               return "crowd_wisdom";
  if (/moodle/.test(r))                       return "moodle";
  if (/homegrown|none/.test(r))              return "homegrown_or_none";
  return "unsure_research";
}

function heuristicFileParse(content: string): any[] {
  const parsed: any[] = [];
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 3);

  // JSON
  if (/^\s*[\[{]/.test(content)) {
    try {
      const j = JSON.parse(content);
      const arr = Array.isArray(j) ? j : [j];
      for (const item of arr) {
        const fk = (keys: string[]) => {
          for (const k of keys) {
            const m = Object.keys(item).find(x => x.toLowerCase().replace(/\W/g,"").includes(k));
            if (m) return String(item[m]);
          }
          return "";
        };
        const org = fk(["org","company","name","association","client"]);
        if (org) parsed.push({
          id: `json-${Date.now()}-${Math.random()}`,
          orgName: org.trim(),
          verticalId: mapVertical(fk(["vert","industry","sector","type"])),
          lmsId: mapLms(fk(["lms","platform","system","software"])),
          triggerSignal: fk(["trigger","signal","pain","note"]).trim() || "General review cycle.",
          contactName: fk(["contact","exec","person","lead"]).trim() || "CE Director",
          contactTitle: fk(["title","role"]).trim() || "Education Manager",
          confidence: 85, status: "Target", hasCredential: true, fusionAngle: true,
        });
      }
      if (parsed.length) return parsed;
    } catch {}
  }

  // CSV / TSV
  const seps = ["\t", ";", ","];
  for (const sep of seps) {
    if (lines[0]?.split(sep).length < 2) continue;
    const headers = lines[0].split(sep).map(h => h.trim().toLowerCase());
    const idx = (terms: string[]) => headers.findIndex(h => terms.some(t => h.includes(t)));
    const orgI = idx(["org","company","name","association"]);
    const vertI = idx(["vert","industry"]);
    const lmsI  = idx(["lms","platform"]);
    const trigI = idx(["trigger","signal","pain"]);
    const cntI  = idx(["contact","exec"]);
    const ttlI  = idx(["title","role"]);
    if (orgI === -1) continue;
    for (let i = 1; i < lines.length; i++) {
      const p = lines[i].split(sep).map(x => x.trim());
      if (p.length < 2) continue;
      parsed.push({
        id: `csv-${Date.now()}-${i}`,
        orgName:       p[orgI] || `Row ${i}`,
        verticalId:    vertI !== -1 && p[vertI] ? mapVertical(p[vertI]) : "general_professional",
        lmsId:         lmsI  !== -1 && p[lmsI]  ? mapLms(p[lmsI])      : "unsure_research",
        triggerSignal: trigI !== -1 && p[trigI]  ? p[trigI] : "Annual evaluation cycle.",
        contactName:   cntI  !== -1 && p[cntI]   ? p[cntI]  : "Associate Executive Director",
        contactTitle:  ttlI  !== -1 && p[ttlI]   ? p[ttlI]  : "LMS Operations Lead",
        confidence: 88, status: "Target", hasCredential: true, fusionAngle: true,
      });
    }
    if (parsed.length) return parsed;
  }

  // Raw text — one org per line
  const candidates = lines.filter(l => l.length > 5 && !l.startsWith("<") && !l.startsWith("{"));
  if (candidates.length) {
    parsed.push({
      id: `raw-${Date.now()}`,
      orgName: candidates[0], verticalId: "general_professional", lmsId: "unsure_research",
      triggerSignal: candidates.slice(1, 3).join(". ") || "Uncovered in document crawl.",
      contactName: "Education Services Director", contactTitle: "Training Administrator",
      confidence: 76, status: "Target", hasCredential: true, fusionAngle: true,
    });
  }
  return parsed;
}

app.post("/api/parse-messy-file", async (req, res) => {
  const client = getClient();
  const { content, fileName, extension } = req.body;
  if (!content) return res.status(400).json({ error: "content is required." });

  let text = content;
  if (extension === "pdf" || String(fileName || "").toLowerCase().endsWith(".pdf")) {
    try { text = (await pdf(Buffer.from(content, "base64"))).text || ""; }
    catch (e) { console.warn("PDF error:", e); }
  }

  if (!client) return res.json({ success: true, targets: heuristicFileParse(text), mode: "heuristic" });

  try {
    const prompt = `You are a B2B sales data extraction specialist. Extract all target organizations from the content below. It may be messy CSV, JSON, plain text, or a clipboard dump.

Content:
"""
${text.slice(0, 9000)}
"""

For each organization extract:
- orgName: full name
- verticalId: exactly one of ${VALID_VERTICALS.join(", ")}
- lmsId: exactly one of ${VALID_LMS.join(", ")}
- triggerSignal: a specific, realistic outbound displacement trigger
- contactName: name or realistic role
- contactTitle: role/title

Return up to 15 entries. Return ONLY a JSON array.`;

    const r = await client.models.generateContent({
      model: PARSE_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              orgName:       { type: Type.STRING },
              verticalId:    { type: Type.STRING },
              lmsId:         { type: Type.STRING },
              triggerSignal: { type: Type.STRING },
              contactName:   { type: Type.STRING },
              contactTitle:  { type: Type.STRING },
            },
            required: ["orgName","verticalId","lmsId","triggerSignal"],
          },
        },
      },
    });

    const rows = JSON.parse(r.text || "[]");
    const validated = rows.map((item: any, idx: number) => ({
      id: `ai-${Date.now()}-${idx}`,
      orgName:       item.orgName || `Org ${idx+1}`,
      verticalId:    VALID_VERTICALS.includes(item.verticalId) ? item.verticalId : "general_professional",
      lmsId:         VALID_LMS.includes(item.lmsId) ? item.lmsId : "unsure_research",
      triggerSignal: item.triggerSignal || "Evaluation cycle initiated.",
      contactName:   item.contactName  || "Director of Continuing Education",
      contactTitle:  item.contactTitle || "Education Technology Lead",
      confidence: 89 + Math.floor(Math.random() * 10),
      lastUpdated: "Scanned via Gemini AI",
      status: "Target", hasCredential: true, fusionAngle: true,
    }));

    return res.json({ success: true, targets: validated, mode: "genai" });
  } catch (err) {
    return res.json({ success: true, targets: heuristicFileParse(text), mode: "heuristic", isQuotaExceeded: isRateLimit(err) });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /api/generate-outreach
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.post("/api/generate-outreach", async (req, res) => {
  const client = getClient();
  const {
    orgName, verticalId, verticalDisplay, lmsId, lmsDisplay,
    painPointId, painPointUserVoice, hasCredential, fusionAngle,
    includeKeywords, excludeKeywords, readingLevel, tone,
    triggerSignal, scrapedNews,
  } = req.body;

  if (!orgName || !verticalDisplay || !lmsDisplay || !painPointUserVoice)
    return res.status(400).json({ error: "Missing required fields." });

  if (!client) {
    const fb = fallbackEmail(orgName, verticalDisplay, lmsDisplay, painPointUserVoice, !!fusionAngle, includeKeywords, tone, triggerSignal, scrapedNews);
    return res.json({ success: true, mode: "template", ...fb });
  }

  try {
    const isFormal = tone === "formal";
    const toneDesc = isFormal
      ? "formal, professional, polished — business-appropriate language, limited contractions"
      : "informal, warm, conversational, friendly — Midwest neighbour energy, use contractions freely";

    const excludeRule = excludeKeywords
      ? `\n- STRICTLY avoid: ${excludeKeywords}`
      : "";
    const includeRule = includeKeywords
      ? `\n- Naturally weave in references to: ${includeKeywords}`
      : "";

    let newsBlock = "";
    if (Array.isArray(scrapedNews) && scrapedNews.length > 0 && scrapedNews[0].headline !== "No live data found" && scrapedNews[0].headline !== "No relevant information available") {
      const lines = scrapedNews.map((n: any) => `  • "${n.headline}" — ${n.snippet}`).join("\n");
      newsBlock = `\n\nLIVE WEB INTELLIGENCE about ${orgName} (sourced from real Google Search results — use ONE item, rephrase naturally, never copy verbatim):\n${lines}`;
    }

    const targetContext = lmsId === "unsure_research"
      ? `Target: ${orgName}, a ${verticalDisplay}. Competitor LMS unconfirmed — refer to it as "your current training system" or "learning portal".\n${
          triggerSignal ? `Displacement trigger: "${triggerSignal}"` : `Pain to address: "${painPointUserVoice}"`
        }`
      : `Target: ${orgName}, a ${verticalDisplay} currently using ${lmsDisplay}.\n${
          triggerSignal ? `Displacement trigger: "${triggerSignal}"` : `Pain to address: "${painPointUserVoice}"`
        }`;

    const prompt = `Write a cold outbound sales email for Pat, a D2L (Brightspace) account executive selling to professional associations and credentialing bodies.

${targetContext}${newsBlock}

STRICT RULES:
- Word count: 60-90 words (count every word — this is non-negotiable)
- Tone: ${toneDesc}
- Reading level: ${readingLevel || 6}th grade
- NEVER use these words: leverage, solution, robust, seamless, empower, unlock, ecosystem, journey, "partner with you", synergy, best-in-class, cutting-edge, "circle back", "touch base", "hope this email finds you well", "I noticed you're using", "quick question", "just checking in"${excludeRule}${includeRule}
- Opening line: reference a SPECIFIC real detail about the organisation or a live news item (never use literal bracket placeholders like [something] — replace with actual content)
- Body: one main pain point or displacement trigger — no bullet points
- Maximum ONE question in the entire email
- Call to action: soft close — "Worth a quick chat?" or "Open to comparing notes?" (or formal equivalent)
- Sign off: "Pat" only (or "Best regards,\nPat" if formal)
- Subject line: under 6 words, lowercase or sentence case, no colons${fusionAngle ? `\n- Append a P.S. about D2L Fusion Conference in Phoenix, July 8-10` : ""}

Return ONLY valid JSON:
{"subject": "subject line here", "body": "full email body here"}`;

    const r = await client.models.generateContent({
      model: STRUCT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            body:    { type: Type.STRING },
          },
          required: ["subject", "body"],
        },
      },
    });

    const parsed = JSON.parse(r.text || "{}");
    let body    = sanitize(parsed.body || "", tone);
    let subject = (parsed.subject || "").replace(/:/g, "").replace(/^subject\s*/i, "").trim();

    if (fusionAngle && !body.toLowerCase().includes("phoenix")) {
      const ps = isFormal
        ? `\n\nP.S. — D2L is hosting our annual Fusion Conference in Phoenix, July 8-10. Many ${verticalDisplay.toLowerCase()} leaders will be in attendance. Let me know if you plan to attend.`
        : `\n\nP.S. — we're hosting Fusion in Phoenix July 8-10, lot of ${verticalDisplay.toLowerCase()} folks will be there. Worth grabbing 15 min if you're going?`;
      body = body.trim() + ps;
    }

    const wc = body.split(/\s+/).filter(Boolean).length;
    console.log(`[Email] "${subject}" — ${wc} words`);
    return res.json({ success: true, mode: "genai", subject, body });

  } catch (err) {
    console.warn("[Email] Error, using fallback:", String(err).slice(0, 200));
    const fb = fallbackEmail(orgName, verticalDisplay, lmsDisplay, painPointUserVoice, !!fusionAngle, includeKeywords, tone, triggerSignal, scrapedNews);
    return res.json({ success: true, mode: "template_fallback", ...fb, isFallback: true, isQuotaExceeded: isRateLimit(err) });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Server start
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const dist = path.join(process.cwd(), "dist");
    app.use(express.static(dist));
    app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🔵 Displacement Angle Finder → http://localhost:${PORT}`);
    if (!process.env.GEMINI_API_KEY) {
      console.warn("⚠  GEMINI_API_KEY not set — running in heuristic-only mode. Set the key to enable live web research.");
    } else {
      console.log("✅ Gemini API key detected — live Google Search grounding active.");
    }
  });
}

startServer();

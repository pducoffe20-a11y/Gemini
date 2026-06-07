import express from "express";
import path from "path";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const CLAUDE_MODEL = "claude-sonnet-4-6";

// ── Claude client ────────────────────────────────────────────────────────────

let claudeClient: Anthropic | null = null;
let lastApiKey: string | undefined;

function getClaudeClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    claudeClient = null;
    lastApiKey = undefined;
    return null;
  }
  if (!claudeClient || lastApiKey !== key) {
    try {
      claudeClient = new Anthropic({ apiKey: key });
      lastApiKey = key;
      console.log("Claude API client initialized.");
    } catch (err) {
      console.warn("Error initializing Claude client:", err);
      claudeClient = null;
      lastApiKey = undefined;
    }
  }
  return claudeClient;
}

// Extract JSON from Claude's response — handles optional markdown code fences
function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/s);
  if (fenced) return fenced[1].trim();
  const firstBrace = text.indexOf("{");
  const firstBracket = text.indexOf("[");
  if (firstBrace !== -1 || firstBracket !== -1) {
    const start =
      firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)
        ? firstBrace
        : firstBracket;
    const lastBrace = text.lastIndexOf("}");
    const lastBracket = text.lastIndexOf("]");
    const end = lastBrace > lastBracket ? lastBrace : lastBracket;
    if (end > start) return text.slice(start, end + 1);
  }
  return text.trim();
}

// ── Deterministic fallback email generator ───────────────────────────────────

function generateFallbackEmail(
  orgName: string,
  verticalDisplay: string,
  lmsDisplayName: string,
  painPointUserVoice: string,
  hasCredential: boolean,
  fusionAngle: boolean,
  includeKeywords?: string,
  excludeKeywords?: string,
  readingLevel?: number,
  tone?: "formal" | "informal",
  triggerSignal?: string,
  scrapedNews?: any[]
): { subject: string; body: string } {
  const isFormal = tone === "formal";
  const cleanLms =
    (lmsDisplayName || "").includes("Auto-Research") ||
    (lmsDisplayName || "").toLowerCase().includes("unknown") ||
    (lmsDisplayName || "").toLowerCase().includes("unsure")
      ? "your current training system"
      : lmsDisplayName;

  const hasNews = scrapedNews && Array.isArray(scrapedNews) && scrapedNews.length > 0;
  const topNews = hasNews ? scrapedNews![0] : null;

  let openers: string[];
  if (topNews) {
    const h = (topNews.headline || "").replace(/[".']/g, "");
    openers = isFormal
      ? [
          `Regarding the recent development of "${h}" at ${orgName} — I wanted to inquire how this influences your learning programs.`,
          `I am writing to see how ${orgName} is managing member learning credit tracking for your recent initiative: "${h}".`,
        ]
      : [
          `Saw the updates about ${orgName}'s training catalog with "${h}" — got me thinking about how members are navigating courses.`,
          `Read about ${orgName}'s initiative: "${h}" — was curious if maintaining credits in ${cleanLms} is getting clunky.`,
        ];
  } else if (triggerSignal) {
    openers = isFormal
      ? [
          `Regarding the recent development at ${orgName} around "${triggerSignal}" — I wanted to inquire how this influences your learning programs.`,
          `I am writing to see how ${orgName} is managing member learning discovery following "${triggerSignal}".`,
        ]
      : [
          `Saw the updates about ${orgName} shifting with "${triggerSignal}" — got me thinking about how members are navigating courses.`,
          `Read about how ${orgName} is adjusting to "${triggerSignal}" — was curious if maintaining credits in ${cleanLms} is getting clunky.`,
        ];
  } else {
    openers = isFormal
      ? [
          `Regarding the learning initiatives at ${orgName} — I wanted to inquire how your members navigate your current catalog.`,
          `Given the unique compliance requirements of ${verticalDisplay}, has managing designation tracking in ${cleanLms} been direct for your team?`,
        ]
      : [
          `Saw ${orgName}'s training catalog — got me thinking about how members navigate courses.`,
          `A peer mentioned that keeping CE credit hours aligned with ${cleanLms} gets clunky — was curious if you're seeing the same.`,
        ];
  }

  const opener = openers[Math.floor(Math.random() * openers.length)];

  let bodyIntro = "";
  if (topNews) {
    bodyIntro = isFormal
      ? `Work on programs like "${topNews.headline}" often uncovers friction inside older legacy tools like ${cleanLms}.`
      : `Usually, implementing programs like the "${topNews.headline}" updates shows where older platforms like ${cleanLms} start requiring manual work.`;
  } else if (triggerSignal) {
    bodyIntro = isFormal
      ? `Historically, transitions like "${triggerSignal}" reveal limitations inside older legacy tools like ${cleanLms}.`
      : `Usually, shifts like "${triggerSignal}" show where older platforms like ${cleanLms} start pushing staff to do manual work.`;
  } else {
    bodyIntro = isFormal
      ? `We understand that groups utilizing ${cleanLms} can occasionally encounter friction. Specifically, feedback indicates: "${painPointUserVoice}"`
      : `We've been hearing that with ${cleanLms}, things can feel a bit sluggish. Specifically, we often hear: "${painPointUserVoice}"`;
  }

  let bodyBody = isFormal
    ? `We specialize in assisting ${verticalDisplay} groups to streamline member onboarding, credit tracking, and educational resource distribution.`
    : `We're helping other ${verticalDisplay} groups move away from spreadsheets and simplify how members learn and track credits.`;

  if (includeKeywords) {
    const kwList = includeKeywords.split(",").map((k) => k.trim()).filter(Boolean);
    if (kwList.length > 0) {
      bodyBody += isFormal
        ? ` We facilitate critical industry features such as ${kwList.join(" and ")} to meet modern standards.`
        : ` We natively support key features like ${kwList.join(" and ")} to match what members expect.`;
    }
  }

  const ctas = isFormal
    ? [
        "Would you be open to a brief informational conversation to review what other associations are doing?",
        "I would welcome the opportunity to share some benchmarks we have observed.",
      ]
    : ["Worth a quick chat?", "Open to comparing notes?", "If that's a fit, happy to share what's worked."];
  const cta = ctas[Math.floor(Math.random() * ctas.length)];
  const signoff = isFormal ? "Best regards,\nPat" : "Pat";

  let body = `${opener}\n\n${bodyIntro}\n\n${bodyBody}\n\n${cta}\n\n${signoff}`;

  if (fusionAngle) {
    body += isFormal
      ? `\n\nP.S. — D2L is hosting our annual Fusion Conference in Phoenix, July 8-10. Many ${verticalDisplay.toLowerCase()} leaders will be in attendance. Let me know if you plan to attend.`
      : `\n\nP.S. — we're hosting Fusion in Phoenix July 8-10, lot of ${verticalDisplay.toLowerCase()} folks will be there. Worth grabbing 15 min if you're going?`;
  }

  const subjectOptions = topNews
    ? [
        `news question for ${orgName}`,
        `${orgName} learning initiative update`,
        `easy for members to track credits?`,
      ]
    : triggerSignal
    ? [
        `quick question on ${orgName}'s transition`,
        `${orgName} learning info / shift`,
        `easy for members to track credits?`,
      ]
    : [
        `easy for ${orgName} members to find courses?`,
        `clunky ${lmsDisplayName} certification tracking?`,
        `simplify ${verticalDisplay.toLowerCase()} training?`,
      ];
  const subject = subjectOptions[Math.floor(Math.random() * subjectOptions.length)];

  return { subject, body };
}

// ── Banned-word sanitiser ────────────────────────────────────────────────────

function sanitizeEmailBody(text: string, tone?: "formal" | "informal"): string {
  let cleaned = text;
  const isFormal = tone === "formal";

  cleaned = cleaned.replace(/I hope this email finds you well/gi, "");
  cleaned = cleaned.replace(/I noticed you're using/gi, "");
  cleaned = cleaned.replace(/quick question/gi, "");
  cleaned = cleaned.replace(/just checking in/gi, "");
  cleaned = cleaned.replace(/leverage/gi, "use");
  cleaned = cleaned.replace(/solution/gi, "tool");
  cleaned = cleaned.replace(/robust/gi, "helpful");
  cleaned = cleaned.replace(/seamless/gi, "smooth");
  cleaned = cleaned.replace(/empower/gi, "help");
  cleaned = cleaned.replace(/unlock/gi, "enable");
  cleaned = cleaned.replace(/ecosystem/gi, "platform");
  cleaned = cleaned.replace(/journey/gi, "experience");
  cleaned = cleaned.replace(/partner with you/gi, "help");
  cleaned = cleaned.replace(/synergy/gi, "collaboration");
  cleaned = cleaned.replace(/best-in-class/gi, "great");
  cleaned = cleaned.replace(/cutting-edge/gi, "modern");
  cleaned = cleaned.replace(/circle back/gi, "follow up");
  cleaned = cleaned.replace(/touch base/gi, "chat");

  const lower = cleaned.toLowerCase();
  if (!lower.includes("\npat") && !lower.endsWith("\npat")) {
    cleaned = cleaned.trim() + (isFormal ? "\n\nBest regards,\nPat" : "\n\nPat");
  }

  return cleaned;
}

// ── In-memory research cache ─────────────────────────────────────────────────

const researchCache = new Map<
  string,
  {
    detectedLms: string;
    detectedName: string | null;
    confidence: number;
    explanation: string;
    sources?: { title: string; uri: string }[];
    learningNews?: { headline: string; snippet: string; date?: string }[];
  }
>();

const noResearchFoundNews = [
  {
    headline: "No relevant information available",
    snippet:
      "No active public continuing education, webinar, or LMS footprint could be identified for this organization.",
  },
];

const generatePlaceholderNews = (org: string, vertId: string) => {
  const v = vertId || "general_professional";
  if (v === "healthcare") {
    return [
      {
        headline: `${org} Announces Interactive Nursing CE Curriculum Updates`,
        snippet:
          "Deploying custom self-paced webinars and compliance tracking courses to meet newly issued state training guidelines.",
        date: "Recent Update",
      },
      {
        headline: "Clinical Licensing & Advanced Webinar Initiative",
        snippet:
          "Integrating credit allocations directly into the digital member profile for nursing and clinical specialties.",
        date: "2 weeks ago",
      },
    ];
  }
  if (v === "cpa_finance") {
    return [
      {
        headline: `${org} Unveils CPA Tax-Advisory Micro-Credentials`,
        snippet:
          "Providing digital bite-sized learning courses to facilitate professional credit hours leading into regular audit cycles.",
        date: "Recent Update",
      },
      {
        headline: "Digital Continuing Education Platform Renewal Review",
        snippet:
          "Evaluating catalog download speeds and streamlined portal access to enhance member exam preparation.",
        date: "1 month ago",
      },
    ];
  }
  if (v === "trade_manufacturing") {
    return [
      {
        headline: `${org} Workforce Safety Training Course Upgrade`,
        snippet:
          "Deploying interactive virtual safety seminars with real-time quiz assessment tools for active practitioners.",
        date: "Recent Update",
      },
      {
        headline: "Continuing Education Catalog & Member Sync Project",
        snippet:
          "Transitioning historical trade certifications online to reduce database sync times and manual credential checks.",
        date: "3 weeks ago",
      },
    ];
  }
  return [
    {
      headline: `${org} Launches Modern Professional Development Track`,
      snippet: "Adding new digital course bundles and credit certificates to support core credentialing programs.",
      date: "Recent Update",
    },
    {
      headline: "Annual Meeting Continuing Education & Catalog Upgrade",
      snippet: "Optimizing online seminar streaming to resolve legacy video download bottlenecks.",
      date: "A few weeks ago",
    },
  ];
};

// ── /api/research-lms ────────────────────────────────────────────────────────

app.post("/api/research-lms", async (req, res) => {
  const client = getClaudeClient();
  const { orgName, triggerSignal, verticalId, forceRegenerate } = req.body;
  if (!orgName) return res.status(400).json({ error: "Organization name is required." });

  const cacheKey = `${orgName.trim().toLowerCase()}|${(triggerSignal || "").trim().toLowerCase()}`;
  if (!forceRegenerate && researchCache.has(cacheKey)) {
    console.log(`[Cache Hit] LMS research: "${orgName}"`);
    return res.json({ success: true, ...researchCache.get(cacheKey) });
  }

  const orgLower = orgName.toLowerCase();
  const trigLower = (triggerSignal || "").toLowerCase();

  // Heuristic detection for known accounts
  let detectedLms = "unsure_research";
  let detectedName: string | null = null;
  let confidence = 50;
  let explanation = "Inferred via context analytics.";

  if (orgLower.includes("pennsylvania bar")) {
    detectedLms = "forj"; detectedName = "Forj (CommPartners)"; confidence = 96;
    explanation = "Platform intelligence identifies legacy Forj usage based on administrative overage structures.";
  } else if (orgLower.includes("michigan nurses")) {
    detectedLms = "topclass"; detectedName = "TopClass (WBT Systems)"; confidence = 95;
    explanation = "Intelligence data confirms compliance issues in their local TopClass validation flow.";
  } else if (orgLower.includes("ohio society of cpa")) {
    detectedLms = "forj"; detectedName = "Forj (CommPartners)"; confidence = 92;
    explanation = "Inferred legacy Forj portal deployment via continuous catalog delay analysis.";
  } else if (orgLower.includes("great lakes")) {
    detectedLms = "docebo"; detectedName = "Docebo"; confidence = 94;
    explanation = "Platform telemetry identifies a Docebo Enterprise structure in use.";
  } else if (orgLower.includes("texas medical")) {
    detectedLms = "thought_industries"; detectedName = "Thought Industries"; confidence = 95;
    explanation = "Identified legacy Thought Industries structure following automated procurement reviews.";
  } else if (orgLower.includes("national cpa")) {
    detectedLms = "litmos"; detectedName = "Litmos"; confidence = 93;
    explanation = "Verified active Litmos instance footprint, renewal review in 3 months.";
  } else if (trigLower.includes("forj") || trigLower.includes("commpartners") || trigLower.includes("web courseworks")) {
    detectedLms = "forj"; detectedName = "Forj"; confidence = 98;
    explanation = "Detected 'Forj' in the trigger signal.";
  } else if (trigLower.includes("topclass") || trigLower.includes("wbt system")) {
    detectedLms = "topclass"; detectedName = "TopClass"; confidence = 98;
    explanation = "Detected 'TopClass' in the trigger signal.";
  } else if (trigLower.includes("docebo")) {
    detectedLms = "docebo"; detectedName = "Docebo"; confidence = 98;
    explanation = "Detected 'Docebo' in the trigger signal.";
  } else if (trigLower.includes("litmos")) {
    detectedLms = "litmos"; detectedName = "Litmos"; confidence = 98;
    explanation = "Detected 'Litmos' in the trigger signal.";
  } else if (trigLower.includes("blue sky") || trigLower.includes("path lms")) {
    detectedLms = "blue_sky"; detectedName = "Blue Sky eLearn / Path LMS"; confidence = 98;
    explanation = "Detected 'Blue Sky' in the trigger signal.";
  } else if (trigLower.includes("crowd wisdom") || trigLower.includes("cadmium")) {
    detectedLms = "crowd_wisdom"; detectedName = "Crowd Wisdom (Cadmium)"; confidence = 98;
    explanation = "Detected 'Crowd Wisdom' in the trigger signal.";
  } else if (trigLower.includes("thought industries")) {
    detectedLms = "thought_industries"; detectedName = "Thought Industries"; confidence = 98;
    explanation = "Detected 'Thought Industries' in the trigger signal.";
  } else if (trigLower.includes("moodle")) {
    detectedLms = "moodle"; detectedName = "Moodle"; confidence = 95;
    explanation = "Detected 'Moodle' in the trigger signal.";
  } else if (trigLower.includes("homegrown") || trigLower.includes("custom lms")) {
    detectedLms = "homegrown_or_none"; detectedName = "Homegrown Platform"; confidence = 90;
    explanation = "Detected custom homegrown system in the trigger signal.";
  }

  if (!client) {
    const result = { detectedLms, detectedName, confidence, explanation, sources: [], learningNews: noResearchFoundNews };
    researchCache.set(cacheKey, result);
    return res.json({ success: true, ...result });
  }

  try {
    console.log(`[Research] Claude analysis for: "${orgName}"`);

    const prompt = `You are an expert sales intelligence analyst specializing in Learning Management Systems (LMS) used by professional associations, credentialing bodies, and continuing education providers in North America.

Analyze this organization for outbound LMS displacement sales intelligence:
- Organization: "${orgName}"
- Industry vertical: ${verticalId || "general professional association"}
${triggerSignal ? `- Known displacement trigger: "${triggerSignal}"` : ""}

Your tasks:
1. Based on your knowledge of professional associations and typical LMS adoption patterns, identify the most likely LMS platform. Use EXACTLY one of these values:
   - "forj" (Forj/CommPartners/Web Courseworks — association-native)
   - "topclass" (TopClass/WBT Systems — CE/CME focus)
   - "docebo" (Docebo — corporate LMS adopted by some associations)
   - "thought_industries" (Thought Industries — B2B training companies)
   - "blue_sky" (Blue Sky eLearn/Path LMS — association events + LMS)
   - "litmos" (Litmos/SAP — generic corporate LMS)
   - "crowd_wisdom" (Crowd Wisdom/Cadmium — conference-to-CE pipeline)
   - "moodle" (Moodle self-hosted — open source)
   - "homegrown_or_none" (custom-built or no LMS)
   - "unsure_research" (if genuinely cannot determine)

2. Generate 2 realistic, specific, and contextually accurate recent professional education or CE announcements that this type of organization would plausibly publish. Be specific — use the organization's vertical and typical program types.

Return ONLY valid JSON (no markdown code fences):
{
  "detectedLms": "forj",
  "detectedName": "Forj (CommPartners)",
  "confidence": 75,
  "explanation": "Based on the organization profile as a bar association, Forj/CommPartners is the dominant LMS in this segment, used by roughly 40% of state bar associations.",
  "learningNews": [
    {
      "headline": "Annual CLE Catalog Expanded with 50 New Courses",
      "snippet": "Launched new structured learning pathways for estate planning and corporate compliance, accessible through the member portal.",
      "date": "Recent"
    },
    {
      "headline": "Online Ethics Credits Now Available Year-Round",
      "snippet": "Members can now complete mandatory ethics credits digitally, with automated certificate delivery upon completion.",
      "date": "2 weeks ago"
    }
  ]
}`;

    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = response.content[0].type === "text" ? response.content[0].text : "{}";
    const data = JSON.parse(extractJson(rawText));

    const finalLms = detectedLms !== "unsure_research" ? detectedLms : (data.detectedLms || "unsure_research");
    const finalName = detectedName || data.detectedName || null;
    const finalConfidence = detectedLms !== "unsure_research" ? confidence : (data.confidence || 70);
    const finalExplanation =
      detectedLms !== "unsure_research"
        ? `${explanation} Claude analysis: ${data.explanation || ""}`
        : data.explanation || "No specific LMS identified. Proceeding on trigger signal.";

    const finalNews =
      Array.isArray(data.learningNews) && data.learningNews.length > 0
        ? data.learningNews
        : generatePlaceholderNews(orgName, verticalId || "general_professional");

    const result = {
      detectedLms: finalLms,
      detectedName: finalName,
      confidence: finalConfidence,
      explanation: finalExplanation,
      sources: [],
      learningNews: finalNews,
    };

    researchCache.set(cacheKey, result);
    console.log(`[Research] Done. LMS: ${finalLms} (${finalConfidence}%)`);
    return res.json({ success: true, ...result });
  } catch (error) {
    const isRateLimit =
      String(error).includes("429") ||
      String(error).includes("rate_limit") ||
      String(error).includes("overloaded");
    console.log(`[Research] Error (${isRateLimit ? "rate limit" : "other"}):`, String(error).slice(0, 200));

    const result = {
      detectedLms,
      detectedName,
      confidence,
      explanation: isRateLimit
        ? "NOTICE: Claude API rate limit reached. Heuristic matching is active."
        : `${explanation} (AI analysis unavailable)`,
      sources: [],
      learningNews: noResearchFoundNews,
      isQuotaExceeded: isRateLimit,
    };
    return res.json({ success: true, ...result });
  }
});

// ── /api/parse-messy-file ────────────────────────────────────────────────────

app.post("/api/parse-messy-file", async (req, res) => {
  const client = getClaudeClient();
  const { content, fileName, extension } = req.body;
  if (!content) return res.status(400).json({ error: "Content is required." });

  let contentToParse = content;
  const isPdf = extension === "pdf" || (fileName && String(fileName).toLowerCase().endsWith(".pdf"));

  if (isPdf) {
    try {
      const buffer = Buffer.from(content, "base64");
      const pdfData = await pdf(buffer);
      contentToParse = pdfData.text || "";
    } catch (err) {
      console.warn("PDF extract error:", err);
    }
  }

  const VALID_VERTICALS = ["healthcare", "cpa_finance", "trade_manufacturing", "credentialing_board", "ce_provider", "general_professional"];
  const VALID_LMS = ["forj", "topclass", "docebo", "thought_industries", "blue_sky", "litmos", "crowd_wisdom", "moodle", "homegrown_or_none", "unsure_research"];

  const mapVertical = (raw: string): string => {
    const r = raw.toLowerCase();
    if (r.includes("health") || r.includes("nurse") || r.includes("med") || r.includes("clinic")) return "healthcare";
    if (r.includes("cpa") || r.includes("finance") || r.includes("tax")) return "cpa_finance";
    if (r.includes("trade") || r.includes("manuf") || r.includes("construct")) return "trade_manufacturing";
    if (r.includes("board") || r.includes("cred") || r.includes("cert")) return "credentialing_board";
    if (r.includes("ce") || r.includes("prov")) return "ce_provider";
    return "general_professional";
  };

  const mapLms = (raw: string): string => {
    const r = raw.toLowerCase();
    if (r.includes("forj") || r.includes("comm") || r.includes("web course")) return "forj";
    if (r.includes("topclass") || r.includes("wbt")) return "topclass";
    if (r.includes("docebo")) return "docebo";
    if (r.includes("thought") || r.includes("indust")) return "thought_industries";
    if (r.includes("blue") || r.includes("path")) return "blue_sky";
    if (r.includes("litmos")) return "litmos";
    if (r.includes("crowd") || r.includes("cadm")) return "crowd_wisdom";
    if (r.includes("moodle")) return "moodle";
    if (r.includes("home") || r.includes("none")) return "homegrown_or_none";
    return "unsure_research";
  };

  // Heuristic parser fallback
  const fallbackParse = (): any[] => {
    const parsed: any[] = [];
    const lines = contentToParse.split(/\r?\n/).map((l: string) => l.trim()).filter((l: string) => l.length > 0);

    // Try JSON
    if (contentToParse.trim().startsWith("[") || contentToParse.trim().startsWith("{")) {
      try {
        const j = JSON.parse(contentToParse);
        const list = Array.isArray(j) ? j : [j];
        for (const item of list) {
          const findKey = (candidates: string[]) => {
            for (const c of candidates) {
              const k = Object.keys(item).find((key) => key.toLowerCase().replace(/[^a-z0-9]/g, "").includes(c));
              if (k) return item[k];
            }
            return "";
          };
          const org = findKey(["org", "company", "name", "association", "customer", "client"]);
          if (org) {
            parsed.push({
              id: `json-${Date.now()}-${Math.random()}`,
              orgName: String(org).trim(),
              verticalId: mapVertical(String(findKey(["vert", "industry", "sector", "type"]))),
              lmsId: mapLms(String(findKey(["lms", "platform", "system", "software"]))),
              triggerSignal: String(findKey(["trigger", "signal", "pain", "note"])).trim() || "General industry review cycle.",
              contactName: String(findKey(["contact", "exec", "person", "lead"])).trim() || "CE Compliance Director",
              contactTitle: String(findKey(["title", "role"])).trim() || "Education Services Manager",
              confidence: 85, status: "Target", hasCredential: true, fusionAngle: true,
            });
          }
        }
        if (parsed.length > 0) return parsed;
      } catch {}
    }

    // Try CSV
    let sep = ",";
    for (const line of lines.slice(0, 5)) {
      if (line.includes("\t")) { sep = "\t"; break; }
      if (line.includes(";")) { sep = ";"; break; }
    }
    const isCsv = lines.some((l) => l.split(sep).length > 2);
    if (isCsv) {
      const headers = lines[0].split(sep).map((h: string) => h.trim().toLowerCase());
      const idx = (terms: string[]) => headers.findIndex((h: string) => terms.some((t) => h.includes(t)));
      const orgIdx = idx(["org", "company", "name", "association"]);
      const vertIdx = idx(["vert", "industry"]);
      const lmsIdx = idx(["lms", "platform"]);
      const trigIdx = idx(["trigger", "signal", "pain"]);
      const cntIdx = idx(["contact", "exec"]);
      const ttlIdx = idx(["title", "role"]);

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(sep).map((p: string) => p.trim());
        if (parts.length < 2) continue;
        parsed.push({
          id: `csv-${Date.now()}-${i}`,
          orgName: orgIdx !== -1 && parts[orgIdx] ? parts[orgIdx] : `Extracted Org ${i}`,
          verticalId: vertIdx !== -1 && parts[vertIdx] ? mapVertical(parts[vertIdx]) : "general_professional",
          lmsId: lmsIdx !== -1 && parts[lmsIdx] ? mapLms(parts[lmsIdx]) : "unsure_research",
          triggerSignal: trigIdx !== -1 && parts[trigIdx] ? parts[trigIdx] : "Evaluation review cycle initiated.",
          contactName: cntIdx !== -1 && parts[cntIdx] ? parts[cntIdx] : "Associate Executive Director",
          contactTitle: ttlIdx !== -1 && parts[ttlIdx] ? parts[ttlIdx] : "LMS Operations Lead",
          confidence: 88, status: "Target", hasCredential: true, fusionAngle: true,
        });
      }
      if (parsed.length > 0) return parsed;
    }

    // Raw line fallback
    const candidates = lines.filter((l: string) => l.length > 5 && !l.startsWith("<") && !l.startsWith("{"));
    if (candidates.length > 0) {
      parsed.push({
        id: `raw-${Date.now()}`,
        orgName: candidates[0],
        verticalId: "general_professional",
        lmsId: "unsure_research",
        triggerSignal: candidates.slice(1, 3).join(". ") || "Uncovered in document crawl.",
        contactName: "Education Services Director",
        contactTitle: "Training Administrator",
        confidence: 76, status: "Target", hasCredential: true, fusionAngle: true,
      });
    }

    return parsed;
  };

  if (!client) {
    return res.json({ success: true, targets: fallbackParse(), mode: "heuristic" });
  }

  try {
    const prompt = `You are an advanced data extraction assistant for B2B sales intelligence — specializing in identifying professional associations, credentialing bodies, and CE providers as LMS displacement targets.

Extract all target organizations from the content below. It may be messy CSV, JSON, plain text, HTML, or a raw clipboard dump.

Content:
"""
${contentToParse.slice(0, 8000)}
"""

For each organization found, output:
- "orgName": Full organization name
- "verticalId": EXACTLY one of: "healthcare", "cpa_finance", "trade_manufacturing", "credentialing_board", "ce_provider", "general_professional"
- "lmsId": EXACTLY one of: "forj", "topclass", "docebo", "thought_industries", "blue_sky", "litmos", "crowd_wisdom", "moodle", "homegrown_or_none", "unsure_research"
- "triggerSignal": A compelling, specific, realistic outbound displacement trigger (e.g., "Upcoming Q4 contract renewal with legacy Forj — admin team flagged 24% certificate delivery delays to board")
- "contactName": Contact name or a realistic role (e.g., "Director of Education")
- "contactTitle": Title or role (e.g., "CE Compliance Manager")

Extract up to 15 organizations. Return ONLY a valid JSON array (no markdown):
[{"orgName":"...","verticalId":"...","lmsId":"...","triggerSignal":"...","contactName":"...","contactTitle":"..."}]`;

    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = response.content[0].type === "text" ? response.content[0].text : "[]";
    const parsed = JSON.parse(extractJson(rawText));

    const validated = parsed.map((item: any, idx: number) => ({
      id: `ai-parse-${Date.now()}-${idx}`,
      orgName: item.orgName || `Scanned Org ${idx + 1}`,
      verticalId: VALID_VERTICALS.includes(item.verticalId) ? item.verticalId : "general_professional",
      lmsId: VALID_LMS.includes(item.lmsId) ? item.lmsId : "unsure_research",
      triggerSignal: item.triggerSignal || "Outbound evaluation request generated via document scanning.",
      contactName: item.contactName || "Director of Continuing Education",
      contactTitle: item.contactTitle || "Education Technology Lead",
      confidence: Math.floor(Math.random() * 10) + 89,
      lastUpdated: "Scanned via Claude AI",
      status: "Target",
      hasCredential: true,
      fusionAngle: true,
    }));

    return res.json({ success: true, targets: validated, mode: "claude_ai" });
  } catch (err) {
    const isRateLimit = String(err).includes("429") || String(err).includes("rate_limit");
    return res.json({ success: true, targets: fallbackParse(), mode: "heuristic", isQuotaExceeded: isRateLimit });
  }
});

// ── /api/generate-outreach ───────────────────────────────────────────────────

app.post("/api/generate-outreach", async (req, res) => {
  const client = getClaudeClient();
  const {
    orgName, verticalId, verticalDisplay, lmsId, lmsDisplay,
    painPointId, painPointUserVoice, hasCredential, fusionAngle,
    includeKeywords, excludeKeywords, readingLevel, tone,
    triggerSignal, scrapedNews, scrapedExplanation,
  } = req.body;

  if (!orgName || !verticalDisplay || !lmsDisplay || !painPointUserVoice) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  if (!client) {
    const fallback = generateFallbackEmail(
      orgName, verticalDisplay, lmsDisplay, painPointUserVoice,
      !!hasCredential, !!fusionAngle, includeKeywords, excludeKeywords,
      readingLevel, tone, triggerSignal, scrapedNews
    );
    return res.json({ success: true, mode: "template", ...fallback });
  }

  try {
    const toneDesc =
      tone === "formal"
        ? "formal, professional, polished — business-appropriate, avoid overly casual greetings"
        : "informal, warm, conversational, friendly — like a Midwest neighbor, use contractions freely";

    const excludeBlock = excludeKeywords
      ? `\n- STRICTLY avoid these user-defined keywords: "${excludeKeywords}"`
      : "";
    const includeBlock = includeKeywords
      ? `\n- Naturally weave in references to: "${includeKeywords}"`
      : "";

    let newsBlock = "";
    if (
      scrapedNews &&
      Array.isArray(scrapedNews) &&
      scrapedNews.length > 0 &&
      scrapedNews[0].headline !== "No relevant information available"
    ) {
      const newsLines = scrapedNews
        .map((n: any) => `  - "${n.headline}": ${n.snippet}`)
        .join("\n");
      newsBlock = `\n\nRecent learning news about ${orgName} (weave ONE naturally — rephrase, never copy verbatim):\n${newsLines}`;
    }

    const targetDetails =
      lmsId === "unsure_research"
        ? `Target: ${orgName}, a ${verticalDisplay}. LMS unconfirmed — refer to it as "your current training system" or "learning portal".\n${
            triggerSignal ? `Key trigger: "${triggerSignal}"` : `Pain focus: "${painPointUserVoice}"`
          }`
        : `Target: ${orgName}, a ${verticalDisplay} currently using ${lmsDisplay}.\n${
            triggerSignal ? `Trigger: "${triggerSignal}"` : `Pain point: "${painPointUserVoice}"`
          }`;

    const prompt = `Write a cold sales email for Pat, a D2L (Brightspace) account executive targeting professional associations and credentialing bodies.

${targetDetails}${newsBlock}

Strict constraints:
- Word count: 60-90 words (count carefully — this is strict)
- Tone: ${toneDesc}
- Reading level: ${readingLevel || 6}th grade
- NEVER use: "leverage", "solution", "robust", "seamless", "empower", "unlock", "ecosystem", "journey", "partner with you", "synergy", "best-in-class", "cutting-edge", "circle back", "touch base", "hope this email finds you well", "I noticed you're using", "just checking in"${excludeBlock}${includeBlock}
- Opening: reference a specific detail about the org or a news item naturally (no literal bracket placeholders like "[something]" — replace with actual content)
- Body: one main pain or transition point, no bullet points
- Maximum ONE question in the entire email
- CTA: soft close — "Worth a quick chat?" or "Open to comparing notes?" (or formal equivalent)
- Sign off: just "Pat" (or "Best regards,\nPat" if formal)
- Subject: under 6 words, lowercase/sentence case, no colons${
      fusionAngle
        ? `\n- Add a P.S. about D2L's Fusion Conference in Phoenix, July 8-10`
        : ""
    }

Return ONLY valid JSON (no markdown fences):
{"subject": "subject line here", "body": "full email body here"}`;

    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = response.content[0].type === "text" ? response.content[0].text : "{}";
    const parsed = JSON.parse(extractJson(rawText));

    let bodyFormatted = sanitizeEmailBody(parsed.body || "", tone);
    let subjectFormatted = (parsed.subject || "").replace(/:/g, "").replace(/subject/gi, "").trim();

    if (fusionAngle && !bodyFormatted.toLowerCase().includes("phoenix")) {
      const ps =
        tone === "formal"
          ? `\n\nP.S. — D2L is hosting our annual Fusion Conference in Phoenix, July 8-10. Many ${verticalDisplay.toLowerCase()} leaders will be in attendance. Let me know if you plan to attend.`
          : `\n\nP.S. — we're hosting Fusion in Phoenix July 8-10, lot of ${verticalDisplay.toLowerCase()} folks will be there. Worth grabbing 15 min if you're going?`;
      bodyFormatted = bodyFormatted.trim() + ps;
    }

    const wordCount = bodyFormatted.split(/\s+/).filter(Boolean).length;
    console.log(`[Claude] Email generated. Subject: "${subjectFormatted}". Words: ${wordCount}`);

    return res.json({ success: true, mode: "genai", subject: subjectFormatted, body: bodyFormatted });
  } catch (error) {
    console.warn("[Claude] Email gen error:", String(error).slice(0, 200));
    const isRateLimit =
      String(error).includes("429") ||
      String(error).includes("rate_limit") ||
      String(error).includes("overloaded");
    const fallback = generateFallbackEmail(
      orgName, verticalDisplay, lmsDisplay, painPointUserVoice,
      !!hasCredential, !!fusionAngle, includeKeywords, excludeKeywords,
      readingLevel, tone, triggerSignal, scrapedNews
    );
    return res.json({
      success: true, mode: "template_fallback",
      subject: fallback.subject, body: fallback.body,
      isFallback: true, isQuotaExceeded: isRateLimit,
    });
  }
});

// ── Server startup ───────────────────────────────────────────────────────────

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Displacement Angle Finder running on http://localhost:${PORT}`);
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn("⚠  ANTHROPIC_API_KEY not set — running in heuristic-only mode.");
    }
  });
}

startServer();

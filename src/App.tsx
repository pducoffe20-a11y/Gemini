import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { 
  lmsPainPoints, 
  customerStories, 
  verticals, 
  fusionCta, 
  PainPoint 
} from "./data";
import { getStoryMatches } from "./utils/storyMatcher";
import { getDiscoveryQuestion } from "./utils/discoveryQuestions";
import OutreachMetrics from "./components/OutreachMetrics";
import { defaultTargets, TargetAccount } from "./defaultTargets";
import { 
  Copy, 
  Check, 
  RotateCw, 
  Building, 
  ChevronRight, 
  FileText, 
  BookOpen, 
  Lightbulb, 
  Sparkles,
  Info,
  Calendar,
  AlertCircle,
  HelpCircle,
  UploadCloud,
  Search,
  PlusCircle,
  TrendingUp,
  Target,
  Layers,
  CheckCircle2,
  ListFilter
} from "lucide-react";

export default function App() {
  // Main state - target accounts
  const [targets, setTargets] = useState<TargetAccount[]>(defaultTargets);
  const [selectedTarget, setSelectedTarget] = useState<TargetAccount | null>(defaultTargets[2]); // Ohio Society of CPAs by default
  
  // Single selected workspace inputs (mirrored from selected target)
  const [orgName, setOrgName] = useState("Ohio Society of CPAs");
  const [debouncedOrgName, setDebouncedOrgName] = useState("Ohio Society of CPAs");
  const [selectedVertical, setSelectedVertical] = useState("cpa_finance");
  const [selectedLMS, setSelectedLMS] = useState("unsure_research");
  const [hasCredential, setHasCredential] = useState(true);
  const [fusionAngle, setFusionAngle] = useState(true);
  const [triggerSignal, setTriggerSignal] = useState("");
  const [debouncedTriggerSignal, setDebouncedTriggerSignal] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactTitle, setContactTitle] = useState("");

  // Search & Filter state for tracker desk
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [verticalFilter, setVerticalFilter] = useState<string>("all");

  // Excel integration and ingestion pipeline states
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");

  // Compact manual addition form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newLms, setNewLms] = useState("unsure_research");
  const [newVertical, setNewVertical] = useState("general_professional");
  const [newTrigger, setNewTrigger] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newTitle, setNewTitle] = useState("");

  // Advanced AI Persona state
  const [includeKeywords, setIncludeKeywords] = useState("");
  const [debouncedIncludeKeywords, setDebouncedIncludeKeywords] = useState("");
  const [excludeKeywords, setExcludeKeywords] = useState("");
  const [debouncedExcludeKeywords, setDebouncedExcludeKeywords] = useState("");
  const [readingLevel, setReadingLevel] = useState(6);
  const [tone, setTone] = useState<"formal" | "informal">("informal");

  // Focus pain point state (highly interactive - Pat can select which pain to focus outreach on)
  const [focusedPain, setFocusedPain] = useState<PainPoint | null>(null);

  // Outputs state
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMode, setGenerationMode] = useState<"genai" | "template" | "loading">("loading");

  // Selected Customer Story state (Pat can customize/override to use one of the alternates)
  const [activeStoryKey, setActiveStoryKey] = useState("");

  // Copy indicator states
  const [copiedState, setCopiedState] = useState<Record<string, boolean>>({});

  // Automated LMS Research states
  const [researchingLms, setResearchingLms] = useState(false);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [researchResult, setResearchResult] = useState<{
    detectedLms: string;
    detectedName: string | null;
    confidence: number;
    explanation: string;
    sources?: { title: string; uri: string }[];
    learningNews?: { headline: string; snippet: string; date?: string }[];
  } | null>(null);

  // One-time mounting effect to sync the initial default selection
  useEffect(() => {
    if (defaultTargets[2]) {
      handleSelectTarget(defaultTargets[2]);
    }
  }, []);

  // Row selection handler that sets all local parameters cleanly without keystroke feedback loop
  const handleSelectTarget = (target: TargetAccount) => {
    setSelectedTarget(target);
    setOrgName(target.orgName);
    setDebouncedOrgName(target.orgName);
    setSelectedVertical(target.verticalId);
    setSelectedLMS(target.lmsId);
    setHasCredential(target.hasCredential);
    setFusionAngle(target.fusionAngle);
    setTriggerSignal(target.triggerSignal);
    setDebouncedTriggerSignal(target.triggerSignal);
    setContactName(target.contactName || "");
    setContactTitle(target.contactTitle || "");

    // Load cached email subject and body directly if they already exist
    setEmailSubject(target.subject || "");
    setEmailBody(target.body || "");
    setGenerationMode(target.generationMode || "loading");

    // Auto-set focal pain point based on LMS
    const lmsData = lmsPainPoints[target.lmsId];
    if (lmsData && lmsData.pains && lmsData.pains.length > 0) {
      setFocusedPain(lmsData.pains[0]);
    } else {
      setFocusedPain(null);
    }
  };

  // Sync edits on detail fields back into the selectedTarget object in main array
  const updateTargetField = (field: keyof TargetAccount, value: any) => {
    if (!selectedTarget) return;

    // Fast-updates for specific fields to bind inputs reactive
    if (field === "orgName") {
      setOrgName(value);
    } else if (field === "verticalId") {
      setSelectedVertical(value);
    } else if (field === "lmsId") {
      setSelectedLMS(value);
      // Auto-update default focused pain when LMS is tweaked in-place
      const lmsData = lmsPainPoints[value];
      if (lmsData && lmsData.pains && lmsData.pains.length > 0) {
        setFocusedPain(lmsData.pains[0]);
      } else {
        setFocusedPain(null);
      }
    } else if (field === "hasCredential") {
      setHasCredential(value);
    } else if (field === "fusionAngle") {
      setFusionAngle(value);
    } else if (field === "triggerSignal") {
      setTriggerSignal(value);
    } else if (field === "contactName") {
      setContactName(value);
    } else if (field === "contactTitle") {
      setContactTitle(value);
    }

    // Cascade into targets state and selection state without circular load resets
    setTargets(prev => prev.map(t => {
      if (t.id === selectedTarget.id) {
        const updated = { ...t, [field]: value };
        // Clear generated email draft cache ONLY if a parameter governing message creation is modified
        if (["orgName", "verticalId", "lmsId", "triggerSignal", "hasCredential", "fusionAngle"].includes(field)) {
          delete updated.subject;
          delete updated.body;
          delete updated.generationMode;
        }
        return updated;
      }
      return t;
    }));

    setSelectedTarget(prev => {
      if (!prev) return null;
      const updated = { ...prev, [field]: value };
      if (["orgName", "verticalId", "lmsId", "triggerSignal", "hasCredential", "fusionAngle"].includes(field)) {
        delete updated.subject;
        delete updated.body;
        delete updated.generationMode;
      }
      return updated;
    });
  };

  // Live composers update active states and persist edits live inside chosen targets
  const handleEmailBodyChange = (newBody: string) => {
    setEmailBody(newBody);
    if (selectedTarget) {
      setTargets(prev => prev.map(t => {
        if (t.id === selectedTarget.id) {
          return { ...t, body: newBody };
        }
        return t;
      }));
      setSelectedTarget(prev => prev ? { ...prev, body: newBody } : null);
    }
  };

  const handleEmailSubjectChange = (newSubject: string) => {
    setEmailSubject(newSubject);
    if (selectedTarget) {
      setTargets(prev => prev.map(t => {
        if (t.id === selectedTarget.id) {
          return { ...t, subject: newSubject };
        }
        return t;
      }));
      setSelectedTarget(prev => prev ? { ...prev, subject: newSubject } : null);
    }
  };

  // Debouncing custom parameters to prevent rate limit spikes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedIncludeKeywords(includeKeywords);
    }, 700);
    return () => clearTimeout(timer);
  }, [includeKeywords]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedExcludeKeywords(excludeKeywords);
    }, 700);
    return () => clearTimeout(timer);
  }, [excludeKeywords]);

  // Debounce orgName and triggerSignal inputs for smooth typing feedback without crashing the workspace
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedOrgName(orgName);
    }, 600);
    return () => clearTimeout(timer);
  }, [orgName]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTriggerSignal(triggerSignal);
    }, 600);
    return () => clearTimeout(timer);
  }, [triggerSignal]);

  // Consolidated handler to trigger/re-run AI research on target LMS
  const triggerLmsResearch = async (force: boolean = false) => {
    if (!debouncedOrgName) return;
    setResearchingLms(true);
    setResearchResult(null);
    try {
      const response = await fetch("/api/research-lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgName: debouncedOrgName,
          triggerSignal: debouncedTriggerSignal,
          verticalId: selectedVertical,
          forceRegenerate: force
        }),
      });
      const data = await response.json();
      if (data && data.isQuotaExceeded) {
        setIsQuotaExceeded(true);
      }
      if (data && data.success) {
        setResearchResult({
          detectedLms: data.detectedLms,
          detectedName: data.detectedName,
          confidence: data.confidence,
          explanation: data.explanation,
          sources: data.sources,
          learningNews: data.learningNews
        });
        
        // Auto-trigger fresh outreach email generation with the newly scraped live professional learning updates
        generateOutreach(true, data.learningNews);
      }
    } catch (err) {
      console.warn("LMS research lookup notice (using local heuristics):", err);
    } finally {
      setResearchingLms(false);
    }
  };

  // Reset research result when organization name or target changes, prompting user to click real-time search manually
  useEffect(() => {
    setResearchResult(null);
  }, [debouncedOrgName, selectedLMS]);

  // Story matching logic based on selected vertical/compliance state
  const matchedStories = getStoryMatches(selectedVertical, hasCredential);
  useEffect(() => {
    if (matchedStories.primaryKey && !activeStoryKey) {
      setActiveStoryKey(matchedStories.primaryKey);
    }
  }, [selectedVertical, hasCredential]);

  // Execute outreach email generation (Gemini API with trigger support)
  const generateOutreach = async (forceRegenerate: boolean = false, customScrapedNews?: any[]) => {
    const lmsData = lmsPainPoints[selectedLMS] || { display_name: selectedLMS, pains: [] };
    const activePain = focusedPain || (lmsData.pains && lmsData.pains[0]) || { id: "generic", user_voice: "clunky navigation and limited reporting" };
    const verticalDisplay = verticals.find(v => v.id === selectedVertical)?.display || "prospects";

    // If target already has a cached/custom draft, load it directly instead of fetching from API
    if (selectedTarget && selectedTarget.id && selectedTarget.subject && selectedTarget.body && !forceRegenerate) {
      setEmailSubject(selectedTarget.subject);
      setEmailBody(selectedTarget.body);
      setGenerationMode(selectedTarget.generationMode || "genai");
      return;
    }

    setIsGenerating(true);
    setGenerationMode("loading");

    try {
      const response = await fetch("/api/generate-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgName: debouncedOrgName || "your association",
          verticalId: selectedVertical,
          verticalDisplay,
          lmsId: selectedLMS,
          lmsDisplay: lmsData.display_name,
          painPointId: activePain.id,
          painPointUserVoice: activePain.user_voice,
          hasCredential,
          fusionAngle,
          includeKeywords: debouncedIncludeKeywords,
          excludeKeywords: debouncedExcludeKeywords,
          readingLevel,
          tone,
          triggerSignal: debouncedTriggerSignal || undefined, // Send core research trigger if present
          scrapedNews: customScrapedNews !== undefined ? customScrapedNews : (researchResult?.learningNews || undefined),
          scrapedExplanation: researchResult?.explanation || undefined,
          forceRegenerate
        })
      });

      const data = await response.json();
      if (data && data.isQuotaExceeded) {
        setIsQuotaExceeded(true);
      }
      if (data && data.success) {
        setEmailSubject(data.subject);
        setEmailBody(data.body);
        setGenerationMode(data.mode);

        // Save generated email into main targets array and choice state
        if (selectedTarget) {
          setTargets(prev => prev.map(t => {
            if (t.id === selectedTarget.id) {
              return {
                ...t,
                subject: data.subject,
                body: data.body,
                generationMode: data.mode,
                status: t.status === "Target" ? "Ready" : t.status
              } as TargetAccount;
            }
            return t;
          }));
          setSelectedTarget(prev => {
            if (!prev) return null;
            return {
              ...prev,
              subject: data.subject,
              body: data.body,
              generationMode: data.mode,
              status: prev.status === "Target" ? "Ready" : prev.status
            } as TargetAccount;
          });
        }
      } else {
        throw new Error("Failed generation state");
      }
    } catch (err) {
      console.log("Client-side fallback outline trigger generation.");
      
      const isFormalEnv = tone === "formal";
      
      const emailSubjectOptions = debouncedTriggerSignal 
        ? [
            `quick question on ${debouncedOrgName}'s transition`,
            `adjusting to transition?`,
            `${debouncedOrgName} learning updates / shift`,
            `easy for members to track credits?`
          ]
        : [
            `easy for ${debouncedOrgName} members to find courses?`,
            `clunky ${lmsData.display_name} certification tracking?`,
            `quick question on ${debouncedOrgName} learning info`,
            `simplify ${verticalDisplay.toLowerCase()} training?`
          ];
      
      const subject = emailSubjectOptions[Math.floor(Math.random() * emailSubjectOptions.length)];
      
      let opener = "";
      if (debouncedTriggerSignal) {
        opener = isFormalEnv
          ? `Regarding the recent development at ${debouncedOrgName} regarding "${debouncedTriggerSignal}" — I wanted to inquire how this influences your learning programs.`
          : `Saw the updates about ${debouncedOrgName} shifting with "${debouncedTriggerSignal}" — got me thinking about how members are navigating courses.`;
      } else {
        opener = isFormalEnv
          ? `Regarding the learning initiatives at ${debouncedOrgName} — I wanted to inquire how your members navigate your current catalog.`
          : `Saw ${debouncedOrgName}'s training catalog — got me thinking about how members navigate courses.`;
      }
      
      let bodyIntro = "";
      if (debouncedTriggerSignal) {
        bodyIntro = isFormalEnv
          ? `Historically, transitions like "${debouncedTriggerSignal}" reveal technical limitations inside older legacy tools like ${lmsData.display_name}.`
          : `Usually, shifts like "${debouncedTriggerSignal}" show where older legacy platforms like ${lmsData.display_name} start pushing your staff to do manual work.`;
      } else {
        bodyIntro = isFormalEnv
          ? `We understand that groups utilizing ${lmsData.display_name} can occasionally encounter operational friction. Specifically, feedback indicates: "${activePain.user_voice}"`
          : `We've been hearing that with ${lmsData.display_name}, things can feel a bit sluggish. Specifically, we often hear: "${activePain.user_voice}"`;
      }
      
      let bodyOutro = isFormalEnv
        ? `We specialize in assisting ${verticalDisplay} groups to streamline member onboarding, credit tracking, and educational resource distribution.`
        : `We're helping other ${verticalDisplay} groups move away from spreadsheets and simplify how members learn and track credits. It's built to keep them coming back.`;

      if (debouncedIncludeKeywords) {
        const kwList = debouncedIncludeKeywords.split(",").map(k => k.trim()).filter(Boolean);
        if (kwList.length > 0) {
          bodyOutro += isFormalEnv
            ? ` We facilitate critical industry features such as ${kwList.join(" and ")} to meet modern standards.`
            : ` We natively support key features like ${kwList.join(" and ")} to match what members expect.`;
        }
      }

      const ctas = isFormalEnv
        ? [
            "Would you be open to a brief informational conversation to review what other associations are doing?",
            "I would welcome the opportunity to share some benchmarks we have observed."
          ]
        : [
            "Worth a quick chat?",
            "Open to comparing notes?"
          ];
      const cta = ctas[Math.floor(Math.random() * ctas.length)];
      const signoffLabel = isFormalEnv ? "Best regards,\nPat" : "Pat";
      
      let bodyText = `${opener}\n\n${bodyIntro}\n\n${bodyOutro}\n\n${cta}\n\n${signoffLabel}`;
      
      if (fusionAngle) {
        bodyText += isFormalEnv
          ? `\n\nP.S. — D2L is hosting our annual Fusion Conference in Phoenix, July 8-10. Many ${verticalDisplay.toLowerCase()} leaders will be in attendance. Let me know if you plan to attend.`
          : `\n\nP.S. — we're hosting Fusion in Phoenix July 8-10, lot of ${verticalDisplay.toLowerCase()} folks will be there. Worth grabbing 15 min if you're going?`;
      }

      if (debouncedExcludeKeywords) {
        const exList = debouncedExcludeKeywords.split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
        exList.forEach(ex => {
          const regex = new RegExp(`\\b${ex}\\b`, "gi");
          bodyText = bodyText.replace(regex, "");
        });
      }
      
      setEmailSubject(subject);
      setEmailBody(bodyText);
      setGenerationMode("template_fallback");
      
      // Save fallbacks to targets array cache
      if (selectedTarget) {
        setTargets(prev => prev.map(t => {
          if (t.id === selectedTarget.id) {
            return {
              ...t,
              subject: subject,
              body: bodyText,
              generationMode: "template_fallback",
              status: t.status === "Target" ? "Ready" : t.status
            } as TargetAccount;
          }
          return t;
        }));
        setSelectedTarget(prev => {
          if (!prev) return null;
          return {
            ...prev,
            subject: subject,
            body: bodyText,
            generationMode: "template_fallback",
            status: prev.status === "Target" ? "Ready" : prev.status
          } as TargetAccount;
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Automatically trigger email generation when primary conditions change
  useEffect(() => {
    generateOutreach();
  }, [
    debouncedOrgName,
    selectedVertical,
    selectedLMS,
    focusedPain,
    hasCredential,
    fusionAngle,
    debouncedTriggerSignal,
    debouncedIncludeKeywords,
    debouncedExcludeKeywords,
    readingLevel,
    tone
  ]);

  // Excel parsing & ingestion mechanics
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processSpreadsheet(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processSpreadsheet(files[0]);
    }
  };

  const processSpreadsheet = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(15);
    setUploadStatus(`Analyzing ${file.name} structure...`);

    const extension = file.name.split('.').pop()?.toLowerCase();

    // Helper to call backend parse-messy-file
    const callMessyApi = async (text: string, customExtension?: string) => {
      try {
        setUploadProgress(45);
        setUploadStatus("Synthesizing targets with outreach intelligence...");
        const response = await fetch("/api/parse-messy-file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text, fileName: file.name, extension: customExtension || extension }),
        });
        const result = await response.json();
        if (result && result.isQuotaExceeded) {
          setIsQuotaExceeded(true);
        }
        if (result && result.success && result.targets && result.targets.length > 0) {
          setUploadProgress(80);
          setUploadStatus("Refining trigger signal categorization...");
          setTimeout(() => {
            setUploadProgress(100);
            setUploadStatus("Successfully synthesized active targets dashboard!");
            setTargets(result.targets);
            handleSelectTarget(result.targets[0]);
            setIsUploading(false);
          }, 600);
          return true;
        }
      } catch (err) {
        console.warn("Outbound API parse failed, using client heuristic fallback", err);
      }
      return false;
    };

    const reader = new FileReader();

    if (extension === "xlsx" || extension === "xls") {
      reader.onload = async (evt) => {
        try {
          if (!evt.target || !evt.target.result) {
            setIsUploading(false);
            return;
          }
          const data = new Uint8Array(evt.target.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          
          // Get standard sheet structure and a CSV representation as fallback text
          const rawRows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          const fallbackCsvText = XLSX.utils.sheet_to_csv(sheet);

          // If standard sheet matches well
          if (rawRows.length >= 2) {
            const headers = rawRows[0].map((h: any) => String(h || "").trim().toLowerCase());
            const hasGoodHeader = headers.some((h: string) => h.includes("org") || h.includes("company") || h.includes("name") || h.includes("association") || h.includes("lms"));
            
            if (hasGoodHeader) {
              // Parse rows dynamically
              const orgIdx = headers.findIndex((h: string) => h.includes("org") || h.includes("company") || h.includes("name") || h.includes("association") || h.includes("client"));
              const verticalIdx = headers.findIndex((h: string) => h.includes("vert") || h.includes("industry") || h.includes("sector") || h.includes("type"));
              const lmsIdx = headers.findIndex((h: string) => h.includes("lms") || h.includes("platform") || h.includes("system") || h.includes("software"));
              const triggerIdx = headers.findIndex((h: string) => h.includes("trigger") || h.includes("signal") || h.includes("news") || h.includes("event") || h.includes("pain") || h.includes("note"));
              const contactIdx = headers.findIndex((h: string) => h.includes("contact") || h.includes("exec") || h.includes("person") || h.includes("lead") || h.includes("owner") || h.includes("name"));
              const titleIdx = headers.findIndex((h: string) => h.includes("title") || h.includes("role"));

              const rows = rawRows.slice(1).filter(r => r && r.length > 0);
              const parsed: TargetAccount[] = rows.map((row, idx) => {
                const orgVal = orgIdx !== -1 && row[orgIdx] ? String(row[orgIdx]).trim() : `Ingested Target ${idx + 1}`;
                
                let verticalId = "general_professional";
                if (verticalIdx !== -1 && row[verticalIdx]) {
                  const rawV = String(row[verticalIdx]).toLowerCase();
                  if (rawV.includes("health") || rawV.includes("nurse") || rawV.includes("med") || rawV.includes("clinic")) verticalId = "healthcare";
                  else if (rawV.includes("cpa") || rawV.includes("finance") || rawV.includes("tax")) verticalId = "cpa_finance";
                  else if (rawV.includes("trade") || rawV.includes("manuf") || rawV.includes("construction")) verticalId = "trade_manufacturing";
                  else if (rawV.includes("board") || rawV.includes("cred") || rawV.includes("cert")) verticalId = "credentialing_board";
                  else if (rawV.includes("ce") || rawV.includes("prov")) verticalId = "ce_provider";
                }

                let lmsId = "unsure_research";
                if (lmsIdx !== -1 && row[lmsIdx]) {
                  const rawL = String(row[lmsIdx]).toLowerCase();
                  if (rawL.includes("forj") || rawL.includes("comm") || rawL.includes("web course")) lmsId = "forj";
                  else if (rawL.includes("topclass") || rawL.includes("wbt") || rawL.includes("systems")) lmsId = "topclass";
                  else if (rawL.includes("docebo")) lmsId = "docebo";
                  else if (rawL.includes("thought") || rawL.includes("indust")) lmsId = "thought_industries";
                  else if (rawL.includes("blue") || rawL.includes("path")) lmsId = "blue_sky";
                  else if (rawL.includes("litmos")) lmsId = "litmos";
                  else if (rawL.includes("crowd") || rawL.includes("cadm")) lmsId = "crowd_wisdom";
                  else if (rawL.includes("moodle")) lmsId = "moodle";
                  else if (rawL.includes("home")) lmsId = "homegrown_or_none";
                }

                let trigSig = "";
                if (triggerIdx !== -1 && row[triggerIdx]) {
                  trigSig = String(row[triggerIdx]).trim();
                } else {
                  const friendlyLms = lmsId === "unsure_research" ? "legacy learning portal" : (lmsPainPoints[lmsId]?.display_name || "legacy LMS");
                  const syntheticTriggers = [
                    `Member complaints surfaced concerning ${friendlyLms} certificate download lags.`,
                    `Newly hired Training Manager announces review of all legacy ${friendlyLms} workflows.`,
                    `Upcoming Q4 contract negotiation window opens with legacy vendor ${friendlyLms}.`,
                    `Critical database API sync failure reported between membership system and ${friendlyLms}.`,
                    `Industry renewal guidelines audit forces evaluation of more reliable CE integrations.`
                  ];
                  trigSig = syntheticTriggers[idx % syntheticTriggers.length];
                }

                const cName = contactIdx !== -1 && row[contactIdx] ? String(row[contactIdx]).trim() : "Member Services Director";
                const cTitle = titleIdx !== -1 && row[titleIdx] ? String(row[titleIdx]).trim() : "CE Compliance Administrator";
                const conf = Math.floor(Math.random() * 15) + 82;

                return {
                  id: `excel-${Date.now()}-${idx}`,
                  orgName: orgVal,
                  verticalId,
                  lmsId,
                  triggerSignal: trigSig,
                  contactName: cName,
                  contactTitle: cTitle,
                  confidence: conf,
                  lastUpdated: "Just Imported",
                  status: "Target",
                  hasCredential: true,
                  fusionAngle: true
                };
              });

              if (parsed.length > 0) {
                setUploadProgress(70);
                setTimeout(() => {
                  setUploadProgress(100);
                  setUploadStatus("Successfully parsed targets!");
                  setTargets(parsed);
                  handleSelectTarget(parsed[0]);
                  setIsUploading(false);
                }, 1000);
                return;
              }
            }
          }

          // If standard parse failed, send CSV text version to backend for dynamic parse
          const success = await callMessyApi(fallbackCsvText);
          if (!success) {
            alert("Dynamic scan was unable to extract layout targets. Try utilizing standard tabular listings or structured clipboard documents.");
            setIsUploading(false);
          }
        } catch (e) {
          console.warn("Excel processing exception", e);
          setIsUploading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (extension === "pdf") {
      reader.onload = async (evt) => {
        try {
          if (!evt.target || !evt.target.result) {
            setIsUploading(false);
            return;
          }
          const dataUrl = evt.target.result as string;
          const commaIndex = dataUrl.indexOf(",");
          const base64 = commaIndex !== -1 ? dataUrl.substring(commaIndex + 1) : dataUrl;
          const success = await callMessyApi(base64, "pdf");
          if (!success) {
            alert("Dynamic scanner was unable to structuralize target accounts from this PDF. Try copy-pasting the text or verify contents are legible.");
            setIsUploading(false);
          }
        } catch (e) {
          console.warn("PDF file processing exception:", e);
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } else {
      // JSON, CSV, HTML, TXT or other formats
      reader.onload = async (evt) => {
        try {
          if (!evt.target || !evt.target.result) {
            setIsUploading(false);
            return;
          }
          const text = evt.target.result as string;
          const success = await callMessyApi(text);
          if (!success) {
            alert("Dynamic scanner was unable to structuralize target accounts from this document. Verify contents are legible and try again.");
            setIsUploading(false);
          }
        } catch (e) {
          console.warn("Document text processing exception", e);
          setIsUploading(false);
        }
      };
      reader.readAsText(file);
    }
  };

  // Manual Target Adder function to let Pat quickly drop and compile triggers
  const handleAddManualTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName) {
      alert("Please specify the Organization Name.");
      return;
    }

    const created: TargetAccount = {
      id: `manual-${Date.now()}`,
      orgName: newOrgName,
      verticalId: newVertical,
      lmsId: newLms,
      triggerSignal: newTrigger || "Regular business evaluation cycle reveals appetite for modern digital catalog upgrade.",
      contactName: newContact || "Director of Member Experience",
      contactTitle: newTitle || "Training Lead",
      confidence: Math.floor(Math.random() * 10) + 88,
      lastUpdated: "Created just now",
      status: "Target",
      hasCredential: true,
      fusionAngle: true
    };

    setTargets(prev => [created, ...prev]);
    handleSelectTarget(created);
    setShowAddForm(false);
    
    // reset form inputs
    setNewOrgName("");
    setNewTrigger("");
    setNewContact("");
    setNewTitle("");
  };

  // Copy helper
  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedState(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const currentLmsData = lmsPainPoints[selectedLMS] || { display_name: "LMS", category_note: "", competitive_strength: "", pains: [] };
  const currentStory = customerStories[activeStoryKey] || matchedStories.primaryStory;
  const currentDiscoveryQuestion = getDiscoveryQuestion(focusedPain?.id || "generic", currentLmsData.display_name);

  // Format pain points text for copying
  const getPainPointsText = (): string => {
    return `LMS Pain Points for ${currentLmsData.display_name}:\n` + 
      currentLmsData.pains.map((p, idx) => `${idx + 1}. Pain: "${p.user_voice}"\n  Discovery Signals: ${p.discovery_signal || "N/A"}`).join("\n\n");
  };

  // Format customer story text for copying
  const getCustomerStoryCopyText = (): string => {
    return `Story: ${currentStory.display_name} (${currentStory.official_name})\nOutcome: ${currentStory.one_line_outcome}\nMapping Logic: ${currentStory.why_it_maps}`;
  };

  // Filtering targets for the dynamic grid view
  const filteredTargets = targets.filter(t => {
    const matchesSearch = t.orgName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.triggerSignal.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
                          (statusFilter === "high_risk" && t.confidence >= 90) ||
                          (statusFilter === t.status.toLowerCase());
                          
    const matchesVertical = verticalFilter === "all" || t.verticalId === verticalFilter;

    return matchesSearch && matchesStatus && matchesVertical;
  });

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-800 font-sans flex flex-col">
      {/* Dynamic Header */}
      <header className="bg-white border-b border-slate-200 px-6 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#7db924] rounded-lg flex items-center justify-center font-bold text-white text-xs font-display shadow-md">
            D2L
          </div>
          <div>
            <h1 id="app-title" className="text-xl font-bold font-display tracking-tight text-slate-900 flex flex-wrap items-center gap-2">
              Displacement Angle Finder
              <span className="text-[10px] uppercase font-bold tracking-wider bg-brand/10 text-brand px-2.5 py-0.5 rounded-full border border-brand/20">
                Outbound Trigger Desk v3.0
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Drop excel lists and track live competitor displacement news triggers instantly.
            </p>
          </div>
        </div>
        
        {/* KPI Indicators in Header */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Targets Loaded</span>
            <span className="text-sm font-bold text-slate-800 font-mono text-center">{targets.length}</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">High Risk Count (Conf &gt; 90%)</span>
            <span className="text-sm font-bold text-red-600 font-mono text-center">
              {targets.filter(t => t.confidence >= 90).length}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-brand/5 border border-brand/20 px-3.5 py-2 rounded-lg text-brand font-semibold text-xs animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-brand"></span>
            Real-time Tracker Desk Live
          </div>
        </div>
      </header>

      {/* Quota warning banner */}
      {isQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3.5 flex items-center justify-between gap-4 text-slate-800 text-xs">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
              <span>
                <strong>Notice:</strong> Claude API rate limit reached. The system has automatically activated local heuristic template matching so your campaign outreach and targeting workflows can continue instantly. To restore real-time AI, set your <strong>ANTHROPIC_API_KEY</strong> environment variable.
              </span>
            </div>
            <button 
              type="button"
              onClick={() => setIsQuotaExceeded(false)}
              className="text-amber-800 hover:text-amber-950 font-bold uppercase tracking-wider text-[10px] bg-amber-200 hover:bg-amber-300 px-3 py-1 rounded cursor-pointer transition-colors whitespace-nowrap"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col gap-6">
        
        {/* Top Segment: Live Trigger Tracker & spreadsheet Upload */}
        <section id="trigger-tracker-panel" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* File input / Drag zone & Adder (Grid columns: 4/12) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold font-display uppercase tracking-tight text-slate-800 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-brand" />
                Prospect List Ingestion
              </h2>
              {targets.length > 0 && (
                <button 
                  onClick={() => {
                    setTargets(defaultTargets);
                    handleSelectTarget(defaultTargets[2]);
                  }}
                  className="text-[10px] text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                >
                  Reset Defaults
                </button>
              )}
            </div>

            {/* Ingestion Box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-5 text-center flex flex-col justify-center items-center transition-all min-h-[160px] cursor-pointer relative overflow-hidden ${
                isDragging
                  ? "border-brand bg-brand/5 scale-[0.99]"
                  : "border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100/50"
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center justify-center gap-3 w-full px-2">
                  <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-brand animate-spin"></div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-700">{uploadProgress}% Analyzed</p>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase tracking-wider animate-pulse">{uploadStatus}</p>
                  </div>
                  {/* Visual Progress bar */}
                  <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden mt-1">
                    <div className="bg-brand h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer py-1 select-none">
                  <UploadCloud className="w-8 h-8 text-slate-400 mb-2.5 group-hover:text-brand" />
                  <span className="text-xs font-bold text-slate-700 block mb-1">
                    Drop client sheet, PDF, JSON, HTML or TXT here
                  </span>
                  <span className="text-[10px] text-slate-400 block mb-3 text-center px-4 leading-normal">
                    Supports .xlsx, .pdf, .csv, .json, .html & .txt files with auto-extraction
                  </span>
                  <span className="text-[9px] bg-slate-200 text-slate-600 font-semibold px-2.5 py-1 rounded-full">
                    Auto-Maps LMS, Verticals, and Triggers
                  </span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.pdf,.csv,.json,.html,.htm,.txt,.log"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Quick manual target inclusion toggle */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="w-full bg-slate-50 hover:bg-slate-100/80 px-4 py-2.5 text-xs font-bold text-slate-700 flex items-center justify-between border-b border-slate-200"
              >
                <span className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-slate-500" />
                  Manually Add Displacement Target
                </span>
                <ChevronRight className={`w-4 h-4 text-slate-450 transition-transform ${showAddForm ? "rotate-90" : ""}`} />
              </button>

              {showAddForm && (
                <form onSubmit={handleAddManualTarget} className="p-4 bg-white space-y-3">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Org/Association Name"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-brand/40 outline-none text-slate-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newVertical}
                      onChange={(e) => setNewVertical(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-brand/40 outline-none text-slate-900 font-semibold"
                    >
                      {verticals.map(v => (
                        <option key={v.id} value={v.id}>{v.display}</option>
                      ))}
                    </select>
                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-indigo-800 bg-indigo-50/80 border border-indigo-100 rounded px-2 py-1 font-bold">
                      <Sparkles className="w-3 h-3 text-indigo-600 animate-pulse" />
                      AI LMS Hunter Activated
                    </div>
                  </div>
                  <div>
                    <textarea
                      placeholder="What is the transition trigger/displacement signal?"
                      value={newTrigger}
                      onChange={(e) => setNewTrigger(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-brand/40 outline-none text-slate-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Contact Person (e.g. Pat)"
                      value={newContact}
                      onChange={(e) => setNewContact(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-brand/40 outline-none text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="Title (e.g. CEO)"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-brand/40 outline-none text-slate-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-850 text-white font-bold py-1.5 rounded text-xs transition-colors cursor-pointer"
                  >
                    Add Target and Focus Outreach
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Tracker desk grid database table (Grid columns: 8/12) */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold font-display uppercase tracking-tight text-slate-800 flex items-center gap-2">
                <Target className="w-4 h-4 text-brand" />
                Live Target Displacement Tracker Feed
              </h2>
              
              {/* Filter controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    placeholder="Search accounts or triggers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand/40 w-full sm:w-44 text-slate-900"
                  />
                </div>

                {/* Status Drop Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand/40 text-slate-850 font-medium"
                >
                  <option value="all">Any Status</option>
                  <option value="high_risk">High Displacement Risk (90%+)</option>
                  <option value="target">Unprocessed Targets</option>
                  <option value="ready">Draft Prepared</option>
                  <option value="displaced">Displaced Accounts</option>
                </select>
              </div>
            </div>

            {/* Ingested Accounts dynamic grid table */}
            <div className="overflow-x-auto border border-slate-250 rounded-xl bg-slate-50/30 max-h-[290px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4 font-bold select-none">Organization</th>
                    <th className="py-3 px-3 font-bold select-none">Current LMS</th>
                    <th className="py-3 px-4 font-bold select-none">Observed Transition Trigger</th>
                    <th className="py-3 px-3 font-bold select-none">Score</th>
                    <th className="py-3 px-3 text-right font-bold select-none">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs text-slate-700 bg-white">
                  {filteredTargets.length > 0 ? (
                    filteredTargets.map((account) => {
                      const isSelected = selectedTarget?.id === account.id;
                      const isHighConf = account.confidence >= 90;
                      return (
                        <tr
                          key={account.id}
                          onClick={() => handleSelectTarget(account)}
                          className={`hover:bg-slate-50/80 cursor-pointer transition-all ${
                            isSelected ? "bg-brand/10 hover:bg-brand/15 font-semibold" : ""
                          }`}
                        >
                          <td className="py-3 px-4 font-semibold text-slate-905">
                            <div className="flex items-center gap-2">
                              {isSelected ? (
                                <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                              ) : (
                                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              )}
                              <div>
                                <div className="font-bold text-slate-900">{account.orgName}</div>
                                <div className="text-[10px] text-slate-400 font-normal">
                                  {verticals.find(v => v.id === account.verticalId)?.display || "General professional"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            {account.lmsId === "unsure_research" ? (
                              <span className="bg-indigo-50 text-indigo-700 font-bold text-[9px] py-1 px-2.5 rounded-md border border-indigo-200 inline-flex items-center gap-1 shadow-2xs">
                                <Sparkles className="w-2.5 h-2.5 text-indigo-600 animate-spin" style={{ animationDuration: "3s" }} />
                                AI Hunter
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-700 font-mono text-[10px] py-1 px-2.5 rounded-md border border-slate-200/50">
                                {lmsPainPoints[account.lmsId]?.display_name || "Unknown"}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <p className="line-clamp-2 text-[11px] text-slate-600 font-medium leading-relaxed italic">
                              "{account.triggerSignal}"
                            </p>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1">
                              <TrendingUp className={`w-3.5 h-3.5 ${isHighConf ? "text-red-500" : "text-amber-500"}`} />
                              <span className={`font-mono text-[11px] font-bold ${
                                isHighConf ? "text-red-600" : "text-amber-600"
                              }`}>
                                {account.confidence}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className={`inline-block text-[9px] font-bold py-1 px-2.5 rounded-full uppercase ${
                              account.status === "Displaced" ? "bg-slate-900 text-white" :
                              account.status === "Ready" ? "bg-brand/20 text-brand" :
                              account.status === "Processing" ? "bg-amber-100 text-amber-800 animate-pulse" :
                              "bg-slate-100 text-slate-500"
                            }`}>
                              {account.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-slate-400 text-center text-xs">
                        <AlertCircle className="w-7 h-7 mx-auto text-slate-350 mb-2" />
                        No active triggers found checking search key "{searchTerm}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <p className="text-[10px] text-slate-400 italic">
              💡 <strong>Protip:</strong> Selecting a prospect in the tracking grid loads their triggers and target info directly into the workspace below!
            </p>
          </div>
        </section>

        {/* Content columns split: 5/12 Left (Details Card), 7/12 Right (Outreach Kit) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full flex-1 items-stretch">
          
          {/* Left Column (Card desk parameters and settings) */}
          <div className="lg:col-span-5 flex flex-col gap-6 h-full">
            
            {/* Target Details Workspace Card */}
            <div id="target-details-card" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col relative relative group overflow-hidden">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                <h2 className="text-sm font-bold font-display uppercase text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-brand rounded-full animate-pulse"></span>
                  Active Target Details Context
                </h2>
                {selectedTarget && (
                  <span className="text-[10px] font-bold font-mono text-slate-400">
                    Source: {selectedTarget.id.startsWith("manual") ? "Custom Form" : selectedTarget.id.startsWith("excel") ? "Ingested Excel" : "Default Database"}
                  </span>
                )}
              </div>

              {selectedTarget ? (
                <div className="space-y-4">
                  {/* Account Name input */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                      Prospect Organization Title (Editable)
                    </label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => updateTargetField("orgName", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900"
                    />
                  </div>

                  {/* Vertical & Competing LMS Select */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                        Target Market Vertical
                      </label>
                      <select
                        value={selectedVertical}
                        onChange={(e) => updateTargetField("verticalId", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-205 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold"
                      >
                        {verticals.map((v) => (
                          <option key={v.id} value={v.id}>{v.display}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                        Competitor LMS
                      </label>
                      {selectedLMS === "unsure_research" ? (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 border-dashed rounded-lg px-3 py-1.5 text-xs text-indigo-900 font-bold flex items-center gap-1.5 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping"></span>
                          <span>AI Hunt Scanner Active</span>
                        </div>
                      ) : (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-1 text-xs text-indigo-900 font-bold flex items-center justify-between">
                          <span className="truncate">
                            🔒 {lmsPainPoints[selectedLMS]?.display_name || selectedLMS}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateTargetField("lmsId", "unsure_research")}
                            className="text-[9px] text-indigo-650 hover:text-indigo-800 font-extrabold underline cursor-pointer ml-1"
                            title="Reset to dynamic AI LMS Hunter scanner"
                          >
                            Reset
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI LMS Autodetect Info & Interactive Apply */}
                  {selectedLMS === "unsure_research" && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3.5 space-y-2.5 shadow-sm transform transition duration-300">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-750 tracking-wider uppercase flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-600" />
                          AI Real-Time Scraper Engine
                        </span>
                        {researchingLms ? (
                          <span className="text-[10px] font-medium text-indigo-600 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                            Scraping Web in Real-Time...
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {researchResult && (
                              <button
                                type="button"
                                onClick={() => triggerLmsResearch(true)}
                                className="text-[9.5px] bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold px-2 py-0.5 rounded transition cursor-pointer"
                                title="Force fresh AI Web scraping"
                              >
                                Re-Scrape
                              </button>
                            )}
                            <span className="text-[9px] bg-indigo-100 text-indigo-850 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                              Scraper Ready
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {researchingLms ? (
                        <div className="space-y-1.5 py-1">
                          <div className="h-3.5 bg-indigo-200/50 rounded-full w-4/5 animate-pulse" />
                          <div className="h-2.5 bg-indigo-200/40 rounded-full w-2/3 animate-pulse" />
                        </div>
                      ) : researchResult ? (
                        <div className="space-y-3.5">
                          <div className="bg-white/80 rounded-lg p-2.5 border border-blue-105 shadow-2xs">
                            <p className="text-xs text-slate-705 leading-relaxed font-semibold">
                              {researchResult.explanation}
                            </p>
                          </div>
                          
                          {researchResult.detectedLms && researchResult.detectedLms !== "unsure_research" ? (
                            <div className="flex items-center gap-2 pt-1 border-t border-blue-100">
                              <span className="text-[10px] font-semibold text-slate-500">
                                Inferred LMS: <strong className="text-indigo-750 font-bold">{researchResult.detectedName}</strong> ({researchResult.confidence}% confidence)
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  updateTargetField("lmsId", researchResult.detectedLms);
                                }}
                                className="ml-auto bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-[10px] px-2.5 py-1 rounded-md transition duration-155 shadow-xs cursor-pointer"
                              >
                                Apply
                              </button>
                            </div>
                          ) : (
                            <div className="text-[10px] text-amber-700 font-semibold bg-amber-50 rounded-lg p-2 border border-amber-200 leading-relaxed">
                              ⚠️ No specific LMS brand verified. Email generator has prioritized your Trigger Signal.
                            </div>
                          )}

                          {/* Live Continuing Education & Learning News */}
                          {researchResult.learningNews && researchResult.learningNews.length > 0 && (
                            <div className="pt-2.5 border-t border-blue-100 space-y-1.5">
                              <span className="text-[9.5px]/[13px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 text-emerald-800">
                                <span className="flex h-2 w-2 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                📡 Scraped Learning & Continuing Ed News:
                              </span>
                              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                {researchResult.learningNews.map((news, i) => (
                                  <div
                                    key={i}
                                    className="bg-emerald-50/45 hover:bg-emerald-50 border border-emerald-125/25 rounded-md p-2 transition duration-155"
                                  >
                                    <div className="flex items-start justify-between gap-1.5 mb-1">
                                      <h4 className="text-[10px] font-bold text-slate-800 leading-snug">
                                        {news.headline}
                                      </h4>
                                      {news.date && (
                                        <span className="text-[7.5px] bg-emerald-100/70 text-emerald-850 font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                          {news.date}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[9.5px] text-slate-600 leading-relaxed font-semibold">
                                      {news.snippet}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Interactive list of audited scraper source references */}
                          {researchResult.sources && researchResult.sources.length > 0 && (
                            <div className="pt-2 border-t border-blue-100 space-y-1.5">
                              <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block">
                                🔍 Visited Footprints & Citations:
                              </span>
                              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                                {researchResult.sources.map((src, i) => (
                                  <a
                                    key={i}
                                    href={src.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-[10px] text-indigo-650 hover:text-indigo-850 font-medium bg-white/70 hover:bg-indigo-50/80 border border-indigo-125/40 rounded px-2.5 py-1.5 transition duration-155 hover:translate-x-0.5"
                                  >
                                    <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                                    <span className="truncate flex-1 font-bold">{src.title}</span>
                                    <span className="text-[8.5px] text-slate-400 font-extrabold font-mono uppercase">Audited</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-2 px-3 bg-white/80 border border-blue-105 rounded-xl space-y-2.5 flex flex-col items-center text-center">
                          <p className="text-[11px] text-slate-600 leading-relaxed max-w-sm">
                            Scrapes digital tech directories, subdomains, and search archives matching <strong className="text-indigo-900 font-bold">"{orgName}"</strong> in real-time.
                          </p>
                          <button
                            type="button"
                            onClick={() => triggerLmsResearch(true)}
                            className="w-full bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-750 text-white font-extrabold text-[11px] px-3.5 py-2 rounded-lg transition duration-155 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Search className="w-3.5 h-3.5" />
                            Launch Real-Time AI Scraper
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Contact details */}
                  <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-100">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Contact Lead</label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => updateTargetField("contactName", e.target.value)}
                        placeholder="N/A"
                        className="w-full bg-slate-50 border border-slate-180 rounded pl-2 pr-2 py-1 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Title Role</label>
                      <input
                        type="text"
                        value={contactTitle}
                        onChange={(e) => updateTargetField("contactTitle", e.target.value)}
                        placeholder="N/A"
                        className="w-full bg-slate-50 border border-slate-180 rounded pl-2 pr-2 py-1 text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="flex flex-wrap items-center gap-4 py-1.5 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={hasCredential}
                        onChange={(e) => updateTargetField("hasCredential", e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-brand focus:ring-brand/20 accent-[#7db924]"
                      />
                      <span className="text-xs font-semibold text-slate-600">State Credential Active</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={fusionAngle}
                        onChange={(e) => updateTargetField("fusionAngle", e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-brand focus:ring-brand/20 accent-[#7db924]"
                      />
                      <span className="text-xs font-semibold text-slate-600">Fusion PS Angle</span>
                    </label>
                  </div>

                  {/* Core Outbound Research Trigger Input */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Selected Outreach Trigger Signal (Editable)
                      </label>
                      <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded capitalize">
                        Targeting Signal
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={triggerSignal}
                      onChange={(e) => updateTargetField("triggerSignal", e.target.value)}
                      className="w-full bg-red-50/40 border border-red-200 rounded-lg p-3 text-xs leading-relaxed italic text-red-900 font-medium"
                      placeholder="Enter custom event trigger (e.g., board resignation, negative press, platform outage)..."
                    />
                    <p className="text-[9px] text-slate-455 mt-1">
                      Our AI outreach model prioritizes this trigger event to construct highly relevant messages compared to legacy cold templates.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-slate-400 text-center">
                  Select a prospect card from the tracker grid to begin.
                </div>
              )}
            </div>

            {/* Custom Guardrails & AI Persona Parameters */}
            <div id="ai-persona-card" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col relative overflow-hidden group">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                <h2 className="text-sm font-bold font-display text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand animate-pulse" />
                  AI Persona & Custom Guardrails
                </h2>
                <span className="text-[10px] font-bold font-sans bg-brand/10 text-brand px-2 py-0.5 rounded-full uppercase">
                  Persona Engine v2
                </span>
              </div>

              <div className="space-y-4">
                {/* Tone select */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-wider">
                    Outreach Sales Tone
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setTone("informal")}
                      className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                        tone === "informal"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-750"
                      }`}
                    >
                      Conversational (Pat Style)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTone("formal")}
                      className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                        tone === "formal"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-750"
                      }`}
                    >
                      Formal & Professional
                    </button>
                  </div>
                </div>

                {/* Reading Level */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Target Grade Level
                    </label>
                    <span className="text-xs font-bold text-brand">
                      {readingLevel === 5 ? "5th Grade (Simple)" : 
                       readingLevel === 6 ? "6th Grade (Very Clear)" :
                       readingLevel === 7 ? "7th Grade (Clear)" :
                       readingLevel === 8 ? "8th Grade (Standard)" :
                       readingLevel === 9 ? "9th Grade (Engaging)" :
                       readingLevel === 10 ? "10th Grade (Pro)" :
                       readingLevel === 11 ? "11th Grade (Sophisticated)" : "12th Grade (Academic)"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="12"
                    value={readingLevel}
                    onChange={(e) => setReadingLevel(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-brand"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-semibold px-0.5 mt-1">
                    <span>5th Grade</span>
                    <span>8th Grade</span>
                    <span>12th Grade</span>
                  </div>
                </div>

                {/* Include keywords */}
                <div>
                  <label htmlFor="include-keywords" className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                    Keywords to Include
                  </label>
                  <input
                    id="include-keywords"
                    type="text"
                    value={includeKeywords}
                    onChange={(e) => setIncludeKeywords(e.target.value)}
                    placeholder="e.g. Brightspace, student mobile app, 24/7 support"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand/50 text-slate-900"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">
                    Force the AI to weave in these items naturally. Comma-separated.
                  </p>
                </div>

                {/* Exclude keywords */}
                <div>
                  <label htmlFor="exclude-keywords" className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                    Guardrails: Keywords to Exclude
                  </label>
                  <input
                    id="exclude-keywords"
                    type="text"
                    value={excludeKeywords}
                    onChange={(e) => setExcludeKeywords(e.target.value)}
                    placeholder="e.g. synergistic, circle back (overrides default lists)"
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand/50 text-slate-900"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">
                    Keep the AI completely clean of these terms. Comma-separated.
                  </p>
                </div>
              </div>
            </div>

            {/* Pain Points Module (Fallback catalog list) */}
            <div id="section-1-pains" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col relative relative group overflow-hidden">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                <h2 className="text-sm font-bold font-display text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-red-400 rounded-full"></span>
                  Static Pain Catalog: {currentLmsData.display_name}
                </h2>
                <button
                  type="button"
                  onClick={() => copyToClipboard("pains", getPainPointsText())}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full font-bold uppercase transition-colors text-slate-600 cursor-pointer"
                >
                  {copiedState["pains"] ? "Copied!" : "Copy Catalog"}
                </button>
              </div>

              <p className="text-[10px] text-slate-440 mb-3.5 italic leading-relaxed">
                If custom trigger is empty, the outreach builds around this selected point. <strong>Toggle to select a baseline pain:</strong>
              </p>

              <div className="space-y-3">
                {currentLmsData.pains && currentLmsData.pains.length > 0 ? (
                  currentLmsData.pains.map((pain) => {
                    const isFocused = focusedPain?.id === pain.id;
                    return (
                      <div
                        key={pain.id}
                        onClick={() => setFocusedPain(pain)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isFocused
                            ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                            : "bg-slate-50 hover:bg-slate-100/60 border-slate-200 text-slate-700 hover:border-slate-350"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`text-[9px] font-bold font-mono uppercase tracking-wider ${
                            isFocused ? "text-brand" : "text-slate-400"
                          }`}>
                            {pain.id.replace(/_/g, " ")}
                          </span>
                          {isFocused && (
                            <span className="text-[8px] bg-brand text-white font-bold px-1 rounded uppercase">
                              Focused
                            </span>
                          )}
                        </div>
                        
                        <p className={`text-xs font-semibold leading-relaxed italic ${isFocused ? "text-white" : "text-slate-900"}`}>
                          "{pain.user_voice}"
                        </p>

                        {pain.discovery_signal && (
                          <div className="mt-2 pt-1 border-t border-slate-200/10 text-[9px] truncate">
                            <span className={`${isFocused ? "text-slate-300" : "text-slate-400"} font-bold uppercase tracking-wider mr-1`}>
                              Signal:
                            </span>
                            <span className={isFocused ? "text-slate-200" : "text-slate-600"}>
                              {pain.discovery_signal}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-slate-400 py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                    No explicit pains specified for this LMS profile.
                  </div>
                )}
              </div>
            </div>

            {/* Section 3 & 4 — Customer Story and Discovery Question combined card */}
            <div id="section-3-story" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between overflow-hidden gap-5">
              
              {/* Customer Story module */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-sm font-bold font-display text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-blue-400 rounded-full"></span>
                    Verified Success Story Mapped
                  </h2>
                  <button
                    type="button"
                    onClick={() => copyToClipboard("story", getCustomerStoryCopyText())}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full font-bold uppercase transition-colors text-slate-600 cursor-pointer"
                  >
                    {copiedState["story"] ? "Copied!" : "Copy Case"}
                  </button>
                </div>

                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/70 text-left mb-3.5">
                  <div className="text-blue-900 font-bold text-sm mb-1 leading-tight">
                    {currentStory.official_name} ({currentStory.display_name})
                  </div>
                  <p className="text-xs text-slate-750 leading-relaxed mb-2 pb-2 border-b border-blue-100/40">
                    {currentStory.one_line_outcome}
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold italic">
                    Why it maps: {currentStory.why_it_maps}
                  </p>

                  {currentStory.not_in_source_csv && (
                    <div className="mt-2.5 p-2 bg-amber-50 border border-amber-100/80 rounded text-[10px] text-amber-800">
                      <strong>Placeholder:</strong> {currentStory.warning}
                    </div>
                  )}
                </div>

                {/* Alternate toggle */}
                {matchedStories.alternates && matchedStories.alternates.length > 0 && (
                  <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-200/60">
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">
                      Or Toggle Alternative Case Study:
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {matchedStories.alternates.map((item) => {
                        const isSelected = activeStoryKey === item.key;
                        return (
                          <div
                            key={item.key}
                            onClick={() => setActiveStoryKey(item.key)}
                            className={`p-2 rounded border text-left cursor-pointer transition-all text-[11px] ${
                              isSelected
                                ? "bg-slate-900 border-slate-900 text-white font-medium"
                                : "bg-white hover:bg-slate-150 border-slate-200 text-slate-650"
                            }`}
                          >
                            <div className="font-bold truncate">{item.story.display_name}</div>
                            <div className="text-[9px] opacity-80 truncate">{item.story.one_line_outcome}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Discovery Question module */}
              <div id="section-4-question" className="border-t border-slate-100 pt-4">
                <div className="flex justify-between items-center mb-2.5">
                  <h2 className="text-sm font-bold font-display text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-amber-400 rounded-full"></span>
                    Diagnostic Discovery Question
                  </h2>
                  <button
                    type="button"
                    onClick={() => copyToClipboard("question", currentDiscoveryQuestion)}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full font-bold uppercase transition-colors text-slate-600 cursor-pointer"
                  >
                    {copiedState["question"] ? "Copied!" : "Copy Question"}
                  </button>
                </div>
                
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 italic font-medium leading-relaxed">
                  "{currentDiscoveryQuestion}"
                </p>
                <div className="text-[10px] text-slate-400 mt-2 italic">
                  <strong>Diagnostic Call Tip:</strong> Plant doubt on outdated workflows without triggering standard vendor defense alerts.
                </div>
              </div>
            </div>

            {/* Territory Notices */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-slate-705 shadow-2xs">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-slate-450 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h3 className="font-bold font-display uppercase tracking-wider text-slate-800">Pat's Territory Playbook Guard</h3>
                  <p className="text-slate-500 mt-0.5 leading-relaxed">
                    Focused region: <strong>PA, OH, MI, MN, WI, TN, KY, DE</strong>. Multi-credential high-stakes accreditation stories mapped dynamically to assure proof validity.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Outreach workspace (Outbound Outreach Email Desk) */}
          <div id="section-2-email" className="lg:col-span-7 bg-slate-900 rounded-2xl p-6 shadow-xl flex flex-col text-slate-105 h-full justify-between items-stretch min-h-[640px]">
            
            {/* Context Card Headers */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10 shrink-0">
              <h2 className="text-sm font-bold tracking-widest uppercase text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-brand rounded-full animate-ping"></span>
                Outbound Outreach Kit Workspace
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => generateOutreach(true)}
                  disabled={isGenerating}
                  className="text-[10px] bg-white/10 hover:bg-white/20 disabled:opacity-50 px-3 py-1.5 rounded-full font-bold uppercase text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCw className={`w-3 h-3 ${isGenerating ? "animate-spin text-brand" : ""}`} />
                  Regenerate
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const emailString = `Subject: ${emailSubject}\n\n${emailBody}`;
                    copyToClipboard("email", emailString);
                    // Mark active target status as "Emailed"!
                    if (selectedTarget) {
                      updateTargetField("status", "Emailed");
                    }
                  }}
                  className="text-[10px] bg-brand hover:bg-brand-hover px-4 py-1.5 rounded-full font-bold uppercase text-white transition-colors cursor-pointer"
                >
                  {copiedState["email"] ? "Copied & Synced!" : "Copy Email Kit"}
                </button>
              </div>
            </div>

            {/* In-desk Content block */}
            <div className="flex-1 flex flex-col justify-between">
              
              {isGenerating && generationMode === "loading" ? (
                <div className="py-28 flex-1 flex flex-col items-center justify-center gap-3">
                  <div className="w-9 h-9 rounded-full border-3 border-white/10 border-t-brand animate-spin"></div>
                  <p className="text-xs text-slate-400 font-bold font-mono tracking-wider animate-pulse">
                    Synthesizing Outbound Messaging...
                  </p>
                </div>
              ) : (
                <div className="space-y-4 flex-1">
                  
                  {/* Lead metadata indicators */}
                  <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-mono tracking-widest uppercase pb-1">
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3 text-brand" />
                      Recipient: {contactName || "CE Director"} ({contactTitle || "LMS Lead"})
                    </span>
                    <span className={`font-bold px-1.5 py-0.5 rounded ${
                      generationMode === "genai" 
                        ? "bg-brand/10 text-brand" 
                        : "bg-amber-400/10 text-amber-400"
                    }`}>
                      {generationMode === "genai" ? "Claude Live Generated" : "Static Match Draft"}
                    </span>
                  </div>

                  {/* Subject Line display */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center shadow-xs focus-within:border-brand/40 transition-colors">
                    <label htmlFor="email-subject-field" className="text-[11px] text-slate-500 font-mono tracking-wider mr-2 pr-2 border-r border-white/10 uppercase select-none cursor-pointer">
                      Subject
                    </label>
                    <input
                      id="email-subject-field"
                      type="text"
                      value={emailSubject}
                      onChange={(e) => handleEmailSubjectChange(e.target.value)}
                      placeholder="Subject line..."
                      className="bg-transparent text-xs font-semibold text-slate-100 flex-1 pl-1 outline-none border-none focus:ring-0 focus:outline-none placeholder-slate-600 font-sans"
                    />
                  </div>

                  {/* Email body editor / viewer details */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-h-[220px] shadow-sm flex flex-col justify-start focus-within:border-brand/40 transition-colors">
                    <label htmlFor="email-body-editor" className="sr-only">Edit Email Draft</label>
                    <textarea
                      id="email-body-editor"
                      value={emailBody}
                      onChange={(e) => handleEmailBodyChange(e.target.value)}
                      rows={10}
                      className="bg-transparent text-slate-200 text-xs leading-relaxed font-serif selection:bg-brand leading-loose resize-none outline-none border-none focus:ring-0 focus:outline-none w-full flex-1"
                      placeholder="Outreach copy drafting and polisher..."
                    />
                  </div>

                  {/* Quick trigger analysis feedback warning */}
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between gap-3 text-[10px] text-slate-400">
                    <div>
                      <span>Outreach Word Count: <strong>{emailBody ? emailBody.split(/\s+/).filter(Boolean).length : 0} words</strong></span>
                      <span className="mx-2">|</span>
                      <span>Reading Grade Goal: <strong>{readingLevel}th Grade</strong></span>
                    </div>
                    {debouncedTriggerSignal && (
                      <span className="text-brand font-bold bg-brand/10 px-2 py-0.5 rounded uppercase">
                        Signal Anchored
                      </span>
                    )}
                  </div>

                </div>
              )}

              {/* Outreach Metrics Graph Segment */}
              <div className="mt-6 pt-5 border-t border-white/10 shrink-0">
                <OutreachMetrics emailText={emailBody} />
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="mt-12 bg-slate-900 border-t border-slate-800 text-slate-400 py-6 px-4 text-center text-xs shrink-0 select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <p>
            &copy; 2026 D2L Corp (Desire2Learn). Developed for Midwest region AE outbound enablement.
          </p>
          <div className="flex gap-4 text-slate-500 font-semibold font-mono text-[10px]">
            <span className="hover:text-brand cursor-pointer">PLAYBOOK DIRECTORY</span>
            <span>|</span>
            <span className="hover:text-brand cursor-pointer">FUSION GUIDE CENTER</span>
            <span>|</span>
            <span className="hover:text-brand cursor-pointer">COMPLIANCE ASSURANCE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

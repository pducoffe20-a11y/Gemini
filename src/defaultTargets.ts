export interface TargetAccount {
  id: string;
  orgName: string;
  verticalId: string;
  lmsId: string;
  triggerSignal: string;
  contactName: string;
  contactTitle: string;
  confidence: number;
  lastUpdated: string;
  status: "Target" | "Processing" | "Ready" | "Emailed" | "Displaced";
  hasCredential: boolean;
  fusionAngle: boolean;
  subject?: string;
  body?: string;
  generationMode?: "genai" | "template" | "template_fallback" | "loading";
}

export const defaultTargets: TargetAccount[] = [
  {
    id: "target-1",
    orgName: "Pennsylvania Bar Association",
    verticalId: "general_professional",
    lmsId: "unsure_research",
    triggerSignal: "New CE Director announced; budget proposal highlights $45,000 in legacy Forj overages.",
    contactName: "Miriam Vance",
    contactTitle: "Chief Executive & CE Director",
    confidence: 96,
    lastUpdated: "38m ago",
    status: "Target",
    hasCredential: true,
    fusionAngle: true
  },
  {
    id: "target-2",
    orgName: "Michigan Nurses Association",
    verticalId: "healthcare",
    lmsId: "unsure_research",
    triggerSignal: "State regulatory health board demands real-time license validation sync which TopClass fails to process.",
    contactName: "Marcus Thorne, PhD",
    contactTitle: "Director of Continuing Education",
    confidence: 91,
    lastUpdated: "2h ago",
    status: "Ready",
    hasCredential: true,
    fusionAngle: true
  },
  {
    id: "target-3",
    orgName: "Ohio Society of CPAs",
    verticalId: "cpa_finance",
    lmsId: "unsure_research",
    triggerSignal: "Member board complains of major Forj catalog lag, threatening continuing professional credit compliance.",
    contactName: "Sarah Lindon",
    contactTitle: "Director of Education & Events",
    confidence: 89,
    lastUpdated: "6h ago",
    status: "Ready",
    hasCredential: true,
    fusionAngle: true
  },
  {
    id: "target-4",
    orgName: "Great Lakes Manufacturing Institute",
    verticalId: "trade_manufacturing",
    lmsId: "unsure_research",
    triggerSignal: "Annual audit shows 24% certificate delivery delay, raising legal compliance concerns with member factories.",
    contactName: "James Sterling",
    contactTitle: "Lead Compliance Officer",
    confidence: 84,
    lastUpdated: "1d ago",
    status: "Target",
    hasCredential: true,
    fusionAngle: false
  },
  {
    id: "target-5",
    orgName: "Texas Medical Credentialing Board",
    verticalId: "credentialing_board",
    lmsId: "unsure_research",
    triggerSignal: "Public RFP issued asking for automated renewal portals to replace complex multi-step legacy flows.",
    contactName: "Dr. Alana Wu",
    contactTitle: "Executive Chairman",
    confidence: 98,
    lastUpdated: "2d ago",
    status: "Processing",
    hasCredential: true,
    fusionAngle: true
  },
  {
    id: "target-6",
    orgName: "National CPA Certification Society",
    verticalId: "cpa_finance",
    lmsId: "unsure_research",
    triggerSignal: "Legacy Litmos contract expiring in 3 months; administration is evaluating alternative modern platforms.",
    contactName: "Gregory Miller",
    contactTitle: "Head of Professional Standards",
    confidence: 92,
    lastUpdated: "3d ago",
    status: "Displaced",
    hasCredential: true,
    fusionAngle: true
  }
];

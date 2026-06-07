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
    id: "t-01",
    orgName: "Michigan Nurses Association",
    verticalId: "healthcare_assoc",
    lmsId: "topclass",
    triggerSignal: "State regulatory board mandates real-time license validation sync — TopClass fails to process bulk renewals within the required 4-hour window.",
    contactName: "Marcus Thorne, PhD",
    contactTitle: "Director of Continuing Education",
    confidence: 91,
    lastUpdated: "2h ago",
    status: "Ready",
    hasCredential: true,
    fusionAngle: true
  },
  {
    id: "t-02",
    orgName: "Texas Medical Credentialing Board",
    verticalId: "credentialing_board",
    lmsId: "thought_industries",
    triggerSignal: "Public RFP issued for automated renewal portals to replace complex multi-step legacy workflows in Thought Industries.",
    contactName: "Dr. Alana Wu",
    contactTitle: "Executive Chairman",
    confidence: 98,
    lastUpdated: "2d ago",
    status: "Processing",
    hasCredential: true,
    fusionAngle: true
  },
  {
    id: "t-03",
    orgName: "Ohio Society of CPAs",
    verticalId: "cpa_finance",
    lmsId: "forj",
    triggerSignal: "Member board formally complained of major Forj catalog lag threatening continuing professional credit compliance for 14,000 members.",
    contactName: "Sarah Lindon",
    contactTitle: "Director of Education & Events",
    confidence: 89,
    lastUpdated: "6h ago",
    status: "Ready",
    hasCredential: true,
    fusionAngle: true
  },
  {
    id: "t-04",
    orgName: "National CPA Certification Society",
    verticalId: "cpa_finance",
    lmsId: "litmos",
    triggerSignal: "Legacy Litmos contract expiring in 3 months; administration actively evaluating alternative modern platforms.",
    contactName: "Gregory Miller",
    contactTitle: "Head of Professional Standards",
    confidence: 92,
    lastUpdated: "3d ago",
    status: "Displaced",
    hasCredential: true,
    fusionAngle: true
  },
  {
    id: "t-05",
    orgName: "Great Lakes Manufacturing Institute",
    verticalId: "trade_manufacturing",
    lmsId: "docebo",
    triggerSignal: "Annual compliance audit shows 24% certificate delivery delay, raising legal liability concerns with member factories.",
    contactName: "James Sterling",
    contactTitle: "Lead Compliance Officer",
    confidence: 84,
    lastUpdated: "1d ago",
    status: "Target",
    hasCredential: true,
    fusionAngle: false
  },
  {
    id: "t-06",
    orgName: "Midwest Construction Safety Alliance",
    verticalId: "trade_manufacturing",
    lmsId: "moodle",
    triggerSignal: "Failed third-party security audit following Moodle major version upgrade; OSHA compliance window is 60 days.",
    contactName: "Don Hargrove",
    contactTitle: "Director of Safety Programs",
    confidence: 78,
    lastUpdated: "4d ago",
    status: "Target",
    hasCredential: true,
    fusionAngle: false
  },
  {
    id: "t-07",
    orgName: "Pennsylvania Bar Association",
    verticalId: "general_professional_assoc",
    lmsId: "forj",
    triggerSignal: "New CE Director announced; budget proposal highlights $45,000 in legacy Forj overages and unmet product roadmap commitments.",
    contactName: "Miriam Vance",
    contactTitle: "Chief Executive & CE Director",
    confidence: 96,
    lastUpdated: "38m ago",
    status: "Target",
    hasCredential: true,
    fusionAngle: true
  },
  {
    id: "t-08",
    orgName: "Illinois Pharmacy Board",
    verticalId: "credentialing_board",
    lmsId: "crowd_wisdom",
    triggerSignal: "Annual credentialing audit exposed Crowd Wisdom reporting gaps; board demanded real-time CE dashboards by next review cycle.",
    contactName: "Dr. Patricia Lane",
    contactTitle: "Director of Certification & Compliance",
    confidence: 87,
    lastUpdated: "5h ago",
    status: "Target",
    hasCredential: true,
    fusionAngle: true
  },
  {
    id: "t-09",
    orgName: "American Marketing Professionals",
    verticalId: "general_professional_assoc",
    lmsId: "blue_sky",
    triggerSignal: "Member engagement scores dropped 18% YoY; exit surveys cite the Blue Sky learning portal as the top friction point.",
    contactName: "Keisha Rollins",
    contactTitle: "VP Member Experience",
    confidence: 73,
    lastUpdated: "1d ago",
    status: "Target",
    hasCredential: false,
    fusionAngle: false
  },
  {
    id: "t-10",
    orgName: "Society of HR Management Midwest",
    verticalId: "general_professional_assoc",
    lmsId: "homegrown_or_none",
    triggerSignal: "Staff spreadsheet-based CE tracking hit capacity after 30% membership growth; compliance review flagged data gaps.",
    contactName: "Brian Caldwell",
    contactTitle: "Senior Director of Education",
    confidence: 81,
    lastUpdated: "2d ago",
    status: "Target",
    hasCredential: true,
    fusionAngle: false
  },
  {
    id: "t-11",
    orgName: "Midwest Learning Solutions Group",
    verticalId: "ce_provider",
    lmsId: "thought_industries",
    triggerSignal: "Per-learner pricing crossed a cost threshold as catalog expanded to 300+ courses; CFO flagged LMS costs up 58% vs. revenue.",
    contactName: "Angela Torres",
    contactTitle: "Chief Learning Officer",
    confidence: 85,
    lastUpdated: "3d ago",
    status: "Processing",
    hasCredential: false,
    fusionAngle: false
  },
  {
    id: "t-12",
    orgName: "Professional CE Alliance",
    verticalId: "ce_provider",
    lmsId: "docebo",
    triggerSignal: "Docebo AI feature bundle quoted at additional $80K; CFO pushing back; third CSM in 2 years assigned last month.",
    contactName: "Robert Chen",
    contactTitle: "VP Product & Technology",
    confidence: 88,
    lastUpdated: "6h ago",
    status: "Target",
    hasCredential: false,
    fusionAngle: false
  }
];

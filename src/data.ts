export interface PainPoint {
  id: string;
  user_voice: string;
  discovery_signal?: string;
  objection_to_anticipate?: string;
  switch_trigger?: string;
}

export interface LMSInfo {
  display_name: string;
  aliases: string[];
  category_note: string;
  competitive_strength?: string;
  pains: PainPoint[];
}

export interface CustomerStory {
  display_name: string;
  official_name: string;
  vertical_tags: string[];
  credential_required: boolean;
  territory: string;
  learners: string;
  one_line_outcome: string;
  why_it_maps: string;
  not_in_source_csv?: boolean;
  warning?: string;
}

export const lmsPainPoints: Record<string, LMSInfo> = {
  forj: {
    display_name: "Forj",
    aliases: ["CommPartners", "Web Courseworks", "Forj LMS"],
    category_note: "Formed from the 2020 CommPartners + Web Courseworks merger. Association-native but product velocity has been a recurring concern post-merger.",
    competitive_strength: "Built specifically for associations from day one — speaks the language of CE, member tiers, and chapter rollouts. Strong reputation in mid-size professional associations.",
    pains: [
      {
        id: "search_broken",
        user_voice: "Search is rough — members type what they want, get irrelevant results, and bounce. Staff keep getting 'where do I find X?' emails for content that's literally in the catalog.",
        discovery_signal: "Low course completion despite high enrollment, staff manually emailing curated playlists, complaints from membership team about 'members not knowing what's available.'",
        objection_to_anticipate: "'We're getting a redesign next quarter' → ask what specifically is changing on search vs. navigation; redesigns rarely fix discoverability without re-architecting taxonomy.",
        switch_trigger: "New marketing or membership leader pushes a member experience refresh; member survey scores on 'finding content' drop below benchmark."
      },
      {
        id: "reporting_thin",
        user_voice: "Admin reporting is shallow — you can see who enrolled, but answering 'which content actually drives renewals' takes a spreadsheet and a weekend.",
        discovery_signal: "Marketing or membership team asking the LMS admin for custom CSV exports; board asking 'what's our ROI on learning' and getting silence.",
        objection_to_anticipate: "'We use [BI tool] for that' → fine, but ask how often the data gets pulled and who owns it. Usually the answer is 'quarterly' and 'nobody full-time.'",
        switch_trigger: "Board meeting where leadership asks for outcome data the LMS can't produce."
      },
      {
        id: "dated_ux",
        user_voice: "The learner UI feels like 2018 — members compare it to what they use at work or on LinkedIn Learning and the gap is obvious.",
        discovery_signal: "Complaints from younger members; drop in non-dues revenue from courses; exec comments about 'modernizing the member experience.'",
        objection_to_anticipate: "'It's functional, members are used to it' → reframe: usage is not satisfaction. Ask if they've surveyed members on the learning experience specifically.",
        switch_trigger: "Member NPS or satisfaction survey flagging the learning experience; new CEO with a digital mandate."
      },
      {
        id: "post_merger_velocity",
        user_voice: "Roadmap moves slower than the sales pitch suggested — features we were promised at signing have been 'coming soon' for a year and a half.",
        discovery_signal: "Customer references roadmap commitments not met; product release notes feel light; account team turnover.",
        objection_to_anticipate: "'They just released X' → ask how that landed for the customer, and what's actually shipped vs. what's still on the slide.",
        switch_trigger: "Renewal conversation where the customer audits what they paid for vs. what they got."
      },
      {
        id: "mobile_thin",
        user_voice: "Mobile is functional but it's clearly the desktop site shrunk down — not built for someone trying to finish a CE module on the train.",
        discovery_signal: "Mobile completion rates significantly lower than desktop; complaints from field-based or commuting members.",
        objection_to_anticipate: "'Most members use desktop anyway' → ask if they've checked the data lately; mobile share has shifted hard in the last 2 years.",
        switch_trigger: "Member demographic shift toward mobile-first generations; field-based member segment growth."
      }
    ]
  },
  topclass: {
    display_name: "TopClass",
    aliases: ["WBT Systems", "ASI TopClass", "TopClass LMS"],
    category_note: "Acquired by Advanced Solutions International (ASI) in 2020. Tightly integrated with iMIS, more friction with everything else. Strong CE pedigree but the platform is aging.",
    competitive_strength: "Deep CE/CME/CPE history — knows credit hours, audit trails, and certification renewal workflows. Best-in-class iMIS integration if that's the AMS.",
    pains: [
      {
        id: "ce_workflow_clunky",
        user_voice: "Issuing CE certificates and tracking credit hours takes more clicks than it should — staff build spreadsheets to handle audits and bulk renewals.",
        discovery_signal: "Mention of manual CE tracking, certificate corrections, audit prep being a 'fire drill,' or staff time eaten by credit-hour requests.",
        objection_to_anticipate: "'CE has always been complicated' → agree, but ask how much staff time per month is spent on certificate corrections specifically; the number usually shocks the exec on the call.",
        switch_trigger: "Audit cycle, certificate compliance incident, or staff turnover where institutional knowledge of the workarounds leaves with someone."
      },
      {
        id: "ams_integration_friction",
        user_voice: "Integration with our AMS is brittle — it works until it doesn't, and when it breaks we're between two vendors pointing at each other.",
        discovery_signal: "Especially loud if the AMS is anything other than iMIS — Fonteva, Personify, MemberSuite, YourMembership users feel this most. Mention of sync failures, duplicate records, or middleware patches.",
        objection_to_anticipate: "'We're on iMIS so it's fine' → ask about non-member registrations and chapter rollups; iMIS users still feel the seams on edge cases.",
        switch_trigger: "AMS replacement or upgrade decision; integration outage that hits a member-facing workflow."
      },
      {
        id: "aging_learner_ui",
        user_voice: "The learner experience hasn't kept up — it's functional but it doesn't feel like a modern learning platform.",
        discovery_signal: "New CMO or marketing lead pushing for a refresh; member feedback comparing it unfavorably to LinkedIn Learning, Coursera, etc.",
        objection_to_anticipate: "'We're not trying to be Netflix' → fair, but ask whether the current UX is meeting the bar members expect from a $300+/year membership.",
        switch_trigger: "Brand refresh, website redesign, or new member experience initiative."
      },
      {
        id: "weak_personalization",
        user_voice: "Everyone sees the same catalog — there's no real recommendation engine or learning pathway logic, so members have to already know what they want.",
        discovery_signal: "Flat engagement metrics across diverse member segments; requests for 'recommended for you' features.",
        objection_to_anticipate: "'Members like browsing the catalog' → reframe: browsing works at 50 courses, breaks at 500. Ask catalog size and growth rate.",
        switch_trigger: "Catalog crosses ~200 courses; multiple member personas (early career vs. senior) need distinct journeys."
      },
      {
        id: "innovation_pace",
        user_voice: "Release cadence has slowed since the ASI acquisition — feels more like maintenance mode than active product investment.",
        discovery_signal: "Customer references muted product enthusiasm; release notes feel sparse; ASI conference content focused on AMS, not LMS.",
        objection_to_anticipate: "'They're focused on integration' → ask what NEW capability has shipped in the last 18 months that the customer is excited about. Usually a long pause.",
        switch_trigger: "Customer hits a feature ceiling; competitor announces something the customer would have to wait years for."
      }
    ]
  },
  docebo: {
    display_name: "Docebo",
    aliases: ["Docebo Learn", "Docebo LMS"],
    category_note: "Powerful corporate LMS. Strong product, but built for enterprise L&D — the association/CE motion is a configuration job, not a native fit.",
    competitive_strength: "Genuinely strong corporate L&D product — AI features, learning analytics depth, extensibility. Best fit for associations that operate like training companies.",
    pains: [
      {
        id: "expensive_with_addons",
        user_voice: "Base license was reasonable, then Training Orchestra got added for ILT, then Shape, then Connect, then Discover — now we're paying for a stack we only half-use.",
        discovery_signal: "Procurement renewal coming up; finance pushing back on the line item; phrases like 'we're paying for features we don't use' or 'the bill keeps going up.'",
        objection_to_anticipate: "'We negotiated the bundle down' → ask what the 3-year TCO looks like vs. year 1; the renewal step-ups are where it hurts.",
        switch_trigger: "Multi-year renewal up for negotiation, especially when CFO is involved."
      },
      {
        id: "admin_learning_curve",
        user_voice: "It's powerful, but every new admin needs weeks to ramp — and we don't have a full-time LMS admin.",
        discovery_signal: "Small team (1-3 people running learning); recent admin turnover; dependency on Docebo professional services for routine changes.",
        objection_to_anticipate: "'We're getting better at it' → ask what happens when their primary admin takes parental leave or leaves. Bus-factor question lands.",
        switch_trigger: "Admin departure; budget freeze on professional services spend; learning leader role going unfilled."
      },
      {
        id: "not_built_for_associations",
        user_voice: "It was built for corporate L&D — CE credits, member tiers, non-dues revenue aren't native, so we've configured around them.",
        discovery_signal: "CE tracking done in custom fields; member vs. non-member pricing logic handled outside the LMS; complaints about 'fighting the tool.'",
        objection_to_anticipate: "'We made it work' → respect the effort, then ask what breaks when they want to change something. Customizations are technical debt.",
        switch_trigger: "New leadership questioning the tech stack; CE audit forcing a closer look at credit tracking logic."
      },
      {
        id: "ai_behind_paywall",
        user_voice: "Half the AI features they pitched are behind another add-on — to actually get the personalization story, the bill jumps again.",
        discovery_signal: "Customer references AI features they 'don't have access to' or 'were quoted for separately.'",
        objection_to_anticipate: "'We'll add it next year' → ask what the projected total cost is at full feature parity; the answer is often 2-3x current spend.",
        switch_trigger: "Procurement reviewing the add-on stack; CMO asking why AI features promised in the sales cycle aren't live."
      },
      {
        id: "csm_churn",
        user_voice: "We're on our third customer success manager in two years — every time we have to re-explain our setup and our goals.",
        discovery_signal: "Customer mentions CSM turnover; QBRs feel transactional; account team doesn't know the customer's history.",
        objection_to_anticipate: "'Our new CSM is great' → acknowledge, then ask how long the previous two lasted. Pattern matters more than the current rep.",
        switch_trigger: "CSM transition that goes badly; missed renewal touchpoint; escalation that has nowhere to land."
      }
    ]
  },
  thought_industries: {
    display_name: "Thought Industries",
    aliases: ["TI", "Thought Industries LMS"],
    category_note: "Built for B2B training companies — customer education, software training, paid certification. Associations sometimes adopt it but the seams show.",
    competitive_strength: "Strong commerce engine — paid course catalogs, subscriptions, bundles. Built for training-as-a-business, which works well for some CE providers.",
    pains: [
      {
        id: "wrong_dna",
        user_voice: "It was built to sell training as a product, not to serve members — workflows assume a commercial buyer, not a member who already pays dues.",
        discovery_signal: "Membership team and learning team using different tools; member-vs-non-member pricing logic awkward; dual catalog setups.",
        objection_to_anticipate: "'We use it for both' → ask which workflow breaks more often; usually the member side.",
        switch_trigger: "Member experience initiative; consolidation of tech stack under one platform."
      },
      {
        id: "ce_not_native",
        user_voice: "Continuing education credits and certification tracking aren't first-class — we stitched it together with custom fields and Zapier.",
        discovery_signal: "Any mention of CE audit, board reporting on credentialing, integration sprawl, or Zapier in the LMS stack.",
        objection_to_anticipate: "'It tracks completions' → completions ≠ credit hours; ask about audit-ready credit reports specifically.",
        switch_trigger: "Failed or stressful audit cycle; new credential launch."
      },
      {
        id: "pricing_scales_fast",
        user_voice: "Pricing scales with active learners — as the catalog grew, so did the invoice, faster than non-dues revenue.",
        discovery_signal: "Budget conversations; mention of usage-based or per-learner pricing fatigue; CFO scrutiny of the LMS line item.",
        objection_to_anticipate: "'We negotiated a cap' → ask what happens when they exceed the cap, and whether the cap renews. Usually the answer is 'it gets worse.'",
        switch_trigger: "Active learner count crossing a tier threshold; renewal with new pricing model."
      },
      {
        id: "salesforce_dependency",
        user_voice: "The good integrations assume Salesforce — if we're on a different CRM or AMS, half the value evaporates.",
        discovery_signal: "Customer mentions Salesforce as a workaround for things the LMS should do natively; AMS-LMS sync gaps.",
        objection_to_anticipate: "'We're moving to Salesforce' → fine, but ask the timeline and what they do in the meantime.",
        switch_trigger: "AMS evaluation; Salesforce implementation stalling."
      },
      {
        id: "limited_community",
        user_voice: "Learning happens in isolation — no real community, discussion, or peer learning layer, which is half of why people join an association.",
        discovery_signal: "Separate community tool bolted on (Higher Logic, Mighty Networks); learning and community teams operate as silos.",
        objection_to_anticipate: "'Community lives in our other platform' → ask how often a member crosses from one to the other in a single session. The answer is usually 'rarely.'",
        switch_trigger: "Initiative to unify the member experience; community tool renewal."
      }
    ]
  },
  blue_sky: {
    display_name: "Blue Sky eLearn (Path LMS)",
    aliases: ["Path LMS", "Blue Sky", "Blue Sky eLearn"],
    category_note: "Association-focused, historically bundled with virtual event services. Solid for smaller associations; thin on learning science.",
    competitive_strength: "Easy to implement, association-friendly support, integrated virtual event delivery for orgs that need it.",
    pains: [
      {
        id: "light_personalization",
        user_voice: "It serves the same content to everyone — no real personalization or recommendation engine, so members have to know what they're looking for before they find it.",
        discovery_signal: "Flat engagement across member personas; requests for 'Netflix-style' learning; leadership pressure on engagement metrics.",
        objection_to_anticipate: "'We curate manually' → ask how that scales with the catalog and the team size.",
        switch_trigger: "Engagement metrics flatlining or declining; new strategic plan emphasizing member experience."
      },
      {
        id: "basic_reporting",
        user_voice: "Reporting tells us who watched what — it doesn't tell us what's working or what to invest in next.",
        discovery_signal: "Marketing or exec team asking for outcome data the LMS can't produce; quarterly board reports built by hand in PowerPoint.",
        objection_to_anticipate: "'We export to Excel' → ask who owns that and how often it happens. Usually fragile.",
        switch_trigger: "Board pressure for outcomes data; new VP of Learning hire."
      },
      {
        id: "catalog_scale_pain",
        user_voice: "When the catalog was 50 courses it was fine — at 500 it's hard to navigate and hard to govern.",
        discovery_signal: "Recent catalog expansion; content team complaining about duplication, version control, or 'orphaned' courses.",
        objection_to_anticipate: "'We're auditing the catalog' → ask how often the audit runs and what gets retired.",
        switch_trigger: "Catalog hits an internal pain threshold; governance initiative."
      },
      {
        id: "events_focus_split",
        user_voice: "The product gets attention when there's a virtual event push — the core LMS roadmap can feel like the quieter sibling.",
        discovery_signal: "Customer references event-driven product investment; LMS feature requests sitting for long periods.",
        objection_to_anticipate: "'They listen to feedback' → ask what they've requested in the last year and what shipped.",
        switch_trigger: "Strategic plan that decouples events from learning; new learning leader."
      },
      {
        id: "search_basic",
        user_voice: "Search is keyword-only — there's no concept of skills, topics, or learner intent, so the same catalog feels smaller than it is.",
        discovery_signal: "Members asking 'do you have anything on X?' for content that exists; staff hand-curating playlists.",
        objection_to_anticipate: "'We tag everything' → tagging only helps if search uses tags well; ask for a demo of finding a niche topic.",
        switch_trigger: "Member experience refresh; learning leader hires from a more modern platform."
      }
    ]
  },
  litmos: {
    display_name: "Litmos",
    aliases: ["SAP Litmos", "Litmos LMS"],
    category_note: "Generic corporate LMS with a complicated ownership history (changed hands multiple times in the last several years). Common in associations that 'bought what IT picked.'",
    competitive_strength: "Fast to deploy, friendly admin UX for simple use cases, broad content marketplace integrations.",
    pains: [
      {
        id: "no_association_dna",
        user_voice: "It's a corporate compliance tool dressed up as learning — it doesn't speak the language of members, chapters, or credentials.",
        discovery_signal: "LMS chosen by IT or HR; learning leader inherited it; mention of 'we use it because it's already in our SAP stack' or similar.",
        objection_to_anticipate: "'It does the job' → ask which member-facing workflow they'd build differently if starting today.",
        switch_trigger: "Learning leadership change; strategic shift toward member-facing learning."
      },
      {
        id: "weak_certification",
        user_voice: "Certification and CE workflows are afterthoughts — fine for 'did they complete the course,' not for 'did they earn 24 credit hours this cycle across these formats.'",
        discovery_signal: "Manual certification spreadsheets; complaints during credential audits; staff time on certificate corrections.",
        objection_to_anticipate: "'We track it in our AMS' → ask how the data gets from one to the other; usually CSV exports.",
        switch_trigger: "Audit pain; new credential launch; AMS migration exposing the seams."
      },
      {
        id: "no_community",
        user_voice: "Learning is solo — no real community or peer learning layer, which is half of why people join an association.",
        discovery_signal: "Separate community platform bolted alongside the LMS; cross-platform UX friction.",
        objection_to_anticipate: "'Community is its own thing' → ask whether members notice or care that they're in two places. They do.",
        switch_trigger: "Initiative to unify member experience."
      },
      {
        id: "ownership_uncertainty",
        user_voice: "The product has changed hands so many times we never know what the roadmap really is — every owner has a different priority.",
        discovery_signal: "Customer references roadmap uncertainty; account team turnover; product investment feels uneven.",
        objection_to_anticipate: "'The current owner is committed' → ask how long they've been the owner and what's shipped under them.",
        switch_trigger: "Renewal cycle; another ownership change; major feature deprecation."
      },
      {
        id: "pricing_misalignment",
        user_voice: "Pricing assumes employee headcount — associations with member counts that fluctuate or include free tiers find the model awkward.",
        discovery_signal: "Negotiation friction at renewal; questions about how to price member tiers.",
        objection_to_anticipate: "'We've got a custom deal' → ask what happens when membership grows or shrinks 20%.",
        switch_trigger: "Membership model change; renewal cycle."
      }
    ]
  },
  crowd_wisdom: {
    display_name: "Crowd Wisdom",
    aliases: ["Cadmium Crowd Wisdom", "Cadmium", "Crowd Wisdom LMS"],
    category_note: "Part of the Cadmium ecosystem (events + abstracts + learning). Strongest when the org is all-in on Cadmium; weakest when they want flexibility.",
    competitive_strength: "Tight integration between conference content and CE delivery — strong conference-to-CE pipeline. Familiar to many medical and scientific associations.",
    pains: [
      {
        id: "ecosystem_lockin",
        user_voice: "It works well if you're all-in on Cadmium — the moment you want to do something the broader ecosystem doesn't, you feel the walls.",
        discovery_signal: "Frustration about flexibility; integration with non-Cadmium tools; vendor consolidation conversations going the wrong direction.",
        objection_to_anticipate: "'We like having everything in one place' → ask what they wish they could change that the ecosystem doesn't allow.",
        switch_trigger: "Strategic plan questioning vendor consolidation; failed attempt to integrate a third-party tool."
      },
      {
        id: "ux_dated",
        user_voice: "The learner UI feels like a conference platform that learned to do LMS — not the other way around.",
        discovery_signal: "Member feedback comparing it unfavorably to other learning platforms; younger members complaining.",
        objection_to_anticipate: "'It's familiar to longtime members' → ask whether familiarity is the standard they want to hold the product to.",
        switch_trigger: "Member experience refresh; new generation of members."
      },
      {
        id: "reporting_depth",
        user_voice: "Reporting covers the basics but doesn't help us answer the strategic questions — what content drives retention, what's underused, where the gaps are.",
        discovery_signal: "Exec team or board asking ROI questions the data can't answer; ad-hoc Excel analysis to bridge the gap.",
        objection_to_anticipate: "'We pull custom reports' → ask who owns that and how often it actually happens.",
        switch_trigger: "Board ROI pressure; new analytics-minded leader."
      },
      {
        id: "mobile_thin",
        user_voice: "Mobile is an afterthought — fine for browsing, not built for finishing a course.",
        discovery_signal: "Mobile completion rates significantly lower; member feedback about app or responsive experience.",
        objection_to_anticipate: "'Most CE is done on desktop' → ask if they've actually checked the data lately.",
        switch_trigger: "Mobile-first member segment growth; field-based audience."
      },
      {
        id: "pricing_complexity",
        user_voice: "Pricing depends on which Cadmium modules you have — comparing it to anything else is apples to oranges.",
        discovery_signal: "Procurement frustration with the quote structure; difficulty doing TCO analysis.",
        objection_to_anticipate: "'Bundled pricing is cheaper' → ask what they're paying per module and whether they use all of them.",
        switch_trigger: "Procurement-led vendor review; CFO asking for a TCO breakdown."
      }
    ]
  },
  moodle: {
    display_name: "Moodle (self-hosted)",
    aliases: ["Moodle", "Moodle self-hosted", "Moodle community"],
    category_note: "Open-source LMS. Cheap on paper, expensive in maintenance, talent, and opportunity cost. Common in smaller associations and academic-adjacent orgs.",
    competitive_strength: "No license cost; fully customizable for orgs with strong internal dev; deep plugin ecosystem.",
    pains: [
      {
        id: "maintenance_burden",
        user_voice: "It's 'free' until you count the developer time, the upgrade cycles, and the security patches — then it's not.",
        discovery_signal: "Small IT team stretched; recent upgrade pain; mention of 'who actually owns Moodle' being unclear; a vendor or contractor handling it.",
        objection_to_anticipate: "'Our IT handles it' → ask what happens when that person leaves or is reassigned.",
        switch_trigger: "IT staff departure; failed upgrade; security incident."
      },
      {
        id: "no_vendor_support",
        user_voice: "When something breaks at 9pm before a launch, there's no vendor to call — it's us and a Stack Overflow thread.",
        discovery_signal: "Past incident where a release got delayed; anxiety around major upgrades; mention of paid support contracts with a third party.",
        objection_to_anticipate: "'We pay [partner] for support' → ask how often that gets used and what it costs annually. Often more than a SaaS LMS.",
        switch_trigger: "Outage that hits a member-facing workflow; major upgrade looming."
      },
      {
        id: "custom_dev_for_modern_features",
        user_voice: "Every modern feature — personalization, analytics, mobile-first UX — is a custom dev project or a plugin we have to maintain.",
        discovery_signal: "Roadmap discussions where 'we'd need to build that' keeps coming up; plugin sprawl.",
        objection_to_anticipate: "'The plugin ecosystem covers it' → ask how many plugins they maintain and what happens at the next Moodle major version.",
        switch_trigger: "Major Moodle version upgrade breaking plugins; new strategic capability needed."
      },
      {
        id: "talent_dependency",
        user_voice: "Everything depends on the one person who knows our Moodle setup — if they leave, we're in trouble.",
        discovery_signal: "Single named admin who 'owns Moodle'; documentation gaps; mention of 'bus factor.'",
        objection_to_anticipate: "'We've documented it' → ask when it was last updated and who could pick it up cold.",
        switch_trigger: "Admin departure; org restructure; risk audit."
      },
      {
        id: "compliance_burden",
        user_voice: "Security patches, accessibility audits, data privacy compliance — all of that is on us. With a vendor, it's their job.",
        discovery_signal: "Compliance audit pressure; accessibility complaints; data privacy regulation changes.",
        objection_to_anticipate: "'We're staying on top of it' → ask how often they audit, and whether they've passed a recent third-party security review.",
        switch_trigger: "Failed compliance review; new privacy regulation; accessibility lawsuit in the sector."
      }
    ]
  },
  homegrown_or_none: {
    display_name: "Homegrown / no LMS",
    aliases: ["No LMS", "Custom-built", "PDFs and Zoom", "SharePoint", "Internal portal"],
    category_note: "Either a custom-built portal or duct-tape of Zoom + PDFs + Excel + email. Common in smaller associations, newer credentialing programs, and orgs that have grown past their original setup.",
    competitive_strength: "Fully tailored to the org's exact workflow; no vendor relationship to manage; familiar to staff and members.",
    pains: [
      {
        id: "no_infrastructure_for_scale",
        user_voice: "It works for 200 learners — it won't work for 2,000. We're already feeling the cracks.",
        discovery_signal: "Recent enrollment growth; complaints about manual work scaling linearly with members; staff overtime.",
        objection_to_anticipate: "'We can hire more staff' → ask whether that's the leverage they actually want.",
        switch_trigger: "Enrollment growth surge; new program launch; staff burnout."
      },
      {
        id: "no_analytics",
        user_voice: "We have no real data on what learners actually do — we can tell you who registered, not who finished or what they got out of it.",
        discovery_signal: "Board asking for outcomes data that doesn't exist; marketing operating on guesswork; no engagement reporting.",
        objection_to_anticipate: "'We get good qualitative feedback' → ask whether they'd make a budget decision on qualitative feedback alone.",
        switch_trigger: "Board ROI pressure; grant or sponsorship requiring outcomes data."
      },
      {
        id: "manual_ce_tracking",
        user_voice: "CE credits live in a spreadsheet — every audit is a fire drill and every certificate is a manual email.",
        discovery_signal: "Recent audit pain; staff time eaten by certificate requests; errors in credit reporting.",
        objection_to_anticipate: "'It works for now' → ask what happens when their credential program doubles in size.",
        switch_trigger: "Audit; credentialing program growth; staff turnover."
      },
      {
        id: "compliance_risk",
        user_voice: "We're one missed certificate or one accessibility complaint away from a real problem — and we're holding it together with email.",
        discovery_signal: "Mentions of close calls; accessibility complaints; concern about audit-readiness.",
        objection_to_anticipate: "'We haven't had an issue yet' → reframe: risk is what hasn't happened yet, not what has.",
        switch_trigger: "Compliance incident in the sector; board-level risk review."
      },
      {
        id: "talent_dependency",
        user_voice: "The whole thing was built by one person who's no longer here — we don't fully understand how it works, and we're scared to touch it.",
        discovery_signal: "Mention of an original developer who's gone; reluctance to make changes; workarounds piled on workarounds.",
        objection_to_anticipate: "'We can document it' → ask if anyone currently on staff could rebuild it from scratch.",
        switch_trigger: "Critical change request that exposes the dependency; risk audit."
      }
    ]
  },
  unsure_research: {
    display_name: "Auto-Research LMS / Unknown",
    aliases: ["Autodetect", "Research", "Unsure"],
    category_note: "AI will analyze the organization and trigger to identify their current LMS. If no specific LMS is found, outreach will prioritize the trigger signal.",
    competitive_strength: "Flexible outreach focusing directly on the transition trigger.",
    pains: [
      {
        id: "generic_trigger_pain",
        user_voice: "managing member learning transitions cleanly without manual overhead",
        discovery_signal: "New leadership transitions, expiring legacy contracts, or board-level administrative compliance changes.",
        objection_to_anticipate: "'We are busy managing this shift' -> respect the transition timeline, ask how they are cushioning the risk of data loss during the move.",
        switch_trigger: "Core transition trigger identified in the outbound signal."
      }
    ]
  }
};

export const customerStories: Record<string, CustomerStory> = {
  isc2: {
    display_name: "(ISC)²",
    official_name: "International Information Systems Security Certification Consortium",
    vertical_tags: ["credentialing_board", "general_professional_assoc"],
    credential_required: true,
    territory: "North America",
    learners: "150,000",
    one_line_outcome: "(ISC)² scaled professional development to 150,000+ cybersecurity professionals on Brightspace — course completions jumped to 33% (up 25 points), member course-takers grew from 13% to 27%, and learner satisfaction sits at 92-99%.",
    why_it_maps: "When a global credentialing body needs to deliver professional development at real scale — and prove engagement to the board — this is the proof point. Especially strong for prospects with large dispersed member bases and an existing certification credential."
  },
  chime: {
    display_name: "CHIME",
    official_name: "College of Healthcare Information Management Executives",
    vertical_tags: ["healthcare_assoc"],
    credential_required: false,
    territory: "North America",
    learners: "5,000",
    one_line_outcome: "CHIME launched online learning on Brightspace in two weeks (down from a nine-month plan) when COVID hit, enabling them to support healthcare leaders globally and expand membership beyond the C-suite.",
    why_it_maps: "For healthcare associations under pressure to ship something fast — new credential, new member experience, board mandate — this is the 'we move fast' proof point. The two-week launch detail is sticky on calls."
  },
  anzca: {
    display_name: "ANZCA",
    official_name: "Australian and New Zealand College of Anaesthetists",
    vertical_tags: ["healthcare_assoc", "credentialing_board"],
    credential_required: true,
    territory: "APAC",
    learners: "8,000",
    one_line_outcome: "ANZCA — the body that supports 87% of anaesthetists in Australia and New Zealand — uses Brightspace to deliver credential maintenance and CBE content, with active learners up 10% year-over-year and 1,800 members logging in monthly.",
    why_it_maps: "Best fit for healthcare credentialing bodies focused on credential maintenance, CME/CPD compliance, and member fellowship pathways. APAC-based so use carefully with US prospects — frame as 'their international peer.'"
  },
  cmtbc: {
    display_name: "CMTBC",
    official_name: "College of Massage Therapists of British Columbia",
    vertical_tags: ["healthcare_assoc", "credentialing_board"],
    credential_required: true,
    territory: "North America",
    learners: "5,500",
    one_line_outcome: "CMTBC uses Brightspace for regulatory entry-to-practice and quality assurance, supporting 50% growth (3,600 → 5,500 RMTs) while keeping a small internal team efficient through D2L Managed Services.",
    why_it_maps: "Strong fit for regulatory bodies or credentialing boards with small staff teams — the 'we grew 50% without growing the team' angle resonates with stretched ops leaders."
  },
  mmi: {
    display_name: "MMI",
    official_name: "Money Management Institute (MMI)",
    vertical_tags: ["cpa_finance"],
    credential_required: false,
    territory: "North America",
    learners: "",
    one_line_outcome: "MMI launched the MMI Learning Hub on Brightspace for financial services execs — hitting 95%+ engagement in the Executive IQ program, nearly doubling engagement scores (46% → 87%), and 98% of learners would recommend.",
    why_it_maps: "The strongest direct match for CPA/financial services associations — executive-level audience, cohort-based learning, certification, and engagement metrics that survive an exec review. Use heavily with OSCPA-type prospects."
  },
  energy_safety_canada: {
    display_name: "Energy Safety Canada",
    official_name: "Energy Safety Canada (ESC)",
    vertical_tags: ["trade_manufacturing", "credentialing_board"],
    credential_required: true,
    territory: "North America",
    learners: "100,000",
    one_line_outcome: "Energy Safety Canada delivers compliance and safety certification to 100,000+ energy workers on Brightspace, using the Kirkpatrick Model to continuously measure and improve course effectiveness.",
    why_it_maps: "Best fit for trade/industrial associations doing safety credentialing or compliance training at scale. The 100K number is eye-catching, the Kirkpatrick detail signals rigor — works especially well for PRI-type industrial credentialing prospects."
  },
  ufcw_canada: {
    display_name: "UFCW Canada",
    official_name: "United Food and Commercial Workers Union Canada",
    vertical_tags: ["trade_manufacturing"],
    credential_required: false,
    territory: "North America",
    learners: "10,000",
    one_line_outcome: "UFCW Canada launched 'On-the-Go' micro-learning modules on Brightspace for union members — boosting webCampus enrollment 25%, OTG module enrollments 55%, and pushing module completion rates to 57% (vs. 35-40% for traditional courses).",
    why_it_maps: "Strong story for trade associations and workforce orgs where members are field-based, time-poor, and won't sit through long courses. The micro-credential / 15-minute module framing is the hook."
  },
  aacsb: {
    display_name: "AACSB",
    official_name: "Association to Advance Collegiate Schools of Business",
    vertical_tags: ["general_professional_assoc"],
    credential_required: false,
    territory: "North America",
    learners: "",
    one_line_outcome: "AACSB used Brightspace to automate admin work and build templates, freeing staff for higher-value work and enabling them to launch a Competency-Based Education (CBE) academy for member business school staff — including reducing a 50-page process to a few clicks.",
    why_it_maps: "Recognizable association name. Best for prospects whose pain is 'staff drowning in manual work' or 'we want to launch a new program but can't free up the team.' The '50 pages → few clicks' line is sticky."
  },
  good_roads: {
    display_name: "Good Roads",
    official_name: "Good Roads (Ontario municipal association)",
    vertical_tags: ["trade_manufacturing", "general_professional_assoc"],
    credential_required: false,
    territory: "North America",
    learners: "2,500 annually",
    one_line_outcome: "Good Roads grew online training enrollment 10x in two years on Brightspace, hitting a 98% skill improvement rate, 85%+ course completion, and self-sustaining revenue — running 70+ courses with just three staff and 200 volunteer instructors.",
    why_it_maps: "Best for smaller associations punching above their weight — the '3 staff running 70 courses' detail lands with stretched teams. Also a strong revenue-growth and ROI story."
  },
  harvard_business_publishing: {
    display_name: "Harvard Business Publishing",
    official_name: "Harvard Business Publishing Corporate Learning",
    vertical_tags: ["ce_provider", "general_professional_assoc"],
    credential_required: false,
    territory: "North America",
    learners: "",
    one_line_outcome: "Harvard Business Publishing Corporate Learning rebuilt their course templates and delivery model on Brightspace to customize world-class leadership training at scale — creating a reusable component library that lets delivery teams quickly tailor experiences per client.",
    why_it_maps: "Best for CE providers and training organizations whose pain is 'every client wants something custom and it's eating our margin.' The 'customization at scale' framing is the hook. Recognizable brand for credibility."
  },
  imsa: {
    display_name: "IMSA",
    official_name: "International Municipal Signals Association",
    vertical_tags: ["credentialing_board", "trade_manufacturing"],
    credential_required: true,
    territory: "North America",
    learners: "9,300",
    one_line_outcome: "IMSA cut certification time for public safety professionals by moving exams and study online on Brightspace — eliminating travel and time off for learners while streamlining admin work for IMSA staff.",
    why_it_maps: "Best for credentialing bodies serving field professionals (public safety, trades, infrastructure) where the 'travel + time off work' barrier is real. Strong fit for IMSA-style infrastructure or municipal credentialing prospects."
  },
  cma_canadian_marketing: {
    display_name: "Canadian Marketing Association",
    official_name: "Canadian Marketing Association (CMA)",
    vertical_tags: ["general_professional_assoc"],
    credential_required: true,
    territory: "North America",
    learners: "400",
    one_line_outcome: "The Canadian Marketing Association launched the Chartered Marketer (CM) designation on Brightspace — 400+ marketers have earned, applied for, or are working toward the designation, with many reporting promotions after completion.",
    why_it_maps: "Best for professional associations launching a new flagship credential or designation. The 'members got promoted because of this' detail is compelling for member-value conversations."
  },
  cpled: {
    display_name: "CPLED",
    official_name: "Canadian Centre for Professional Legal Education",
    vertical_tags: ["credentialing_board", "general_professional_assoc"],
    credential_required: true,
    territory: "North America",
    learners: "1,000",
    one_line_outcome: "CPLED combines online and in-person learning on Brightspace to deliver the Practice Readiness Education Program — preparing 1,000+ aspiring lawyers for legal careers through hybrid, blended, and continuously updated coursework.",
    why_it_maps: "Best for credentialing bodies in regulated professions (legal, accounting, healthcare) with a defined entry-to-practice program and a small-to-mid cohort size."
  },
  bslm: {
    display_name: "British Society of Lifestyle Medicine",
    official_name: "British Society of Lifestyle Medicine (BSLM)",
    vertical_tags: ["healthcare_assoc", "credentialing_board"],
    credential_required: true,
    territory: "EMEA",
    learners: "",
    one_line_outcome: "BSLM partnered with D2L to launch lifestyle medicine certification globally — driving 150% membership growth, 60,000+ accredited learning hours delivered, 335% conference attendance growth, and a 46% revenue increase (with 120%+ the following year).",
    why_it_maps: "Best when the prospect cares about non-dues revenue growth and membership expansion through a new credential. The metrics are exceptional — use for the 'this is what a credential program at scale looks like financially' conversation. EMEA-based so frame as 'an international peer.'"
  },
  gafta: {
    display_name: "Gafta",
    official_name: "Grain and Feed Trade Association",
    vertical_tags: ["trade_manufacturing", "ce_provider"],
    credential_required: false,
    territory: "EMEA",
    learners: "",
    one_line_outcome: "Gafta serves 1,900 members across 95+ countries through a central learning hub on Brightspace — driving a 49% lift in learner engagement, expanding from 5 to 30 online short courses, and unlocking commercial agreements with industry partners.",
    why_it_maps: "Best for global trade associations with dispersed memberships and a revenue motive. The 'central learning hub' + 'industry partnerships' framing works for prospects thinking about platform economics, not just LMS features."
  },
  pmi: {
    display_name: "PMI",
    official_name: "Project Management Institute",
    vertical_tags: ["credentialing_board", "general_professional_assoc"],
    credential_required: true,
    territory: "Global",
    learners: "",
    one_line_outcome: "PMI partnered with D2L on Brightspace, including the CSPP certification launch — scaling credentialing delivery across a global member base.",
    why_it_maps: "Tier-one credentialing brand. When a prospect runs a certification program, PMI is the credibility anchor — D2L is the platform a global gold-standard credentialing body chose.",
    not_in_source_csv: true,
    warning: "PMI does not appear in the customer stories CSV. Pat references it constantly from his deal context (CSPP certification launch, GPM Global tie-in), but the specific outcomes/metrics should be verified. Use this entry as a name-drop only until verified."
  }
};

export const storyMatchRules = {
  matching_logic: [
    "Step 1: Filter customer_stories where vertical_tags includes the input vertical.",
    "Step 2: If credential_required input is true, filter further to stories where credential_required is true.",
    "Step 3: Prefer stories where territory matches Pat's territory (North America) — sort NA above APAC/EMEA.",
    "Step 4: Within the filtered set, return the primary based on the recommendations below.",
    "Step 5: If filtered set is empty, fall back to (ISC)² for credentialing prospects, AACSB for general assoc, Harvard Business Publishing for CE providers."
  ],
  vertical_to_primary_story: {
    "healthcare_assoc__credential_false": "chime",
    "healthcare_assoc__credential_true": "cmtbc",
    "cpa_finance__credential_false": "mmi",
    "cpa_finance__credential_true": "mmi",
    "trade_manufacturing__credential_false": "ufcw_canada",
    "trade_manufacturing__credential_true": "energy_safety_canada",
    "credentialing_board__credential_true": "isc2",
    "credentialing_board__credential_false": "isc2",
    "general_professional_assoc__credential_false": "aacsb",
    "general_professional_assoc__credential_true": "cma_canadian_marketing",
    "ce_provider__credential_false": "harvard_business_publishing",
    "ce_provider__credential_true": "harvard_business_publishing",
    "other__credential_true": "isc2",
    "other__credential_false": "aacsb"
  } as Record<string, string>,
  fallback_chain: ["isc2", "aacsb", "harvard_business_publishing"]
};

export const voiceGuidelines = {
  reading_level_target: "6th grade — verify with a readability check before send.",
  banned_words: [
    "leverage",
    "solution",
    "robust",
    "seamless",
    "empower",
    "unlock",
    "ecosystem",
    "journey",
    "partner with you",
    "synergy",
    "best-in-class",
    "cutting-edge",
    "circle back",
    "touch base",
    "hope this email finds you well",
    "I noticed you're using",
    "quick question",
    "just checking in"
  ],
  allowed_patterns: {
    openers: [
      "Saw [specific thing] — got me thinking about [pain].",
      "Question for you: [open question tied to pain].",
      "[Peer name] mentioned [thing] — figured you might be running into the same."
    ],
    soft_ctas: [
      "Worth a quick chat?",
      "Open to comparing notes?",
      "Want me to send a 2-minute video instead?",
      "If that's a fit, happy to share what's worked."
    ]
  },
  rules: {
    max_words_body: 90,
    max_questions_in_body: 1,
    use_contractions: true,
    use_bullets_in_email: false,
    subject_max_words: 6,
    subject_case: "lowercase or sentence case, no colons",
    signoff: "Pat",
    no_signature_block: true
  }
};

export const verticals = [
  { id: "healthcare_assoc", display: "Healthcare association" },
  { id: "cpa_finance", display: "CPA / finance" },
  { id: "trade_manufacturing", display: "Trade / manufacturing" },
  { id: "credentialing_board", display: "Credentialing board" },
  { id: "general_professional_assoc", display: "General professional assoc" },
  { id: "ce_provider", display: "CE provider" },
  { id: "other", display: "Other" }
];

export const fusionCta = {
  active_window: {
    start_date: "2026-04-01",
    end_date: "2026-07-10"
  },
  template: "P.S. — we're hosting Fusion in Phoenix July 8-10, lot of {vertical_display} folks will be there. Worth grabbing 15 min if you're going?"
};

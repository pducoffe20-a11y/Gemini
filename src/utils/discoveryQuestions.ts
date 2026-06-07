export function getDiscoveryQuestion(painPointId: string, lmsDisplay: string): string {
  const questions: Record<string, string> = {
    // Search / Discoverability
    search_broken: "When members come to your learning portal, how easy is it for them to browse and find content relevant to their exact role?",
    discoverability: "When members search your learning hub, what's their typical path to finding a specialized piece of training?",
    
    // Reporting / Analytics
    reporting_thin: "When the board asks which courses are directly driving member retention or revenue, how much manual effort goes into pulling that data?",
    reporting_depth: "What's your current workflow for mapping member engagement data over to your renewals and program feedback?",
    basic_reporting: "How do you currently track which parts of your course catalog are driving member satisfaction, and which have gone stale?",
    no_analytics: "What sort of reporting or feedback do you share when leadership asks what value members are getting from your learning courses?",
    
    // UX / UI
    dated_ux: "When members compare your learning catalog's layout to other web tools they use daily, what feedback do they generally share?",
    aging_learner_ui: "When you survey younger members entering your association, how well does the portal layout meet their expectations for digital tools?",
    ux_dated: "How easy is it for members to start or pause a lesson on whatever device they have on hand?",
    
    // CE / Certification Workflow
    ce_workflow_clunky: "How much administrative manual overhead goes into tracking credit hours, audits, and issuing compliance certificates?",
    weak_certification: "When a member finishes their CE tracking cycle, what is the process for verifying their hours and approving renewals?",
    manual_ce_tracking: "What kind of manual checking is needed to make sure member credits are recorded accurately and sent without delays?",
    
    // Integration
    ams_integration_friction: "When a member updates their credentials or dues in your database, how cleanly does that data sync across to your learning platform?",
    salesforce_dependency: "If you want to pull insights or run a membership status check, how many manual imports or custom workarounds are needed?",
    ecosystem_lockin: "When you want to try out a new tool or partner program, what kind of friction or integration effort do you usually run into?",
    
    // Post-merger / Pace / CSM
    post_merger_velocity: "When you hear about upcoming roadmaps or new features, how quickly do those typically get rolled out to your actual system?",
    innovation_pace: "What major capabilities have been added to your system recently that have actually improved your day-to-day admin work?",
    csm_churn: "How much continuity do you feel like you have with your account team when you need to resolve platform challenges?",
    
    // Cost / Pricing
    expensive_with_addons: "How do you evaluate which parts of your training suite are actively driving member value versus features that are rarely touched?",
    pricing_scales_fast: "As your catalog grows or member participation rises, how do you manage the predictability of your ongoing user licensing fees?",
    pricing_misalignment: "How well does your pricing model accommodate members who might only log in once or twice a year?",
    pricing_complexity: "How predictable is your licensing cost year-over-year when planning budgets for and introducing new courses?",
    
    // Community / Social
    no_community: "How do members currently share insights or ask questions to each other while taking courses on your platform?",
    limited_community: "What does the bridge look like between where members learn and where they interact for networking or peer learning?",
    
    // Self-hosted / Maintenance / Homegrown
    maintenance_burden: "How much of your internal team's day-to-day energy is spent on server updates, plug-in audits, and software patches?",
    no_vendor_support: "If something stops working during a critical member signup window, what's your first line of troubleshooting support?",
    custom_dev_for_modern_features: "When leadership wants to add a new digital feature, is that quick to implement or does it trigger a long custom project?",
    talent_dependency: "If the main person who set up your learning system were to take extended leave, who is the backup to handle urgent fixes?",
    compliance_burden: "What's your current strategy for managing accessibility audits or data privacy updates on your self-guided setup?",
    no_infrastructure_for_scale: "As you plan to scale your member roster or courses, where do you anticipate the first operational bottleneck will show up?",
    compliance_risk: "How are you keeping track of certificate approvals so that auditing credentials doesn't become a high-risk manual headache?",
  };

  return questions[painPointId] || `When your staff or members interact with your learning system, what are the primary administrative hurdles they run into during a normal week?`;
}

import { useState, useEffect } from "react";

// ─── Responsive hook ─────────────────────────────────────────────────────────
function useMobile(bp = 768) {
  const [m, setM] = useState(false);
  useEffect(() => {
    const check = () => setM(window.innerWidth < bp);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [bp]);
  return m;
}

// ─── Design tokens ───────────────────────────────────────────────────────────
const C = {
  bg: "#F5F4F0", white: "#FFFFFF", ink: "#0A0A09", inkMid: "#2C2C2A",
  inkLight: "#6B6966", inkFaint: "#B0ADA8", border: "#E2DFD9",
  borderDark: "#C4C1BA", accent: "#C8922A", accentDim: "#E8B96A",
  buyer: "#1A5C35", buyerBg: "#EFF8F3", buyerBorder: "#A8D4B8",
  seller: "#8B1A1A", sellerBg: "#FBF0F0", sellerBorder: "#D4A8A8",
  caseBg: "#F0F4FB", caseBorder: "#B8CAE8", caseText: "#1A2C5C",
};
const F = {
  corpus: "'Cormorant Garamond', Georgia, serif",
  display: "'Playfair Display', Georgia, serif",
  body: "'Libre Baskerville', Georgia, serif",
  ui: "'DM Sans', -apple-system, sans-serif",
  mono: "'DM Mono', monospace",
};

// ═══════════════════════════════════════════════════════════════════════════════
// DATABASE LAYER
// ═══════════════════════════════════════════════════════════════════════════════

const PROVISIONS = [
  { id: "structure",    number: 1,  title: "Structure & Mechanics",  deal: "Twitter / X Holdings", deal_date: "Apr. 25, 2022", sections: "§§ 2.1–2.3" },
  { id: "economics",   number: 2,  title: "Deal Economics",          deal: "Twitter / X Holdings", deal_date: "Apr. 25, 2022", sections: "§§ 3.1–3.2" },
  { id: "ppa",         number: 3,  title: "PPA Mechanics",           deal: "Twitter / X Holdings", deal_date: "Apr. 25, 2022", sections: "§§ 3.1–3.7" },
  { id: "earnouts",    number: 4,  title: "Earnouts",                deal: "Twitter / X Holdings", deal_date: "Apr. 25, 2022", sections: "N/A" },
  { id: "rw",          number: 5,  title: "Reps & Warranties",       deal: "Twitter / X Holdings", deal_date: "Apr. 25, 2022", sections: "Arts. IV–V" },
  { id: "mae",         number: 6,  title: "Material Adverse Effect", deal: "Twitter / X Holdings", deal_date: "Apr. 25, 2022", sections: "Art. I" },
  { id: "covenants",   number: 7,  title: "Covenants",               deal: "Twitter / X Holdings", deal_date: "Apr. 25, 2022", sections: "Art. VI" },
  { id: "conditions",  number: 8,  title: "Conditions to Closing",   deal: "Twitter / X Holdings", deal_date: "Apr. 25, 2022", sections: "Art. VII" },
  { id: "termination", number: 9,  title: "Termination",             deal: "Twitter / X Holdings", deal_date: "Apr. 25, 2022", sections: "Art. VIII" },
  { id: "indemnity",   number: 10, title: "Indemnification",         deal: "Twitter / X Holdings", deal_date: "Apr. 25, 2022", sections: "§ 6.6" },
  { id: "boilerplate", number: 11, title: "Boilerplate",             deal: "Twitter / X Holdings", deal_date: "Apr. 25, 2022", sections: "Art. IX" },
];

const DEFINED_TERMS = {
  "DGCL": {
    id: "DGCL",
    term: "DGCL",
    short: "Delaware General Corporation Law — governs Delaware corporations.",
    long: "The Delaware General Corporation Law (DGCL) is the primary statute governing corporations incorporated in Delaware. Section 251 governs merger procedures; Section 251(h) permits no-vote back-end mergers after a successful tender offer clearing 50%+ of shares. Section 262 governs stockholder appraisal rights. The Twitter/X Holdings merger was governed entirely by Delaware law despite Twitter being headquartered in San Francisco — California's CCC is defined in the agreement but plays a limited role.",
    appears_in: ["structure", "conditions", "boilerplate"],
    related_cases: ["akorn", "ncs"],
    related_terms: ["251h", "EffectiveTime", "Certificate of Merger"],
  },
  "Effective Time": {
    id: "EffectiveTime",
    term: "Effective Time",
    short: "The moment the merger legally takes effect upon filing the Certificate of Merger with the Delaware Secretary of State.",
    long: "Defined in Section 2.3(a). The Effective Time is when the merger becomes legally effective — typically upon filing of the Certificate of Merger with the Delaware Secretary of State, or at a later time specified in that certificate. For Twitter/X Holdings, the Effective Time occurred on October 27, 2022. The Effective Time is distinct from the Closing (the commercial event) but both occur concurrently on the Closing Date.",
    appears_in: ["structure", "ppa", "covenants"],
    related_cases: [],
    related_terms: ["DGCL", "Certificate of Merger", "Closing Date"],
  },
  "Acquisition Sub": {
    id: "AcquisitionSub",
    term: "Acquisition Sub",
    short: "X Holdings II, Inc. — a Delaware shell formed April 19, 2022 solely to effect the merger.",
    long: "X Holdings II, Inc. is a Delaware corporation and a direct wholly owned subsidiary of Parent (X Holdings I). It was formed April 19, 2022 — six days before the merger agreement was signed — solely to effect the merger. It has never engaged in any business. In a forward triangular merger, Acquisition Sub merges into the target (Twitter), and Acquisition Sub ceases to exist at the Effective Time. The use of a merger subsidiary insulates Parent from direct liability and keeps the target's contracts intact.",
    appears_in: ["structure", "rw", "conditions"],
    related_cases: [],
    related_terms: ["Surviving Corporation", "DGCL"],
  },
  "Surviving Corporation": {
    id: "SurvivingCorporation",
    term: "Surviving Corporation",
    short: "Twitter, Inc. — continued post-merger as a wholly owned subsidiary of Parent.",
    long: "Defined in Section 2.1. In a forward triangular merger, the target survives and the merger subsidiary disappears. Twitter continued as the Surviving Corporation, preserving its legal entity, contracts, licenses, FCC authorizations, and existing indebtedness. Musk's bank debt financing (committed by Morgan Stanley et al.) specifically required Twitter's legal continuity. Post-closing, Twitter's corporate name was later changed to X Corp. through a separate certificate amendment.",
    appears_in: ["structure", "conditions", "boilerplate"],
    related_cases: [],
    related_terms: ["Acquisition Sub", "DGCL"],
  },
  "Company Material Adverse Effect": {
    id: "MAE",
    term: "Company Material Adverse Effect",
    short: "The threshold allowing a buyer to walk if a sufficiently serious negative event occurs before closing.",
    long: "Defined in Article I with nine carve-out categories. A 'Company Material Adverse Effect' means any change reasonably expected to result in a material adverse effect on the business, financial condition, or results of operations of Twitter and its subsidiaries, taken as a whole — subject to nine categories of exclusions. The nine carve-outs include: (i) industry conditions; (ii) law/GAAP changes; (iii) macro economic/political conditions; (iv) force majeure; (v) pandemics/COVID-19; (vi) deal announcement effects; (vii) actions taken with Parent's consent; (viii) stock price changes or earnings misses (underlying causes excepted); and (ix) matters disclosed in SEC filings. Musk's July 2022 termination letter argued Twitter's bot/spam disclosures triggered this definition. The argument failed — Delaware courts have never found a qualifying MAE in a contested case.",
    appears_in: ["mae", "conditions", "termination", "rw"],
    related_cases: ["akorn", "channel_med", "ab_inbev"],
    related_terms: ["Termination Fee", "specific performance"],
  },
  "Termination Fee": {
    id: "TerminationFee",
    term: "Termination Fee",
    short: "The Company Termination Fee — $1,000,000,000 payable by Twitter to Parent in certain termination scenarios.",
    long: "Defined in Article I as $1,000,000,000 (one billion dollars). Payable by Twitter to Parent if the agreement is terminated due to (1) Parent terminating for Company breach, or (2) Twitter exercising its Superior Proposal fiduciary out. The Termination Fee is the sole and exclusive remedy of Parent against the Company for monetary damages. Symmetrically, the Parent Termination Fee is also $1,000,000,000 — payable by Musk (personally, via the Limited Guarantee) to Twitter if Parent fails to close when required. Bilateral $1B structures signal equal negotiating leverage.",
    appears_in: ["termination", "structure"],
    related_cases: [],
    related_terms: ["Parent Termination Fee", "specific performance", "Company Material Adverse Effect"],
  },
  "specific performance": {
    id: "SpecificPerformance",
    term: "specific performance",
    short: "The equitable remedy allowing a party to compel the other to perform contractual obligations rather than just pay damages.",
    long: "Section 9.9 of the Twitter agreement grants both parties bilateral specific performance rights — the right to compel closing, not just collect the termination fee. Twitter exercised this right in its July 12, 2022 Chancery lawsuit. The clause provides that (1) irreparable harm is established without further proof; (2) no bond is required; and (3) the right exists 'without proof of actual damages.' Musk signed personally as Equity Investor with respect to Section 9.9, making him individually subject to the specific performance claim. He closed on October 27, 2022 rather than face trial.",
    appears_in: ["structure", "termination", "boilerplate"],
    related_cases: ["twitter_musk", "akorn"],
    related_terms: ["Termination Fee", "Company Material Adverse Effect"],
  },
  "reasonable best efforts": {
    id: "RBE",
    term: "reasonable best efforts",
    short: "The highest efforts standard — obligates a party to take all reasonable steps to achieve the specified result.",
    long: "Section 6.3 obligates Parent and Acquisition Sub to use 'reasonable best efforts' to obtain regulatory approvals and consummate the merger. This is the strongest efforts standard in M&A agreements, sitting above 'commercially reasonable efforts' and 'best efforts' in practical application. Twitter cited Musk's Section 6.3 obligations as a primary basis for its specific performance claim — arguing that Musk's refusal to close violated his reasonable best efforts obligation to consummate the transaction.",
    appears_in: ["structure", "covenants", "conditions"],
    related_cases: ["twitter_musk"],
    related_terms: ["specific performance", "Termination Fee"],
  },
  "Parent Termination Fee": {
    id: "ParentTerminationFee",
    term: "Parent Termination Fee",
    short: "$1,000,000,000 payable by Parent (Musk personally, via Limited Guarantee) to Twitter if Parent fails to close.",
    long: "Defined in Article I as $1,000,000,000. Payable by Parent to Twitter if Twitter terminates due to Parent's breach, or if the Outside Date passes while Parent's closing conditions are satisfied. Musk guaranteed payment personally via the Limited Guarantee — ensuring Twitter had recourse against an individual with assets, not just a newly formed shell. The symmetry with the Company Termination Fee ($1B each) was deliberate and signal of balanced leverage.",
    appears_in: ["termination", "structure"],
    related_cases: [],
    related_terms: ["Termination Fee", "specific performance"],
  },
};

const CASES = {
  twitter_musk: {
    id: "twitter_musk",
    name: "Twitter, Inc. v. Musk",
    court: "Del. Ch.",
    year: 2022,
    cite: "C.A. No. 2022-0613-KSJM",
    summary: "Twitter sued Musk for specific performance after he purported to terminate the merger agreement on July 8, 2022, citing Twitter's alleged failure to disclose bot/spam account data and a purported Company MAE. Chancellor McCormick expedited proceedings and set trial for October 17, 2022. Musk moved to close on October 4; the deal closed October 27 — four days before trial.",
    holdings: [
      "Expedited proceedings granted — trial set within 90 days of filing",
      "Musk's termination notice held not to moot specific performance claim",
      "Settlement: Musk closed at original $54.20/share price",
    ],
    provisions: ["structure", "mae", "termination", "covenants", "boilerplate"],
    terms: ["Company Material Adverse Effect", "specific performance", "reasonable best efforts", "Termination Fee"],
  },
  akorn: {
    id: "akorn",
    name: "Akorn, Inc. v. Fresenius Kabi AG",
    court: "Del. Ch.",
    year: 2018,
    cite: "C.A. No. 2018-0300-JTL",
    summary: "First Delaware case to find a qualifying Material Adverse Effect, permitting buyer to walk. Akorn had concealed widespread regulatory violations and data integrity problems from FDA submissions. The court found the violations were qualitatively and quantitatively significant, durationally significant, and not reflected in the deal price.",
    holdings: [
      "First MAE finding in a contested Delaware merger case",
      "Requires both qualitative significance and durational significance",
      "Seller's active regulatory concealment — not mere earnings miss — was dispositive",
      "Akorn's business declined ~86% in operating income — far beyond a typical downturn",
    ],
    provisions: ["mae", "rw", "conditions"],
    terms: ["Company Material Adverse Effect"],
  },
  channel_med: {
    id: "channel_med",
    name: "Channel Medsystems v. Boston Scientific",
    court: "Del. Ch.",
    year: 2019,
    cite: "C.A. No. 2018-0673-AGB",
    summary: "Boston Scientific tried to walk from an acquisition of Channel Medsystems after discovering that Channel's CFO had engaged in financial fraud. Court found no MAE despite material misrepresentations because Boston Scientific could not show the fraud had a lasting effect on the business — the underlying business was otherwise sound.",
    holdings: [
      "Fraud by seller employee ≠ automatic MAE",
      "Buyer must show lasting impact on business, not just the fraud itself",
      "Buyer also in breach for failing to use reasonable best efforts to close",
    ],
    provisions: ["mae", "rw"],
    terms: ["Company Material Adverse Effect", "reasonable best efforts"],
  },
  ab_inbev: {
    id: "ab_inbev",
    name: "AB InBev / SABMiller",
    court: "N/A (settled)",
    year: 2016,
    cite: "N/A",
    summary: "AB InBev acquired SABMiller for £79B. Frequently cited for its MAE definition and the Brexit/macro carve-outs that were negotiated into the agreement. The deal proceeded despite significant FX movements and regulatory complexity across 40+ jurisdictions.",
    holdings: [
      "Macro/FX carve-outs successfully insulated deal from Brexit currency movements",
      "Demonstrates importance of careful MAE carve-out negotiation in cross-border deals",
    ],
    provisions: ["mae", "conditions"],
    terms: ["Company Material Adverse Effect"],
  },
  ncs: {
    id: "ncs",
    name: "Omnicare v. NCS Healthcare",
    court: "Del. Sup. Ct.",
    year: 2003,
    cite: "818 A.2d 914 (Del. 2003)",
    summary: "Delaware Supreme Court struck down a voting agreement that, combined with a board-approved merger, made stockholder rejection mathematically impossible. Established that a board cannot completely lock up a deal such that stockholder fiduciary protection is nullified — relevant to understanding the outer limits of deal certainty mechanisms.",
    holdings: [
      "Deal-lock provisions eliminating all stockholder discretion are void",
      "Board cannot agree to measures that ensure approval without stockholder choice",
      "Relevant ceiling on how much certainty a buyer can extract from a public target",
    ],
    provisions: ["structure", "conditions"],
    terms: ["DGCL"],
  },
};

const QA_DATABASE = [
  { id: "q1",  provision_id: "structure", level: "junior", question: "Why did Acquisition Sub merge into Twitter instead of the other way around?", answer: "Forward triangular structure keeps Twitter — the valuable entity with all the contracts, licenses, and user data — alive as the Surviving Corporation. Acquisition Sub was a shell formed April 19, 2022 with no assets. If you merged Twitter into Acquisition Sub (reverse triangular), you'd need consent under every major contract that had a change-of-control provision. The forward structure sidesteps most of that.", concepts: ["merger-structure"], tags: ["CoC", "forward-triangular"] },
  { id: "q2",  provision_id: "structure", level: "junior", question: "What's the difference between the Closing and the Effective Time?", answer: "The Closing is the commercial event — documents exchange, funds move, ownership transfers. The Effective Time is when the merger becomes legally effective, upon filing the Certificate of Merger with the Delaware Secretary of State. For Twitter, both occurred on October 27, 2022. The two happen concurrently on Closing Date but are technically distinct — the legal change in corporate existence requires the state filing.", concepts: ["closing-mechanics"], tags: ["Effective Time", "Certificate of Merger"] },
  { id: "q3",  provision_id: "structure", level: "junior", question: "Why does Elon Musk sign the agreement personally?", answer: "Musk signed as 'Equity Investor' solely with respect to the Specified Provisions — Sections 5.4, 6.3, 6.8, 6.10, 6.11, 6.12, and 9.9. This made him personally liable on those provisions, not just the shell entities. Without this, Twitter's claims would be against X Holdings I and II — shells with no assets. Always check which provisions an individual is actually bound by; it's usually a defined subset.", concepts: ["party-structure"], tags: ["personal-liability", "Equity Investor", "specific performance"] },
  { id: "q4",  provision_id: "structure", level: "junior", question: "What was the deal price and premium?", answer: "$54.20 per share in cash — a 38% premium to Twitter's closing price on April 1, 2022, the last full trading day before Musk disclosed his approximately 9% stake. Total deal value approximately $44 billion. The Merger Consideration is defined in Section 3.1(c) and is payable in cash without interest, subject to withholding taxes.", concepts: ["deal-economics"], tags: ["price", "premium", "merger-consideration"] },
  { id: "q5",  provision_id: "structure", level: "mid", question: "Why wasn't Section 251(h) used to eliminate the stockholder vote?", answer: "Musk's financing structure — equity commitment letter, margin loan on Tesla shares, bank debt commitments from Morgan Stanley et al. — was incompatible with clean 251(h) tender offer mechanics on the compressed timeline he initially wanted. The deal also deteriorated quickly after signing. Long-form structure with a stockholder vote was used instead; 98.6% of votes cast approved on September 13, 2022.", concepts: ["merger-structure"], tags: ["251h", "tender-offer", "stockholder-vote"] },
  { id: "q6",  provision_id: "structure", level: "mid", question: "What were Musk's stated grounds for terminating?", answer: "His July 8 termination letter cited three grounds: (1) Twitter materially breached Section 6.4 by withholding bot/spam account data; (2) Twitter made false representations about its monetizable daily active users; and (3) these issues constituted a Company Material Adverse Effect. Twitter's position: the MAE carve-outs explicitly covered all of these issues and the termination was wrongful. Musk closed rather than defend this at trial.", concepts: ["MAE", "termination"], tags: ["termination", "MAE", "bot-spam"] },
  { id: "q7",  provision_id: "structure", level: "mid", question: "What is a Limited Guarantee and why does it matter here?", answer: "A limited guarantee is a personal obligation where Musk guaranteed Parent would pay the Parent Termination Fee if triggered. Without it, Twitter's recourse would be only against X Holdings I — a shell with no assets. The Limited Guarantee made Musk personally liable for $1 billion and was a key piece of Twitter's litigation leverage.", concepts: ["party-structure", "termination"], tags: ["Limited Guarantee", "RTF", "personal-liability"] },
  { id: "q8",  provision_id: "structure", level: "senior", question: "What was the decisive legal factor in Twitter winning the specific performance fight?", answer: "Two things: the bilateral specific performance clause in Section 9.9, and Chancery's willingness to expedite. Musk's strategy was delay — push the trial to 2023, let conditions deteriorate, extract a price cut. Once Chancellor McCormick set an October 2022 trial date, Musk's leverage evaporated. He closed October 27 — four days before trial was to begin.", concepts: ["specific-performance", "remedies"], tags: ["specific performance", "expedited proceedings", "Chancery"] },
  { id: "q9",  provision_id: "structure", level: "senior", question: "How would you have advised Musk on the MAE argument?", answer: "I would have told him it was a losing argument before filing. Delaware courts have never found a qualifying MAE in a contested case — Akorn is the sole exception, and that involved active concealment of FDA violations with ~86% earnings decline. The clause (viii) carve-out explicitly excluded earnings misses as standalone MAE evidence. The underlying-causes hook is a very high bar. He signed a seller-favorable MAE definition and should have known it.", concepts: ["MAE", "remedies"], tags: ["MAE", "Akorn", "Delaware law"] },
  { id: "q10", provision_id: "structure", level: "senior", question: "What structure lessons does Twitter/Musk teach for future deals?", answer: "Three: (1) If your buyer has committed equity and no financing condition, insist on bilateral specific performance — not RTF as sole remedy. (2) Draft your information access covenant with clear parameters so it can't be weaponized as a termination basis. (3) MAE carve-outs are not boilerplate — they are the seller's primary substantive protection. Negotiate them with the same intensity as price.", concepts: ["remedies", "MAE", "covenants"], tags: ["specific performance", "MAE", "deal structure"] },
  { id: "q11", provision_id: "mae", level: "junior", question: "What is the 'materiality' threshold for an MAE?", answer: "There's no bright-line dollar amount. Delaware courts use a qualitative and quantitative test: the effect must be significant and durationally meaningful — not a short-term blip. In Akorn, the court found an MAE after an ~86% operating income decline that was expected to persist. A 10–15% revenue miss typically won't qualify, especially with the standard carve-outs.", concepts: ["MAE"], tags: ["MAE", "materiality"] },
  { id: "q12", provision_id: "mae", level: "mid", question: "What is the 'underlying causes' carve-out in clause (viii) and why does it matter?", answer: "Clause (viii) says stock price changes and earnings misses are excluded from the MAE definition — but it preserves the ability to look at the 'underlying causes' of those changes. Musk tried to use this: Twitter's stock dropped, but the underlying cause was the bot/spam issue, which he argued was an MAE. The problem: the underlying cause (disputed user count estimates) wasn't qualitatively significant enough to constitute a standalone MAE under Akorn's standard.", concepts: ["MAE"], tags: ["MAE", "underlying causes", "clause viii"] },
];

const WAR_STORIES_DATABASE = [
  { id: "ws1", provision_id: "structure", level: "junior", title: "The CoC Clause That Only Applied to One Structure", deal: "Media SaaS acquisition, 2023", story: "A first-year flagged a major distribution agreement as requiring change-of-control consent and put it on the consent matrix. The partner reviewed it and noted that the CoC definition only triggered if the target ceased to be the 'surviving entity.' We were doing a forward triangular — the target survived. No consent needed. The associate had read the trigger but not the full definition. Always read the complete definition, not just where it fires. On Twitter, many advertising contracts had CoC provisions that didn't fire because Twitter continued as the Surviving Corporation.", concepts: ["merger-structure"], tags: ["CoC", "forward-triangular"] },
  { id: "ws2", provision_id: "structure", level: "mid", title: "When the Interim Covenant Became a Weapon", deal: "Tech buyout, 2022", story: "We were representing a target whose buyer was getting cold feet post-signing. Under the ordinary course covenant, buyer consent was required for any new employment contract above threshold. The buyer slow-walked every consent request — a 3-day SLA stretched to 3 weeks. We couldn't sign retention packages for key engineers. Two left before closing. Lesson: negotiate explicit response deadlines into consent provisions. The Twitter deal shows the same dynamic in reverse — Musk refused consent to Twitter's retention programs, itself a breach of his Section 6.1 obligations.", concepts: ["covenants"], tags: ["ordinary course", "consent", "retention"] },
  { id: "ws3", provision_id: "structure", level: "senior", title: "The Trial Date That Won the Deal", deal: "Twitter / X Holdings, 2022", story: "This one is public. When Twitter filed for specific performance in July 2022, the real fight wasn't over merits — it was over timing. Musk's strategy was delay: push the trial to 2023, let conditions deteriorate, use that as price-cut leverage. Twitter's counsel at Wilson Sonsini and Simpson Thacher moved to expedite. Chancellor McCormick set a five-day trial for October 17, 2022. On October 4 — thirteen days before trial — Musk sent a letter offering to close at $54.20. He closed October 27. The specific performance clause was the sword; the expedited schedule was what made it lethal. When you negotiate Section 9.9, you're negotiating the procedural posture of any future litigation.", concepts: ["specific-performance", "remedies"], tags: ["specific performance", "expedited", "Chancery", "Wilson Sonsini", "Simpson Thacher"] },
  { id: "ws4", provision_id: "mae", level: "senior", title: "Akorn: The Day Delaware Found an MAE", deal: "Fresenius / Akorn, 2018", story: "For 15 years, buyers argued MAE and lost every time in Delaware. Then came Akorn. Fresenius discovered during due diligence follow-up that Akorn had systematically falsified FDA data integrity submissions — not a small problem, but a systematic fraud running through the company's regulatory compliance function. Operating income had dropped ~86%. Vice Chancellor Laster found an MAE. The lesson for sellers: the carve-outs protect against market movements and earnings misses, but they don't insulate a company from fundamental, undisclosed structural problems. The lesson for buyers: MAE is still a near-impossible standard to meet without evidence of active concealment and lasting business impairment.", concepts: ["MAE"], tags: ["MAE", "Akorn", "Delaware"] },
];

const LEVELS = {
  junior: { label: "Junior Associate", short: "Junior", color: "#1A5C35" },
  mid:    { label: "Mid Associate",    short: "Mid",    color: "#C8922A" },
  senior: { label: "Senior / Counsel", short: "Senior", color: "#6B3A00" },
};

const EXPLAINER_CONTENT = {
  junior: {
    heading: "What Is This Section?",
    paras: [
      "The opening article of every merger agreement tells you three things: the transaction type, the parties, and what happens to each entity at closing. In Twitter/X Holdings, Section 2.1 gives you all three in one sentence.",
      "This is a forward triangular merger — Acquisition Sub (X Holdings II) merges into Twitter, Acquisition Sub disappears, and Twitter survives as the Surviving Corporation under Musk's ownership. This structure is the default for public deals because it keeps the target's legal existence intact, preserving its contracts, licenses, and regulatory registrations.",
      "Your first job on any deal: build a change-of-control matrix across every material contract. In a forward triangular, many CoC definitions only trigger if the target stops being the surviving entity. Because Twitter survived here, many of those provisions simply didn't fire — but you have to verify each one. Don't assume.",
    ],
    tasks: ["Identify the merger structure and confirm which entity survives", "Build a complete change-of-control matrix across all material contracts", "Flag contracts where CoC triggers regardless of which entity survives"],
  },
  mid: {
    heading: "Structure Choice & The Stockholder Vote",
    paras: [
      "Unlike most high-profile public deals, Twitter/X Holdings did not use Section 251(h) — there was no front-end tender offer. This was a long-form merger requiring a full stockholder vote. The proxy statement was filed, the special meeting was scheduled, and 98.6% of votes cast approved on September 13, 2022.",
      "Why no 251(h)? Musk's financing structure — equity commitment letter, margin loan on Tesla shares, debt commitments from Morgan Stanley and others — made clean tender offer mechanics difficult on the compressed timeline he initially wanted. The long-form structure was fine because the only remaining condition at the time of the vote was already satisfied.",
      "The more interesting structural issue: Musk signed personally as 'Equity Investor' solely with respect to the Specified Provisions — Sections 5.4, 6.3, 6.8, 6.10, 6.11, 6.12, and 9.9. This made him personally liable on specific performance and the efforts covenant. Always check which provisions an individual is actually bound by.",
    ],
    tasks: ["Understand why 251(h) was not used and the proxy mechanics that followed", "Map which provisions Musk was personally bound by as Equity Investor", "Analyze the financing structure and its interaction with closing conditions"],
  },
  senior: {
    heading: "Structure, Liability & Closing Risk",
    paras: [
      "The Twitter deal is the defining specific performance case of the modern era. Twitter negotiated bilateral specific performance — both sides could enforce the obligation to close. When Musk sent his termination letter on July 8, 2022, Twitter filed suit four days later in Delaware Chancery for specific performance under Section 9.9.",
      "Musk's leverage was the financing risk and the Company Material Adverse Effect argument. He argued Twitter had materially breached Section 6.4 by withholding bot/spam data, triggering the MAE definition. Twitter's counter: the nine MAE carve-outs — particularly the exclusions for stock price declines and missed projections — made his argument untenable. Chancery's expedited schedule removed Musk's ability to delay. He closed October 27.",
      "The senior-level lesson: structure and remedies are inseparable. The reason Twitter could force Musk to close was that counsel negotiated bilateral specific performance with no financing-out. In PE-backed deals, that protection is routinely diluted. Advising on structure without advising on remedies architecture is incomplete client work.",
    ],
    tasks: ["Advise on specific performance rights and the conditions for exercise", "Analyze MAE carve-outs in the context of a buyer's walk attempt", "Counsel on the relationship between financing structure and closing certainty"],
  },
};

const CLAUSE_TEXT = `ARTICLE II — THE MERGER

Section 2.1  The Merger. Upon the terms and subject to the conditions of this Agreement, and in accordance with the DGCL, at the Effective Time, Acquisition Sub shall be merged with and into the Company, whereupon the separate existence of Acquisition Sub shall cease, and the Company shall continue under the name "Twitter, Inc." as the surviving corporation (the "Surviving Corporation") and shall continue to be governed by the laws of the State of Delaware.

Section 2.2  The Closing. Subject to the provisions of Article VII, the closing of the Merger (the "Closing") shall take place at 9:00 a.m. (Pacific Time) on a date to be specified by the parties hereto, but no later than the second (2nd) Business Day after the satisfaction or waiver of all of the conditions set forth in Article VII (other than those conditions that by their terms are to be satisfied at the Closing, but subject to the satisfaction or waiver of such conditions at the Closing).

Section 2.3  Effective Time. Concurrently with the Closing, the Company, Parent and Acquisition Sub shall cause a certificate of merger with respect to the Merger (the "Certificate of Merger") to be executed and filed with the Secretary of State of the State of Delaware in accordance with the relevant provisions of the DGCL and any other applicable Law of the State of Delaware.`;

const CLAUSE_ANNOTATIONS = {
  junior: [
    { phrase: "Acquisition Sub shall be merged with and into the Company", note: "Forward triangular — Acquisition Sub merges into Twitter, not the other way around. Twitter survives. Critical for your CoC analysis: most change-of-control provisions trigger only when the target does NOT survive. Run every material contract through this filter before flagging it for consent." },
    { phrase: `the Company shall continue under the name "Twitter, Inc."`, note: "Twitter keeps its legal name at closing. Most acquirers rename the surviving entity immediately or soon after. Musk renamed it X Corp. post-closing through a separate certificate amendment — not through the merger agreement itself." },
  ],
  mid: [
    { phrase: "Subject to the provisions of Article VII", note: "Cross-reference to Article VII (conditions to closing). On the Twitter deal, the only unsatisfied condition at the time of the stockholder vote was technically already cleared. The real uncertainty was whether Musk would perform — not whether conditions would be satisfied." },
    { phrase: "no later than the second (2nd) Business Day after the satisfaction or waiver of all of the conditions", note: "T+2 closing mechanics. If conditions are satisfied, the parties must close within 2 Business Days or the other side has a breach claim. Twitter used this language to argue that once all conditions were met, Musk had an immediate obligation to close — not discretion." },
  ],
  senior: [
    { phrase: `shall continue under the name "Twitter, Inc." as the surviving corporation`, note: "Structurally necessary to preserve Twitter's debt indentures, advertising contracts, and regulatory registrations. Musk's $13B bank debt commitment from Morgan Stanley et al. was structured around Twitter's existing credit profile and required Twitter's legal continuity. A reverse triangular would have created consent and assumption problems the banks wouldn't have accepted." },
    { phrase: "shall continue to be governed by the laws of the State of Delaware", note: "Delaware governing law. The litigation when Musk tried to walk was filed in the Delaware Court of Chancery under Section 9.10. Chancellor McCormick's sophistication and willingness to expedite proceedings is precisely why Delaware incorporation matters for remedies — she set a trial date that gave Musk nowhere to hide." },
  ],
};

const NEGOTIATION_POINTS = [
  {
    title: "Merger Structure: Forward vs. Reverse Triangular",
    buyer: {
      label: "Buyer",
      text: "Buyer typically prefers forward triangular (Acquisition Sub merges into target) because (1) target's contracts are preserved without consent requirements, (2) Acquisition Sub shields Parent from target's pre-closing liabilities, and (3) the structure is cleaner for debt financing — lenders can underwrite against the target entity directly.",
      points: ["Shields Parent from target's pre-closing unknown liabilities", "Target's contracts, licenses, and regulatory authorizations transfer without consent", "Debt underwritten against target's existing credit profile — cleaner for banks"],
    },
    seller: {
      label: "Seller",
      text: "Seller's interests are largely aligned with forward triangular — the target survives, preserving its corporate identity and employment agreements. The negotiation is less about structure and more about ensuring that survival of the entity doesn't permit the buyer to extract value by causing the target to incur new liabilities pre-closing through the consent mechanism.",
      points: ["Target survival preserves employee agreements and incentive plans", "Forward structure limits ambiguity about which entity bears post-closing obligations", "Seller should verify that 'surviving corporation' governance post-closing is specified"],
    },
  },
  {
    title: "Closing Mechanics: T+2 vs. Longer",
    buyer: {
      label: "Buyer",
      text: "Buyers push for longer post-condition closing periods (T+5, T+7) to allow time to line up funding draws, board approvals, and operational readiness. A T+2 obligation — as in the Twitter agreement — can create operational pressure and was precisely the provision Twitter used to argue Musk was immediately in breach once conditions were satisfied.",
      points: ["Longer closing period gives operational flexibility to coordinate funding and systems", "Protects against last-minute administrative failures creating breach exposure", "Particularly important in leveraged buyouts where bank draws require lead time"],
    },
    seller: {
      label: "Seller",
      text: "Sellers want the shortest possible closing period once conditions are satisfied. The Twitter T+2 structure is seller-favorable. The longer the gap between condition satisfaction and required closing, the more time for a buyer to manufacture a dispute or seek a walk. A T+2 closing obligation combined with bilateral specific performance is a powerful combination.",
      points: ["T+2 minimizes exposure window between condition satisfaction and closing", "Short closing obligation combined with bilateral specific performance — as in Twitter — is very seller-favorable", "Removes buyer's practical ability to delay while retaining nominal deal commitment"],
    },
  },
  {
    title: "Personal Liability: Equity Investor Provisions",
    buyer: {
      label: "Buyer / Sponsor",
      text: "Individual buyers and sponsors universally resist personal liability. Standard position: the acquisition entity (Parent) is solely liable; the individual or fund is at most liable for the termination fee via a limited guarantee capped at the RTF amount. Exposure beyond the RTF — e.g., specific performance claims against an individual — is vigorously resisted.",
      points: ["Resist personal liability beyond Limited Guarantee for termination fee", "Insist Equity Investor designation be limited to financing and coordination provisions", "Avoid binding the individual to effort covenants (§ 6.3) and specific performance (§ 9.9) where possible"],
    },
    seller: {
      label: "Seller",
      text: "Seller pushes for individual liability where the buyer is a natural person or where the acquisition entity is a newly-formed shell with no assets. In Twitter, Wilson Sonsini / Simpson Thacher secured Musk's personal binding to Section 9.9 (specific performance), making him individually subject to Chancery's enforcement jurisdiction. This was the critical structural protection.",
      points: ["Bind the individual to specific performance provision — not just the RTF guarantee", "Secure personal binding to efforts covenant (§ 6.3) to prevent constructive termination", "In all-equity deals with individual buyers, personal Equity Investor designation is non-negotiable"],
    },
  },
  {
    title: "Specific Performance: Bilateral vs. RTF Sole Remedy",
    buyer: {
      label: "Buyer",
      text: "Buyers — especially PE sponsors — push hard to make the Reverse Termination Fee the seller's sole remedy. This caps the buyer's downside at the RTF amount regardless of breach. Standard formulation: 'Receipt of the Parent Termination Fee shall be the Company's sole and exclusive remedy.' This eliminates the seller's right to force closing.",
      points: ["RTF as sole remedy caps downside regardless of nature of breach", "Standard in PE-backed leveraged buyouts where financing risk is real", "Prevents seller from using specific performance as leverage during deal deterioration"],
    },
    seller: {
      label: "Seller",
      text: "In the Twitter agreement, seller secured bilateral specific performance — both parties can enforce closing. This is the gold standard for sellers. Twitter's counsel refused to accept RTF as sole remedy because Musk was a strategic buyer with committed equity. Section 9.9 was ultimately what forced Musk to close rather than pay $1B and walk.",
      points: ["Bilateral specific performance is achievable when buyer has committed equity and no financing condition", "Without specific performance, a financially sophisticated buyer can treat the RTF as a cheap option to exit", "Always link specific performance right to the individual (Equity Investor) where applicable — otherwise recourse is only against a shell entity"],
    },
  },
];

const PROVISION_CASES = ["twitter_musk", "ncs"];

const TABS = [
  { id: "explainer",   label: "Explainer" },
  { id: "clause",      label: "Annotated Clause" },
  { id: "negotiation", label: "Negotiation Points" },
  { id: "qa",          label: "Q&A" },
  { id: "stories",     label: "War Stories" },
  { id: "cases",       label: "Cases" },
  { id: "edgar",       label: "Precedent Bank" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function DefinedTerm({ termKey, onExpand }) {
  const def = DEFINED_TERMS[termKey];
  if (!def) return <span>{termKey}</span>;
  return (
    <span
      onClick={() => onExpand(termKey)}
      style={{ color: C.accent, borderBottom: `1px solid ${C.accentDim}`, cursor: "pointer" }}
    >
      {termKey}
    </span>
  );
}

function TermPanel({ termKey, onClose }) {
  const def = DEFINED_TERMS[termKey];
  if (!def) return null;
  const relatedCases = (def.related_cases || []).map(id => CASES[id]).filter(Boolean);
  const appearsIn = (def.appears_in || []).map(id => PROVISIONS.find(p => p.id === id)).filter(Boolean);
  const panelWidth = typeof window !== "undefined" ? Math.min(440, window.innerWidth) : 440;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", justifyContent: "flex-end" }}>
      <div style={{ flex: 1, background: "rgba(0,0,0,0.35)" }} onClick={onClose} />
      <div style={{ width: panelWidth, background: C.white, boxShadow: "-8px 0 40px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ background: C.ink, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 9, fontFamily: F.mono, letterSpacing: 1.8, color: C.accentDim, marginBottom: 6, textTransform: "uppercase" }}>Defined Term</div>
            <div style={{ fontFamily: F.corpus, fontSize: 22, fontWeight: 600, color: C.white, letterSpacing: 0.5, lineHeight: 1.2 }}>{def.term}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#999", fontSize: 20, cursor: "pointer", paddingTop: 2 }}>✕</button>
        </div>
        <div style={{ padding: "24px 24px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <div style={{ fontSize: 9, fontFamily: F.mono, letterSpacing: 1.5, color: C.inkFaint, textTransform: "uppercase", marginBottom: 10 }}>Definition</div>
            <p style={{ fontFamily: F.body, fontSize: 14, lineHeight: 1.85, color: C.inkMid }}>{def.long}</p>
          </div>
          {appearsIn.length > 0 && (
            <div>
              <div style={{ fontSize: 9, fontFamily: F.mono, letterSpacing: 1.5, color: C.inkFaint, textTransform: "uppercase", marginBottom: 10 }}>Appears In</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {appearsIn.map(p => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: C.bg, borderRadius: 6, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 10, fontFamily: F.mono, color: C.inkFaint, width: 20, textAlign: "center" }}>{p.number}</span>
                    <span style={{ fontSize: 13, fontFamily: F.ui, color: C.inkMid }}>{p.title}</span>
                    <span style={{ fontSize: 10, fontFamily: F.mono, color: C.inkFaint, marginLeft: "auto" }}>{p.sections}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {relatedCases.length > 0 && (
            <div>
              <div style={{ fontSize: 9, fontFamily: F.mono, letterSpacing: 1.5, color: C.inkFaint, textTransform: "uppercase", marginBottom: 10 }}>Related Cases</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {relatedCases.map(c => (
                  <div key={c.id} style={{ padding: "12px 14px", background: C.caseBg, border: `1px solid ${C.caseBorder}`, borderRadius: 8 }}>
                    <div style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 600, color: C.caseText, marginBottom: 2 }}>{c.name}</div>
                    <div style={{ fontFamily: F.mono, fontSize: 10, color: C.inkFaint, marginBottom: 6 }}>{c.court} {c.year}</div>
                    <div style={{ fontFamily: F.ui, fontSize: 12, color: C.inkMid, lineHeight: 1.6 }}>{c.summary.slice(0, 180)}…</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InjectTerms({ text, onExpand }) {
  if (!text || typeof text !== "string") return text;
  let parts = [text];
  for (const termKey of Object.keys(DEFINED_TERMS)) {
    const next = [];
    for (const part of parts) {
      if (typeof part !== "string" || !part.includes(termKey)) { next.push(part); continue; }
      const idx = part.indexOf(termKey);
      next.push(part.slice(0, idx));
      next.push(<DefinedTerm key={`${termKey}-${idx}-${Math.random()}`} termKey={termKey} onExpand={onExpand} />);
      next.push(part.slice(idx + termKey.length));
    }
    parts = next;
  }
  return <>{parts}</>;
}

function ExplainerTab({ level, onExpand }) {
  const data = EXPLAINER_CONTENT[level];
  const lc = LEVELS[level].color;
  return (
    <div>
      <h3 style={{ fontFamily: F.display, fontSize: 24, color: C.ink, marginBottom: 18, fontWeight: 700 }}>{data.heading}</h3>
      {data.paras.map((p, i) => (
        <p key={i} style={{ fontFamily: F.body, fontSize: 15, lineHeight: 1.9, color: C.inkMid, marginBottom: 16 }}>
          <InjectTerms text={p} onExpand={onExpand} />
        </p>
      ))}
      <div style={{ marginTop: 24, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "18px 22px" }}>
        <div style={{ fontSize: 9, fontFamily: F.mono, letterSpacing: 1.8, color: lc, marginBottom: 12, textTransform: "uppercase" }}>Your Tasks at This Level</div>
        {data.tasks.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "flex-start" }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", border: `1.5px solid ${lc}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
              <span style={{ fontSize: 9, color: lc, fontFamily: F.mono }}>{i + 1}</span>
            </div>
            <span style={{ fontSize: 14, fontFamily: F.ui, color: C.inkMid, lineHeight: 1.55 }}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClauseTab({ level, onExpand }) {
  const [expanded, setExpanded] = useState({});
  const lc = LEVELS[level].color;
  const anns = CLAUSE_ANNOTATIONS[level];

  const render = () => {
    let parts = [CLAUSE_TEXT];
    anns.forEach((ann, i) => {
      const next = [];
      for (const part of parts) {
        if (typeof part !== "string") { next.push(part); continue; }
        const idx = part.indexOf(ann.phrase);
        if (idx === -1) { next.push(part); continue; }
        next.push(part.slice(0, idx));
        next.push(
          <span key={i}>
            <span onClick={() => setExpanded(p => ({ ...p, [i]: !p[i] }))} style={{ background: expanded[i] ? `${lc}18` : `${lc}0A`, borderBottom: `2px solid ${lc}`, cursor: "pointer", borderRadius: "2px 2px 0 0", transition: "background 0.15s", padding: "1px 0" }}>
              {ann.phrase}
              <span style={{ fontSize: 9, color: lc, marginLeft: 3, fontFamily: F.mono }}>{expanded[i] ? "▲" : "▼"}</span>
            </span>
            {expanded[i] && (
              <div style={{ display: "block", margin: "10px 0", background: C.white, border: `1px solid ${lc}40`, borderLeft: `3px solid ${lc}`, borderRadius: "0 6px 6px 0", padding: "12px 16px", fontSize: 13, fontFamily: F.ui, color: C.inkMid, lineHeight: 1.7 }}>
                <div style={{ fontSize: 9, letterSpacing: 1.5, color: lc, marginBottom: 6, textTransform: "uppercase", fontFamily: F.mono }}>{LEVELS[level].short} Note</div>
                {ann.note}
              </div>
            )}
          </span>
        );
        next.push(part.slice(idx + ann.phrase.length));
      }
      parts = next;
    });
    const withTerms = [];
    for (const part of parts) {
      if (typeof part !== "string") { withTerms.push(part); continue; }
      withTerms.push(<InjectTerms key={Math.random()} text={part} onExpand={onExpand} />);
    }
    return withTerms;
  };

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 14, padding: "8px 14px", background: C.bg, borderRadius: 6, border: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 10, fontFamily: F.mono, color: C.inkLight, letterSpacing: 1 }}>SOURCE</span>
        <span style={{ fontSize: 12, fontFamily: F.ui, color: C.inkMid }}>Twitter / X Holdings Merger Agreement, §§ 2.1–2.3 (Apr. 25, 2022) — SEC EDGAR Ex. 2.1</span>
        <span style={{ fontSize: 10, fontFamily: F.mono, color: C.inkFaint }}>Tap underlined text for annotations · Gold terms are defined — click to explore</span>
      </div>
      <div style={{ fontFamily: F.body, fontSize: 14, lineHeight: 2.05, color: C.inkMid, background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "28px 32px", whiteSpace: "pre-wrap" }}>
        {render()}
      </div>
    </div>
  );
}

function NegotiationTab({ onExpand }) {
  const [selected, setSelected] = useState(0);
  const pt = NEGOTIATION_POINTS[selected];
  const mobile = useMobile();
  return (
    <div>
      <p style={{ fontFamily: F.ui, fontSize: 13, color: C.inkLight, marginBottom: 20, lineHeight: 1.6 }}>
        Negotiation points specific to structure &amp; mechanics provisions. Each point shows how buyer and seller interests diverge and what market practice looks like.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
        {NEGOTIATION_POINTS.map((p, i) => (
          <button key={i} onClick={() => setSelected(i)} style={{ padding: "10px 16px", textAlign: "left", border: `1px solid ${selected === i ? C.ink : C.border}`, borderRadius: 8, background: selected === i ? C.ink : C.white, color: selected === i ? C.white : C.inkMid, fontSize: 13, fontFamily: F.ui, fontWeight: selected === i ? 600 : 400, cursor: "pointer", transition: "all 0.15s" }}>
            {p.title}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 16 }}>
        {["buyer", "seller"].map(side => {
          const d = pt[side];
          const color = side === "buyer" ? C.buyer : C.seller;
          const bg = side === "buyer" ? C.buyerBg : C.sellerBg;
          const border = side === "buyer" ? C.buyerBorder : C.sellerBorder;
          return (
            <div key={side} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ background: color, padding: "10px 18px" }}>
                <span style={{ fontSize: 10, fontFamily: F.mono, letterSpacing: 1.5, color: "#FFF", textTransform: "uppercase" }}>{d.label} Position</span>
              </div>
              <div style={{ padding: "18px 20px 14px" }}>
                <p style={{ fontFamily: F.body, fontSize: 13, lineHeight: 1.9, color: C.inkMid, margin: 0, marginBottom: 16, borderBottom: `1px solid ${border}`, paddingBottom: 16 }}>
                  <InjectTerms text={d.text} onExpand={onExpand} />
                </p>
                <div style={{ fontSize: 9, fontFamily: F.mono, letterSpacing: 1.5, color, textTransform: "uppercase", marginBottom: 10 }}>Key Points</div>
                {d.points.map((n, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <span style={{ fontSize: 9, color: "#FFF", fontFamily: F.mono }}>{i + 1}</span>
                    </div>
                    <span style={{ fontSize: 13, fontFamily: F.ui, color: C.inkMid, lineHeight: 1.6 }}>{n}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QATab({ level, onExpand }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState({});
  const lc = LEVELS[level].color;
  const items = QA_DATABASE
    .filter(q => q.provision_id === "structure" && q.level === level)
    .filter(q => !search || q.question.toLowerCase().includes(search.toLowerCase()) || q.answer.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions…"
          style={{ flex: 1, minWidth: 200, padding: "10px 14px", fontSize: 14, fontFamily: F.ui, border: `1px solid ${C.border}`, borderRadius: 8, background: C.bg, color: C.ink, outline: "none", boxSizing: "border-box" }}
        />
        <span style={{ fontSize: 11, fontFamily: F.mono, color: C.inkFaint, whiteSpace: "nowrap" }}>Q&amp;A is searchable across all provisions →</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item, i) => (
          <div key={item.id} style={{ border: `1px solid ${open[i] ? lc + "60" : C.border}`, borderRadius: 10, overflow: "hidden", background: C.white, transition: "border-color 0.15s" }}>
            <button onClick={() => setOpen(p => ({ ...p, [i]: !p[i] }))} style={{ width: "100%", background: "none", border: "none", padding: "15px 20px", textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: F.ui, fontSize: 14, color: C.ink, fontWeight: 500, lineHeight: 1.4 }}>{item.question}</span>
              <span style={{ fontSize: 18, color: lc, flexShrink: 0, fontWeight: 300 }}>{open[i] ? "−" : "+"}</span>
            </button>
            {open[i] && (
              <div style={{ padding: "0 20px 16px", borderTop: `1px solid ${C.border}`, paddingTop: 14, fontFamily: F.body, fontSize: 14, color: C.inkMid, lineHeight: 1.85 }}>
                <InjectTerms text={item.answer} onExpand={onExpand} />
                {item.tags && (
                  <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                    {item.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 10, fontFamily: F.mono, color: C.inkFaint, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: "2px 7px" }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function WarStoriesTab({ level }) {
  const lc = LEVELS[level].color;
  const stories = WAR_STORIES_DATABASE.filter(s => s.provision_id === "structure" && s.level === level);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {stories.map(s => (
        <div key={s.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderLeft: `3px solid ${lc}`, borderRadius: "0 12px 12px 0", padding: "24px 28px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
            <span style={{ fontFamily: F.corpus, fontSize: 19, color: C.ink, fontWeight: 600, letterSpacing: 0.5 }}>{s.title}</span>
            <span style={{ fontSize: 11, fontFamily: F.mono, color: C.inkFaint }}>{s.deal}</span>
          </div>
          <p style={{ fontFamily: F.body, fontSize: 14, color: C.inkMid, lineHeight: 1.9, margin: 0 }}>{s.story}</p>
          {s.tags && (
            <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
              {s.tags.map(tag => (
                <span key={tag} style={{ fontSize: 10, fontFamily: F.mono, color: C.inkFaint, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: "2px 7px" }}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CasesTab({ onExpand }) {
  const cases = PROVISION_CASES.map(id => CASES[id]).filter(Boolean);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ fontFamily: F.ui, fontSize: 13, color: C.inkLight, lineHeight: 1.6 }}>Key cases relevant to structure &amp; mechanics provisions. Linked throughout content — click any case name to see full analysis.</p>
      {cases.map(c => (
        <div key={c.id} style={{ background: C.caseBg, border: `1px solid ${C.caseBorder}`, borderRadius: 12, padding: "22px 26px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontFamily: F.corpus, fontSize: 20, fontWeight: 600, color: C.caseText, letterSpacing: 0.3, marginBottom: 3 }}>{c.name}</div>
              <div style={{ fontFamily: F.mono, fontSize: 10, color: C.inkFaint, letterSpacing: 0.5 }}>{c.court} · {c.year} · {c.cite}</div>
            </div>
          </div>
          <p style={{ fontFamily: F.body, fontSize: 14, color: C.inkMid, lineHeight: 1.85, marginBottom: 14 }}>{c.summary}</p>
          <div style={{ fontSize: 9, fontFamily: F.mono, letterSpacing: 1.5, color: C.caseText, textTransform: "uppercase", marginBottom: 8 }}>Key Holdings</div>
          {c.holdings.map((h, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: C.caseText, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                <span style={{ fontSize: 9, color: "#FFF", fontFamily: F.mono }}>{i + 1}</span>
              </div>
              <span style={{ fontSize: 13, fontFamily: F.ui, color: C.inkMid, lineHeight: 1.6 }}>{h}</span>
            </div>
          ))}
          {c.terms.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, fontFamily: F.mono, color: C.inkFaint }}>Defined terms:</span>
              {c.terms.map(t => DEFINED_TERMS[t] ? (
                <span key={t} onClick={() => onExpand(t)} style={{ fontSize: 10, fontFamily: F.mono, color: C.accent, borderBottom: `1px solid ${C.accentDim}`, cursor: "pointer" }}>{t}</span>
              ) : null)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function EDGARTab() {
  const [query, setQuery] = useState("");
  const [form, setForm] = useState("S-4");
  const [dateFrom, setDateFrom] = useState("2020-01-01");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const PRESETS = [
    { label: "Specific Performance", query: "specific performance consummate merger" },
    { label: "MAE Carve-outs", query: "material adverse effect carve-out pandemic" },
    { label: "Reverse Break Fee", query: "parent termination fee reverse breakup" },
    { label: "Ordinary Course", query: "ordinary course of business consent pending merger" },
    { label: "Limited Guarantee", query: "limited guarantee equity investor termination fee" },
  ];
  const search = async (q = query) => {
    if (!q.trim()) return;
    setLoading(true); setError(null); setResults(null);
    try {
      const params = new URLSearchParams({ q: `"${q}"`, forms: form, dateRange: "custom", startdt: dateFrom, enddt: "2025-12-31" });
      const res = await fetch(`https://efts.sec.gov/LATEST/search-index?${params}`);
      if (!res.ok) throw new Error(`EDGAR returned ${res.status}`);
      setResults(await res.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  const hits = results?.hits?.hits || [];
  const total = results?.hits?.total?.value;
  return (
    <div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} placeholder='e.g. "specific performance consummate merger"'
            style={{ flex: 1, minWidth: 200, padding: "10px 14px", fontSize: 14, fontFamily: F.ui, border: `1px solid ${C.border}`, borderRadius: 8, color: C.ink, outline: "none", background: C.bg, boxSizing: "border-box" }}
          />
          <select value={form} onChange={e => setForm(e.target.value)} style={{ padding: "10px 12px", fontSize: 13, fontFamily: F.ui, border: `1px solid ${C.border}`, borderRadius: 8, color: C.inkMid, background: C.white }}>
            <option value="S-4">S-4</option><option value="8-K">8-K</option><option value="SC+TO-T">SC TO-T</option><option value="S-4,8-K">S-4 + 8-K</option>
          </select>
          <select value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: "10px 12px", fontSize: 13, fontFamily: F.ui, border: `1px solid ${C.border}`, borderRadius: 8, color: C.inkMid, background: C.white }}>
            <option value="2022-01-01">2022+</option><option value="2020-01-01">2020+</option><option value="2018-01-01">2018+</option>
          </select>
          <button onClick={() => search()} disabled={loading} style={{ padding: "10px 22px", background: C.ink, color: C.white, border: "none", borderRadius: 8, fontSize: 14, fontFamily: F.ui, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, whiteSpace: "nowrap" }}>
            {loading ? "Searching…" : "Search EDGAR"}
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <span style={{ fontSize: 11, fontFamily: F.mono, color: C.inkFaint, marginRight: 4, lineHeight: 2 }}>Quick:</span>
          {PRESETS.map(p => (
            <button key={p.label} onClick={() => { setQuery(p.query); search(p.query); }} style={{ padding: "5px 12px", fontSize: 12, fontFamily: F.ui, border: `1px solid ${C.border}`, borderRadius: 20, background: C.bg, color: C.inkMid, cursor: "pointer" }}>{p.label}</button>
          ))}
        </div>
      </div>
      {error && <div style={{ background: C.sellerBg, border: `1px solid ${C.sellerBorder}`, borderRadius: 8, padding: "14px 18px", fontFamily: F.ui, fontSize: 14, color: C.seller }}>{error}. EDGAR may be rate-limited — try again shortly.</div>}
      {results && !error && (
        <div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontFamily: F.ui, color: C.inkLight }}>{total != null ? `${total.toLocaleString()} filings matched` : "Results"}</span>
            <span style={{ marginLeft: "auto", fontSize: 10, fontFamily: F.mono, color: C.inkFaint }}>SOURCE: SEC EDGAR</span>
          </div>
          {hits.length === 0 ? (
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 32, textAlign: "center", fontFamily: F.ui, fontSize: 14, color: C.inkLight }}>No results. Try broadening search terms or date range.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {hits.map((hit, i) => {
                const src = hit._source || {};
                const entity = src.display_names?.[0]?.name || src.entity_name || "Unknown";
                const date = src.file_date || "";
                const formType = src.form_type || "";
                const url = `https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent('"' + query + '"')}&forms=${form}&dateRange=custom&startdt=${dateFrom}&enddt=2025-12-31`;
                return (
                  <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 44, height: 36, borderRadius: 6, background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 9, fontFamily: F.mono, color: C.inkLight, textAlign: "center" }}>{formType}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entity}</div>
                      <div style={{ fontFamily: F.ui, fontSize: 12, color: C.inkLight }}>{formType} · {date}</div>
                    </div>
                    <a href={url} target="_blank" rel="noopener noreferrer" style={{ padding: "7px 14px", fontSize: 12, fontFamily: F.ui, fontWeight: 500, border: `1px solid ${C.border}`, borderRadius: 6, color: C.inkMid, textDecoration: "none", flexShrink: 0 }}>View →</a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {!results && !loading && !error && (
        <div style={{ background: C.white, border: `1px dashed ${C.border}`, borderRadius: 12, padding: "48px 32px", textAlign: "center" }}>
          <div style={{ fontFamily: F.corpus, fontSize: 28, fontWeight: 300, color: C.ink, marginBottom: 12, letterSpacing: 4, textTransform: "uppercase" }}>Search 10,000+ M&amp;A Filings.</div>
          <p style={{ fontFamily: F.ui, fontSize: 14, color: C.inkLight, maxWidth: 400, margin: "0 auto" }}>Live SEC EDGAR search. Find clause language across S-4 merger proxies, tender offer docs, and 8-K deal announcements.</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// APP SHELL
// ═══════════════════════════════════════════════════════════════════════════════

export default function CorpusApp() {
  const [level, setLevel] = useState("junior");
  const [tab, setTab] = useState("explainer");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTerm, setActiveTerm] = useState(null);
  const mobile = useMobile();
  const lc = LEVELS[level].color;
  const px = mobile ? 16 : 40;
  const provision = PROVISIONS[0];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.ink, fontFamily: F.ui }}>
      {activeTerm && <TermPanel termKey={activeTerm} onClose={() => setActiveTerm(null)} />}

      <div style={{ height: 3, background: C.accent }} />

      <header style={{ background: C.white, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: `0 ${px}px`, height: 54, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {mobile
            ? <button onClick={() => setMenuOpen(o => !o)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 10px", fontSize: 13, fontFamily: F.ui, color: C.inkMid }}>☰ Menu</button>
            : <nav style={{ display: "flex", gap: 24 }}>{["Curriculum", "Precedents", "Account"].map(n => <span key={n} style={{ fontSize: 12, fontFamily: F.ui, color: C.inkLight, cursor: "pointer" }}>{n}</span>)}</nav>
          }
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ fontFamily: F.corpus, fontSize: mobile ? 18 : 22, fontWeight: 300, color: C.ink, letterSpacing: mobile ? 4 : 5, textTransform: "uppercase" }}>CORPUS</span>
            <span style={{ fontFamily: F.corpus, fontSize: mobile ? 18 : 22, fontWeight: 300, color: C.accent }}>.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {!mobile && <span style={{ fontSize: 11, fontFamily: F.mono, color: C.inkFaint }}>Twitter / X Holdings · 2022</span>}
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 11, color: C.white, fontWeight: 700 }}>B</span>
            </div>
          </div>
        </div>
      </header>

      {mobile && menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex" }}>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.4)" }} onClick={() => setMenuOpen(false)} />
          <div style={{ width: 280, background: C.white, borderLeft: `1px solid ${C.border}`, padding: "24px 20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: 1.8, color: C.inkFaint, textTransform: "uppercase" }}>Navigation</span>
              <button onClick={() => setMenuOpen(false)} style={{ background: "none", border: "none", fontSize: 18, color: C.inkLight }}>✕</button>
            </div>
            <div>
              <div style={{ fontSize: 9, fontFamily: F.mono, letterSpacing: 1.8, color: C.inkFaint, marginBottom: 10, textTransform: "uppercase" }}>Level</div>
              {Object.entries(LEVELS).map(([key, val]) => (
                <button key={key} onClick={() => { setLevel(key); setMenuOpen(false); }} style={{ width: "100%", padding: "9px 14px", textAlign: "left", border: `1px solid ${level === key ? val.color : C.border}`, borderRadius: 8, background: level === key ? val.color : C.white, color: level === key ? C.white : C.inkMid, fontSize: 14, fontFamily: F.ui, marginBottom: 6 }}>{val.label}</button>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 9, fontFamily: F.mono, letterSpacing: 1.8, color: C.inkFaint, marginBottom: 10, textTransform: "uppercase" }}>Provisions</div>
              {PROVISIONS.map((p, i) => (
                <div key={p.id} style={{ padding: "7px 10px", borderRadius: 6, marginBottom: 2, fontSize: 12, fontFamily: F.ui, color: i === 0 ? C.ink : C.inkFaint, fontWeight: i === 0 ? 600 : 400, background: i === 0 ? C.border : "transparent", display: "flex", gap: 7, alignItems: "center" }}>
                  {i === 0 && <div style={{ width: 4, height: 4, borderRadius: "50%", background: lc }} />}
                  {p.number}. {p.title}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: `0 ${px}px` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", height: 36, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", overflowX: "auto" }}>
          {["The Merger Agreement", `Provision ${provision.number}`, provision.title].map((t, i, a) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, fontFamily: F.ui, color: i < a.length - 1 ? C.inkFaint : C.inkMid }}>{t}</span>
              {i < a.length - 1 && <span style={{ color: C.borderDark }}>›</span>}
            </span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: `24px ${px}px 48px`, display: "flex", gap: 40 }}>
        {!mobile && (
          <aside style={{ width: 200, flexShrink: 0 }}>
            <div style={{ fontSize: 9, fontFamily: F.mono, letterSpacing: 1.8, color: C.inkFaint, marginBottom: 10, textTransform: "uppercase" }}>Level</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 28 }}>
              {Object.entries(LEVELS).map(([key, val]) => (
                <button key={key} onClick={() => setLevel(key)} style={{ padding: "8px 14px", textAlign: "left", border: `1px solid ${level === key ? val.color : C.border}`, borderRadius: 8, background: level === key ? val.color : C.white, color: level === key ? C.white : C.inkMid, fontSize: 13, fontFamily: F.ui, fontWeight: level === key ? 600 : 400, transition: "all 0.15s" }}>{val.label}</button>
              ))}
            </div>
            <div style={{ fontSize: 9, fontFamily: F.mono, letterSpacing: 1.8, color: C.inkFaint, marginBottom: 10, textTransform: "uppercase" }}>Provisions</div>
            {PROVISIONS.map((p, i) => (
              <div key={p.id} style={{ padding: "7px 10px", borderRadius: 6, marginBottom: 2, fontSize: 12, fontFamily: F.ui, cursor: i === 0 ? "default" : "pointer", color: i === 0 ? C.ink : C.inkFaint, fontWeight: i === 0 ? 600 : 400, background: i === 0 ? C.border : "transparent", display: "flex", gap: 7, alignItems: "center" }}>
                {i === 0 && <div style={{ width: 4, height: 4, borderRadius: "50%", background: lc, flexShrink: 0 }} />}
                <span>{p.number}. {p.title}</span>
              </div>
            ))}
            <div style={{ marginTop: 24, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 9, fontFamily: F.mono, letterSpacing: 1.5, color: C.inkFaint, textTransform: "uppercase", marginBottom: 8 }}>Progress</div>
              <div style={{ height: 3, background: C.border, borderRadius: 2 }}>
                <div style={{ width: "9%", height: "100%", background: lc, borderRadius: 2 }} />
              </div>
              <div style={{ fontSize: 11, color: C.inkFaint, marginTop: 6, fontFamily: F.ui }}>1 of 11 complete</div>
            </div>
          </aside>
        )}

        <main style={{ flex: 1, minWidth: 0 }}>
          {mobile && (
            <div className="noscroll" style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto" }}>
              {Object.entries(LEVELS).map(([key, val]) => (
                <button key={key} onClick={() => setLevel(key)} style={{ padding: "7px 14px", flexShrink: 0, border: `1px solid ${level === key ? val.color : C.border}`, borderRadius: 20, background: level === key ? val.color : C.white, color: level === key ? C.white : C.inkMid, fontSize: 12, fontFamily: F.ui, fontWeight: level === key ? 600 : 400, whiteSpace: "nowrap" }}>{val.label}</button>
              ))}
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontFamily: F.mono, letterSpacing: 1.5, textTransform: "uppercase", color: lc, background: `${lc}14`, padding: "3px 9px", borderRadius: 4 }}>{LEVELS[level].label}</span>
              <span style={{ fontSize: 10, fontFamily: F.mono, color: C.inkFaint }}>PROVISION 01</span>
            </div>
            <h1 style={{ fontFamily: F.display, fontSize: mobile ? 26 : 38, fontWeight: 900, color: C.ink, letterSpacing: -0.8, lineHeight: 1.1, marginBottom: 8 }}>Structure &amp; Mechanics.</h1>
            <p style={{ fontFamily: F.ui, fontSize: 14, color: C.inkLight }}>
              {provision.deal} · {provision.deal_date} · {provision.sections} · Forward triangular · Bilateral specific performance · $44B
            </p>
          </div>

          <div className="noscroll" style={{ display: "flex", background: C.white, border: `1px solid ${C.border}`, borderRadius: "10px 10px 0 0", overflowX: "auto", overflowY: "hidden" }}>
            {TABS.map((t, i) => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ flexShrink: 0, padding: mobile ? "11px 12px" : "11px 6px", flex: mobile ? "none" : 1, background: tab === t.id ? C.ink : "transparent", color: tab === t.id ? C.white : C.inkLight, border: "none", borderRight: i < TABS.length - 1 ? `1px solid ${C.border}` : "none", fontSize: 12, fontFamily: F.ui, fontWeight: tab === t.id ? 600 : 400, transition: "all 0.15s", whiteSpace: "nowrap" }}>{t.label}</button>
            ))}
          </div>

          <div style={{ background: tab === "edgar" ? "transparent" : C.white, border: tab === "edgar" ? "none" : `1px solid ${C.border}`, borderTop: "none", borderRadius: "0 0 12px 12px", padding: tab === "edgar" ? "20px 0 0" : mobile ? 20 : 32 }}>
            {tab === "explainer"   && <ExplainerTab level={level} onExpand={setActiveTerm} />}
            {tab === "clause"      && <ClauseTab level={level} onExpand={setActiveTerm} />}
            {tab === "negotiation" && <NegotiationTab onExpand={setActiveTerm} />}
            {tab === "qa"          && <QATab level={level} onExpand={setActiveTerm} />}
            {tab === "stories"     && <WarStoriesTab level={level} />}
            {tab === "cases"       && <CasesTab onExpand={setActiveTerm} />}
            {tab === "edgar"       && <EDGARTab />}
          </div>
        </main>
      </div>
    </div>
  );
}

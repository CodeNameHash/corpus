// data/concepts.js
// Standalone concept objects — embeddable in any provision page, also routable as /concepts/[slug]

export const CONCEPTS = {

  // ─── MERGER STRUCTURES ──────────────────────────────────────────────────────

  'direct-merger': {
    id: 'direct-merger',
    slug: 'direct-merger',
    title: 'Direct Merger',
    category: 'merger-structures',
    provision_ids: ['structure'],
    summary: 'Target merges directly into acquirer. Acquirer survives. Target disappears.',
    definition: 'A direct merger (also called a "straight merger") is the simplest acquisition structure. Under DGCL § 251, Target merges directly into Acquirer, Acquirer survives as the legal entity, and Target ceases to exist. All of Target\'s assets, liabilities, contracts, and obligations transfer to Acquirer by operation of law.',
    mechanics: [
      'Acquirer and Target execute a merger agreement',
      'Target stockholders vote to approve (typically majority of outstanding shares)',
      'Acquirer stockholders may also need to vote if issuing >20% new shares',
      'Certificate of Merger filed with Delaware Secretary of State',
      'Target dissolves; Acquirer assumes all assets and liabilities',
      'Target stockholders receive merger consideration (cash, stock, or mix)',
    ],
    when_used: 'Rarely used in large public M&A today. Most common in: (1) acquisitions of small private companies where liability concerns are minimal; (2) internal reorganizations and subsidiary mergers; (3) transactions where the acquirer specifically wants Target\'s corporate existence to terminate and all contracts to transfer automatically.',
    advantages: [
      'Simplest structure — fewest moving parts and entities',
      'Assets transfer by operation of law — no individual assignment needed',
      'Lower transaction costs (no subsidiary formation)',
      'Clean result: only one surviving entity',
    ],
    disadvantages: [
      'Acquirer assumes all Target liabilities directly — no structural shield',
      'Target\'s contracts may contain change-of-control or anti-assignment provisions triggered by the merger',
      'If Target has contingent or undisclosed liabilities, Acquirer has no protection',
      'Acquirer stockholder vote more likely to be required',
      'Cannot be used for tax-free reorganizations in most cases',
    ],
    deal_relationship: 'Not used in the Twitter deal. Musk and his acquisition vehicles had significant concern about Twitter\'s contingent liabilities (including the then-pending § 1001 fraud investigation and advertiser disputes). A direct merger would have exposed the acquisition entity to those liabilities without any structural buffer. Instead, the parties used a reverse triangular merger with X Holdings II (a wholly-owned Musk subsidiary) merging into Twitter, leaving Twitter as the surviving corporation.',
    diagram: {
      type: 'direct',
      before: ['Acquirer', 'Target'],
      after: ['Acquirer (survives, absorbs Target)'],
      flow: 'Target → merges into → Acquirer',
    },
    related_concepts: ['forward-triangular-merger', 'reverse-triangular-merger'],
    related_cases: ['akorn'],
    sort_order: 1,
  },

  'forward-triangular-merger': {
    id: 'forward-triangular-merger',
    slug: 'forward-triangular-merger',
    title: 'Forward Triangular Merger',
    category: 'merger-structures',
    provision_ids: ['structure'],
    summary: 'Target merges into a newly-formed Acquirer subsidiary. Subsidiary survives. Target disappears.',
    definition: 'In a forward triangular merger, Acquirer forms a wholly-owned subsidiary ("Merger Sub") specifically for the transaction. Target merges into Merger Sub. Merger Sub survives. Target ceases to exist. Acquirer\'s liability exposure is limited to its investment in Merger Sub — Target\'s pre-closing liabilities are now in Merger Sub, one corporate layer removed from Acquirer.',
    mechanics: [
      'Acquirer forms a wholly-owned subsidiary (Merger Sub)',
      'Merger Sub and Target execute the merger agreement (Acquirer signs as parent guarantor)',
      'Target stockholders vote to approve',
      'Acquirer funds Merger Sub with the merger consideration',
      'Target merges into Merger Sub; Merger Sub survives',
      'Target dissolves; Merger Sub (now holding all former Target assets) is a subsidiary of Acquirer',
      'Target stockholders receive consideration; their shares are cancelled',
    ],
    when_used: 'Used when: (1) acquirer wants liability protection but also wants Target\'s licenses, contracts, and regulatory approvals to survive (they transfer to Merger Sub by operation of law); (2) the deal is structured as a taxable cash acquisition; (3) acquirer wants a clean subsidiary holding the acquired business. Common in strategic acquisitions of companies with significant regulatory approvals (e.g., FCC licenses, FDA approvals) that transfer automatically in a merger but would require assignment in an asset deal.',
    advantages: [
      'Acquirer gets one layer of liability protection (Target liabilities sit in Merger Sub)',
      'Contracts and licenses transfer by operation of law — no individual assignment required',
      'Cleaner than an asset acquisition for heavily-licensed or heavily-contracted businesses',
      'Target regulatory approvals (FDA, FCC, etc.) survive in Merger Sub',
    ],
    disadvantages: [
      'Target ceases to exist — its brand, charter, and corporate history end',
      'Change-of-control provisions in Target\'s contracts are still triggered',
      'Generally not available for tax-free reorganizations (unlike reverse triangular)',
      'If Merger Sub has pre-existing liabilities, those mix with Target\'s',
      'Acquirer\'s liability protection is only one layer — piercing risk remains',
    ],
    deal_relationship: 'Not used in the Twitter deal. A forward triangular merger would have caused Twitter (the entity) to disappear, which was undesirable for multiple reasons: (1) Twitter\'s brand and corporate identity were core to the deal\'s value; (2) Twitter had valuable FCC-adjacent and international regulatory relationships tied to the Twitter entity; (3) Musk\'s financing structure required Twitter to survive as an entity to bear the leveraged debt load post-closing. The reverse triangular structure — where Twitter survived — better served these objectives.',
    diagram: {
      type: 'forward-triangular',
      before: ['Acquirer', 'Merger Sub (new)', 'Target'],
      after: ['Acquirer', '└─ Merger Sub (survives, absorbs Target)'],
      flow: 'Target → merges into → Merger Sub',
    },
    related_concepts: ['direct-merger', 'reverse-triangular-merger'],
    related_cases: [],
    sort_order: 2,
  },

  'reverse-triangular-merger': {
    id: 'reverse-triangular-merger',
    slug: 'reverse-triangular-merger',
    title: 'Reverse Triangular Merger',
    category: 'merger-structures',
    provision_ids: ['structure'],
    summary: 'Acquirer\'s subsidiary merges into Target. Target survives. Subsidiary disappears.',
    definition: 'In a reverse triangular merger, Acquirer forms a wholly-owned subsidiary (Merger Sub). Merger Sub merges into Target — the direction is reversed relative to a forward triangular. Target survives as the legal entity and becomes a wholly-owned subsidiary of Acquirer. Merger Sub ceases to exist. This is the dominant structure for large public company acquisitions in the United States.',
    mechanics: [
      'Acquirer forms a wholly-owned subsidiary (Merger Sub)',
      'Merger agreement executed between Acquirer, Merger Sub, and Target',
      'Target stockholders vote to approve (Acquirer usually votes Merger Sub shares)',
      'At closing: Merger Sub merges into Target',
      'Target survives as a wholly-owned subsidiary of Acquirer',
      'Merger Sub dissolves',
      'Former Target stockholders receive merger consideration; their shares convert to right to receive consideration',
      'Acquirer now owns 100% of Target',
    ],
    when_used: 'The default structure for public company M&A. Used when: (1) Target has valuable contracts with anti-assignment provisions (they don\'t trigger because Target, the contracting party, survives); (2) the deal involves regulated industries where Target\'s licenses must continue (they do, because the licensed entity continues); (3) acquirer wants to use Target\'s existing corporate infrastructure post-closing; (4) the parties want the flexibility for a tax-free reorganization (available if ≥80% stock consideration). Used in the Twitter deal.',
    advantages: [
      'Target entity survives — its contracts, licenses, and regulatory approvals continue without assignment',
      'Anti-assignment and change-of-control provisions in Target contracts generally not triggered (Target remains the party)',
      'Can qualify as tax-free reorganization if ≥80% stock consideration',
      'Target\'s corporate history, brand, and charter survive intact',
      'Acquirer gets liability protection (Target is a subsidiary, not a division)',
      'Dominant market practice — counterparties, counsel, and courts understand it',
    ],
    disadvantages: [
      'Target\'s pre-closing liabilities survive in Target (now Acquirer\'s subsidiary) — liability protection is real but imperfect',
      'Some "change of control" definitions capture indirect ownership changes, still triggering CoC provisions',
      'More complex than a direct merger (requires subsidiary formation)',
      'Requires Acquirer to fund Merger Sub with merger consideration',
      'If tax-free reorg desired, must maintain ≥80% stock consideration throughout',
    ],
    deal_relationship: 'This is the structure used in the Twitter deal. Section 2.1 of the merger agreement provides that X Holdings II (Merger Sub) merged with and into Twitter, with Twitter surviving as a wholly-owned subsidiary of X Holdings I (Acquirer). Key reasons: (1) Twitter had thousands of enterprise contracts — survival of the Twitter entity avoided mass consent-solicitation obligations; (2) Twitter\'s debt financing (the leveraged buyout structure) required Twitter to survive as the entity actually bearing the debt; (3) Twitter had international regulatory approvals and data-processing agreements that could not be easily reassigned; (4) the Twitter brand itself required continuity of the corporate entity.',
    diagram: {
      type: 'reverse-triangular',
      before: ['Acquirer', 'Merger Sub (new)', 'Target'],
      after: ['Acquirer', '└─ Target (survives, absorbs Merger Sub)'],
      flow: 'Merger Sub → merges into → Target',
    },
    related_concepts: ['direct-merger', 'forward-triangular-merger', 'double-dummy-newco'],
    related_cases: ['twitter_musk', 'ncs'],
    sort_order: 3,
  },

  'double-dummy-newco': {
    id: 'double-dummy-newco',
    slug: 'double-dummy-newco',
    title: 'Double Dummy / NewCo Structure',
    category: 'merger-structures',
    provision_ids: ['structure'],
    summary: 'Both companies merge into subsidiaries of a new holding company. Both survive as subsidiaries under a NewCo parent.',
    definition: 'In a double dummy structure, neither the acquirer nor the target merges into the other. Instead, a brand new holding company (NewCo) is formed. Both Acquirer and Target each form a wholly-owned subsidiary. Each existing company then merges into its respective subsidiary — with both companies surviving as subsidiaries of NewCo. The result is two operating companies held under a single new parent.',
    mechanics: [
      'Parties form NewCo (the new parent holding company)',
      'NewCo forms two wholly-owned subsidiaries: Sub A (for Acquirer) and Sub B (for Target)',
      'Sub A merges into Acquirer; Acquirer survives as a subsidiary of NewCo',
      'Sub B merges into Target; Target survives as a subsidiary of NewCo',
      'Former Acquirer stockholders receive NewCo shares',
      'Former Target stockholders receive NewCo shares (at negotiated exchange ratio)',
      'NewCo is now the public parent of both operating companies',
    ],
    when_used: 'Used primarily in mergers of equals or near-equals where: (1) neither party wants to be seen as the "acquired" company for cultural or strategic reasons; (2) the parties want a new combined identity (new name, new ticker); (3) complex tax planning requires both entities to survive under a new parent; (4) the transaction is structured as a tax-free reorganization. Also used when the combined company wants to redomicile (e.g., move to Ireland or UK for tax purposes) — NewCo is formed in the new jurisdiction.',
    advantages: [
      'Neither company is "acquired" — useful for mergers of equals optics',
      'Both operating entities survive with their contracts, licenses, and regulatory approvals intact',
      'Enables redomiciliation to a new jurisdiction through NewCo',
      'Can achieve tax-free treatment for both sets of stockholders simultaneously',
      'NewCo can be publicly listed immediately with a new brand identity',
    ],
    disadvantages: [
      'Most complex structure — three entities (NewCo + two operating subs) require coordination',
      'Both acquirer and target stockholders must vote',
      'Significant integration complexity post-closing (two separate operating entities)',
      'Higher transaction costs (multiple entities, more complex tax analysis)',
      'Rarely used in straightforward acquisitions — overkill for most deals',
      'NewCo governance structure must be negotiated from scratch',
    ],
    deal_relationship: 'Not used in the Twitter deal. This was not a merger of equals — it was a clean acquisition with Musk buying 100% of Twitter for cash. A double dummy structure would have been inappropriate and unnecessarily complex given the deal\'s straightforward nature: Musk was the sole buyer, all Twitter stockholders were receiving cash, and there was no need for a new combined holding structure. The reverse triangular achieved the same goal (Twitter entity survival) without the added complexity.',
    diagram: {
      type: 'double-dummy',
      before: ['Acquirer', 'Target'],
      after: ['NewCo', '├─ Acquirer (survives as sub)', '└─ Target (survives as sub)'],
      flow: 'Both → merge into respective subs → under NewCo',
    },
    related_concepts: ['reverse-triangular-merger', 'reverse-morris-trust'],
    related_cases: [],
    sort_order: 4,
  },

  'reverse-morris-trust': {
    id: 'reverse-morris-trust',
    slug: 'reverse-morris-trust',
    title: 'Reverse Morris Trust',
    category: 'merger-structures',
    provision_ids: ['structure'],
    summary: 'Tax-free spin-off of a subsidiary combined with a merger — lets a parent divest a division tax-free by merging it with an acquirer.',
    definition: 'A Reverse Morris Trust (RMT) is a transaction structure that combines a tax-free spin-off under IRC § 355 with a tax-free merger under IRC § 368. It allows a parent company to divest a subsidiary or division to an acquirer on a tax-free basis. The "reverse" refers to the direction: in a classic Morris Trust, the acquiring company received assets; in an RMT, the subsidiary is spun off to parent\'s stockholders first, then merged with the acquirer. The combined entity must be controlled by the former parent\'s stockholders (>50%) immediately after the transaction.',
    mechanics: [
      'Parent identifies a subsidiary or division to divest ("SpinCo")',
      'Parent spins off SpinCo to Parent\'s own stockholders via tax-free distribution under § 355',
      'Immediately after the spin-off, SpinCo merges with a subsidiary of Acquirer',
      'SpinCo survives the merger as a subsidiary of Acquirer',
      'Former Parent stockholders own >50% of the combined company post-merger (IRS requirement)',
      'Former Acquirer stockholders own <50% post-merger',
      'No tax at the corporate or stockholder level on the spin-off (if § 355 conditions met)',
    ],
    when_used: 'Used when a large parent wants to divest a subsidiary without triggering a large corporate-level tax on the gain. Classic examples: AT&T\'s DirecTV spin and merger with Liberty Media (2021); WarnerMedia spin from AT&T and merger with Discovery (2022); Raytheon\'s separation transactions. Requires IRS private letter ruling process (12-18 months) and careful structuring to satisfy § 355 requirements including active business, business purpose, and the >50% control test.',
    advantages: [
      'Parent divests a subsidiary completely tax-free at the corporate level',
      'Parent stockholders receive SpinCo shares tax-free (deferred until they sell)',
      'Acquirer gets the business at a lower effective price (no tax drag)',
      'Efficient for divestitures of large, valuable divisions with significant embedded gain',
      'Can be structured as a merger of equals (SpinCo + Acquirer sub)',
    ],
    disadvantages: [
      'Extremely complex — requires IRS private letter ruling, extensive tax analysis, SEC registration',
      'Timeline is long (12-24 months from announcement to close)',
      'Parent must maintain >50% control test — limits acquirer\'s negotiating position on economics',
      '§ 355 requirements are strict — failure can result in massive tax liability',
      'Two-year post-closing restriction on certain transactions (§ 355(e) anti-avoidance)',
      'Acquirer effectively gets minority economics in the combined company',
      'Rarely available for pure cash acquisitions',
    ],
    deal_relationship: 'Not applicable to the Twitter deal. RMT structures are used for divestitures, not acquisitions of public companies for cash. Twitter was being acquired outright, not divested from a parent. However, RMT is a structure that Corpus users will encounter frequently in large-cap M&A — for example, if a client is advising a telecom company spinning off its media assets, or a pharma company divesting a mature drug portfolio. Understanding why RMT was unavailable here (it\'s a divestiture tool, not an acquisition tool) is itself a useful analytical point.',
    diagram: {
      type: 'rmt',
      before: ['Parent', '└─ SpinCo (division)', 'Acquirer'],
      after: ['Parent (divests SpinCo)', 'Acquirer', '└─ SpinCo (survives as sub of Acquirer)'],
      flow: 'Parent spins SpinCo → SpinCo merges with Acquirer sub → SpinCo survives',
    },
    related_concepts: ['double-dummy-newco', 'forward-triangular-merger'],
    related_cases: [],
    sort_order: 5,
  },
};

// Helper: get all concepts for a provision
export function getConceptsForProvision(provisionId) {
  return Object.values(CONCEPTS).filter(c => c.provision_ids.includes(provisionId));
}

// Helper: get all concepts in a category
export function getConceptsByCategory(category) {
  return Object.values(CONCEPTS)
    .filter(c => c.category === category)
    .sort((a, b) => a.sort_order - b.sort_order);
}

// Categories registry
export const CONCEPT_CATEGORIES = {
  'merger-structures': {
    id: 'merger-structures',
    label: 'Merger Structures',
    provision_id: 'structure',
    description: 'The five principal structures for effecting a merger or acquisition under Delaware law.',
  },
  // Add more categories as you build them:
  // 'mae-standards': { ... },
  // 'earnout-mechanics': { ... },
  // 'rep-warranty-regimes': { ... },
};

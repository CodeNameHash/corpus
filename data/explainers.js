export const EXPLAINERS = {
  structure: {
    junior: {
      headline: "Two companies become one — here's the legal mechanism.",
      body: `A merger is the legal combination of two corporations into one. In the Twitter deal, Elon Musk's acquisition vehicle (X Holdings II, Inc. — called "Acquisition Sub") merged into Twitter, Inc. When it was over, Acquisition Sub ceased to exist and Twitter survived as a wholly-owned subsidiary of Musk's parent company.

This is called a forward triangular merger. The word "triangular" refers to the three-party structure: Parent (X Holdings I) → Acquisition Sub (X Holdings II) → Target (Twitter). Acquisition Sub is a shell formed six days before signing, with no assets or operations. Its entire purpose is to serve as the merging entity so that Parent never directly touches Twitter's liabilities.

The merger happens at a specific legal moment: the "Effective Time," which occurs when the Certificate of Merger is filed with the Delaware Secretary of State. That happened on October 27, 2022. Before that moment, Twitter was an independent public company. After that moment, it was a private subsidiary.

Two days before closing (T+2), both sides prepare for the filing — wire transfers are staged, lenders fund their commitments, and the Certificate of Merger is ready to go. The deal "closes" commercially on that date; the merger takes legal effect at the moment of filing.`,
    },
    mid: {
      headline: "Structure choice was driven by debt, contracts, and litigation risk.",
      body: `The forward triangular structure was not an arbitrary choice. Three factors drove it.

First: Twitter's $13B in acquisition financing required Twitter to survive as the legal borrower. Musk's banks (Morgan Stanley, Bank of America, Barclays, and others) structured their commitments against Twitter as the credit. A structure where Twitter ceased to exist would have required renegotiating the entire debt package. Forward triangular preserved this continuity.

Second: Twitter held valuable contracts — data licensing agreements, advertiser relationships, developer API agreements — that contained change-of-control triggers. In a forward triangular merger, Twitter technically "survived," which minimizes automatic contract termination triggers in agreements that define CoC as a merger of the company itself (as opposed to a change in ownership). Counsel still conducted a full CoC contract review, but the structure reduced the blast radius.

Third: By keeping Acquisition Sub as the disappearing entity, Parent (X Holdings I) had no direct liability for Musk's shell structure. This matters less in a deal where Parent has assets, but here the entire structure was newly formed weeks before signing.

One tension: a forward triangular merger can still trigger CoC provisions defined as a change in "beneficial ownership." Twitter's counsel had to distinguish between provisions triggered by the merger-entity change versus those triggered by ownership change — these required separate analysis.`,
    },
    senior: {
      headline: "Structure, deal protection, and personal liability worked in concert.",
      body: `The Structure & Mechanics provisions of the Twitter merger agreement are best understood as a single integrated package, not a series of independent choices.

Musk's vehicles were newly formed shells. X Holdings I (Parent) was incorporated April 4, 2022. X Holdings II (Acquisition Sub) was incorporated April 19, 2022. Neither had assets. Twitter's negotiating leverage came from one source: Musk signed personally.

Section 9.9's bilateral specific performance and Musk's personal signature as Equity Investor were structurally linked. The specific performance remedy was only meaningful because it ran against an individual with personal assets — not against two Delaware shells. Wilson Sonsini and Simpson Thacher extracted this concession as a precondition to signing, knowing that any dispute would need a collectible defendant.

The closing mechanics reinforced this: T+2 from condition satisfaction, concurrent Certificate of Merger filing, precise Effective Time definition. When Musk attempted to terminate in July 2022, Twitter filed in Chancery within four days. Chancellor McCormick set trial for October 17 — creating a credible path to a court-ordered close before the Outside Date (October 28). The mechanics were designed for exactly this scenario.

The structural lesson: in deals where the acquiror is newly formed and the controlling individual is the real counterparty, structure the deal protection against the individual from the start. Termination fees against shells are uncollectible. Specific performance against individuals is not.`,
    },
  },
};

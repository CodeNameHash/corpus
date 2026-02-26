export const CLAUSES = {
  structure: {
    section: "Article II — The Merger",
    items: [
      {
        id: "c1",
        label: "§ 2.1 — The Merger",
        text: "Upon the terms and subject to the conditions of this Agreement, and in accordance with the DGCL, at the Effective Time, Acquisition Sub shall be merged with and into the Company, whereupon the separate existence of Acquisition Sub shall cease, and the Company shall continue under the name 'Twitter, Inc.' as the surviving corporation (the 'Surviving Corporation') in the Merger and shall succeed to and assume all the rights, properties and obligations of Acquisition Sub in accordance with the DGCL.",
        annotations: {
          junior: { phrase: "merged with and into the Company", note: "Forward triangular structure: Acquisition Sub merges into Twitter. Twitter survives. Acquisition Sub disappears. This preserves Twitter's contracts, licenses, and debt obligations — all of which require legal continuity of the entity." },
          mid: { phrase: "succeed to and assume all the rights, properties and obligations", note: "By operation of Delaware law (DGCL § 259), the Surviving Corporation automatically acquires all rights and assumes all liabilities of the disappearing entity (Acquisition Sub). No separate assignment is required." },
          senior: { phrase: "in accordance with the DGCL", note: "The DGCL governs merger mechanics including appraisal rights (§ 262), stockholder vote requirements (§ 251), and the effect of the merger (§ 259). Governing law for the transaction itself is Delaware regardless of where the parties operate." },
        },
      },
      {
        id: "c2",
        label: "§ 2.2 — The Closing",
        text: "The closing of the Merger (the 'Closing') shall take place at 9:00 a.m. (Pacific Time) at the offices of Wilson Sonsini Goodrich & Rosati, Professional Corporation, 650 Page Mill Road, Palo Alto, California 94304, on the date that is two (2) Business Days after the date on which the last of the conditions set forth in Article VII (other than those conditions that by their nature are to be satisfied at the Closing, but subject to the satisfaction or, to the extent permitted by applicable Law, waiver of those conditions) shall have been satisfied or, to the extent permitted by applicable Law, waived, or at such other place, time and/or date as Parent and the Company may agree in writing.",
        annotations: {
          junior: { phrase: "two (2) Business Days after", note: "T+2 closing mechanic. Standard in strategic M&A — matches equity settlement conventions. The two-day window gives both sides time to arrange wire transfers and administrative tasks after conditions are satisfied." },
          mid: { phrase: "other than those conditions that by their nature are to be satisfied at the Closing", note: "Circular conditions carve-out: some closing conditions (like delivery of closing certificates) can only be satisfied at closing itself. Those are excluded from the T+2 trigger — otherwise you'd need conditions satisfied before you could count to T+2, creating an impossibility." },
          senior: { phrase: "to the extent permitted by applicable Law, waived", note: "Not all closing conditions are waivable — conditions required by law (e.g., HSR clearance) cannot be waived. Parties can only waive conditions to the extent doing so is legally permissible. Counsel must analyze each condition's waivability before advising the client on closing mechanics." },
        },
      },
      {
        id: "c3",
        label: "§ 2.3 — Effective Time",
        text: "As soon as practicable on the Closing Date, the parties hereto shall cause the Merger to be consummated by filing a Certificate of Merger with the Secretary of State of the State of Delaware in such form as is required by, and executed in accordance with the relevant provisions of, the DGCL (the time of such filing with the Secretary of State of the State of Delaware, or such later time as may be agreed in writing by Parent and the Company and specified in the Certificate of Merger, being the 'Effective Time').",
        annotations: {
          junior: { phrase: "filing a Certificate of Merger with the Secretary of State", note: "The merger becomes legally effective at the moment of filing (or a later time specified in the certificate). The parties orchestrate this concurrent with wire transfers — the deal is 'done' when the certificate hits the Delaware Secretary of State's system." },
          mid: { phrase: "As soon as practicable on the Closing Date", note: "The Effective Time is not self-executing upon satisfaction of conditions — it requires affirmative action (filing). 'As soon as practicable' means parties are obligated to file promptly once closing conditions are met, but have flexibility on exact timing within the Closing Date." },
          senior: { phrase: "such later time as may be agreed in writing", note: "Parties can specify a future effective time in the Certificate of Merger — allowing them to coordinate exactly when the merger takes effect (e.g., at market close, or midnight). This is used in deals sensitive to trading hours or tax year treatment." },
        },
      },
    ],
  },
};

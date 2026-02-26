export const NEGOTIATION_POINTS = {
  structure: [
    {
      id: "np1",
      title: "Forward vs. Reverse Triangular Merger",
      deal_context: "Twitter survived as Surviving Corporation. Acquisition Sub (X Holdings II) merged in and ceased to exist.",
      buyer_position: "Buyer typically prefers a reverse triangular merger (target merges into Acquisition Sub) — the acquired company's separate existence ends, reducing exposure to unknown liabilities. Parent is one step removed.",
      seller_position: "Seller prefers forward triangular (Acquisition Sub merges into target) — existing contracts, licenses, and debt stay in place. Change-of-control triggers are minimized. Here, Twitter's $13B bank financing required its legal continuity.",
      key_points: [
        "Forward triangular: target survives, existing contracts and debt preserved.",
        "Reverse triangular: target disappears, assets and liabilities transfer, potential for broader CoC triggers.",
        "Debt structure is often determinative — lenders may require the borrower entity to survive.",
      ],
    },
    {
      id: "np2",
      title: "Closing Timeline (T+2 vs. Extended Period)",
      deal_context: "Section 2.2(a) required closing on the second business day after conditions satisfied (T+2).",
      buyer_position: "Buyer often pushes for a longer closing window post-condition satisfaction — time to arrange financing draws, internal approvals, and mechanics. Some PE deals build in 5–10 business day windows.",
      seller_position: "Seller wants T+2 certainty — minimizes post-condition drift and the risk of a last-minute buyer claim. Aligns with equity market settlement conventions.",
      key_points: [
        "T+2 is the standard in strategic deals with committed financing.",
        "Longer windows increase buyer optionality but create seller execution risk.",
        "Concurrent filing of Certificate of Merger with wire mechanics creates logistical complexity at T+2.",
      ],
    },
    {
      id: "np3",
      title: "Equity Investor Personal Liability",
      deal_context: "Musk signed personally as Equity Investor, binding him to specific performance obligations under Section 9.9.",
      buyer_position: "Buyers resist personal liability for controlling individuals — preference for entity-only obligation. Concede only where essential to get deal done.",
      seller_position: "Sellers push hard for personal liability of controlling individuals when the acquiror is a newly formed shell with no assets. Limited Guarantee from the individual is the floor; direct specific performance signature is the ask.",
      key_points: [
        "Newly formed acquirors have no assets — personal guarantee is the only meaningful recourse.",
        "Limited Guarantee scope should cover both termination fee AND specific performance obligations.",
        "Litigating against an individual with personal assets (versus a shell) is a fundamentally different risk calculus.",
      ],
    },
    {
      id: "np4",
      title: "Specific Performance: Bilateral vs. RTF as Sole Remedy",
      deal_context: "Section 9.9 grants bilateral specific performance — both parties can compel closing, not just collect the termination fee.",
      buyer_position: "Buyer prefers reverse termination fee as sole remedy — caps liability at a known amount ($1B here) and provides optionality to walk for a defined cost. Resists bilateral specific performance that could force a close.",
      seller_position: "Seller wants bilateral specific performance — the right to compel closing, not just collect damages. Especially critical when the deal is strategic and no replacement buyer exists at that price.",
      key_points: [
        "RTF-as-sole-remedy structures give buyer a 'walk right' — the fee is the price of the option.",
        "Bilateral specific performance eliminates that optionality — buyer must close or litigate.",
        "Delaware Chancery will enforce properly drafted bilateral specific performance provisions (see Twitter v. Musk).",
      ],
    },
  ],
};

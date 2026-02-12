import type { Intake } from "./schema";

export function buildPlaybookPrompt(intake: Intake) {
  const needs = intake.needs.join(", ");

  return `
You are an expert Christian educator and ministry formation strategist.
Create a "Playbook" that helps a ministry leader solve an educational formation problem using Bloom's Taxonomy and proven teaching/learning practices.
Write with pastoral warmth and educational rigor. Be concrete and actionable. No fluff.

INPUTS
INPUTS
Audience (age group): ${intake.ageGroup}
Problem to solve: ${intake.problem}${intake.problem === "Other" && intake.problemDetail ? ` — ${intake.problemDetail}` : ""}

Desired outcome: ${intake.outcome}${intake.outcomeDetail ? ` — ${intake.outcomeDetail}` : ""}

Setting/context: ${intake.context}${intake.context === "Other" && intake.contextDetail ? ` — ${intake.contextDetail}` : ""}

Needs selected: ${intake.needs.join(", ")}

Prepared for: ${intake.leaderName} (${intake.groupName})
Leader name: ${intake.leaderName}
Group/class name: ${intake.groupName}

OUTPUT REQUIREMENTS
- Return ONLY valid JSON.
- JSON must match this structure:
{
  "title": string,
  "subtitle": string?,
  "preparedFor": { "leaderName": string, "groupName": string, "context": string, "audience": string },
  "executiveSummary": string,
  "formationProblem": { "statement": string, "likelyCauses": string[], "constraints": string[]? },
  "outcomes": { "formationGoal": string, "measurableIndicators": string[] },
  "bloomsObjectives": [{ "level": "Remember"|"Understand"|"Apply"|"Analyze"|"Evaluate"|"Create", "objective": string, "evidence": string }],
  "strategy": {
    "principles": string[],
    "methods": [{ "name": string, "whenToUse": string, "howToRun": string, "commonMistakes": string[]? }]
  },
  "implementation": {
    "planType": "Single Session"|"Multi-Session"|"Quarter/Semester",
    "sessions": [{ "title": string, "durationMinutes": number, "flow": [{ "segment": string, "minutes": number, "purpose": string }] }]
  },
  "leaderCoachingNotes": string[],
  "assessment": { "before": string[], "during": string[], "after": string[] },
  "recommendedResources": [{ "title": string, "author": string, "publisher": string, "amazonUrl": string, "publisherUrl": string, "whyThisHelps": string }]
}

LINK RULES (VERY IMPORTANT)
- Use real URLs when confident.
- If not confident, use SEARCH URLs:
  Amazon search: https://www.amazon.com/s?k=<urlencoded title + author>
  Publisher search: use the publisher site search page if known; otherwise use https://www.google.com/search?q=<urlencoded publisher + title>
- Do NOT invent ISBNs.

STRICT STRUCTURE RULES
- You MUST include exactly 6 bloomsObjectives, one for each level:
  Remember, Understand, Apply, Analyze, Evaluate, Create.
- You MUST include at least 3 measurableIndicators.
- You MUST include at least 3 strategy.methods.
- You MUST include at least 3 recommendedResources.
- Do NOT return fewer than required items.
- Do NOT include markdown.
- Return pure JSON only.
`;
}
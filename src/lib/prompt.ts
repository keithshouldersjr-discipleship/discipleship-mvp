// src/lib/prompt.ts
import type { Intake } from "./schema";

/** Keep enum labels stable (prevents drift like "6 Weeks" vs "4–6 Weeks") */
function timeHorizonLabel(v: Intake["timeHorizon"]): string {
  return v;
}

/** Convert duration choice into a deterministic durationMinutes number */
function durationMinutes(intake: Intake): number {
  if (intake.duration === "Custom") {
    const n =
      typeof intake.durationCustomMinutes === "number"
        ? intake.durationCustomMinutes
        : undefined;
    // fallback if UI ever sends Custom without a number
    return typeof n === "number" && Number.isFinite(n) ? n : 60;
  }

  // Choose the high end of the range for planning consistency
  if (intake.duration === "45–60 min") return 60;
  if (intake.duration === "75–90 min") return 90;

  // Should never happen, but keep it safe
  return 60;
}

function settingLabel(intake: Intake): string {
  if (intake.setting === "Other" && intake.settingDetail?.trim()) {
    return `${intake.setting} — ${intake.settingDetail.trim()}`;
  }
  return intake.setting;
}

function topicOrTextLabel(intake: Intake): string {
  return intake.topicOrText?.trim() ? intake.topicOrText.trim() : "";
}

function constraintsList(intake: Intake): string[] {
  // constraints may arrive as array or string depending on UI evolution—normalize
  const v = (intake as unknown as { constraints?: unknown }).constraints;

  if (Array.isArray(v)) {
    return v.filter(
      (x): x is string => typeof x === "string" && x.trim().length > 0
    );
  }

  if (typeof v === "string" && v.trim().length > 0) {
    return v
      .split(/[\n,]+/g)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  return [];
}

function leaderLabel(intake: Intake): string {
  const v = intake.leaderName?.trim();
  return v && v.length > 0 ? v : "Teacher/Leader";
}

export function buildBlueprintPrompt(intake: Intake) {
  const setting = settingLabel(intake);
  const horizon = timeHorizonLabel(intake.timeHorizon);
  const minutes = durationMinutes(intake);
  const topicOrText = topicOrTextLabel(intake);
  const leaderName = leaderLabel(intake);
  const constraints = constraintsList(intake);

  const constraintsLine =
    constraints.length > 0 ? constraints.join("; ") : "None provided";

  const moduleKey =
    intake.role === "Teacher"
      ? "teacher"
      : intake.role === "Pastor/Leader"
      ? "pastorLeader"
      : "youthLeader";

  return `
You are Discipleship by Design: an expert Christian educator and formation strategist.
Your job is to generate a ministry education BLUEPRINT that helps volunteer teachers/leaders who are busy and have limited training in education:
1) prepare to teach,
2) lead an engaging learning environment,
3) and design curriculum that forms disciples.

BRAND VOICE
- Warm, pastoral, practical. Clear and concise. “Teach With Intention.”
- Assume busy volunteer leaders. No fluff. Concrete steps.

CRITICAL OUTPUT RULES (NON-NEGOTIABLE)
- Return ONLY a single JSON object.
- Do NOT wrap it in { "blueprint": ... } or { "data": ... }.
- Do NOT echo the inputs back as top-level fields (no "role", "designType", etc. at the root).
- The root JSON MUST contain ONLY these keys:
  "header", "overview", "modules", "recommendedResources"
- No markdown. No commentary. No trailing commas.

ENUMS (use EXACT spelling)
role: "Teacher" | "Pastor/Leader" | "Youth Leader"
designType: "Single Lesson" | "Multi-Week Series" | "Quarter Curriculum"
timeHorizon: "Single Session" | "4–6 Weeks" | "Quarter/Semester"
planType: "Single Session" | "Multi-Session" | "Quarter/Semester"

INPUTS
Role: ${intake.role}
Design type: ${intake.designType}
Time horizon: ${horizon}
Age group: ${intake.ageGroup}
Group name: ${intake.groupName}
Leader name: ${leaderName}
Setting: ${setting}
Session duration minutes (use this number exactly): ${minutes}
Topic or text (may be empty string): ${topicOrText}
Desired outcome (north star): ${intake.desiredOutcome}
Constraints: ${constraintsLine}

YOU MUST PRODUCE JSON MATCHING THIS STRUCTURE EXACTLY:

{
  "header": {
    "title": string,
    "subtitle": string,
    "role": "Teacher"|"Pastor/Leader"|"Youth Leader",
    "preparedFor": { "leaderName": string, "groupName": string },
    "context": {
      "setting": string,
      "ageGroup": string,
      "designType": "Single Lesson"|"Multi-Week Series"|"Quarter Curriculum",
      "timeHorizon": "Single Session"|"4–6 Weeks"|"Quarter/Semester",
      "durationMinutes": number,
      "topicOrText": string,
      "constraints": string[]
    }
  },
  "overview": {
    "executiveSummary": string,
    "outcomes": {
      "formationGoal": string,
      "measurableIndicators": string[]
    },
    "bloomsObjectives": [
      { "level": "Remember"|"Understand"|"Apply"|"Analyze"|"Evaluate"|"Create", "objective": string, "evidence": string }
    ]
  },
  "modules": {
    "${moduleKey}": { ...role module... }
  },
  "recommendedResources": [
    { "title": string, "author": string, "publisher": string, "amazonUrl": string, "publisherUrl": string, "whyThisHelps": string }
  ]
}

ROLE MODULE DEFINITIONS
- If role is "Teacher", modules.teacher MUST match:
{
  "prepChecklist": { "beforeTheWeek": string[], "dayOf": string[] },
  "lessonPlan": {
    "planType": "Single Session"|"Multi-Session"|"Quarter/Semester",
    "sessions": [
      { "title": string, "durationMinutes": number, "flow": [ { "segment": string, "minutes": number, "purpose": string } ] }
    ]
  },
  "facilitationPrompts": {
    "openingQuestions": string[],
    "discussionQuestions": string[],
    "applicationPrompts": string[]
  },
  "followUpPlan": { "sameWeekPractice": string[], "nextTouchpoint": string[] }
}

- If role is "Pastor/Leader", modules.pastorLeader MUST match:
{
  "planOverview": { "planType": "Single Session"|"Multi-Session"|"Quarter/Semester", "cadence": string, "alignmentNotes": string[] },
  "sessions": [
    {
      "title": string,
      "objective": string,
      "leaderPrep": string[],
      "takeHomePractice": string[],
      "sessionPlan": { "title": string, "durationMinutes": number, "flow": [ { "segment": string, "minutes": number, "purpose": string } ] }
    }
  ],
  "leaderTrainingPlan": {
    "trainingSessions": [ { "title": string, "durationMinutes": number, "agenda": string[] } ],
    "coachingNotes": string[]
  },
  "measurementFramework": {
    "inputsToTrack": string[],
    "outcomesToMeasure": string[],
    "simpleRubric": string[]
  }
}

- If role is "Youth Leader", modules.youthLeader MUST match:
{
  "activityIntegratedPlan": {
    "sessions": [
      { "title": string, "durationMinutes": number, "flow": [ { "segment": string, "minutes": number, "purpose": string } ] }
    ]
  },
  "activityBank": [
    { "name": string, "timeMinutes": number, "objectiveTie": string, "setup": string, "debriefQuestions": string[] }
  ],
  "leaderNotes": { "transitions": string[], "engagementMoves": string[], "guardrails": string[] }
}

COUNT RULES (to prevent failures)
- overview.outcomes.measurableIndicators: at least 3 (5 is better)
- overview.bloomsObjectives: EXACTLY 6 items, in this order:
  Remember, Understand, Apply, Analyze, Evaluate, Create
- For the selected role module, all required arrays must be non-empty (at least 3 items where it makes sense)
- recommendedResources: 3–6 items

DURATION + FLOW RULES
- Use header.context.durationMinutes = ${minutes}
- In any sessionPlan / lessonPlan sessions, use durationMinutes = ${minutes}
- Each session.flow should have 4–7 segments.
- Minutes should add up realistically to about ${minutes}.

LINK RULES
- Use real URLs only when confident.
- Otherwise use search URLs:
  Amazon: https://www.amazon.com/s?k=<urlencoded title + author>
  Publisher: https://www.google.com/search?q=<urlencoded publisher + title>

Return ONLY the JSON object described above.
`.trim();
}
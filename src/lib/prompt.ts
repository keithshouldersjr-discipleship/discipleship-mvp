// src/lib/prompt.ts
import type { Intake } from "@/lib/schema";
import { DBD_METHOD } from "@/lib/methodology";
import {
  deriveRoleFromTask,
  deriveDesignTypeFromTask,
  defaultTimeHorizon,
  requiresTimeHorizon,
} from "@/lib/intake";

function formatMethodologyForPrompt() {
  const convictions = DBD_METHOD.coreConvictions.map((c) => `- ${c}`).join("\n");

  const inform = DBD_METHOD.movements.inform;
  const inspire = DBD_METHOD.movements.inspire;
  const assess = DBD_METHOD.movements.assess;

  return `
The Discipleship by Design Method (MANDATORY):

Core Convictions:
${convictions}

Three Movements of Every Lesson (mapped to Bloom’s Revised Taxonomy):
1) Inform — Clarify truth.
   Bloom: ${inform.bloomLevels.join(", ")}
   Summary: ${inform.summary}

2) Inspire — Connect truth to life.
   Bloom: ${inspire.bloomLevels.join(", ")}
   Summary: ${inspire.summary}

3) Assess — Confirm transformation and invite creation.
   Bloom: ${assess.bloomLevels.join(", ")}
   Summary: ${assess.summary}

Three Dimensions of Objective (for every lesson/session):
- Head — ${DBD_METHOD.objectiveDimensions.head}
- Heart — ${DBD_METHOD.objectiveDimensions.heart}
- Hands — ${DBD_METHOD.objectiveDimensions.hands}

Structural requirements (non-negotiable):
- The blueprint MUST use Head/Heart/Hands language for objectives.
- The blueprint MUST use Inform/Inspire/Assess language for engagement.
- Every session must include:
  - objectives: { head, heart, hands }
  - engagement: { inform[], inspire[], assess[] }
  - flow[] with minutes and movement tags (Inform/Inspire/Assess)
- Use simple, volunteer-friendly language (no academic jargon).
`.trim();
}

export function buildBlueprintPrompt(intake: Intake) {
  const role = intake.role ?? deriveRoleFromTask(intake.task);
  const designType = intake.designType ?? deriveDesignTypeFromTask(intake.task);

  // ✅ only include time horizon when task requires it
  const timeHorizon =
    intake.timeHorizon ??
    (requiresTimeHorizon(intake.task) ? defaultTimeHorizon(intake.task) : undefined);

  const constraints = intake.constraints?.length
    ? intake.constraints.slice(0, 2).join("; ")
    : "None provided";

  return `
You are generating a discipleship blueprint for Discipleship by Design.
Your audience is volunteer leaders and teachers with little-to-no formal training in education.
Your job is to produce a plan that is spiritually faithful, realistic to execute, and clearly measurable.

${formatMethodologyForPrompt()}

Non-negotiable design principles:
1) Backwards Design (do NOT skip this):
   - Begin with a clear Formation Goal (what learners become/do).
   - Define Measurable Indicators (observable evidence of growth).
   - Define a THREE-DIMENSION objective set in Head/Heart/Hands language
     that directly supports the formation goal.

2) Realism & Feasibility:
   - Session plans must fit the session length.
   - Flow segment minutes MUST sum to the session durationMinutes.
   - Keep plans achievable for volunteers with limited prep.
   - Use scripture accessibly (assume some learners have low Bible literacy).

3) Constraints must shape decisions:
   - Do not merely mention constraints—adapt pacing, explanations, and activities to them.
   - The plan should feel designed around the top 1–2 constraints.

Task-specific requirements:
- Teach A Class:
  - Keep it clear + simple.
  - Use the Inform → Inspire → Assess rhythm.
  - Include ONE concrete “Hands” practice step for the week.
- Lead A Workshop:
  - Make it participatory (exercises + debrief).
  - Keep instructions short and explicit.
- Build Curriculum:
  - Ensure progression across sessions.
  - Every session still must include objectives + engagement + flow.
  - Include leader training + measurement framework if the role is Pastor/Leader.

Now generate the blueprint using the intake details below:

Task: ${intake.task}
Design Type (use this in header.context.designType): ${designType}
Role (modules must match this role): ${role}
${timeHorizon ? `Time Horizon (use this in header.context.timeHorizon): ${timeHorizon}` : ""}

Audience Age Group: ${intake.ageGroup}
Group Name: ${intake.groupName}
Leader Name: ${intake.leaderName ?? "Not provided"}

Setting: ${intake.setting}${intake.settingDetail ? ` (${intake.settingDetail})` : ""}
Session Length:
${
  intake.duration === "Custom"
    ? `${intake.durationCustomMinutes ?? "?"} minutes`
    : intake.duration
}

Desired Outcome (formation intent): ${intake.desiredOutcome}
Topic/Text: ${intake.topicOrText ?? ""}

Top Constraints (max 2): ${constraints}

OUTPUT FORMAT RULES (STRICT):
- Return ONLY valid JSON (no markdown/backticks/commentary).
- Root keys must be exactly: header, overview, modules, recommendedResources
- The JSON must match this exact shape and key names:

{
  "header": {
    "title": "string",
    "subtitle": "string (optional)",
    "role": "Teacher | Pastor/Leader | Youth Leader",
    "preparedFor": { "leaderName": "string", "groupName": "string" },
    "context": {
      "designType": "Single Lesson | Multi-Week Series | Quarter Curriculum",
      "timeHorizon": "string",
      "ageGroup": "string",
      "setting": "string",
      "durationMinutes": number,
      "topicOrText": "string",
      "constraints": ["string", "string"]
    }
  },
  "overview": {
    "executiveSummary": "string",
    "outcomes": {
      "formationGoal": "string",
      "measurableIndicators": ["string", "..."]
    },
    "headHeartHandsObjectives": {
      "head": "string",
      "heart": "string",
      "hands": "string"
    }
  },
  "modules": {
    "teacher": {
      "prepChecklist": { "beforeTheWeek": ["string"], "dayOf": ["string"] },
      "lessonPlan": {
        "planType": "Single Session|Multi-Session|Quarter/Semester",
        "sessions": [
          {
            "title": "string",
            "durationMinutes": number,
            "objectives": { "head": "string", "heart": "string", "hands": "string" },
            "engagement": { "inform": ["string"], "inspire": ["string"], "assess": ["string"] },
            "flow": [
              { "segment": "string", "minutes": number, "purpose": "string", "movement": "Inform|Inspire|Assess" }
            ]
          }
        ]
      },
      "followUpPlan": { "sameWeekPractice": ["string"], "nextTouchpoint": ["string"] }
    },
    "pastorLeader": "omit unless role is Pastor/Leader",
    "youthLeader": "omit unless role is Youth Leader"
  },
  "recommendedResources": [
    { "title": "string", "author": "string", "publisher": "string", "amazonUrl": "string", "publisherUrl": "string", "whyThisHelps": "string" }
  ]
}

Hard rules:
- Root keys must be exactly: header, overview, modules, recommendedResources
- modules.teacher must be an OBJECT (not an array).
- Put role/designType/timeHorizon/durationMinutes/constraints into header.context (and leaderName/groupName into header.preparedFor).
- If role is Teacher, include only modules.teacher (do not include pastorLeader/youthLeader).
- Every session must include objectives + engagement + flow.
- Every flow item must include movement = Inform|Inspire|Assess.
- Flow minutes must sum to durationMinutes for that session.
`.trim();
}
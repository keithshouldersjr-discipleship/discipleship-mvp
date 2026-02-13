// src/lib/schema.ts
import { z } from "zod";

/* ============================================
   INTAKE SCHEMA (what the form submits)
============================================ */

export const IntakeSchema = z.object({
  track: z.enum(["Teacher", "Pastor/Leader", "Youth Leader"]),

  groupType: z.string().min(1),
  groupTypeDetail: z.string().optional(),

  ageGroup: z.string().min(1),

  outcome: z.string().min(3),
  outcomeDetail: z.string().optional(),

 timeHorizon: z.enum(["single", "weeks_4_6", "quarter"]),

  topicOrText: z.string().optional(),

  constraints: z.array(z.string()).optional(),

  context: z.string().min(1),
  contextDetail: z.string().optional(),

  needs: z
    .array(
      z.enum([
        "Curriculum",
        "Teaching Plan",
        "Teaching Methods",
        "Leader Training",
        "Itinerary",
      ])
    )
    .min(1),

  leaderName: z.string().min(2),
  groupName: z.string().min(2),
});

export type Intake = z.infer<typeof IntakeSchema>;

/* ============================================
   PLAYBOOK OUTPUT SCHEMA (AI must match this)
   Modular by track: teacher | pastorLeader | youthLeader
============================================ */

/** Shared pieces **/
const BloomsObjectiveSchema = z.object({
  level: z.enum(["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]),
  objective: z.string(),
  evidence: z.string(),
});

const ResourceSchema = z.object({
  title: z.string(),
  author: z.string(),
  publisher: z.string(),
  amazonUrl: z.string().url(),
  publisherUrl: z.string().url(),
  whyThisHelps: z.string(),
});

const SessionFlowSchema = z.object({
  segment: z.string(),
  minutes: z.number().int().min(3).max(180),
  purpose: z.string(),
});

const SessionSchema = z.object({
  title: z.string(),
  durationMinutes: z.number().int().min(10).max(240),
  flow: z.array(SessionFlowSchema).min(4),
});

/** Common header + overview **/
const HeaderSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),

  track: z.enum(["Teacher", "Pastor/Leader", "Youth Leader"]),

  preparedFor: z.object({
    leaderName: z.string(),
    groupName: z.string(),
  }),

  audience: z.object({
    groupType: z.string(),
    ageGroup: z.string(),
  }),

  context: z.object({
    setting: z.string(),
    timeHorizon: z.enum(["Single Session", "4–6 Weeks", "Quarter/Semester"]),
    topicOrText: z.string().optional(),
    constraints: z.array(z.string()).optional(),
  }),
});

const OverviewSchema = z.object({
  executiveSummary: z.string(),

  formationProblem: z.object({
    statement: z.string(),
    likelyCauses: z.array(z.string()).min(1),
  }),

  outcomes: z.object({
    formationGoal: z.string(),
    measurableIndicators: z.array(z.string()).min(3),
  }),

  bloomsObjectives: z.array(BloomsObjectiveSchema).length(6),
});

/** Track modules **/
const TeacherModuleSchema = z.object({
  prepChecklist: z.object({
    beforeTheWeek: z.array(z.string()).min(3),
    dayOf: z.array(z.string()).min(3),
  }),

  lessonPlan: z.object({
    planType: z.enum(["Single Session", "Multi-Session"]),
    sessions: z.array(SessionSchema).min(1),
  }),

  facilitationPrompts: z.object({
    openingQuestions: z.array(z.string()).min(3),
    discussionQuestions: z.array(z.string()).min(4),
    applicationPrompts: z.array(z.string()).min(3),
  }),

  followUpPlan: z.object({
    sameWeekPractice: z.array(z.string()).min(2),
    nextTouchpoint: z.array(z.string()).min(2),
  }),
});

const PastorLeaderModuleSchema = z.object({
  planOverview: z.object({
    planType: z.enum(["Multi-Session", "Quarter/Semester"]),
    cadence: z.string(),
    alignmentNotes: z.array(z.string()).min(3),
  }),

  sessions: z
    .array(
      z.object({
        title: z.string(),
        objective: z.string(),
        leaderPrep: z.array(z.string()).min(2),
        sessionPlan: SessionSchema,
        takeHomePractice: z.array(z.string()).min(2),
      })
    )
    .min(4),

  leaderTrainingPlan: z.object({
    trainingSessions: z
      .array(
        z.object({
          title: z.string(),
          durationMinutes: z.number().int().min(20).max(180),
          agenda: z.array(z.string()).min(4),
        })
      )
      .min(1),

    coachingNotes: z.array(z.string()).min(4),
  }),

  measurementFramework: z.object({
    inputsToTrack: z.array(z.string()).min(3),
    outcomesToMeasure: z.array(z.string()).min(3),
    simpleRubric: z.array(z.string()).min(3),
  }),
});

const YouthLeaderModuleSchema = z.object({
  activityIntegratedPlan: z.object({
    sessions: z.array(SessionSchema).min(1),
  }),

  activityBank: z
    .array(
      z.object({
        name: z.string(),
        objectiveTie: z.string(),
        setup: z.string(),
        timeMinutes: z.number().int().min(5).max(60),
        debriefQuestions: z.array(z.string()).min(3),
      })
    )
    .min(3),

  leaderNotes: z.object({
    transitions: z.array(z.string()).min(3),
    engagementMoves: z.array(z.string()).min(3),
    guardrails: z.array(z.string()).min(3),
  }),
});

/**
 * Modules object is flexible, but we enforce:
 * - Exactly one module must be present based on header.track
 */
const ModulesSchema = z
  .object({
    teacher: TeacherModuleSchema.optional(),
    pastorLeader: PastorLeaderModuleSchema.optional(),
    youthLeader: YouthLeaderModuleSchema.optional(),
  })
  .superRefine((modules, ctx) => {
    // We can't see header.track here; validation against track happens at the root.
    // This refiner ensures at least one module exists.
    const count =
      (modules.teacher ? 1 : 0) +
      (modules.pastorLeader ? 1 : 0) +
      (modules.youthLeader ? 1 : 0);

    if (count === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "modules must include exactly one of: teacher | pastorLeader | youthLeader",
      });
    }
  });

export const PlaybookSchema = z
  .object({
    header: HeaderSchema,
    overview: OverviewSchema,
    modules: ModulesSchema,
    recommendedResources: z.array(ResourceSchema).min(3).max(6),
  })
  .superRefine((pb, ctx) => {
    const track = pb.header.track;

    const hasTeacher = !!pb.modules.teacher;
    const hasPastor = !!pb.modules.pastorLeader;
    const hasYouth = !!pb.modules.youthLeader;

    const count = (hasTeacher ? 1 : 0) + (hasPastor ? 1 : 0) + (hasYouth ? 1 : 0);

    if (count !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["modules"],
        message: "modules must include exactly one module object",
      });
      return;
    }

    if (track === "Teacher" && !hasTeacher) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["modules", "teacher"],
        message: 'Track is "Teacher" but modules.teacher is missing',
      });
    }

    if (track === "Pastor/Leader" && !hasPastor) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["modules", "pastorLeader"],
        message: 'Track is "Pastor/Leader" but modules.pastorLeader is missing',
      });
    }

    if (track === "Youth Leader" && !hasYouth) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["modules", "youthLeader"],
        message: 'Track is "Youth Leader" but modules.youthLeader is missing',
      });
    }
  });

export type Playbook = z.infer<typeof PlaybookSchema>;
import { z } from "zod";

/* ----------------------------------
   OPTION CONSTANTS
----------------------------------- */

export const RoleOptions = ["Teacher", "Pastor/Leader", "Youth Leader"] as const;
export type Role = (typeof RoleOptions)[number];

export const DesignTypeOptions = [
  "Single Lesson",
  "Multi-Week Series",
  "Quarter Curriculum",
] as const;
export type DesignType = (typeof DesignTypeOptions)[number];

export const TimeHorizonOptions = [
  "Single Session",
  "4–6 Weeks",
  "Quarter/Semester",
] as const;
export type TimeHorizon = (typeof TimeHorizonOptions)[number];

export const AgeGroupOptions = [
  "Children",
  "Students",
  "Adults",
  "Multi-Generational",
] as const;
export type AgeGroup = (typeof AgeGroupOptions)[number];

export const SettingOptions = [
  "Sunday School",
  "Small Group",
  "Youth Gathering",
  "Leadership Training",
  "Midweek Bible Study",
  "Other",
] as const;
export type Setting = (typeof SettingOptions)[number];

export const DurationOptions = [
  "45–60 min",
  "75–90 min",
  "Custom",
] as const;
export type Duration = (typeof DurationOptions)[number];


/* ----------------------------------
   INTAKE SCHEMA (MVP SAFE)
----------------------------------- */

export const IntakeSchema = z.object({
  role: z.enum(RoleOptions),

  designType: z.enum(DesignTypeOptions),

  timeHorizon: z.enum(TimeHorizonOptions),

  ageGroup: z.enum(AgeGroupOptions),

  setting: z.enum(SettingOptions),

  settingDetail: z.string().optional(),

  duration: z.enum(DurationOptions),

  durationCustomMinutes: z.number().int().min(10).max(240).optional(),

  topicOrText: z.string().optional(),

  desiredOutcome: z.string().min(5),

  leaderName: z.string().min(1).optional(),

  groupName: z.string().min(1),

  constraints: z.array(z.string()).optional(),
});

export type Intake = z.infer<typeof IntakeSchema>;


/* ----------------------------------
   BLUEPRINT OUTPUT SCHEMA
----------------------------------- */

export const BlueprintSchema = z.object({
  header: z.object({
    title: z.string(),
    subtitle: z.string().optional(),

    role: z.enum(RoleOptions),

    preparedFor: z.object({
      leaderName: z.string(),
      groupName: z.string(),
    }),

    context: z.object({
      setting: z.enum(SettingOptions).or(z.string()), // allows "Other" detail patterns if needed
      ageGroup: z.enum(AgeGroupOptions).or(z.string()),

      designType: z.enum(DesignTypeOptions).or(z.string()),
      timeHorizon: z.enum(TimeHorizonOptions).or(z.string()),

      durationMinutes: z.number().int().min(10).max(240),

      topicOrText: z.string(),
      constraints: z.array(z.string()).optional(),
    }),
  }),

  overview: z.object({
    executiveSummary: z.string(),

    outcomes: z.object({
      formationGoal: z.string(),
      measurableIndicators: z.array(z.string()).min(3),
    }),

    bloomsObjectives: z
      .array(
        z.object({
          level: z.enum([
            "Remember",
            "Understand",
            "Apply",
            "Analyze",
            "Evaluate",
            "Create",
          ]),
          objective: z.string(),
          evidence: z.string(),
        })
      )
      .length(6),
  }),

  modules: z.object({
    teacher: z.unknown().optional(),
    pastorLeader: z.unknown().optional(),
    youthLeader: z.unknown().optional(),
  }),

  recommendedResources: z
    .array(
      z.object({
        title: z.string(),
        author: z.string(),
        publisher: z.string(),
        amazonUrl: z.string(),
        publisherUrl: z.string(),
        whyThisHelps: z.string(),
      })
    )
    .min(3),
});

export type Blueprint = z.infer<typeof BlueprintSchema>;
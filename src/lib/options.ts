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
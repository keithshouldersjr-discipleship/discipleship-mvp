// -----------------------------
// TRACK OPTIONS
// -----------------------------

export const TrackOptions = [
  "Teacher",
  "Pastor/Leader",
  "Youth Leader",
] as const;

export type Track = (typeof TrackOptions)[number];


// -----------------------------
// NEEDS OPTIONS
// -----------------------------

export const NeedsOptions = [
  "Curriculum",
  "Teaching Plan",
  "Teaching Methods",
  "Leader Training",
  "Itinerary",
] as const;

export type Need = (typeof NeedsOptions)[number];


// -----------------------------
// AGE GROUP OPTIONS
// -----------------------------

export const AgeGroupOptions = [
  "Children",
  "Teens",
  "Young Adults",
  "Adults",
  "Multi-Generational",
] as const;

export type AgeGroup = (typeof AgeGroupOptions)[number];


// -----------------------------
// CONTEXT OPTIONS
// -----------------------------

export const ContextOptions = [
  "Sunday School",
  "Bible Study",
  "Morning Worship",
  "Small Group",
  "Leadership Training",
  "Other",
] as const;

export type Context = (typeof ContextOptions)[number];

// -----------------------------
// GROUP TYPE OPTIONS
// -----------------------------
export const GroupTypeOptions = [
  "Whole Church",
  "Sunday School Class",
  "Small Group",
  "Midweek Bible Study",
  "Leadership Training",
  "Youth Group",
  "Other",
] as const;

export type GroupType = (typeof GroupTypeOptions)[number];

// -----------------------------
// TIME HORIZON OPTIONS
// -----------------------------
export const TimeHorizonOptions = [
  { value: "single", label: "Single Session" },
  { value: "weeks_4_6", label: "4–6 Weeks" },
  { value: "quarter", label: "Quarter/Semester" },
] as const;

export type TimeHorizonValue =
  (typeof TimeHorizonOptions)[number]["value"];

export function timeHorizonLabel(v: TimeHorizonValue) {
  if (v === "single") return "Single Session";
  if (v === "weeks_4_6") return "4–6 Weeks";
  return "Quarter/Semester";
}

// -----------------------------
// CONSTRAINT OPTIONS
// -----------------------------
export const ConstraintOptions = [
  "Limited prep time",
  "Low engagement",
  "Inconsistent attendance",
  "Limited volunteer capacity",
  "Wide range of maturity levels",
  "Limited space / classroom constraints",
  "Needs to be highly interactive",
  "New learners / seekers present",
] as const;

export type Constraint = (typeof ConstraintOptions)[number];
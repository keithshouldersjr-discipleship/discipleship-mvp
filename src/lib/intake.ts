// src/lib/intake.ts
import type { Task } from "@/lib/schema";
import type { Role, DesignType, TimeHorizon } from "@/lib/options";

export function deriveRoleFromTask(task: Task): Role {
  switch (task) {
    case "Teach A Class":
      return "Teacher";
    case "Lead A Workshop":
      return "Pastor/Leader";
    case "Build Curriculum":
      return "Pastor/Leader";
  }
}

export function deriveDesignTypeFromTask(task: Task): DesignType {
  switch (task) {
    case "Teach A Class":
      return "Single Lesson";
    case "Lead A Workshop":
      return "Single Lesson";
    case "Build Curriculum":
      return "Quarter Curriculum";
  }
}

export function requiresTimeHorizon(task: Task): boolean {
  return task === "Build Curriculum";
}

export function defaultTimeHorizon(task: Task): TimeHorizon {
  // used for class/workshop (curriculum must be chosen by user)
  return "Single Session";
}
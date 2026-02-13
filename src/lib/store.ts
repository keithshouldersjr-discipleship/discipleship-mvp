import type { Blueprint } from "./schema";

const blueprints = new Map<string, Blueprint>();

export function getBlueprint(id: string): Blueprint | undefined {
  return blueprints.get(id);
}
import type { Playbook } from "./schema";

const playbooks = new Map<string, Playbook>();

export function getPlaybook(id: string): Playbook | undefined {
  return playbooks.get(id);
}
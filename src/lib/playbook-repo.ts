import "server-only";
import { supabaseServer } from "@/lib/supabase-server";
import type { Intake, Playbook } from "@/lib/schema";

export async function insertPlaybook(intake: Intake, playbook: Playbook) {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("playbooks")
    .insert({ intake, playbook })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function fetchPlaybookById(id: string): Promise<Playbook | null> {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("playbooks")
    .select("playbook")
    .eq("id", id)
    .single();

  if (error) return null;
  return (data?.playbook as Playbook) ?? null;
}
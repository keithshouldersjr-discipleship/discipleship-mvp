import "server-only";
import { supabaseServer } from "@/lib/supabase-server";
import { PlaybookSchema, type Intake, type Playbook } from "@/lib/schema";

/* -----------------------------
   Insert
------------------------------ */

export async function insertPlaybook(
  intake: Intake,
  playbook: Playbook
) {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("playbooks")
    .insert({
      intake,
      playbook, // already validated before calling this
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  return data.id as string;
}

/* -----------------------------
   Fetch (schema-validated)
------------------------------ */

export async function fetchPlaybookById(
  id: string
): Promise<Playbook | null> {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("playbooks")
    .select("playbook")
    .eq("id", id)
    .single();

  if (error || !data?.playbook) {
    return null;
  }

  // 🔒 Critical fix: validate stored JSON
  const parsed = PlaybookSchema.safeParse(data.playbook);

  if (!parsed.success) {
    console.error(
      "Stored playbook failed schema validation:",
      parsed.error.flatten()
    );
    return null; // prevents server crash
  }

  return parsed.data;
}
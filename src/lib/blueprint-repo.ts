import "server-only";
import { supabaseServer } from "@/lib/supabase-server";
import { BlueprintSchema, type Intake, type Blueprint } from "@/lib/schema";

/* -----------------------------
   Insert
------------------------------ */

export async function insertBlueprint(
  intake: Intake,
  blueprint: Blueprint
) {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("blueprints")
    .insert({
      intake,
      blueprint, // already validated before calling this
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  return data.id as string;
}

/* -----------------------------
   Fetch (schema-validated)
------------------------------ */

export async function fetchBlueprintById(
  id: string
): Promise<Blueprint | null> {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("blueprints")
    .select("blueprint")
    .eq("id", id)
    .single();

  if (error || !data?.blueprint) {
    return null;
  }

  // 🔒 Critical fix: validate stored JSON
  const parsed = BlueprintSchema.safeParse(data.blueprint);

  if (!parsed.success) {
    console.error(
      "Stored blueprint failed schema validation:",
      parsed.error.flatten()
    );
    return null; // prevents server crash
  }

  return parsed.data;
}
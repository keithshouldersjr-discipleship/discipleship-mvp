import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";

export default async function Home() {
  // ✅ Auth gate: if no session/user, send them to welcome
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set({ name, value, ...options });
          });
        },
      },
    },
  );

  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/welcome");
  }

  // ✅ Authenticated users see your current homepage
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <Image
          src="/dd-logo.png"
          alt="dd logo"
          width={220}
          height={220}
          priority
        />

        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          Discipleship By Design
        </h1>

        <p className="mt-3 max-w-xl text-lg text-white/80">
          Blueprints for Disciple-Making
        </p>

        <Link
          href="/intake"
          className="mt-10 inline-flex items-center justify-center rounded-full bg-[#e1b369] px-10 py-3 text-black font-semibold tracking-wide transition hover:bg-[#B89A4E]"
        >
          Begin Designing
        </Link>
      </div>
    </main>
  );
}

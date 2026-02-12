import Image from "next/image";
import Link from "next/link";
import { ArrowDown } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">

        <Image
          src="/formatio-logo.png"
          alt="Formatio logo"
          width={220}
          height={220}
          priority
        />

        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          Formatio
        </h1>

        <p className="mt-3 max-w-xl text-lg text-white/80">
          Architecting Discipleship
        </p>

        {/* CTA Button */}
        <Link
          href="/intake"
          className="mt-10 rounded-full bg-yellow-500 px-8 py-3 text-black font-semibold transition hover:bg-yellow-400"
        >
          Begin
        </Link>

        {/* Animated Down Arrow */}
        <ArrowDown
          className="mt-10 animate-bounce text-yellow-500"
          size={28}
        />

      </div>
    </main>
  );
}
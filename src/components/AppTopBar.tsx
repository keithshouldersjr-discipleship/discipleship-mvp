import Image from "next/image";
import Link from "next/link";
import { AppMenu } from "@/components/AppMenu";

export function AppTopBar() {
  return (
    <div className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(250,249,245,0.9)] backdrop-blur">
      <div className="dbd-shell flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="relative h-10 w-10 overflow-hidden rounded-lg border border-[var(--line)] bg-white"
          >
            <Image
              src="/dd-logo.png"
              alt="Blueprint"
              fill
              className="object-contain p-1"
              priority
            />
          </Link>
          <div className="leading-tight">
            <Link
              href="/"
              className="text-sm font-extrabold text-[var(--ink)] hover:text-[var(--forest)]"
            >
              Blueprint
            </Link>
            <a
              href="https://discipleship.design"
              className="block text-xs font-semibold text-[var(--muted)] hover:text-[var(--forest)]"
            >
              by Discipleship by Design
            </a>
          </div>
        </div>

        <AppMenu />
      </div>
    </div>
  );
}

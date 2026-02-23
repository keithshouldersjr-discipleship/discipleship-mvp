// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes
  const publicPaths = [
    "/welcome",
    "/auth/callback",
    "/sign-in",
    "/about",
    "/api",
    "/_next",
    "/favicon.ico",
  ];

  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // ✅ Only protect pages that truly require auth
  // (Leave this empty for now if you want the whole app usable without sign-in)
  const protectedPaths: string[] = [
    // Example later: "/account", "/admin"
  ];

  const isProtected = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  if (!isProtected) return NextResponse.next();

  // If you later add protected paths again, you can add Supabase auth check here.
  const url = req.nextUrl.clone();
  url.pathname = "/sign-in";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that require authentication
const protectedPaths = ["/admin/dashboard", "/admin/dictionary", "/admin/history"];
const authPath = "/admin/login";
const adminBase = "/admin";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only check admin routes
  if (!pathname.startsWith(adminBase)) {
    return NextResponse.next();
  }

  // Allow login page
  if (pathname === authPath) {
    // If already logged in, redirect to dashboard
    const authCookie = request.cookies.get("adminAuth");
    if (authCookie?.value === "true") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Check protected paths
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  if (isProtected) {
    const authCookie = request.cookies.get("adminAuth");
    if (authCookie?.value !== "true") {
      return NextResponse.redirect(new URL(authPath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
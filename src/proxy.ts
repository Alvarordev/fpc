import { type NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, PUBLIC_ROUTES } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const hasLegacyAuth = request.cookies.has(AUTH_COOKIE_NAME);
  const hasSupabaseAuth = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-bkuedfoghoxtuzjazysz-auth-token"))
  const isAuthenticated = hasLegacyAuth || hasSupabaseAuth;

  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};

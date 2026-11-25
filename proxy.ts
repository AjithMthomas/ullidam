import { NextResponse, type NextRequest } from "next/server";

/**
 * Portal guard (Next 16 "proxy", formerly middleware). An optimistic check
 * only: no session cookie on a /portal/* page sends the visitor to sign-in.
 * The real checks (signature, idle limit, session version, clinician
 * scoping) happen on the server in lib/portal/auth.ts for every screen and
 * action. Every portal response is marked never-index and never-cache.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const signedIn = request.cookies.has("ullidam_portal");

  if (pathname !== "/portal" && !signedIn) {
    return withPortalHeaders(NextResponse.redirect(new URL("/portal", request.url)));
  }
  return withPortalHeaders(NextResponse.next());
}

function withPortalHeaders(response: NextResponse) {
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Frame-Options", "DENY");
  return response;
}

export const config = {
  matcher: ["/portal", "/portal/:path+"],
};

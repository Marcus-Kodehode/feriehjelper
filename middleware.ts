import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublic = createRouteMatcher([
  "/",
  "/reiser",
  "/budsjett",
  "/aktiviteter",
  "/konto",
  "/emergency",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/health(.*)",
  "/api/debug(.*)",
  "/favicon.ico",
]);

// VIKTIG: Ikke beskytt API-ruter med Clerk middleware
const isApiRoute = createRouteMatcher(["/api/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // La API-ruter gå gjennom uten redirect - de håndterer auth selv
  if (isApiRoute(req)) {
    return NextResponse.next();
  }

  const { userId } = await auth();

  if (!isPublic(req) && !userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\..*|_next).*)", "/(api|trpc)(.*)"],
};
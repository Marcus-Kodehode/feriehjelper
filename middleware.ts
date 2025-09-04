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

export default clerkMiddleware((auth, req) => {
  const a = (auth as any)();

  if (!isPublic(req) && !a?.userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\..*|_next).*)", "/(api|trpc)(.*)"],
};

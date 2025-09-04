// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublic = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/health(.*)",
  "/api/debug(.*)",
  "/favicon.ico",
]);

export default clerkMiddleware((auth, req) => {
  // Ikke bruk auth().protect() – versjonen din har ikke den metoden
  // Noen typer i v6 roper at auth() er Promise; cast for å slippe støy:
  const a = (auth as any)();

  if (!isPublic(req) && !a?.userId) {
    // Unngå redirectToSignIn – gjør en vanlig redirect
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\..*|_next).*)", "/(api|trpc)(.*)"],
};

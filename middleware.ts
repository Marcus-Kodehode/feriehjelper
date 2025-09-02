// middleware.ts (root)
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  debug: true, // <-- temporary, logs to server console
});

export const config = {
  // match everything except Next static assets and favicon
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

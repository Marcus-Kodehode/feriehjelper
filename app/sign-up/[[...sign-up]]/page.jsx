"use client";
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="grid min-h-screen p-6 place-items-center">
      <SignUp />
    </div>
  );
}

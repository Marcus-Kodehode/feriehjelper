"use client";
import Link from "next/link";
import { useState } from "react";
import { X, Menu } from "lucide-react"; // krever `lucide-react` (installer med: npm install lucide-react)

const navLinks = [
  { href: "/", label: "Dashbord" },
  { href: "/reiser", label: "Reiser" },
  { href: "/budsjett", label: "Budsjett" },
  { href: "/aktiviteter", label: "Aktiviteter" },
  { href: "/konto", label: "Min konto" },
  { href: "/nødinformasjon", label: "Nødinformasjon", danger: true },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger Icon */}
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-white md:hidden"
        aria-label="Open menu"
      >
        <Menu size={28} />
      </button>

      {/* Fullscreen Overlay Menu */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 text-white bg-header">
          <button
            onClick={() => setOpen(false)}
            className="absolute text-white top-4 right-4"
            aria-label="Close menu"
          >
            <X size={32} />
          </button>

          {navLinks.map(({ href, label, danger }) => (
            <Link
              key={href}
              href={href}
              className={`text-xl font-semibold px-4 py-2 rounded ${
                danger ? "bg-red-600 hover:bg-red-700" : "bg-teal-700 hover:bg-teal-600"
              } transition`}
              onClick={() => setOpen(false)} // lukk meny ved klikk
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

import Link from "next/link";

export default function Header() {
  return (
    <header className="shadow-md bg-header text-footerText">
      <div className="flex items-center justify-between max-w-6xl px-6 py-4 mx-auto">
        <h1 className="text-xl font-bold text-primary">
          <Link href="/">Feriehjelper</Link>
        </h1>
        <nav className="flex gap-3">
          {[
            { href: "/", label: "Dashbord" },
            { href: "/reiser", label: "Reiser" },
            { href: "/budsjett", label: "Budsjett" },
            { href: "/aktiviteter", label: "Aktiviteter" },
            { href: "/konto", label: "Min konto" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1 text-sm text-white transition rounded bg-contrast hover:bg-opacity-80"
            >
              {link.label}
            </Link>
          ))}

          {/* Nødinfo i rød stil */}
          <Link
            href="/nødinformasjon"
            className="px-3 py-1 text-sm text-white transition rounded bg-danger hover:bg-red-600"
          >
            Nødinformasjon
          </Link>
        </nav>
      </div>
    </header>
  );
}

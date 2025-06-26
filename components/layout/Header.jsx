import Link from "next/link";

export default function Header() {
  return (
    <header className="px-6 py-4 text-white shadow-md bg-header">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Logo + Tekstlink til forside */}
        <Link href="/" className="flex items-center space-x-2">
          <img
            src="/images/logoT.png"
            alt="Feriehjelper logo"
            className="object-contain w-12 h-12"
          />
          <span className="text-lg font-bold">
            <span className="text-primary">Vacation</span>
            <span className="text-contrast">Helper</span>
          </span>
        </Link>

        {/* Navigasjon */}
        <nav className="flex space-x-2 text-sm font-medium">
          <Link href="/" className="px-3 py-1 text-white rounded bg-contrast hover:opacity-90">
            Dashbord
          </Link>
          <Link href="/reiser" className="px-3 py-1 text-white rounded bg-contrast hover:opacity-90">
            Reiser
          </Link>
          <Link href="/budsjett" className="px-3 py-1 text-white rounded bg-contrast hover:opacity-90">
            Budsjett
          </Link>
          <Link href="/aktiviteter" className="px-3 py-1 text-white rounded bg-contrast hover:opacity-90">
            Aktiviteter
          </Link>
          <Link href="/konto" className="px-3 py-1 text-white rounded bg-contrast hover:opacity-90">
            Min konto
          </Link>
          <Link href="/nødinformasjon" className="px-3 py-1 text-white rounded bg-danger hover:opacity-90">
            Nødinformasjon
          </Link>
        </nav>
      </div>
    </header>
  );
}

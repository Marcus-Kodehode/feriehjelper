import Link from "next/link";

export default function Header() {
  return (
    <header className="px-6 py-4 text-black bg-header">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <h1 className="text-xl font-bold">
          <Link href="/">Feriehjelper</Link>
        </h1>
        <nav className="space-x-4 text-sm font-medium">
          <Link href="/" className="hover:underline">
            Dashbord
          </Link>
          <Link href="/reiser" className="hover:underline">
            Reiser
          </Link>
          <Link href="/budsjett" className="hover:underline">
            Budsjett
          </Link>
          <Link href="/aktiviteter" className="hover:underline">
            Aktiviteter
          </Link>
          <Link href="/nødinformasjon" className="hover:underline">
            Nødinformasjon
          </Link>
          <Link href="/konto" className="hover:underline">
            Min konto
          </Link>
        </nav>
      </div>
    </header>
  );
}

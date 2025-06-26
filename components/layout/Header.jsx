import Link from "next/link";
import Image from "next/image";
import MobileMenu from "./MobileMenu";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 px-4 py-3 shadow-md bg-header">
      <div className="flex items-center justify-between mx-auto max-w-7xl">
        {/* Logo & tekst */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/images/logoT.png"
            alt="VacationHelper Logo"
            width={32}
            height={32}
            className="transition-transform duration-300 group-hover:rotate-6"
          />
          <span className="text-xl font-bold">
            <span className="text-accent">Vacation</span>
            <span className="text-green-400">Helper</span>
          </span>
        </Link>

        {/* PC Nav */}
        <nav className="hidden gap-3 text-sm font-medium md:flex">
          <Link href="/" className="nav-btn">Dashbord</Link>
          <Link href="/reiser" className="nav-btn">Reiser</Link>
          <Link href="/budsjett" className="nav-btn">Budsjett</Link>
          <Link href="/aktiviteter" className="nav-btn">Aktiviteter</Link>
          <Link href="/konto" className="nav-btn">Min konto</Link>
          <Link href="/nødinformasjon" className="bg-red-600 nav-btn hover:bg-red-700">Nødinformasjon</Link>
        </nav>

        {/* Mobilmeny */}
        <MobileMenu />
      </div>
    </header>
  );
}

export default function Footer() {
  return (
    <footer className="px-6 py-6 mt-12 bg-footer text-footerText">
      <div className="max-w-6xl mx-auto space-y-2 text-sm text-center">
        <p>© {new Date().getFullYear()} Feriehjelper. Alle rettigheter reservert.</p>
        <p>
          Laget med <span className="text-primary">Next.js</span> & Tailwind CSS
        </p>
      </div>
    </footer>
  );
}

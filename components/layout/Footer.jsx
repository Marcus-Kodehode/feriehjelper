export default function Footer() {
  return (
    <footer className="bg-footer text-footerText px-6 py-4 text-sm">
      <div className="max-w-6xl mx-auto text-sm text-center space-y-2">
        <p>© {new Date().getFullYear()} Feriehjelper. Alle rettigheter reservert.</p>
        <p>
          Bygget med <span className="text-yellow-300">Next.js</span> & Tailwind CSS
        </p>
      </div>
    </footer>
  );
}

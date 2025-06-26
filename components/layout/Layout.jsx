import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background text-textDark px-4 py-6">
        {children}
      </main>
      <Footer />
    </>
  );
}

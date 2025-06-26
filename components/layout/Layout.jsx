import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main className="min-h-screen px-4 py-6 bg-background text-footerText">
        {children}
      </main>
      <Footer />
    </>
  );
}

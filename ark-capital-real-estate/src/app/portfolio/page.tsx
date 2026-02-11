import Header from "@/components/Header";
import Portfolio from "@/components/Portfolio";
import Footer from "@/components/Footer";

export default function PortfolioPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <Portfolio />
      </main>
      <Footer />
    </>
  );
}

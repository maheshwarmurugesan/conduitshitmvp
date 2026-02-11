import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Strategy from "@/components/Strategy";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ScrollReveal>
          <About />
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <Strategy />
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <Contact />
        </ScrollReveal>
      </main>
      <Footer />
    </>
  );
}

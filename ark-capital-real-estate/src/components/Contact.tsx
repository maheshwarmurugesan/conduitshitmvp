export default function Contact() {
  return (
    <section id="contact" className="py-12 md:py-16 bg-white border-t border-gray-100">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[var(--foreground)] mb-4 tracking-tight border-b border-[var(--foreground)]/10 pb-3 inline-block">
          Contact
        </h2>
        <p className="text-lg text-[var(--foreground-muted)] leading-relaxed mt-4 mb-6">
          Get in touch with us to learn more about our approach to single-family and multifamily real estate across Southern California.
        </p>
        <a
          href="#contact"
          className="inline-block bg-[var(--accent)] text-white px-8 py-3.5 rounded-sm font-medium hover:bg-[var(--accent-hover)] transition-colors duration-200"
        >
          Get in Touch
        </a>
      </div>
    </section>
  );
}

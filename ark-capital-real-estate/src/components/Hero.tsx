"use client";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Landing page image — coastal panorama */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-landing.png')" }}
      />
      {/* Overlay so slogan stays readable */}
      <div className="absolute inset-0 bg-[var(--foreground)]/40" />
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-medium text-white leading-[1.12] tracking-[0.02em] animate-fade-in animate-float drop-shadow-md">
          Breathing New Life Into Communities Across Southern California
        </h1>
      </div>
    </section>
  );
}

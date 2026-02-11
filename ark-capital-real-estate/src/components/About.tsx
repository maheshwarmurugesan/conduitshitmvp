import Image from "next/image";

export default function About() {
  return (
    <section id="about" className="py-12 md:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-start">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[var(--foreground)] mb-6 md:mb-8 tracking-tight border-b border-[var(--foreground)]/10 pb-3">
              About
            </h2>
            <div className="space-y-4 text-[var(--foreground)]">
              <p className="text-lg md:text-xl leading-relaxed">
                Ark Capital Real Estate is a real estate investment firm specializing in the acquisition and repositioning of{" "}
                <strong className="text-[var(--accent)] font-semibold">single-family and multifamily residential properties</strong> across Southern California.
              </p>
              <p className="text-lg leading-relaxed text-[var(--foreground-muted)]">
                We identify underperforming or undervalued real estate assets and enhance them through strategic improvements, operational optimization, and disciplined asset management to create long-term value.
              </p>
              <p className="text-lg leading-relaxed text-[var(--foreground-muted)]">
                Our mission is to identify opportunities where hidden value can be unlocked, improve communities, and create long-term growth for investors and partners. We are committed to combining market expertise with a forward-looking investment approach to ensure each property contributes positively to both investors and surrounding communities.
              </p>
              <p className="text-lg leading-relaxed text-[var(--foreground)] font-medium">
                We believe real estate is more than transactions—it&apos;s about building strong foundations for families, neighborhoods, and investors alike.
              </p>
            </div>
          </div>
          <div className="relative md:sticky md:top-24">
            <div className="aspect-[4/3] relative border border-gray-200 overflow-hidden">
              <Image
                src="/images/about-aerial.png"
                alt="Southern California coastal and suburban communities"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

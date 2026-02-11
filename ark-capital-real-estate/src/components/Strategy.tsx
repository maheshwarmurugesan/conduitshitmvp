export default function Strategy() {
  return (
    <section id="strategy" className="py-12 md:py-16 bg-[#f8fafc] border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[var(--foreground)] mb-6 md:mb-8 tracking-tight border-b border-[var(--foreground)]/10 pb-3">
          Strategy
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-serif text-xl font-semibold text-[var(--foreground)] mb-2">
              Investment approach
            </h3>
            <p className="text-lg leading-relaxed text-[var(--foreground-muted)]">
              We follow a value-add investment strategy: identifying undervalued or underperforming residential assets, acquiring properties with strong repositioning potential, and enhancing them through improvements and management optimization to increase value and generate long-term returns for investors.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-xl font-semibold text-[var(--foreground)] mb-2">
              Core activities
            </h3>
            <ul className="list-none space-y-2 text-[var(--foreground-muted)] text-lg">
              <li className="flex items-center gap-2">
                <span className="h-px w-6 bg-[var(--accent)]" />
                Acquisition of single-family residential properties
              </li>
              <li className="flex items-center gap-2">
                <span className="h-px w-6 bg-[var(--accent)]" />
                Acquisition of multifamily residential properties
              </li>
              <li className="flex items-center gap-2">
                <span className="h-px w-6 bg-[var(--accent)]" />
                Repositioning and renovation of acquired properties
              </li>
              <li className="flex items-center gap-2">
                <span className="h-px w-6 bg-[var(--accent)]" />
                Operational improvement and efficiency optimization
              </li>
              <li className="flex items-center gap-2">
                <span className="h-px w-6 bg-[var(--accent)]" />
                Long-term asset management
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-serif text-xl font-semibold text-[var(--foreground)] mb-2">
              Value proposition
            </h3>
            <p className="text-lg leading-relaxed text-[var(--foreground-muted)]">
              Ark Capital creates value by transforming underutilized residential properties into higher-performing real estate assets. We leverage market knowledge, strategic improvements, and operational efficiency to enhance both financial performance and community impact.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

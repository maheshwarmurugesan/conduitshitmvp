import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="py-5 bg-[var(--foreground)] text-white">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <a href="/">
          <Logo variant="dark" width={280} height={64} className="h-14 md:h-16" />
        </a>
        <div className="flex gap-6">
          <a href="/#about" className="hover:text-[var(--accent-light)] transition-colors">About</a>
          <a href="/#strategy" className="hover:text-[var(--accent-light)] transition-colors">Strategy</a>
          <a href="/portfolio" className="hover:text-[var(--accent-light)] transition-colors">Portfolio</a>
          <a href="/team" className="hover:text-[var(--accent-light)] transition-colors">Team</a>
          <a href="/#contact" className="hover:text-[var(--accent-light)] transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="premium-bg">
        {/* Hero / Proof First */}
        <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 pt-24 pb-20 max-w-4xl mx-auto">
          <p className="text-sm tracking-[0.3em] uppercase text-silver mb-6 font-medium">
            Be one of the next
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.08] tracking-tight max-w-4xl text-white">
            <span className="block">27+ into Ross.</span>
            <span className="block mt-2">50+ into Michigan.</span>
            <span className="block mt-2">5 into Top 10.</span>
          </h1>
          <p className="mt-8 text-lg sm:text-xl text-zinc-400 max-w-2xl leading-relaxed font-light">
            Selective 1:1 mentorship. Essays, strategy, Common App, and college planning. Access to a bank of essays from previous batches. Only 20 students per cohort.
          </p>
          <div className="mt-16 flex flex-wrap gap-x-12 gap-y-6 justify-center">
            <div>
              <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">27+</div>
              <div className="text-sm text-silver mt-0.5 tracking-wide">into Ross</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">50+</div>
              <div className="text-sm text-silver mt-0.5 tracking-wide">into Michigan</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">5</div>
              <div className="text-sm text-silver mt-0.5 tracking-wide">into Top 10</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">3M+</div>
              <div className="text-sm text-silver mt-0.5 tracking-wide">views on college content</div>
            </div>
          </div>
          <div className="mt-16">
            <Link
              href="/apply"
              className="apply-btn inline-flex items-center justify-center h-14 px-10 rounded-full bg-gradient-to-br from-white to-zinc-100 text-black text-sm font-medium tracking-wide hover:brightness-95 transition-colors"
            >
              Apply Now
            </Link>
          </div>
        </section>

        {/* What This Is */}
        <section id="what" className="py-24 px-6 border-t border-white/10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-8 tracking-tight text-white">What This Is</h2>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Mahesh College Counseling is 1:1 mentorship for essays, extracurricular strategy, Common App formatting, competitions, and college planning. You get access to a bank of essays from previous batches as reference. Support from someone who&apos;s done it.
            </p>
          </div>
        </section>

        {/* Exclusivity Section */}
        <section className="py-24 px-6 border-t border-white/10" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(192,192,192,0.03) 100%)' }}>
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-3xl sm:text-4xl font-bold leading-tight mb-4 text-white">
              Only 20 students accepted per cohort
            </p>
            <p className="text-2xl sm:text-3xl font-bold leading-tight mb-4 text-silver">
              300+ currently on the waitlist
            </p>
            <p className="text-xl font-medium text-zinc-400">
              Application required
            </p>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-6 border-t border-white/10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-4 tracking-tight text-white">How much does this cost?</h2>
            <div className="text-5xl sm:text-6xl font-semibold tracking-tight text-white">$1,000</div>
            <p className="text-silver mt-2 font-light">Base price. You pay this now and are covered until college apps.</p>
            <p className="text-zinc-500 mt-3 text-sm">
              Each supplemental essay is $75 (start to finish). Total on top of base depends on your college list.
            </p>
          </div>
        </section>

        {/* Why $1,000 Section */}
        <section className="py-24 px-6 border-t border-white/10" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(192,192,192,0.03) 100%)' }}>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-6 tracking-tight text-white">Why $1,000</h2>
            <p className="text-zinc-400 mb-8 leading-relaxed">
              This is exclusive. Only 20 students per cohort. I spend a lot of time with each of you: 1:1 calls, your personal number, real attention. One year of support from the date of purchase. I help you get ahead so you feel more free and less stressed when application season hits.
            </p>
            <ul className="space-y-4 text-zinc-300 text-left inline-block">
              <li className="flex gap-3">
                <span className="text-silver font-medium">•</span>
                Getting started prepping for the Common App
              </li>
              <li className="flex gap-3">
                <span className="text-silver font-medium">•</span>
                Building and refining your college list
              </li>
              <li className="flex gap-3">
                <span className="text-silver font-medium">•</span>
                How to prep and get ahead for college apps
              </li>
              <li className="flex gap-3">
                <span className="text-silver font-medium">•</span>
                Direct 1:1 access, personal number, bookable calls
              </li>
              <li className="flex gap-3">
                <span className="text-silver font-medium">•</span>
                Bank of essays from previous batches for reference
              </li>
              <li className="flex gap-3">
                <span className="text-silver font-medium">•</span>
                Small cohort, priority treatment
              </li>
            </ul>
            <p className="text-zinc-500 mt-8 text-sm">
              Each supplemental essay is $75 (start to finish). Total on top of base depends on your college list.
            </p>
          </div>
        </section>

        {/* Transparency Section */}
        <section className="py-24 px-6 border-t border-white/10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-8 tracking-tight text-white">Where the money goes</h2>
            <p className="text-lg text-zinc-400 leading-relaxed text-left">
              Fees are reinvested into content production, travel to support founders at events, and early-stage investing. This is not lifestyle spending. Funds are used to build long-term professional leverage, expand the network students benefit from, and improve the quality of support offered.
            </p>
          </div>
        </section>

        {/* Application Section CTA */}
        <section className="py-24 px-6 border-t border-white/10" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(192,192,192,0.03) 100%)' }}>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-6 text-white">Ready to apply?</h2>
            <p className="text-zinc-400 mb-8">
              Complete the application. Selected students will be contacted.
            </p>
            <Link
              href="/apply"
              className="apply-btn inline-flex items-center justify-center h-12 px-8 rounded-full bg-gradient-to-br from-white to-zinc-100 text-black text-sm font-medium hover:brightness-95 transition-colors"
            >
              Start Application
            </Link>
          </div>
        </section>

        {/* Debating to committing */}
        <section id="shaky" className="py-24 px-6 border-t border-white/10" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(192,192,192,0.03) 100%)' }}>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-4 text-white">Debating to committing but a little shaky?</h2>
            <p className="text-zinc-400 mb-8">
              Message me on Instagram. You can book calls and communicate through there. I&apos;m very responsive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="https://instagram.com/maheshbusiness_"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-12 px-8 border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-colors rounded-full"
              >
                Contact on Instagram
              </Link>
              <Link
                href="mailto:maheshwarmurugesan@gmail.com"
                className="inline-flex items-center justify-center h-12 px-8 border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-colors rounded-full"
              >
                Email
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 px-6 border-t border-white/10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-12 tracking-tight text-white">FAQ</h2>
            <div className="space-y-12 text-left">
              <div>
                <h3 className="font-medium mb-2 text-white">How does pricing work?</h3>
                <p className="text-zinc-400">
                  $1,000 is the base price you pay now. It covers everything until college apps: Common App prep, building your college list, getting ahead so you feel less stressed. Each supplemental essay is $75 (start to finish). How many supplementals you have depends on your college list, so the total on top of the base is tailored to you.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-white">Who is this for?</h3>
                <p className="text-zinc-400">
                  High-achieving students or highly motivated students willing to make up with effort in their application, Class of 2027 or younger, who want 1:1 guidance on college admissions, essays, extracurricular strategy, and application strategy.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-white">Who is this not for?</h3>
                <p className="text-zinc-400">
                  Students looking for general tutoring or a high-volume counseling service. This is selective 1:1 mentorship.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-white">Refund policy</h3>
                <p className="text-zinc-400">
                  Full refund within 7 days of payment if you have not yet had your first call. After the first call, no refunds.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-white">Admissions disclaimer</h3>
                <p className="text-zinc-400">
                  Mahesh College Counseling does not guarantee admission to any school or program. Past results do not guarantee future outcomes. Mentorship improves your application. It does not replace your work.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-white/10">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-silver">Mahesh College Counseling</p>
            <div className="flex gap-6">
              <Link href="/apply" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Apply
              </Link>
              <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Login
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}

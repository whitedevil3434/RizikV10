import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-[#F5F2EB]">
        {/* Background gradient orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#031E49]/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#00B16A]/10 rounded-full blur-[100px] -z-10" />

        <div className="max-w-4xl mx-auto px-4 text-center z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#031E49]/5 border border-[#031E49]/10 mb-8">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B16A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00B16A]"></span>
            </span>
            <span className="text-xs font-semibold text-[#031E49]/70">Phase 1: Empire Consolidation Active</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-[#031E49]">
            Engineering the Future of <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B16A] to-emerald-600">
              Eco-Tech & Food Safety
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[#0A2D6C]/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            Rizik Global is the architectural nexus bridging sustainable manufacturing with God-tier Active Packaging. We don't just innovate; we dominate.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link
              href="/store"
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-[#031E49] rounded-full hover:bg-[#0A2D6C] shadow-lg hover:shadow-xl"
            >
              Browse E-Commerce
              <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/bio-shield"
              className="inline-flex items-center justify-center px-8 py-4 font-bold text-[#031E49] transition-all duration-200 bg-white border-2 border-[#031E49]/20 rounded-full hover:border-[#031E49]/40 hover:bg-white/80"
            >
              Explore Bio-Shield Tech
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy / Value Prop Section */}
      <section className="w-full py-24 bg-white border-t border-[#031E49]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#031E49] mb-4">The Three Pillars of Rizik Global</h2>
            <p className="text-[#0A2D6C]/60 max-w-2xl mx-auto">Our holding company operates across three core verticals, each designed to dominate its respective market.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-8 rounded-3xl bg-[#F5F2EB] border border-[#031E49]/10 hover:border-[#00B16A]/30 transition-all group hover:shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-[#031E49]/10 flex items-center justify-center mb-6 group-hover:bg-[#031E49]/20 transition-colors">
                <svg className="w-6 h-6 text-[#031E49]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#031E49] mb-3">Bio-Shield Poly-Tech</h3>
              <p className="text-[#0A2D6C]/60 leading-relaxed">
                The Triple-Layer Sandwich membrane. Our proprietary Chitosan/Collagen filter matrix allows perishables to breathe while locking out oxidation. 1-year shelf life under Retort (121°C).
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-8 rounded-3xl bg-[#F5F2EB] border border-[#031E49]/10 hover:border-[#00B16A]/30 transition-all group hover:shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-[#031E49]/10 flex items-center justify-center mb-6 group-hover:bg-[#031E49]/20 transition-colors">
                <svg className="w-6 h-6 text-[#031E49]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#031E49] mb-3">Global B2B Logistics</h3>
              <p className="text-[#0A2D6C]/60 leading-relaxed">
                Direct distribution to mosques, corporate events, and agro-processors. Our internal Portal connects "Rizik Force" elements to immediate market demands with real-time tracking.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-8 rounded-3xl bg-[#F5F2EB] border border-[#031E49]/10 hover:border-[#00B16A]/30 transition-all group hover:shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-[#00B16A]/10 flex items-center justify-center mb-6 group-hover:bg-[#00B16A]/20 transition-colors">
                <svg className="w-6 h-6 text-[#00B16A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#031E49] mb-3">Community Economics</h3>
              <p className="text-[#0A2D6C]/60 leading-relaxed">
                Empowering rural networks (Barishal base) by decentralizing production. From bespoke Mosque prints to Ramadan Glow-in-the-Dark series—engineered for localized mass scaling.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

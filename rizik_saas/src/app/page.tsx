import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Background 3D Motion Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none z-0"
        >
          <source src="/rizik_3d_bg.mp4" type="video/mp4" />
        </video>

        <div className="max-w-4xl mx-auto px-4 text-center z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#031E49]/5 border border-[#031E49]/10 mb-8">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B16A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00B16A]"></span>
            </span>
            <span className="text-xs font-semibold text-[#031E49]/70">Integrated Manufacturing and Supply Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-[#031E49]">
            Engineering the Future of <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B16A] to-emerald-600">
              Eco-Tech & Food Safety
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[#0A2D6C]/75 mb-10 max-w-2xl mx-auto leading-relaxed">
            Rizik Global unifies sustainable manufacturing, advanced packaging, and enterprise distribution under one operating standard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link
              href="/b2b"
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-[#031E49] rounded-full hover:bg-[#0A2D6C] shadow-lg hover:shadow-xl"
            >
              Enter B2B
              <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/fair"
              className="inline-flex items-center justify-center px-8 py-4 font-bold text-[#031E49] transition-all duration-200 bg-[#00B16A]/10 border-2 border-[#00B16A]/30 rounded-full hover:bg-[#00B16A]/20"
            >
              Join Rizik Fair
            </Link>

            <Link
              href="/clink"
              className="inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-[#00A150] rounded-full hover:bg-[#008F42] shadow-lg hover:shadow-xl"
            >
              Open C-Link
            </Link>
          </div>
        </div>
      </section>

      <section className="w-full py-16 bg-white border-t border-[#031E49]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-[#031E49]/10 bg-[#F5F2EB] p-8 md:p-10">
            <p className="text-xs uppercase tracking-[0.14em] text-[#00784D] font-semibold">Launch Campaign</p>
            <h2 className="mt-3 text-3xl font-bold text-[#031E49]">Rizik Fair: Department War + Squad Workforce Entry</h2>
            <p className="mt-4 max-w-3xl text-sm md:text-base text-[#0A2D6C]/70">
              Label QR scans now route participants to fair onboarding, task dashboards, countdown tracking, and
              department-level competition with sponsor and gift-hamper rewards.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/fair" className="px-5 py-2.5 rounded-full bg-[#031E49] text-white text-sm font-bold hover:bg-[#0A2D6C]">
                Open Fair Landing
              </Link>
              <Link href="/community" className="px-5 py-2.5 rounded-full border border-[#031E49]/15 bg-white text-[#031E49] text-sm font-bold hover:bg-[#F5F2EB]">
                View Community Feed
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Subsidiaries Section */}
      <section className="w-full py-24 bg-white border-t border-[#031E49]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#031E49] mb-4">Operations & Subsidiaries</h2>
            <p className="text-[#0A2D6C]/75 max-w-2xl mx-auto">The Rizik Global ecosystem operates across specialized units, unified by automated logistics and eco-tech compliance.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {/* Rizik Textile (Hero) */}
            <div className="p-8 rounded-3xl bg-[#F5F2EB] border border-[#00B16A]/20 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4">
                <span className="px-2 py-1 rounded bg-[#00B16A]/10 text-[#00B16A] text-[10px] font-bold uppercase tracking-wider">Flagship</span>
              </div>
              <h3 className="text-xl font-bold text-[#031E49] mb-3">Rizik Textile</h3>
              <p className="text-[#0A2D6C]/75 text-sm leading-relaxed mb-6">
                Redefining woven tech for enterprise textile manufacturing, precision fabrication, and institutional supply chains.
              </p>
              <Link href="/b2b" className="text-sm font-bold text-[#00B16A] hover:underline">Explore B2B Intake →</Link>
            </div>

            {/* Rizik Bio-Tech */}
            <div className="p-8 rounded-3xl bg-white border border-[#031E49]/10 hover:border-[#031E49]/20 transition-all">
              <h3 className="text-xl font-bold text-[#031E49] mb-3">Rizik Bio-Tech</h3>
              <p className="text-[#0A2D6C]/75 text-sm leading-relaxed">
                Biomaterial research and organic structural integrity. Operating in stealth to develop next-gen alternatives to plastic and synthetic fibers. [Classified]
              </p>
            </div>

            {/* Rizik Tech */}
            <div className="p-8 rounded-3xl bg-white border border-[#031E49]/10 hover:border-[#031E49]/20 transition-all flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#031E49] mb-3">Rizik Tech</h3>
                <p className="text-[#0A2D6C]/75 text-sm leading-relaxed mb-4">
                  The digital nervous system of the ecosystem. Managed cloud logistics, Squad tracking engines, and automated order fulfillment systems.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#00B16A] uppercase tracking-widest">Active Product: </span>
                <Link href="/trust" className="text-xs font-bold text-[#031E49] hover:text-[#00B16A] transition-colors">Rizik Tech Ops ↓</Link>
              </div>
            </div>

            {/* C-Link */}
            <div className="p-8 rounded-3xl bg-[#F9F9F9] border border-[#00A150]/25 hover:border-[#00A150]/50 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#00A150] text-sm font-bold text-white">C</span>
                  <h3 className="text-xl font-bold text-[#031E49]">C-Link</h3>
                </div>
                <p className="text-[#0A2D6C]/75 text-sm leading-relaxed mb-5">
                  A private coordination workspace that shows what should happen, which capability can make it happen, what was assigned, and what actually happened.
                </p>
              </div>
              <Link href="/clink" className="text-sm font-bold text-[#008F42] hover:underline">Open C-Link →</Link>
            </div>

            {/* Rizik Cloud Kitchen (Upcoming) */}
            <div className="p-8 rounded-3xl bg-white border border-[#031E49]/10 hover:border-[#031E49]/20 transition-all opacity-80 border-dashed">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-bold text-[#031E49]">Rizik Cloud Kitchen</h3>
                <span className="px-2 py-0.5 rounded bg-[#031E49]/5 text-[#031E49]/60 text-[8px] font-bold uppercase tracking-wider">Upcoming</span>
              </div>
              <p className="text-[#0A2D6C]/75 text-sm leading-relaxed">
                Reinventing food safety through tech-integrated preparation and traceable supply chains. Initial deployment phase scheduled for Q4.
              </p>
            </div>

            {/* Rizik Manufacturing */}
            <div className="p-8 rounded-3xl bg-white border border-[#031E49]/10 hover:border-[#031E49]/20 transition-all">
              <h3 className="text-xl font-bold text-[#031E49] mb-3">Rizik Manufacturing</h3>
              <p className="text-[#0A2D6C]/75 text-sm leading-relaxed">
                Decentralized production nodes empowering local labor through standardized assembly, high-precision tooling, and global quality control.
              </p>
            </div>

            {/* Rizik Writer (disabled) */}
            <div className="p-8 rounded-3xl bg-[#031E49] border border-[#00B16A]/30 shadow-xl relative overflow-hidden group transition-all">
              <div className="absolute top-0 right-0 p-4">
                <span className="px-2 py-1 rounded bg-[#00B16A] text-white text-[10px] font-bold uppercase tracking-wider">Under Upgrade</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 flex flex-wrap items-center gap-2">
                Rizik Writer
                <span className="text-[9px] bg-white/10 px-2 py-1 rounded text-white/80 uppercase tracking-tighter">PRODUCT OF RIZIK TECH</span>
              </h3>
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                Rizik Writer is temporarily offline while we complete a broader platform consolidation.
              </p>
              <span className="inline-flex items-center text-sm font-bold text-[#00B16A]/70">
                Service paused
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";

const subsidiaries = [
  {
    name: "Rizik Textile",
    endorsed: "by Rizik Global",
    focus: "Advanced textile manufacturing and precision fabrication. First hero product: Rizik EcoMat.",
    href: "/store",
    stage: "Commercial",
    color: "from-[#031E49] to-[#0A2D6C]",
  },
  {
    name: "Rizik Bio Tech",
    endorsed: "by Rizik Global",
    focus: "Classified biomaterial research and organic structural engineering. Operating in stealth.",
    href: "#",
    stage: "Stealth",
    color: "from-[#00B16A] to-emerald-600",
  },
  {
    name: "Rizik Tech",
    endorsed: "by Rizik Global",
    focus: "Ecosystem software, AI workforce integration, and enterprise infrastructure.",
    href: "#",
    stage: "Scaling",
    color: "from-[#111111] to-[#333333]",
  },
  {
    name: "Rizik Cloud Kitchen",
    endorsed: "by Rizik Global",
    focus: "Hyper-local decentralized scalable food operations and automated culinary nodes.",
    href: "#",
    stage: "Upcoming",
    color: "from-[#b53c12] to-[#de5d31]",
  },
  {
    name: "Rizik Manufacturing",
    endorsed: "by Rizik Global",
    focus: "Heavy machinery, smart factory orchestration, and automation integration.",
    href: "#",
    stage: "Stealth",
    color: "from-[#454545] to-[#676767]",
  },
  {
    name: "Rizik B2B Ops",
    endorsed: "by Rizik Global",
    focus: "Procurement, logistics, and enterprise account operations.",
    href: "/b2b",
    stage: "Operational",
    color: "from-[#062d73] to-[#031E49]",
  },
];

export default function SubsidiariesPage() {
  return (
    <div className="min-h-screen bg-[#F5F2EB]">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <p className="inline-flex px-4 py-1.5 rounded-full bg-[#031E49]/5 border border-[#031E49]/10 text-xs font-semibold text-[#031E49]/70">
          Brand and Operating Structure
        </p>

        <h1 className="mt-6 text-4xl md:text-5xl font-bold text-[#031E49]">
          Rizik Global + Endorsed Subsidiaries
        </h1>
        <p className="mt-4 max-w-3xl text-[#0A2D6C]/70">
          Rizik Global operates an endorsed brand system where each subsidiary runs its own business model while governance, trust, and quality flow from the holding company.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {subsidiaries.map((item) => (
            <article key={item.name} className="rounded-3xl border border-[#031E49]/10 overflow-hidden bg-white shadow-sm">
              <div className={`h-2 bg-gradient-to-r ${item.color}`} />
              <div className="p-6">
                <p className="text-xs uppercase tracking-[0.14em] text-[#0A2D6C]/50 font-semibold">{item.endorsed}</p>
                <h2 className="mt-2 text-2xl font-bold text-[#031E49]">{item.name}</h2>
                <p className="mt-4 text-sm leading-relaxed text-[#0A2D6C]/70">{item.focus}</p>

                <div className="mt-6 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#031E49]/5 text-[#031E49]">{item.stage}</span>
                  <Link href={item.href} className="text-sm font-bold text-[#00B16A] hover:text-emerald-700">
                    Open Unit
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-[#031E49]/10 bg-white p-6 md:p-8">
          <h3 className="text-xl font-bold text-[#031E49]">Ecosystem Navigation</h3>
          <p className="mt-3 text-sm text-[#0A2D6C]/70">
            Every subsidiary page includes reciprocal links to Global, Impact, and Trust to keep discovery structured across the ecosystem.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/" className="px-4 py-2 rounded-full bg-[#031E49] text-white text-sm font-semibold">Global Home</Link>
            <Link href="/impact" className="px-4 py-2 rounded-full bg-white border border-[#031E49]/15 text-[#031E49] text-sm font-semibold">Impact Dashboard</Link>
            <Link href="/trust" className="px-4 py-2 rounded-full bg-white border border-[#031E49]/15 text-[#031E49] text-sm font-semibold">Trust Layer</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";

const impactStats = [
  { label: "Rural Production Jobs", value: "1,240", note: "+18% YoY" },
  { label: "Women Workforce", value: "62%", note: "Target: 70%" },
  { label: "Local Sourcing Ratio", value: "78%", note: "Barishal-led" },
  { label: "Partner MSMEs", value: "96", note: "Supply chain nodes" },
];

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-[#F5F2EB]">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <p className="inline-flex px-4 py-1.5 rounded-full bg-[#00B16A]/10 border border-[#00B16A]/20 text-xs font-semibold text-[#00B16A]">
          Social Impact Dashboard
        </p>
        <h1 className="mt-6 text-4xl md:text-5xl font-bold text-[#031E49]">
          Inclusive Growth Metrics
        </h1>
        <p className="mt-4 max-w-3xl text-[#0A2D6C]/70">
          Ecosystem impact across livelihoods, women-led participation, and decentralized local sourcing.
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {impactStats.map((stat) => (
            <article key={stat.label} className="bg-white border border-[#031E49]/10 rounded-2xl p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">{stat.label}</p>
              <p className="mt-3 text-4xl font-bold text-[#031E49]">{stat.value}</p>
              <p className="mt-2 text-xs font-semibold text-[#00B16A]">{stat.note}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <article className="bg-white border border-[#031E49]/10 rounded-3xl p-7 shadow-sm">
            <h2 className="text-2xl font-bold text-[#031E49]">Community Outcomes</h2>
            <ul className="mt-5 space-y-3 text-sm text-[#0A2D6C]/75">
              <li>Primary manufacturing clusters: Barishal and surrounding rural nodes.</li>
              <li>Women-led quality and packaging pods integrated into daily output.</li>
              <li>Faith-centered event logistics enabling predictable seasonal income.</li>
            </ul>
          </article>

          <article className="bg-[#031E49] rounded-3xl p-7 shadow-sm">
            <h2 className="text-2xl font-bold text-[#F5F2EB]">Trust + Traceability</h2>
            <p className="mt-4 text-sm text-[#F5F2EB]/75">
              Certifications, lot traceability, and product-chain verification are published in the trust layer.
            </p>
            <Link href="/trust" className="inline-flex mt-6 px-5 py-2.5 rounded-full bg-[#F5F2EB] text-[#031E49] font-bold text-sm">
              Open Trust Layer
            </Link>
          </article>
        </div>
      </section>
    </div>
  );
}

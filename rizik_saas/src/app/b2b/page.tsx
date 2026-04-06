import Link from "next/link";

const solutionCards = [
  {
    title: "Institutional Procurement",
    details: "Structured supply for mosques, schools, NGOs, and enterprise buyers with contract-based pricing.",
  },
  {
    title: "Private Label and Packaging",
    details: "Custom brand programs for active packaging and eco-product lines with quality checkpoints.",
  },
  {
    title: "Distribution and Fulfillment",
    details: "Coordinated dispatch planning, order tracking, and batch-level visibility for bulk orders.",
  },
];

export default function B2BPage() {
  return (
    <div className="min-h-screen bg-[#F5F2EB]">
      <section className="border-b border-[#031E49]/10 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="inline-flex rounded-full border border-[#031E49]/10 bg-[#031E49]/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#031E49]/60">
            Enterprise
          </p>
          <h1 className="mt-5 text-4xl font-bold text-[#031E49] md:text-5xl">Rizik B2B Solutions</h1>
          <p className="mt-4 max-w-3xl text-lg text-[#0A2D6C]/65">
            Public-facing enterprise offering for large organizations. Operations dashboards remain restricted to authorized portal users.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {solutionCards.map((card) => (
            <article key={card.title} className="rounded-3xl border border-[#031E49]/10 bg-white p-7 shadow-sm">
              <h2 className="text-xl font-bold text-[#031E49]">{card.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#0A2D6C]/70">{card.details}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#031E49] p-10 text-center">
          <h3 className="text-2xl font-bold text-[#F5F2EB]">Need a Commercial Quote?</h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#F5F2EB]/70">
            Share required volume, timeline, and compliance requirements. Our enterprise team will return a proposal.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/b2b/inquiry"
              className="rounded-full bg-[#F5F2EB] px-8 py-4 text-sm font-bold text-[#031E49] transition-all hover:bg-white active:scale-95 flex items-center gap-2 shadow-lg"
            >
              Start Commercial Inquiry
            </Link>
            <Link
              href="/subsidiaries"
              className="rounded-full border border-[#F5F2EB]/30 px-6 py-4 text-sm font-bold text-[#F5F2EB] transition-colors hover:bg-white/10"
            >
              View Ecosystem
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

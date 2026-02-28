const certifications = [
  "Food-contact polymer safety declaration",
  "High-heat resistance validation protocol",
  "Batch-level QA + dispatch sign-off",
  "Supplier onboarding compliance checklist",
];

const traceabilitySteps = [
  { step: "Source", detail: "Raw polymer + additive intake with supplier lot IDs." },
  { step: "Manufacture", detail: "Production batch mapping with time, pod, and operator reference." },
  { step: "QA", detail: "Barrier integrity, thickness, and retort simulation outcomes." },
  { step: "Dispatch", detail: "QR-linked shipment record and receiving confirmation." },
];

export default function TrustPage() {
  return (
    <div className="min-h-screen bg-[#F5F2EB]">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <p className="inline-flex px-4 py-1.5 rounded-full bg-[#031E49]/5 border border-[#031E49]/10 text-xs font-semibold text-[#031E49]/70">
          Trust Layer
        </p>

        <h1 className="mt-6 text-4xl md:text-5xl font-bold text-[#031E49]">
          Certifications + Supply Chain Traceability
        </h1>
        <p className="mt-4 max-w-3xl text-[#0A2D6C]/70">
          This layer standardizes how Rizik demonstrates quality, safety, and accountability across subsidiaries.
        </p>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <article className="bg-white border border-[#031E49]/10 rounded-3xl p-7 shadow-sm">
            <h2 className="text-2xl font-bold text-[#031E49]">Certification Stack</h2>
            <ul className="mt-5 space-y-3 text-sm text-[#0A2D6C]/75">
              {certifications.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#00B16A]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="bg-white border border-[#031E49]/10 rounded-3xl p-7 shadow-sm">
            <h2 className="text-2xl font-bold text-[#031E49]">Traceability Chain</h2>
            <div className="mt-5 space-y-3">
              {traceabilitySteps.map((item) => (
                <div key={item.step} className="rounded-xl border border-[#031E49]/10 px-4 py-3 bg-[#F5F2EB]/60">
                  <p className="text-sm font-bold text-[#031E49]">{item.step}</p>
                  <p className="mt-1 text-xs text-[#0A2D6C]/70">{item.detail}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

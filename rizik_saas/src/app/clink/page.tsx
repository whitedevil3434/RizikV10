import Link from "next/link";

export default function CLinkPage() {
  const configuredClinkUrl = process.env.NEXT_PUBLIC_CLINK_URL;
  const clinkUrl = configuredClinkUrl && !configuredClinkUrl.includes("localhost")
    ? configuredClinkUrl
    : "https://clink-web-5wx.pages.dev";

  return (
    <main className="min-h-screen bg-[#F9F9F9] px-6 py-20 text-[#1D1D1F]">
      <section className="mx-auto max-w-3xl rounded-3xl border border-[#E5E5EA] bg-white p-8 shadow-sm md:p-12">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#00A150] text-xl font-bold text-white">C</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6E6E73]">Rizik Global subsidiary</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#1D1D1F]">C-Link</h1>
          </div>
        </div>

        <p className="mt-8 max-w-2xl text-lg leading-8 text-[#6E6E73]">
          A private business coordination workspace that makes expectations, capabilities, assignments, evidence, outcomes, and blocked work visible between authorized counterparties.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href={clinkUrl} className="inline-flex items-center rounded-xl bg-[#00A150] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#008F42]">
            Open C-Link platform
          </a>
          <Link href="/subsidiaries" className="inline-flex items-center rounded-xl border border-[#D8D8DD] px-5 py-3 text-sm font-semibold text-[#1D1D1F] hover:bg-[#F9F9F9]">
            Back to subsidiaries
          </Link>
        </div>

        <p className="mt-6 text-xs leading-6 text-[#6E6E73]">
          C-Link is independently operated from Rizik marketplace, wallet, khata, kitchen, rider, and other legacy business modules. Rizik Global provides the brand context; C-Link does not publish ratings, declare automatic truth, or replace ERP systems.
        </p>
      </section>
    </main>
  );
}

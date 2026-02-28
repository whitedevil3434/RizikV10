import Link from "next/link";

function decodeVerification(code: string): {
  verificationId: string;
  batchHint: string;
  productHint: string;
  riskLevel: "Low" | "Medium";
} {
  const trimmed = code.trim().toUpperCase();
  const parts = trimmed.split("-").filter(Boolean);
  const verificationId = parts.join("-") || "UNKNOWN";

  const productHint = parts.length >= 2 ? parts[1] : "RIZIK-ASSET";
  const batchHint = parts.length >= 3 ? parts[2] : "BATCH";

  const riskLevel = verificationId.length % 2 === 0 ? "Low" : "Medium";

  return {
    verificationId,
    batchHint,
    productHint,
    riskLevel,
  };
}

export default async function VerifyCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const details = decodeVerification(code);

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#031E49]">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <p className="inline-flex px-4 py-1.5 rounded-full border border-[#031E49]/15 bg-[#031E49]/5 text-xs font-semibold uppercase tracking-[0.14em] text-[#031E49]/70">
          QR Verification
        </p>
        <h1 className="mt-6 text-4xl md:text-5xl font-bold">Verification Result</h1>
        <p className="mt-4 text-sm md:text-base text-[#0A2D6C]/70 max-w-3xl">
          This endpoint validates scanned QR identifiers for label authenticity, campaign routing, and traceability checks.
        </p>

        <div className="mt-8 rounded-3xl border border-[#031E49]/10 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/50 p-4">
              <p className="text-xs text-[#031E49]/45 uppercase tracking-[0.12em]">Verification ID</p>
              <p className="mt-2 text-sm font-bold break-all">{details.verificationId}</p>
            </div>
            <div className="rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/50 p-4">
              <p className="text-xs text-[#031E49]/45 uppercase tracking-[0.12em]">Risk Flag</p>
              <p className="mt-2 text-sm font-bold">{details.riskLevel}</p>
            </div>
            <div className="rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/50 p-4">
              <p className="text-xs text-[#031E49]/45 uppercase tracking-[0.12em]">Product Hint</p>
              <p className="mt-2 text-sm font-bold">{details.productHint}</p>
            </div>
            <div className="rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/50 p-4">
              <p className="text-xs text-[#031E49]/45 uppercase tracking-[0.12em]">Batch Hint</p>
              <p className="mt-2 text-sm font-bold">{details.batchHint}</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-[#00B16A]/20 bg-[#00B16A]/10 px-4 py-3 text-sm text-[#065F46]">
            Next recommended action: proceed to the fair onboarding page or open trust-layer traceability records.
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/fair?scan=${encodeURIComponent(code)}`} className="px-5 py-2.5 rounded-full bg-[#031E49] text-white text-sm font-bold hover:bg-[#0A2D6C]">
              Continue to Fair Entry
            </Link>
            <Link href="/trust" className="px-5 py-2.5 rounded-full border border-[#031E49]/15 bg-white text-[#031E49] text-sm font-bold hover:bg-[#F5F2EB]">
              Open Trust Layer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

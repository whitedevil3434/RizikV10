export const runtime = "edge";

import Link from "next/link";
import { getStoreProducts } from "@/lib/ops/data";

const categoryLabel: Record<string, string> = {
  ECO_MAT: "Eco-Mat",
  BIO_SHIELD: "Bio-Shield",
  OTHER: "Other",
};

export default async function StorePage() {
  const products = await getStoreProducts();

  return (
    <div className="min-h-screen bg-[#F5F2EB]">
      <section className="bg-white border-b border-[#031E49]/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="inline-flex mb-4 px-3 py-1 rounded-full bg-[#031E49]/5 border border-[#031E49]/10 text-xs font-semibold uppercase tracking-[0.12em] text-[#031E49]/55">
            Rizik Product Catalog
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#031E49] mb-4">Rizik Store</h1>
          <p className="text-[#0A2D6C]/60 text-lg max-w-2xl mx-auto">
            Official EcoMat and BioShield product lines with live catalog data.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {products.length === 0 ? (
          <div className="rounded-3xl border border-[#031E49]/10 bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-[#031E49]">Catalog is not available yet</h2>
            <p className="mt-3 text-sm text-[#0A2D6C]/65">
              Product rows are loaded from Supabase. Run the latest migrations and seed to publish catalog records.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <article
                key={product.sku}
                className="bg-white rounded-2xl border border-[#031E49]/10 overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-[#031E49]/5 to-[#00B16A]/10 relative overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.image_alt || product.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[#031E49]/35 text-sm font-semibold">
                      No image
                    </div>
                  )}
                  <span
                    className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
                      product.category === "ECO_MAT" ? "bg-[#031E49] text-white" : "bg-[#00B16A] text-white"
                    }`}
                  >
                    {categoryLabel[product.category] || product.category}
                  </span>
                </div>

                <div className="p-6">
                  <p className="text-[11px] uppercase tracking-[0.11em] text-[#031E49]/45 font-semibold">
                    {product.brand_family || "Rizik"}
                  </p>
                  <h3 className="mt-1 font-bold text-[#031E49] text-lg mb-2 group-hover:text-[#00B16A] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-[#0A2D6C]/50 mb-4 line-clamp-2">{product.description || "No description."}</p>

                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-2xl font-bold text-[#031E49]">৳{Math.round(product.base_price_bdt)}</span>
                      {product.minimum_order_quantity > 1 ? (
                        <span className="text-xs text-[#0A2D6C]/40 block mt-1">
                          Min. order: {product.minimum_order_quantity} units
                        </span>
                      ) : null}
                    </div>
                    <Link
                      href={`/store/${product.sku.toLowerCase()}`}
                      className="px-5 py-2.5 bg-[#031E49] text-white rounded-xl text-sm font-bold hover:bg-[#0A2D6C] transition-colors shadow-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-[#031E49] rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B16A]/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-3xl font-bold text-[#F5F2EB] mb-4 relative z-10">Need Bulk Orders?</h2>
          <p className="text-[#F5F2EB]/60 max-w-xl mx-auto mb-8 relative z-10">
            Enterprise and institutional procurement is managed through the dedicated B2B intake surface.
          </p>
          <Link
            href="/b2b"
            className="relative z-10 inline-flex items-center px-8 py-4 font-bold text-[#031E49] bg-[#F5F2EB] rounded-full hover:bg-white shadow-lg transition-colors"
          >
            Request B2B Access
          </Link>
        </div>
      </section>
    </div>
  );
}

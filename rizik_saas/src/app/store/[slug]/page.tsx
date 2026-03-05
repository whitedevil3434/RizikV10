export const runtime = "edge";

import Link from "next/link";
import AddToCartButton from "@/components/store/add-to-cart-button";
import { getStoreProductBySlug } from "@/lib/ops/data";

const categoryLabel: Record<string, string> = {
  ECO_MAT: "Eco-Mat",
  BIO_SHIELD: "Bio-Shield",
  OTHER: "Other",
};

function formatSpec(label: string, value: string) {
  return (
    <div className="bg-white rounded-xl border border-[#031E49]/10 p-3">
      <span className="text-xs text-[#0A2D6C]/50">{label}</span>
      <p className="text-sm font-bold text-[#031E49]">{value}</p>
    </div>
  );
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolved = await params;
  const product = await getStoreProductBySlug(resolved.slug);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] flex items-center justify-center px-4">
        <div className="text-center rounded-2xl border border-[#031E49]/10 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-[#031E49] mb-2">Product Not Found</h1>
          <p className="text-sm text-[#0A2D6C]/60 mb-4">The requested product is not available in the live catalog.</p>
          <Link href="/store" className="text-[#00B16A] font-bold hover:text-emerald-700">
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const category = categoryLabel[product.category] || product.category;

  return (
    <div className="min-h-screen bg-[#F5F2EB] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="mb-8 text-sm">
          <Link href="/store" className="text-[#00B16A] font-semibold hover:text-emerald-700">
            Store
          </Link>
          <span className="text-[#031E49]/30 mx-2">/</span>
          <span className="text-[#031E49]/50">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square rounded-3xl bg-gradient-to-br from-[#031E49]/5 to-[#00B16A]/10 border border-[#031E49]/10 shadow-sm overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.image_alt || product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-[#031E49]/35 text-sm font-semibold">
                No image
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <span
              className={`self-start px-3 py-1 rounded-full text-xs font-bold mb-4 ${
                product.category === "ECO_MAT" ? "bg-[#031E49] text-white" : "bg-[#00B16A] text-white"
              }`}
            >
              {category}
            </span>
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">
              {product.brand_family || "Rizik"}
            </p>
            <h1 className="text-3xl font-bold text-[#031E49] mt-1 mb-4">{product.name}</h1>
            <p className="text-[#0A2D6C]/60 leading-relaxed mb-6">{product.description || "No description available."}</p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {formatSpec("SKU", product.sku)}
              {formatSpec("Category", category)}
              {formatSpec("MOQ", String(product.minimum_order_quantity))}
              {formatSpec("Brand", product.brand_family || "Rizik")}
            </div>

            <div className="flex items-end gap-4 mt-auto">
              <div>
                <span className="text-sm text-[#0A2D6C]/40">Price</span>
                <p className="text-4xl font-bold text-[#031E49]">৳{Math.round(product.base_price_bdt)}</p>
              </div>
              <AddToCartButton
                sku={product.sku}
                name={product.name}
                price={product.base_price_bdt}
                category={product.category}
              />
            </div>

            <Link href="/cart" className="text-center text-sm text-[#00B16A] font-semibold mt-4 hover:text-emerald-700">
              View Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

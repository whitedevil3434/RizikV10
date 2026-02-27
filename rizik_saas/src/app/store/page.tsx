import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Product type
interface Product {
  product_id: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  base_price_bdt: number;
  minimum_order_quantity: number;
  image_url: string | null;
  is_active: boolean;
}

// Fallback products if DB is empty or unreachable
const fallbackProducts: Product[] = [
  { product_id: "1", sku: "MAT-GLOW-01", name: "Barishal Eco Pray Mat - Glow Series", category: "ECO_MAT", description: "100% Biodegradable, Night-Glow ink, Taraweeh optimized.", base_price_bdt: 150, minimum_order_quantity: 1, image_url: null, is_active: true },
  { product_id: "2", sku: "MAT-SCENT-01", name: "Barishal Eco Pray Mat - Oud Infused", category: "ECO_MAT", description: "100% Biodegradable with Oud & Jasmine scent bonded fabric.", base_price_bdt: 120, minimum_order_quantity: 1, image_url: null, is_active: true },
  { product_id: "3", sku: "MAT-STANDARD-01", name: "Barishal Eco Pray Mat - Classic", category: "ECO_MAT", description: "The original biodegradable non-woven prayer mat.", base_price_bdt: 50, minimum_order_quantity: 1, image_url: null, is_active: true },
  { product_id: "4", sku: "BIO-VEG-01", name: "Bio-Shield Matrix - Vegetable", category: "BIO_SHIELD", description: "30 GSM + 20 Micron LDPE. 15-day shelf life.", base_price_bdt: 25, minimum_order_quantity: 500, image_url: null, is_active: true },
  { product_id: "5", sku: "BIO-SPICE-01", name: "Bio-Shield Matrix - Raw Spice", category: "BIO_SHIELD", description: "50 GSM LDPE. 6-month spice preservation.", base_price_bdt: 45, minimum_order_quantity: 500, image_url: null, is_active: true },
  { product_id: "6", sku: "BIO-RETORT-V1", name: "Bio-Shield Retort Pouch (1yr)", category: "BIO_SHIELD", description: "80 GSM + 50 Micron LDPE. God Mode (121°C). Zero refrigeration.", base_price_bdt: 85, minimum_order_quantity: 500, image_url: null, is_active: true },
];

export default async function StorePage() {
  let products: Product[] = fallbackProducts;

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("empire_products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (!error && data && data.length > 0) {
      products = data as Product[];
    }
  } catch {
    // Supabase may not have tables yet — use fallback silently
  }

  const categoryLabel: Record<string, string> = {
    ECO_MAT: "Eco-Mat",
    BIO_SHIELD: "Bio-Shield",
    OTHER: "Other",
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB]">
      {/* Hero */}
      <section className="bg-white border-b border-[#031E49]/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#031E49] mb-4">Rizik Store</h1>
          <p className="text-[#0A2D6C]/60 text-lg max-w-2xl mx-auto">
            Premium eco-friendly prayer mats and revolutionary active packaging solutions. Direct from Barishal to the world.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.sku}
              className="bg-white rounded-2xl border border-[#031E49]/10 overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group"
            >
              {/* Product Image Placeholder */}
              <div className="aspect-[4/3] bg-gradient-to-br from-[#031E49]/5 to-[#00B16A]/10 flex items-center justify-center relative">
                <span className="text-5xl">
                  {product.category === "ECO_MAT" ? "🕌" : "🧬"}
                </span>
                <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${product.category === "ECO_MAT"
                    ? "bg-[#031E49] text-white"
                    : "bg-[#00B16A] text-white"
                  }`}>
                  {categoryLabel[product.category] || product.category}
                </span>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <h3 className="font-bold text-[#031E49] text-lg mb-2 group-hover:text-[#00B16A] transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-[#0A2D6C]/50 mb-4 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-bold text-[#031E49]">৳{product.base_price_bdt}</span>
                    {product.minimum_order_quantity > 1 && (
                      <span className="text-xs text-[#0A2D6C]/40 block mt-1">
                        Min. order: {product.minimum_order_quantity} units
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/store/${product.sku.toLowerCase()}`}
                    className="px-5 py-2.5 bg-[#031E49] text-white rounded-xl text-sm font-bold hover:bg-[#0A2D6C] transition-colors shadow-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* B2B CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-[#031E49] rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B16A]/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-3xl font-bold text-[#F5F2EB] mb-4 relative z-10">Need Bulk Orders?</h2>
          <p className="text-[#F5F2EB]/60 max-w-xl mx-auto mb-8 relative z-10">
            For mosques, corporate events, and agro-processors. Custom branding available for orders above 5,000 units.
          </p>
          <Link
            href="/portal"
            className="relative z-10 inline-flex items-center px-8 py-4 font-bold text-[#031E49] bg-[#F5F2EB] rounded-full hover:bg-white shadow-lg transition-colors"
          >
            Access B2B Portal
          </Link>
        </div>
      </section>
    </div>
  );
}

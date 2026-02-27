"use client";

import { useCartStore } from "@/lib/store/cart";
import Link from "next/link";
import { ShoppingCartIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

// Product data (same as store fallback — will unify with DB later)
const allProducts = [
    { sku: "MAT-GLOW-01", name: "Barishal Eco Pray Mat - Glow Series", category: "ECO_MAT", description: "100% Biodegradable, Night-Glow ink array engineered for Taraweeh and Tahajjud night prayers. Our phosphorescent ink charges naturally under room light and emits a soft glow for 6+ hours. The non-woven jute-blend fabric decomposes into natural fertilizer within 90 days. Each mat features embedded Qibla direction indicators.", base_price_bdt: 150, specs: ["Glow Duration: 6+ hours", "Material: Non-woven jute blend", "Decomposition: 90 days", "Size: 120cm × 60cm"] },
    { sku: "MAT-SCENT-01", name: "Barishal Eco Pray Mat - Oud Infused", category: "ECO_MAT", description: "100% Biodegradable prayer mat with chemically bonded Oud & Jasmine fragrance. The scent molecules are embedded at the fiber level meaning the aroma persists through 50+ uses. Premium non-woven construction with silk-touch finish.", base_price_bdt: 120, specs: ["Scent: Oud + Jasmine blend", "Longevity: 50+ uses", "Material: Silk-touch non-woven", "Size: 120cm × 60cm"] },
    { sku: "MAT-STANDARD-01", name: "Barishal Eco Pray Mat - Classic", category: "ECO_MAT", description: "The original biodegradable non-woven prayer mat. Affordable, planet-friendly, and built to serve the mass market. Zero plastic footprint.", base_price_bdt: 50, specs: ["Material: 100% Non-woven fiber", "Weight: Ultra-light 45g", "Foldable: Pocket-size", "Size: 110cm × 55cm"] },
    { sku: "BIO-VEG-01", name: "Bio-Shield Matrix - Vegetable Membrane", category: "BIO_SHIELD", description: "Active packaging membrane for fresh vegetables and fruits. 30 GSM non-woven base with 20 Micron LDPE and our proprietary Chitosan/Collagen oxygen barrier. Extends shelf life to 15 days without refrigeration.", base_price_bdt: 25, specs: ["Shelf Life: 15 days", "GSM: 30 + 20μ LDPE", "Barrier: Chitosan/Collagen", "Min Order: 500 units"] },
    { sku: "BIO-SPICE-01", name: "Bio-Shield Matrix - Raw Spice Pouch", category: "BIO_SHIELD", description: "Specialized active packaging for raw spices and dried goods. 50 GSM standard LDPE with enhanced moisture barrier. Preserves aroma, color, and potency for 6 months at ambient temperature.", base_price_bdt: 45, specs: ["Shelf Life: 6 months", "GSM: 50 Standard LDPE", "Moisture Barrier: Enhanced", "Min Order: 500 units"] },
    { sku: "BIO-RETORT-V1", name: "Bio-Shield Retort Pouch (1yr)", category: "BIO_SHIELD", description: "God Mode active packaging. 80 GSM + 50 Micron Thick LDPE triple-layer sandwich membrane. Survives 121°C retort cooking. Zero refrigeration required for 1 full year. The ultimate solution for cooked meat preservation.", base_price_bdt: 85, specs: ["Shelf Life: 1 year", "Heat Tolerance: 121°C", "GSM: 80 + 50μ LDPE", "Min Order: 500 units"] },
];

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const [added, setAdded] = useState(false);
    const addItem = useCartStore((s) => s.addItem);
    const [resolvedParams, setResolvedParams] = useState<{ slug: string } | null>(null);

    // Resolve params
    if (!resolvedParams) {
        params.then(setResolvedParams);
        return (
            <div className="min-h-screen bg-[#F5F2EB] flex items-center justify-center">
                <div className="animate-pulse text-[#031E49]/30 font-bold">Loading...</div>
            </div>
        );
    }

    const product = allProducts.find((p) => p.sku.toLowerCase() === resolvedParams.slug);

    if (!product) {
        return (
            <div className="min-h-screen bg-[#F5F2EB] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-[#031E49] mb-2">Product Not Found</h1>
                    <Link href="/store" className="text-[#00B16A] font-bold hover:text-emerald-700">← Back to Store</Link>
                </div>
            </div>
        );
    }

    function handleAddToCart() {
        addItem({ sku: product!.sku, name: product!.name, price: product!.base_price_bdt, category: product!.category });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    }

    const categoryLabel = product.category === "ECO_MAT" ? "Eco-Mat" : "Bio-Shield";

    return (
        <div className="min-h-screen bg-[#F5F2EB] py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="mb-8 text-sm">
                    <Link href="/store" className="text-[#00B16A] font-semibold hover:text-emerald-700">Store</Link>
                    <span className="text-[#031E49]/30 mx-2">/</span>
                    <span className="text-[#031E49]/50">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Product Image */}
                    <div className="aspect-square rounded-3xl bg-gradient-to-br from-[#031E49]/5 to-[#00B16A]/10 border border-[#031E49]/10 flex items-center justify-center shadow-sm">
                        <span className="text-8xl">{product.category === "ECO_MAT" ? "🕌" : "🧬"}</span>
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <span className={`self-start px-3 py-1 rounded-full text-xs font-bold mb-4 ${product.category === "ECO_MAT" ? "bg-[#031E49] text-white" : "bg-[#00B16A] text-white"}`}>
                            {categoryLabel}
                        </span>
                        <h1 className="text-3xl font-bold text-[#031E49] mb-4">{product.name}</h1>
                        <p className="text-[#0A2D6C]/60 leading-relaxed mb-6">{product.description}</p>

                        {/* Specs */}
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            {product.specs.map((spec, i) => (
                                <div key={i} className="bg-white rounded-xl border border-[#031E49]/10 p-3">
                                    <span className="text-xs text-[#0A2D6C]/50">{spec.split(":")[0]}</span>
                                    <p className="text-sm font-bold text-[#031E49]">{spec.split(":")[1]}</p>
                                </div>
                            ))}
                        </div>

                        {/* Price & Add to Cart */}
                        <div className="flex items-end gap-4 mt-auto">
                            <div>
                                <span className="text-sm text-[#0A2D6C]/40">Price</span>
                                <p className="text-4xl font-bold text-[#031E49]">৳{product.base_price_bdt}</p>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                disabled={added}
                                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold shadow-md transition-all ${added
                                        ? "bg-[#00B16A] text-white"
                                        : "bg-[#031E49] text-white hover:bg-[#0A2D6C]"
                                    }`}
                            >
                                {added ? (
                                    <>
                                        <CheckIcon className="w-5 h-5" /> Added to Cart!
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCartIcon className="w-5 h-5" /> Add to Cart
                                    </>
                                )}
                            </button>
                        </div>

                        {/* View Cart Link */}
                        <Link href="/cart" className="text-center text-sm text-[#00B16A] font-semibold mt-4 hover:text-emerald-700">
                            View Cart →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

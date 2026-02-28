import Link from "next/link";

export default function MatsPage() {
    return (
        <div className="flex flex-col items-center w-full bg-[#F5F2EB] min-h-screen">

            {/* Header */}
            <section className="relative w-full py-24 flex flex-col items-center justify-center overflow-hidden border-b border-[#031E49]/10 bg-white">
                <div className="max-w-4xl mx-auto px-4 text-center z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#031E49]/5 border border-[#031E49]/10 mb-6">
                        <span className="text-xs font-semibold text-[#031E49]/70">Seasonal Campaign Ready</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-[#031E49]">
                        Barishal <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B16A] to-emerald-600">Eco-Mats</span>
                    </h1>
                    <p className="text-lg md:text-xl text-[#0A2D6C]/60 max-w-2xl mx-auto leading-relaxed">
                        100% biodegradable, non-woven prayer mats designed for reliable quality, local production, and accessible pricing.
                    </p>
                </div>
            </section>

            {/* Features Grid */}
            <section className="w-full py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* Feature 1 */}
                        <div className="p-6 rounded-3xl bg-white border border-[#031E49]/10 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300 hover:shadow-lg">
                            <div className="w-10 h-10 rounded-full bg-[#031E49]/5 flex items-center justify-center mb-4 text-lg">💰</div>
                            <h3 className="text-lg font-bold text-[#031E49] mb-2">Accessible Pricing</h3>
                            <p className="text-sm text-[#0A2D6C]/60">Priced between 50-150 BDT to support broad affordability for institutional and community buyers.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-6 rounded-3xl bg-white border border-[#031E49]/10 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300 hover:shadow-lg">
                            <div className="w-10 h-10 rounded-full bg-[#00B16A]/10 flex items-center justify-center mb-4 text-[#00B16A] text-lg">✨</div>
                            <h3 className="text-lg font-bold text-[#031E49] mb-2">Glow-in-the-Dark</h3>
                            <p className="text-sm text-[#0A2D6C]/60">Low-light visual guidance designed for night-prayer use cases.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-6 rounded-3xl bg-white border border-[#031E49]/10 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300 hover:shadow-lg">
                            <div className="w-10 h-10 rounded-full bg-[#031E49]/5 flex items-center justify-center mb-4 text-lg">🌸</div>
                            <h3 className="text-lg font-bold text-[#031E49] mb-2">Oud & Jasmine Infused</h3>
                            <p className="text-sm text-[#0A2D6C]/60">Premium fragrance option for specialized retail and gifting channels.</p>
                        </div>

                        {/* Feature 4 */}
                        <div className="p-6 rounded-3xl bg-white border border-[#031E49]/10 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300 hover:shadow-lg ring-2 ring-[#00B16A]/20">
                            <div className="w-10 h-10 rounded-full bg-[#00B16A]/20 flex items-center justify-center mb-4 text-lg text-[#00B16A]">🌱</div>
                            <h3 className="text-lg font-bold text-[#00B16A] mb-2">Total Biodegradability</h3>
                            <p className="text-sm text-[#0A2D6C]/70">Zero plastic footprint. The mat decomposes directly into fertilizer, completing the Eco-Loop.</p>
                        </div>

                    </div>

                    {/* CTA */}
                    <div className="mt-20 p-12 rounded-[2.5rem] bg-[#031E49] text-center relative overflow-hidden">
                        {/* Decorative blob */}
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-[#00B16A]/20 rounded-full blur-[80px]" />

                        <h2 className="text-3xl font-bold text-[#F5F2EB] mb-4 relative z-10">B2B Bulk Pre-Orders</h2>
                        <p className="text-[#F5F2EB]/70 max-w-xl mx-auto mb-8 relative z-10">
                            For mosques, corporate gifting, and massive event distributions. Custom prints (names/logos) available for orders exceeding 5,000 units.
                        </p>
                        <Link
                            href="/b2b"
                            className="relative z-10 inline-flex items-center justify-center px-8 py-4 font-bold text-[#031E49] transition-all duration-200 bg-[#F5F2EB] rounded-full hover:bg-white shadow-lg"
                        >
                            Request B2B Access
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

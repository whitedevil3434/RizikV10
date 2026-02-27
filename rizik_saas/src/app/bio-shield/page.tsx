export default function BioShieldPage() {
    return (
        <div className="flex flex-col items-center w-full bg-[#F5F2EB] min-h-screen">

            {/* Header */}
            <section className="relative w-full py-24 flex flex-col items-center justify-center overflow-hidden border-b border-[#031E49]/10 bg-white">
                <div className="absolute inset-0 bg-gradient-to-b from-[#00B16A]/5 to-transparent" />
                <div className="max-w-4xl mx-auto px-4 text-center z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00B16A]/10 border border-[#00B16A]/20 mb-6">
                        <span className="text-xs font-semibold text-[#00B16A]">Patent Pending: "Thermal-Lock Membrane"</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-[#031E49]">
                        Rizik <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B16A] to-emerald-600">Bio-Shield</span>
                    </h1>
                    <p className="text-lg md:text-xl text-[#0A2D6C]/60 max-w-2xl mx-auto leading-relaxed">
                        The future of Active Packaging. A Triple-Layer Sandwich membrane engineered to eliminate refrigeration logic.
                    </p>
                </div>
            </section>

            {/* The Science Section */}
            <section className="w-full py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

                        {/* Left: Diagram placeholder */}
                        <div className="relative aspect-square md:aspect-[4/3] w-full rounded-3xl bg-white border border-[#031E49]/10 flex items-center justify-center overflow-hidden group shadow-sm">
                            <div className="absolute inset-0 bg-[#031E49]/[0.02] group-hover:bg-[#031E49]/[0.04] transition-colors" />
                            {/* Abstract Representation of the layers */}
                            <div className="flex flex-col gap-4 items-center z-10">
                                <div className="w-48 h-12 bg-[#F5F2EB] rounded-lg border border-[#031E49]/20 flex items-center justify-center text-[#031E49]/60 text-sm font-medium">Non-Woven Base</div>
                                <div className="w-56 h-8 bg-[#00B16A]/20 rounded-lg border border-[#00B16A]/50 flex items-center justify-center text-[#00B16A] text-sm font-bold shadow-[0_0_15px_rgba(0,177,106,0.3)]">LDPE Matrix + Chitosan/Collagen</div>
                                <div className="w-48 h-12 bg-[#F5F2EB] rounded-lg border border-[#031E49]/20 flex items-center justify-center text-[#031E49]/60 text-sm font-medium">Non-Woven Core</div>
                            </div>
                        </div>

                        {/* Right: Technical Specs */}
                        <div className="flex flex-col gap-8">
                            <div>
                                <h2 className="text-3xl font-bold text-[#031E49] mb-4">The Triple-Layer Sandwich</h2>
                                <p className="text-[#0A2D6C]/60 leading-relaxed">
                                    Traditional packaging suffocates perishables. Bio-Shield operates as a "Scientific Filter", utilizing bio-polymers (Chitosan from shrimp shells, Collagen from fish scales) to create an invisible oxygen barrier.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-6 rounded-2xl bg-white border border-[#031E49]/10 shadow-sm">
                                    <div className="text-2xl font-bold text-[#00B16A] mb-2">15 Days</div>
                                    <div className="text-sm font-medium text-[#031E49] mb-1">Vegetable Matrix</div>
                                    <div className="text-xs text-[#0A2D6C]/50">30 GSM + 20 Micron LDPE</div>
                                </div>

                                <div className="p-6 rounded-2xl bg-white border border-[#031E49]/10 shadow-sm">
                                    <div className="text-2xl font-bold text-[#00B16A] mb-2">6 Months</div>
                                    <div className="text-sm font-medium text-[#031E49] mb-1">Raw Spice Matrix</div>
                                    <div className="text-xs text-[#0A2D6C]/50">50 GSM + Standard LDPE</div>
                                </div>

                                <div className="p-6 rounded-2xl bg-white border border-[#031E49]/10 sm:col-span-2 ring-2 ring-[#00B16A]/30 bg-[#00B16A]/5 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-2xl font-bold text-[#00B16A]">1 Year</div>
                                        <div className="text-xs font-bold px-2 py-1 rounded bg-[#00B16A] text-white uppercase tracking-wider">God Mode</div>
                                    </div>
                                    <div className="text-sm font-medium text-[#031E49] mb-1">Retort Cooked Meat (121°C)</div>
                                    <div className="text-xs text-[#0A2D6C]/60">80 GSM + 50 Micron Thick LDPE. Zero refrigeration required.</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}

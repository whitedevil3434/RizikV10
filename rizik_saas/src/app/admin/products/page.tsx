"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/store/cart";
import Link from "next/link";
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface Product {
    sku: string;
    name: string;
    category: string;
    description: string;
    base_price_bdt: number;
    minimum_order_quantity: number;
    is_active: boolean;
}

const initialProducts: Product[] = [
    { sku: "MAT-GLOW-01", name: "Barishal Eco Pray Mat - Glow Series", category: "ECO_MAT", description: "100% Biodegradable, Night-Glow ink, Taraweeh optimized.", base_price_bdt: 150, minimum_order_quantity: 1, is_active: true },
    { sku: "MAT-SCENT-01", name: "Barishal Eco Pray Mat - Oud Infused", category: "ECO_MAT", description: "100% Biodegradable with Oud & Jasmine scent.", base_price_bdt: 120, minimum_order_quantity: 1, is_active: true },
    { sku: "MAT-STANDARD-01", name: "Barishal Eco Pray Mat - Classic", category: "ECO_MAT", description: "The original biodegradable non-woven prayer mat.", base_price_bdt: 50, minimum_order_quantity: 1, is_active: true },
    { sku: "BIO-VEG-01", name: "Bio-Shield Matrix - Vegetable", category: "BIO_SHIELD", description: "30 GSM + 20 Micron LDPE. 15-day shelf life.", base_price_bdt: 25, minimum_order_quantity: 500, is_active: true },
    { sku: "BIO-SPICE-01", name: "Bio-Shield Matrix - Raw Spice", category: "BIO_SHIELD", description: "50 GSM LDPE. 6-month spice preservation.", base_price_bdt: 45, minimum_order_quantity: 500, is_active: true },
    { sku: "BIO-RETORT-V1", name: "Bio-Shield Retort Pouch (1yr)", category: "BIO_SHIELD", description: "80 GSM + 50 Micron LDPE. God Mode (121°C).", base_price_bdt: 85, minimum_order_quantity: 500, is_active: true },
];

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [search, setSearch] = useState("");
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const filtered = products.filter(
        (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase())
    );

    function handleDelete(sku: string) {
        setProducts(products.filter((p) => p.sku !== sku));
    }

    function handleSave(product: Product) {
        const exists = products.find((p) => p.sku === product.sku);
        if (exists) {
            setProducts(products.map((p) => (p.sku === product.sku ? product : p)));
        } else {
            setProducts([...products, product]);
        }
        setEditingProduct(null);
        setShowAddForm(false);
    }

    const categoryLabel: Record<string, string> = { ECO_MAT: "Eco-Mat", BIO_SHIELD: "Bio-Shield", OTHER: "Other" };

    return (
        <div className="w-full flex h-screen bg-[#F5F2EB]">
            {/* Sidebar */}
            <aside className="w-64 bg-[#031E49] text-white flex flex-col flex-shrink-0">
                <div className="p-6 border-b border-white/10">
                    <span className="font-bold text-xl tracking-tight text-[#F5F2EB]">Rizik<span className="text-[#00B16A]">ERP</span></span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <a href="/admin" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-sm font-medium text-white/70 hover:text-white transition-colors">Command Center</a>
                    <a href="/admin/products" className="block px-4 py-2 rounded-lg bg-white/20 text-white text-sm font-bold shadow-inner">Product Catalog</a>
                    <a href="/admin/orders" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-sm font-medium text-white/70 hover:text-white transition-colors">Logistics & Orders</a>
                    <a href="/admin/crm" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-sm font-medium text-white/70 hover:text-white transition-colors">Support CRM</a>
                    <a href="/admin/qr" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-sm font-medium text-white/70 hover:text-white transition-colors">QR Production Tags</a>
                </nav>
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-y-auto p-12">
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-[#031E49] mb-2">Product Catalog</h1>
                        <p className="text-[#0A2D6C]/60">Manage Eco-Mat and Bio-Shield product listings.</p>
                    </div>
                    <button
                        onClick={() => { setShowAddForm(true); setEditingProduct(null); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#00B16A] text-white rounded-xl text-sm font-bold hover:bg-emerald-600 shadow-md transition-colors"
                    >
                        <PlusIcon className="w-4 h-4" /> Add Product
                    </button>
                </header>

                {/* Search */}
                <div className="relative mb-6">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#031E49]/30" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or SKU..."
                        className="w-full max-w-md pl-10 pr-4 py-3 rounded-xl border border-[#031E49]/20 bg-white text-sm text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]"
                    />
                </div>

                {/* Add/Edit Form */}
                {(showAddForm || editingProduct) && (
                    <ProductForm
                        product={editingProduct}
                        onSave={handleSave}
                        onCancel={() => { setShowAddForm(false); setEditingProduct(null); }}
                    />
                )}

                {/* Product Table */}
                <div className="bg-white rounded-2xl border border-[#031E49]/10 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs text-[#031E49]/50 uppercase bg-[#F5F2EB] border-b border-[#031E49]/10">
                            <tr>
                                <th className="px-6 py-4 font-semibold">SKU</th>
                                <th className="px-6 py-4 font-semibold">Product</th>
                                <th className="px-6 py-4 font-semibold">Category</th>
                                <th className="px-6 py-4 font-semibold">Price (BDT)</th>
                                <th className="px-6 py-4 font-semibold">Min Order</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p) => (
                                <tr key={p.sku} className="border-b border-[#031E49]/5 hover:bg-[#F5F2EB]/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-[#0A2D6C]/50">{p.sku}</td>
                                    <td className="px-6 py-4 font-bold text-[#031E49]">{p.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.category === "ECO_MAT" ? "bg-[#031E49] text-white" : "bg-[#00B16A] text-white"}`}>
                                            {categoryLabel[p.category] || p.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-[#031E49]">৳{p.base_price_bdt}</td>
                                    <td className="px-6 py-4 text-[#0A2D6C]/50">{p.minimum_order_quantity}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${p.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                            {p.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => setEditingProduct(p)} className="p-2 rounded-lg hover:bg-[#F5F2EB] text-[#031E49]/40 hover:text-[#031E49] transition-colors">
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(p.sku)} className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}

// --- Product Add/Edit Form Component ---
function ProductForm({ product, onSave, onCancel }: { product: Product | null; onSave: (p: Product) => void; onCancel: () => void }) {
    const [form, setForm] = useState<Product>(
        product || { sku: "", name: "", category: "ECO_MAT", description: "", base_price_bdt: 0, minimum_order_quantity: 1, is_active: true }
    );

    return (
        <div className="bg-white rounded-2xl border border-[#031E49]/10 p-6 mb-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#031E49] mb-4">{product ? "Edit Product" : "Add New Product"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SKU" disabled={!!product}
                    className="px-4 py-3 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 text-sm text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49] disabled:opacity-50" />
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product Name"
                    className="px-4 py-3 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 text-sm text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]" />
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="px-4 py-3 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 text-sm text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]">
                    <option value="ECO_MAT">Eco-Mat</option>
                    <option value="BIO_SHIELD">Bio-Shield</option>
                    <option value="OTHER">Other</option>
                </select>
                <input type="number" value={form.base_price_bdt} onChange={(e) => setForm({ ...form, base_price_bdt: Number(e.target.value) })} placeholder="Price (BDT)"
                    className="px-4 py-3 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 text-sm text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]" />
                <input type="number" value={form.minimum_order_quantity} onChange={(e) => setForm({ ...form, minimum_order_quantity: Number(e.target.value) })} placeholder="Min Order Qty"
                    className="px-4 py-3 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 text-sm text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]" />
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={1}
                    className="sm:col-span-2 lg:col-span-1 px-4 py-3 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 text-sm text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49] resize-none" />
            </div>
            <div className="flex gap-3 mt-4">
                <button onClick={() => onSave(form)} className="px-5 py-2.5 bg-[#031E49] text-white rounded-xl text-sm font-bold hover:bg-[#0A2D6C] transition-colors">
                    {product ? "Save Changes" : "Create Product"}
                </button>
                <button onClick={onCancel} className="px-5 py-2.5 border border-[#031E49]/20 text-[#031E49] rounded-xl text-sm font-semibold hover:bg-[#F5F2EB] transition-colors">
                    Cancel
                </button>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { MagnifyingGlassIcon, PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";

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
  { sku: "MAT-GLOW-01", name: "Barishal Eco Pray Mat - Glow Series", category: "ECO_MAT", description: "Night-use biodegradable prayer mat series.", base_price_bdt: 150, minimum_order_quantity: 1, is_active: true },
  { sku: "MAT-SCENT-01", name: "Barishal Eco Pray Mat - Oud Infused", category: "ECO_MAT", description: "Premium sensory retail line.", base_price_bdt: 120, minimum_order_quantity: 1, is_active: true },
  { sku: "MAT-STANDARD-01", name: "Barishal Eco Pray Mat - Classic", category: "ECO_MAT", description: "Cost-efficient mass distribution variant.", base_price_bdt: 50, minimum_order_quantity: 1, is_active: true },
  { sku: "BIO-VEG-01", name: "Bio-Shield Matrix - Vegetable", category: "BIO_SHIELD", description: "Short-cycle produce packaging program.", base_price_bdt: 25, minimum_order_quantity: 500, is_active: true },
  { sku: "BIO-SPICE-01", name: "Bio-Shield Matrix - Raw Spice", category: "BIO_SHIELD", description: "Dry goods preservation packaging program.", base_price_bdt: 45, minimum_order_quantity: 500, is_active: true },
  { sku: "BIO-RETORT-V1", name: "Bio-Shield Retort Pouch (1yr)", category: "BIO_SHIELD", description: "Extended shelf-life cooked food packaging.", base_price_bdt: 85, minimum_order_quantity: 500, is_active: true },
];

const categoryLabel: Record<string, string> = { ECO_MAT: "Eco-Mat", BIO_SHIELD: "Bio-Shield", OTHER: "Other" };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const filtered = products.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase())
  );

  function handleDelete(sku: string) {
    setProducts(products.filter((product) => product.sku !== sku));
  }

  function handleSave(product: Product) {
    const exists = products.find((item) => item.sku === product.sku);
    if (exists) {
      setProducts(products.map((item) => (item.sku === product.sku ? product : item)));
    } else {
      setProducts([...products, product]);
    }

    setEditingProduct(null);
    setShowAddForm(false);
  }

  return (
    <OpsShell
      title="Product Catalog"
      subtitle="Manage product variants, pricing, MOQ policy, and active lifecycle status for Eco-Mat and Bio-Shield units."
      activeHref="/admin/products"
      scopeLabel="Admin ERP"
      roleLabel="Catalog Operations"
      navItems={adminNavItems}
      quickLinks={[
        { href: "/admin/products", label: "Catalog", tone: "neutral" },
        { href: "/admin/inventory", label: "Inventory", tone: "neutral" },
        { href: "/admin/analytics", label: "Margin View", tone: "primary" },
      ]}
    >
      <div className="flex flex-wrap gap-3 items-center justify-between mb-5">
        <div className="relative w-full max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#031E49]/35" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by SKU or product name"
            className="w-full pl-9 pr-4 py-3 rounded-xl border border-[#031E49]/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#031E49]/20"
          />
        </div>

        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingProduct(null);
          }}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#031E49] text-white text-sm font-bold hover:bg-[#0A2D6C]"
        >
          <PlusIcon className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {(showAddForm || editingProduct) && (
        <ProductForm
          product={editingProduct}
          onSave={handleSave}
          onCancel={() => {
            setShowAddForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      <section className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
        <div className="md:hidden p-4 space-y-3">
          {filtered.map((product) => (
            <article key={product.sku} className="rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-[#031E49]">{product.name}</p>
                  <p className="mt-1 text-[11px] text-[#0A2D6C]/60 font-mono">{product.sku}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${product.category === "ECO_MAT" ? "bg-[#031E49] text-white" : "bg-[#00B16A] text-white"}`}>
                  {categoryLabel[product.category] || product.category}
                </span>
              </div>
              <p className="mt-2 text-xs text-[#0A2D6C]/75">{product.description}</p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <p className="text-[#031E49] font-semibold">৳{product.base_price_bdt}</p>
                <p className="text-[#0A2D6C]/65">MOQ {product.minimum_order_quantity}</p>
                <span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${product.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                  {product.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => setEditingProduct(product)}
                  className="flex-1 inline-flex items-center justify-center gap-2 h-9 rounded-lg border border-[#031E49]/15 bg-white text-[#031E49]/80 text-xs font-bold"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.sku)}
                  className="h-9 w-9 rounded-lg border border-red-200 bg-white text-red-500 inline-flex items-center justify-center"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.06em] text-[#031E49]/50 bg-[#F5F2EB] border-b border-[#031E49]/10">
              <tr>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">MOQ</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.sku} className="border-b border-[#031E49]/8 hover:bg-[#F5F2EB]/40">
                  <td className="px-5 py-3 font-mono text-xs text-[#0A2D6C]/55">{product.sku}</td>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-[#031E49]">{product.name}</p>
                    <p className="text-xs text-[#0A2D6C]/55">{product.description}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${product.category === "ECO_MAT" ? "bg-[#031E49] text-white" : "bg-[#00B16A] text-white"}`}>
                      {categoryLabel[product.category] || product.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-[#031E49]">৳{product.base_price_bdt}</td>
                  <td className="px-5 py-3 text-[#0A2D6C]/65">{product.minimum_order_quantity}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${product.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="h-8 w-8 rounded-lg border border-[#031E49]/15 bg-white text-[#031E49]/70 hover:text-[#031E49]"
                      >
                        <PencilIcon className="h-4 w-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.sku)}
                        className="h-8 w-8 rounded-lg border border-red-200 bg-white text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4 mx-auto" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </OpsShell>
  );
}

function ProductForm({
  product,
  onSave,
  onCancel,
}: {
  product: Product | null;
  onSave: (product: Product) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Product>(
    product || {
      sku: "",
      name: "",
      category: "ECO_MAT",
      description: "",
      base_price_bdt: 0,
      minimum_order_quantity: 1,
      is_active: true,
    }
  );

  return (
    <section className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm mb-5">
      <h3 className="text-base font-bold text-[#031E49] mb-4">{product ? "Edit Product" : "Add New Product"}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        <input
          value={form.sku}
          disabled={!!product}
          onChange={(event) => setForm({ ...form, sku: event.target.value })}
          placeholder="SKU"
          className="px-3 py-2.5 rounded-xl border border-[#031E49]/15 bg-[#F5F2EB]/45 text-sm focus:outline-none focus:ring-2 focus:ring-[#031E49]/20"
        />
        <input
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          placeholder="Product Name"
          className="px-3 py-2.5 rounded-xl border border-[#031E49]/15 bg-[#F5F2EB]/45 text-sm focus:outline-none focus:ring-2 focus:ring-[#031E49]/20"
        />
        <select
          value={form.category}
          onChange={(event) => setForm({ ...form, category: event.target.value })}
          className="px-3 py-2.5 rounded-xl border border-[#031E49]/15 bg-[#F5F2EB]/45 text-sm focus:outline-none focus:ring-2 focus:ring-[#031E49]/20"
        >
          <option value="ECO_MAT">Eco-Mat</option>
          <option value="BIO_SHIELD">Bio-Shield</option>
          <option value="OTHER">Other</option>
        </select>
        <input
          type="number"
          value={form.base_price_bdt}
          onChange={(event) => setForm({ ...form, base_price_bdt: Number(event.target.value) })}
          placeholder="Price (BDT)"
          className="px-3 py-2.5 rounded-xl border border-[#031E49]/15 bg-[#F5F2EB]/45 text-sm focus:outline-none focus:ring-2 focus:ring-[#031E49]/20"
        />
        <input
          type="number"
          value={form.minimum_order_quantity}
          onChange={(event) => setForm({ ...form, minimum_order_quantity: Number(event.target.value) })}
          placeholder="Min Order Qty"
          className="px-3 py-2.5 rounded-xl border border-[#031E49]/15 bg-[#F5F2EB]/45 text-sm focus:outline-none focus:ring-2 focus:ring-[#031E49]/20"
        />
        <textarea
          rows={1}
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          placeholder="Description"
          className="px-3 py-2.5 rounded-xl border border-[#031E49]/15 bg-[#F5F2EB]/45 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#031E49]/20"
        />
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={() => onSave(form)} className="px-4 py-2 rounded-xl bg-[#031E49] text-white text-sm font-bold hover:bg-[#0A2D6C]">
          {product ? "Save Changes" : "Create Product"}
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-[#031E49]/15 text-[#031E49] text-sm font-semibold hover:bg-[#F5F2EB]">
          Cancel
        </button>
      </div>
    </section>
  );
}

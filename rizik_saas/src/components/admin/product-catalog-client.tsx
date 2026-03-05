"use client";

import { useState, useTransition } from "react";
import { createProductAction, updateProductAction, deleteProductAction, toggleProductAction } from "@/lib/actions/product-actions";
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon, EyeSlashIcon, EyeIcon } from "@heroicons/react/24/outline";

interface Product {
    product_id: string;
    sku: string;
    name: string;
    category: string;
    description: string | null;
    base_price_bdt: number;
    minimum_order_quantity: number;
    image_url: string | null;
    brand_family: string | null;
    is_active: boolean;
}

const categoryLabel: Record<string, string> = { ECO_MAT: "Eco-Mat", BIO_SHIELD: "Bio-Shield", OTHER: "Other" };

// ── Product Form Modal ──
function ProductModal({
    product,
    onClose,
}: {
    product: Product | null; // null = create mode
    onClose: () => void;
}) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const isEdit = product !== null;

    function handleSubmit(formData: FormData) {
        setError(null);
        startTransition(async () => {
            const result = isEdit
                ? await updateProductAction(formData)
                : await createProductAction(formData);
            if (result.error) {
                setError(result.error);
                return;
            }
            onClose();
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 pt-6 pb-2">
                    <h2 className="text-lg font-bold text-[#031E49]">
                        {isEdit ? "Edit Product" : "New Product"}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#F5F2EB] transition-colors">
                        <XMarkIcon className="w-5 h-5 text-[#031E49]/50" />
                    </button>
                </div>

                {error && (
                    <div className="mx-6 mt-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
                        {error}
                    </div>
                )}

                <form action={handleSubmit} className="p-6 space-y-4">
                    {isEdit && <input type="hidden" name="product_id" value={product.product_id} />}

                    <div className="grid grid-cols-2 gap-4">
                        <div className={isEdit ? "col-span-2 opacity-50" : ""}>
                            <label className="block text-xs font-bold text-[#031E49] mb-1">SKU</label>
                            <input
                                type="text"
                                name="sku"
                                defaultValue={product?.sku || ""}
                                readOnly={isEdit}
                                required
                                className="w-full px-3 py-2.5 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 text-sm text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-[#031E49] mb-1">Product Name</label>
                            <input
                                type="text"
                                name="name"
                                defaultValue={product?.name || ""}
                                required
                                className="w-full px-3 py-2.5 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 text-sm text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#031E49] mb-1">Category</label>
                            <select
                                name="category"
                                defaultValue={product?.category || "ECO_MAT"}
                                className="w-full px-3 py-2.5 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 text-sm text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]"
                            >
                                <option value="ECO_MAT">Eco-Mat</option>
                                <option value="BIO_SHIELD">Bio-Shield</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#031E49] mb-1">Brand Family</label>
                            <input
                                type="text"
                                name="brand_family"
                                defaultValue={product?.brand_family || "Rizik"}
                                className="w-full px-3 py-2.5 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 text-sm text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#031E49] mb-1">Price (৳)</label>
                            <input
                                type="number"
                                name="price"
                                step="0.01"
                                min="1"
                                defaultValue={product?.base_price_bdt || ""}
                                required
                                className="w-full px-3 py-2.5 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 text-sm text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#031E49] mb-1">MOQ</label>
                            <input
                                type="number"
                                name="moq"
                                min="1"
                                defaultValue={product?.minimum_order_quantity || 1}
                                className="w-full px-3 py-2.5 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 text-sm text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#031E49] mb-1">Description</label>
                        <textarea
                            name="description"
                            rows={3}
                            defaultValue={product?.description || ""}
                            className="w-full px-3 py-2.5 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 text-sm text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49] resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#031E49] mb-1">Image URL</label>
                        <input
                            type="text"
                            name="image_url"
                            defaultValue={product?.image_url || ""}
                            placeholder="/products/variants/my-product.png"
                            className="w-full px-3 py-2.5 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 text-sm text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className={`w-full py-3 rounded-xl font-bold shadow-md transition-all ${isPending
                                ? "bg-[#031E49]/50 text-white/70 cursor-wait"
                                : "bg-[#031E49] text-white hover:bg-[#0A2D6C]"
                            }`}
                    >
                        {isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
                    </button>
                </form>
            </div>
        </div>
    );
}

// ── Product Table with CRUD ──
export default function ProductCatalogClient({ products }: { products: Product[] }) {
    const [showModal, setShowModal] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [isPending, startTransition] = useTransition();

    function openCreate() {
        setEditProduct(null);
        setShowModal(true);
    }

    function openEdit(p: Product) {
        setEditProduct(p);
        setShowModal(true);
    }

    function handleDelete(p: Product) {
        if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
        startTransition(async () => {
            await deleteProductAction(p.product_id);
        });
    }

    function handleToggle(p: Product) {
        startTransition(async () => {
            await toggleProductAction(p.product_id, !p.is_active);
        });
    }

    return (
        <>
            {showModal && (
                <ProductModal product={editProduct} onClose={() => setShowModal(false)} />
            )}

            <section className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-[#031E49]/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-[#031E49]">Live Product Records</h2>
                        <p className="text-xs text-[#0A2D6C]/55">{products.length} items</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00B16A] text-white text-sm font-bold hover:bg-emerald-600 transition-colors shadow-sm"
                    >
                        <PlusIcon className="w-4 h-4" /> Add Product
                    </button>
                </div>

                {products.length === 0 ? (
                    <div className="p-8 text-sm text-[#0A2D6C]/65">No product rows found.</div>
                ) : (
                    <>
                        {/* Mobile Cards */}
                        <div className="md:hidden p-4 space-y-3">
                            {products.map((product) => (
                                <article key={product.product_id} className="rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/40 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-[#031E49] truncate">{product.name}</p>
                                            <p className="mt-1 text-[11px] text-[#0A2D6C]/60 font-mono">{product.sku}</p>
                                        </div>
                                        <span className={`flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${product.category === "ECO_MAT" ? "bg-[#031E49] text-white" : "bg-[#00B16A] text-white"}`}>
                                            {categoryLabel[product.category] || product.category}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-xs">
                                        <p className="text-[#031E49] font-semibold">৳{Math.round(product.base_price_bdt)}</p>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEdit(product)} className="p-1.5 rounded-lg hover:bg-white transition-colors">
                                                <PencilIcon className="w-4 h-4 text-[#031E49]/60" />
                                            </button>
                                            <button onClick={() => handleToggle(product)} className="p-1.5 rounded-lg hover:bg-white transition-colors">
                                                {product.is_active ? <EyeSlashIcon className="w-4 h-4 text-amber-500" /> : <EyeIcon className="w-4 h-4 text-[#00B16A]" />}
                                            </button>
                                            <button onClick={() => handleDelete(product)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                                                <TrashIcon className="w-4 h-4 text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="text-xs uppercase tracking-[0.06em] text-[#031E49]/50 bg-[#F5F2EB] border-b border-[#031E49]/10">
                                    <tr>
                                        <th className="px-5 py-3">SKU</th>
                                        <th className="px-5 py-3">Product</th>
                                        <th className="px-5 py-3">Category</th>
                                        <th className="px-5 py-3">Brand</th>
                                        <th className="px-5 py-3">Price</th>
                                        <th className="px-5 py-3">MOQ</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.product_id} className="border-b border-[#031E49]/8 hover:bg-[#F5F2EB]/40">
                                            <td className="px-5 py-3 font-mono text-xs text-[#0A2D6C]/55">{product.sku}</td>
                                            <td className="px-5 py-3">
                                                <p className="font-semibold text-[#031E49]">{product.name}</p>
                                                <p className="text-xs text-[#0A2D6C]/55 truncate max-w-[200px]">{product.description || "No description"}</p>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${product.category === "ECO_MAT" ? "bg-[#031E49] text-white" : "bg-[#00B16A] text-white"}`}>
                                                    {categoryLabel[product.category] || product.category}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-[#0A2D6C]/70">{product.brand_family || "Rizik"}</td>
                                            <td className="px-5 py-3 font-semibold text-[#031E49]">৳{Math.round(product.base_price_bdt)}</td>
                                            <td className="px-5 py-3 text-[#0A2D6C]/65">{product.minimum_order_quantity}</td>
                                            <td className="px-5 py-3">
                                                <span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${product.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                                    {product.is_active ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => openEdit(product)}
                                                        disabled={isPending}
                                                        className="p-2 rounded-lg hover:bg-[#F5F2EB] transition-colors"
                                                        title="Edit"
                                                    >
                                                        <PencilIcon className="w-4 h-4 text-[#031E49]/60" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggle(product)}
                                                        disabled={isPending}
                                                        className="p-2 rounded-lg hover:bg-[#F5F2EB] transition-colors"
                                                        title={product.is_active ? "Deactivate" : "Activate"}
                                                    >
                                                        {product.is_active ? (
                                                            <EyeSlashIcon className="w-4 h-4 text-amber-500" />
                                                        ) : (
                                                            <EyeIcon className="w-4 h-4 text-[#00B16A]" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product)}
                                                        disabled={isPending}
                                                        className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="w-4 h-4 text-red-500" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </section>
        </>
    );
}

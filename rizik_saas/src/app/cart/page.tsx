"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { TrashIcon, MinusIcon, PlusIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";

export default function CartPage() {
    const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCartStore();

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-[#F5F2EB] flex items-center justify-center">
                <div className="text-center">
                    <ShoppingBagIcon className="w-16 h-16 text-[#031E49]/20 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-[#031E49] mb-2">Your Cart is Empty</h1>
                    <p className="text-[#0A2D6C]/70 mb-6">Browse our products and add items to get started.</p>
                    <Link
                        href="/store"
                        className="inline-flex px-6 py-3 bg-[#031E49] text-white rounded-xl font-bold hover:bg-[#0A2D6C] transition-colors"
                    >
                        Browse Store
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F2EB] py-12 pb-32 lg:pb-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-[#031E49] mb-8">Shopping Cart ({totalItems()} items)</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <div
                                key={item.sku}
                                className="bg-white rounded-2xl border border-[#031E49]/10 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 shadow-sm"
                            >
                                {/* Product Icon */}
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#031E49]/5 to-[#00B16A]/10 flex items-center justify-center text-2xl flex-shrink-0">
                                    {item.category === "ECO_MAT" ? "🕌" : "🧬"}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 w-full">
                                    <h3 className="font-bold text-[#031E49] text-sm truncate">{item.name}</h3>
                                    <p className="text-xs text-[#0A2D6C]/40 mt-0.5">SKU: {item.sku}</p>
                                    <p className="text-lg font-bold text-[#031E49] mt-1">৳{item.price}</p>
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                                    <button
                                        onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                                        className="w-8 h-8 rounded-lg border border-[#031E49]/10 flex items-center justify-center hover:bg-[#F5F2EB] transition-colors"
                                    >
                                        <MinusIcon className="w-4 h-4 text-[#031E49]" />
                                    </button>
                                    <span className="w-8 text-center font-bold text-[#031E49]">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                                        className="w-8 h-8 rounded-lg border border-[#031E49]/10 flex items-center justify-center hover:bg-[#F5F2EB] transition-colors"
                                    >
                                        <PlusIcon className="w-4 h-4 text-[#031E49]" />
                                    </button>
                                </div>

                                {/* Subtotal + Remove */}
                                <div className="text-right flex-shrink-0 w-full sm:w-auto flex items-center sm:block justify-between">
                                    <p className="font-bold text-[#031E49]">৳{(item.price * item.quantity).toLocaleString()}</p>
                                    <button
                                        onClick={() => removeItem(item.sku)}
                                        className="mt-1 text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={clearCart}
                            className="text-sm text-red-500 font-semibold hover:text-red-700 transition-colors"
                        >
                            Clear entire cart
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-2xl border border-[#031E49]/10 p-6 shadow-sm h-fit sticky top-24">
                        <h2 className="text-lg font-bold text-[#031E49] mb-6">Order Summary</h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-[#0A2D6C]/60">Subtotal ({totalItems()} items)</span>
                                <span className="font-semibold text-[#031E49]">৳{totalPrice().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-[#0A2D6C]/60">Shipping</span>
                                <span className="font-semibold text-[#00B16A]">Free</span>
                            </div>
                            <div className="h-px bg-[#031E49]/10" />
                            <div className="flex justify-between">
                                <span className="font-bold text-[#031E49]">Total</span>
                                <span className="text-xl font-bold text-[#031E49]">৳{totalPrice().toLocaleString()}</span>
                            </div>
                        </div>

                        <Link
                            href="/checkout"
                            className="block w-full text-center bg-[#031E49] text-white py-3.5 rounded-xl font-bold shadow-md hover:bg-[#0A2D6C] transition-colors"
                        >
                            Proceed to Checkout
                        </Link>

                        <Link
                            href="/store"
                            className="block w-full text-center text-sm text-[#00B16A] font-semibold mt-4 hover:text-emerald-700"
                        >
                            ← Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>

            <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[#031E49]/10 bg-white/95 backdrop-blur px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.08em] text-[#031E49]/55 font-semibold">Total</p>
                        <p className="text-lg font-bold text-[#031E49]">৳{totalPrice().toLocaleString()}</p>
                    </div>
                    <Link
                        href="/checkout"
                        className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[#031E49] text-white text-sm font-bold shadow-md hover:bg-[#0A2D6C] transition-colors"
                    >
                        Checkout
                    </Link>
                </div>
            </div>
        </div>
    );
}

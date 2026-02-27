"use client";

import { useCartStore } from "@/lib/store/cart";
import { useState } from "react";
import Link from "next/link";
import { CheckCircleIcon, MapPinIcon, CreditCardIcon } from "@heroicons/react/24/outline";

export default function CheckoutPage() {
    const { items, totalPrice, totalItems, clearCart } = useCartStore();
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderId] = useState(() => `RB-${Date.now().toString(36).toUpperCase()}`);

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-[#F5F2EB] flex items-center justify-center px-4">
                <div className="bg-white rounded-3xl border border-[#031E49]/10 shadow-lg p-12 max-w-md w-full text-center">
                    <CheckCircleIcon className="w-16 h-16 text-[#00B16A] mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-[#031E49] mb-2">Order Confirmed!</h1>
                    <p className="text-[#0A2D6C]/60 mb-6">
                        Your order <span className="font-bold text-[#031E49]">#{orderId}</span> has been placed successfully.
                        Our team will contact you for payment confirmation.
                    </p>
                    <div className="space-y-3">
                        <Link
                            href="/store"
                            className="block w-full bg-[#031E49] text-white py-3 rounded-xl font-bold hover:bg-[#0A2D6C] transition-colors"
                        >
                            Continue Shopping
                        </Link>
                        <Link
                            href="/"
                            className="block w-full text-sm text-[#00B16A] font-semibold hover:text-emerald-700"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-[#F5F2EB] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-[#031E49] mb-2">No items to checkout</h1>
                    <Link href="/store" className="text-[#00B16A] font-bold hover:text-emerald-700">Go to Store →</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F2EB] py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-[#031E49] mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Delivery Address */}
                        <div className="bg-white rounded-2xl border border-[#031E49]/10 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPinIcon className="w-5 h-5 text-[#00B16A]" />
                                <h2 className="text-lg font-bold text-[#031E49]">Delivery Address</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    className="w-full px-4 py-3 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 text-sm text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]"
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    className="w-full px-4 py-3 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 text-sm text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]"
                                />
                                <textarea
                                    placeholder="Street Address"
                                    rows={2}
                                    className="sm:col-span-2 w-full px-4 py-3 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 text-sm text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49] resize-none"
                                />
                                <input
                                    type="text"
                                    placeholder="City"
                                    className="w-full px-4 py-3 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 text-sm text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]"
                                />
                                <input
                                    type="text"
                                    placeholder="District"
                                    className="w-full px-4 py-3 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 text-sm text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]"
                                />
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-2xl border border-[#031E49]/10 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <CreditCardIcon className="w-5 h-5 text-[#00B16A]" />
                                <h2 className="text-lg font-bold text-[#031E49]">Payment Method</h2>
                            </div>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-[#031E49]/10 cursor-pointer hover:border-[#031E49]/30 transition-colors">
                                    <input type="radio" name="payment" defaultChecked className="accent-[#031E49]" />
                                    <span className="text-sm font-semibold text-[#031E49]">Cash on Delivery (COD)</span>
                                </label>
                                <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-[#031E49]/10 cursor-pointer hover:border-[#031E49]/30 transition-colors opacity-50">
                                    <input type="radio" name="payment" disabled className="accent-[#031E49]" />
                                    <span className="text-sm font-semibold text-[#031E49]">bKash / SSLCommerz (Coming Soon)</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-[#031E49]/10 p-6 shadow-sm h-fit sticky top-24">
                        <h2 className="text-lg font-bold text-[#031E49] mb-4">Order Review</h2>

                        <div className="space-y-3 mb-6">
                            {items.map((item) => (
                                <div key={item.sku} className="flex justify-between text-sm">
                                    <span className="text-[#0A2D6C]/60 truncate mr-2">{item.name} ×{item.quantity}</span>
                                    <span className="font-semibold text-[#031E49] flex-shrink-0">৳{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="h-px bg-[#031E49]/10" />
                            <div className="flex justify-between text-sm">
                                <span className="text-[#0A2D6C]/60">Subtotal ({totalItems()} items)</span>
                                <span className="font-semibold text-[#031E49]">৳{totalPrice().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-[#0A2D6C]/60">Delivery</span>
                                <span className="font-semibold text-[#00B16A]">Free</span>
                            </div>
                            <div className="h-px bg-[#031E49]/10" />
                            <div className="flex justify-between">
                                <span className="font-bold text-[#031E49]">Total</span>
                                <span className="text-xl font-bold text-[#031E49]">৳{totalPrice().toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => { setOrderPlaced(true); clearCart(); }}
                            className="w-full bg-[#00B16A] text-white py-3.5 rounded-xl font-bold shadow-md hover:bg-emerald-600 transition-colors"
                        >
                            Place Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

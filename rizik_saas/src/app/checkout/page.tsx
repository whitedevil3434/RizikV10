"use client";

import { useCartStore } from "@/lib/store/cart";
import { placeOrderAction } from "@/lib/actions/order";
import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircleIcon, MapPinIcon, CreditCardIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function CheckoutPage() {
    const { items, totalPrice, totalItems, clearCart } = useCartStore();
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderCodes, setOrderCodes] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    // Form state
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [district, setDistrict] = useState("");

    function handlePlaceOrder() {
        setError(null);
        startTransition(async () => {
            const result = await placeOrderAction({
                items: items.map(i => ({ sku: i.sku, name: i.name, price: i.price, quantity: i.quantity, category: i.category })),
                customerName: name,
                phone,
                address,
                city,
                district,
                paymentMethod: "COD",
            });

            if (result.error) {
                setError(result.error);
                return;
            }

            setOrderCodes(result.orderCodes || []);
            setOrderPlaced(true);
            clearCart();
        });
    }

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-[#F5F2EB] flex items-center justify-center px-4">
                <div className="bg-white rounded-3xl border border-[#031E49]/10 shadow-lg p-12 max-w-md w-full text-center">
                    <CheckCircleIcon className="w-16 h-16 text-[#00B16A] mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-[#031E49] mb-2">Order Confirmed!</h1>
                    <p className="text-[#0A2D6C]/60 mb-4">
                        Your {orderCodes.length > 1 ? "orders have" : "order has"} been placed and saved to our system.
                    </p>
                    <div className="bg-[#F5F2EB] rounded-xl p-4 mb-6 space-y-1">
                        {orderCodes.map((code) => (
                            <p key={code} className="text-sm font-mono font-bold text-[#031E49]">#{code}</p>
                        ))}
                    </div>
                    <p className="text-xs text-[#0A2D6C]/50 mb-6">
                        Track your order status in the Admin dashboard or contact our support team.
                    </p>
                    <div className="space-y-3">
                        <Link
                            href="/store"
                            className="block w-full bg-[#031E49] text-white py-3 rounded-xl font-bold hover:bg-[#0A2D6C] transition-colors"
                        >
                            Continue Shopping
                        </Link>
                        <Link
                            href="/account"
                            className="block w-full text-sm text-[#00B16A] font-semibold hover:text-emerald-700"
                        >
                            View Account
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

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </div>
                )}

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
                                    placeholder="Full Name *"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 text-sm text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]"
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone Number *"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 text-sm text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]"
                                />
                                <textarea
                                    placeholder="Street Address *"
                                    rows={2}
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                    className="sm:col-span-2 w-full px-4 py-3 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 text-sm text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49] resize-none"
                                />
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 text-sm text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]"
                                />
                                <input
                                    type="text"
                                    placeholder="District"
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
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
                                <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-[#031E49] cursor-pointer bg-[#031E49]/5">
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
                            onClick={handlePlaceOrder}
                            disabled={isPending}
                            className={`w-full py-3.5 rounded-xl font-bold shadow-md transition-all ${isPending
                                    ? "bg-[#031E49]/50 text-white/70 cursor-wait"
                                    : "bg-[#00B16A] text-white hover:bg-emerald-600"
                                }`}
                        >
                            {isPending ? "Processing..." : "Place Order"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use server";

import { createAdminClient } from "@/lib/supabase/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface OrderItem {
    sku: string;
    name: string;
    price: number;
    quantity: number;
    category: string;
}

interface PlaceOrderInput {
    items: OrderItem[];
    customerName: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    paymentMethod: string;
}

function generateOrderCode(): string {
    const now = new Date();
    const y = now.getFullYear();
    const seq = Math.floor(Math.random() * 9000) + 1000;
    return `RZK-ORD-${y}-${seq}`;
}

export async function placeOrderAction(input: PlaceOrderInput) {
    // Validate basics
    if (!input.items || input.items.length === 0) {
        return { error: "Cart is empty." };
    }
    if (!input.customerName || input.customerName.trim().length < 2) {
        return { error: "Full name is required." };
    }
    if (!input.phone || input.phone.trim().length < 6) {
        return { error: "Phone number is required." };
    }
    if (!input.address || input.address.trim().length < 5) {
        return { error: "Delivery address is required." };
    }

    // Get current user email (optional — guests can also order)
    let userEmail: string | null = null;
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        userEmail = user?.email || null;
    } catch {
        // Guest checkout — no user session
    }

    const admin = createAdminClient();
    const orderCodes: string[] = [];
    const errors: string[] = [];

    // Create one order per line item (matching admin order queue format)
    for (const item of input.items) {
        const orderCode = generateOrderCode();
        const deliveryDays = item.category === "BIO_SHIELD" ? 7 : 5;
        const expectedDelivery = new Date(Date.now() + deliveryDays * 86400000).toISOString();

        const { error } = await admin.from("rizik_order_records").insert({
            order_code: orderCode,
            customer_name: input.customerName.trim(),
            channel: "B2C",
            product_sku: item.sku,
            quantity: item.quantity,
            unit_price_bdt: item.price,
            status: "PENDING",
            sla_state: "ON_TRACK",
            expected_delivery_at: expectedDelivery,
        });

        if (error) {
            console.error("Order insert error:", error);
            errors.push(`Failed to place order for ${item.name}`);
        } else {
            orderCodes.push(orderCode);
        }
    }

    if (orderCodes.length === 0) {
        return { error: errors.join(". ") || "Failed to place order." };
    }

    // Store delivery info in a simple metadata format (future: separate addresses table)
    // For now, the order is saved and trackable in admin

    return {
        success: true,
        orderCodes,
        primaryCode: orderCodes[0],
        customerEmail: userEmail,
    };
}

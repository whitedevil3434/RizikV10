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
    vatAmount?: number;
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

    // Get current user (optional — guests can also order)
    let userId: string | null = null;
    let userEmail: string | null = null;
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id || null;
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
            vat_amount_bdt: (input.vatAmount || 0) / input.items.length,
            user_id: userId, // Link to the user account
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

    return {
        success: true,
        orderCodes,
        primaryCode: orderCodes[0],
        customerEmail: userEmail,
    };
}

export async function updateOrderStatusAction(id: string, status: string, sla_state?: string) {
    try {
        const admin = createAdminClient();
        const updateData: Record<string, string> = { status };
        if (sla_state) {
            updateData.sla_state = sla_state;
        }

        const { error } = await admin
            .from("rizik_order_records")
            .update(updateData)
            .eq("id", id);

        if (error) {
            console.error("Failed to update order:", error);
            return { error: "Failed to update order status." };
        }

        return { success: true };
    } catch (err) {
        console.error("Order update error:", err);
        return { error: "Unexpected error occurred." };
    }
}

/**
 * ✅ Approve Digital Credits for Rizik Writer (Server Action)
 * Increments user's paid credits and completes the order.
 */
export async function approveWriterCreditsAction(orderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient();

    // 1. Get the order details
    const { data: order, error: orderError } = await admin
      .from("rizik_order_records")
      .select("user_id, quantity, status, channel")
      .eq("id", orderId)
      .single();

    if (orderError || !order) return { success: false, error: "Order not found" };
    if (order.status === "COMPLETED") return { success: false, error: "Order already completed" };
    if (order.channel !== "DIGITAL") return { success: false, error: "Not a digital order" };
    if (!order.user_id) return { success: false, error: "No user associated with this order" };

    // 2. Increment user credits (upsert)
    const { data: usage } = await admin
      .from("user_usage")
      .select("paid_credits, free_uses_remaining, total_transformations")
      .eq("user_id", order.user_id)
      .maybeSingle();

    const currentPaid = usage?.paid_credits || 0;
    const currentFree = usage?.free_uses_remaining || 0;
    const currentTransformations = usage?.total_transformations || 0;
    const newPaidCredits = currentPaid + (order.quantity || 0);

    const { error: updateUsageError } = await admin
      .from("user_usage")
      .upsert({ 
        user_id: order.user_id,
        paid_credits: newPaidCredits,
        free_uses_remaining: currentFree,
        total_transformations: currentTransformations,
        updated_at: new Date().toISOString() 
      }, { onConflict: 'user_id' });

    if (updateUsageError) {
        console.error("Credit update error: ", updateUsageError);
        return { success: false, error: "Failed to update credits: " + (updateUsageError.message || JSON.stringify(updateUsageError)) };
    }

    // 3. Update order status
    const { error: updateOrderError } = await admin
      .from("rizik_order_records")
      .update({ status: "COMPLETED" })
      .eq("id", orderId);

    if (updateOrderError) return { success: false, error: "Failed to update order status" };

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

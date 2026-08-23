"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { getCurrentUserContext } from "@/lib/auth/session";
import { canAccessAdminRole } from "@/lib/auth/policy";

async function requireAdminAccess(): Promise<{ ok: true } | { ok: false; error: string }> {
    const { user, role } = await getCurrentUserContext();
    if (!user || !canAccessAdminRole(role)) {
        return { ok: false, error: "Unauthorized." };
    }
    return { ok: true };
}

// ── Create Product ──
export async function createProductAction(formData: FormData) {
    const access = await requireAdminAccess();
    if (!access.ok) return { error: access.error };

    const sku = (formData.get("sku") as string || "").trim();
    const name = (formData.get("name") as string || "").trim();
    const category = (formData.get("category") as string || "ECO_MAT").trim();
    const description = (formData.get("description") as string || "").trim();
    const price = parseFloat(formData.get("price") as string || "0");
    const moq = parseInt(formData.get("moq") as string || "1", 10);
    const brandFamily = (formData.get("brand_family") as string || "Rizik").trim();
    const imageUrl = (formData.get("image_url") as string || "").trim();

    if (!sku || !name || price <= 0) {
        return { error: "SKU, Name, and Price are required." };
    }

    const admin = createAdminClient();
    const { error } = await admin.from("empire_products").insert({
        sku,
        name,
        category,
        description: description || null,
        base_price_bdt: price,
        minimum_order_quantity: Math.max(1, moq),
        brand_family: brandFamily || null,
        image_url: imageUrl || null,
        is_active: true,
    });

    if (error) {
        console.error("Create product error:", error);
        if (error.message.includes("duplicate")) {
            return { error: "A product with this SKU already exists." };
        }
        return { error: "Failed to create product." };
    }

    revalidatePath("/admin/products");
    return { success: true };
}

// ── Update Product ──
export async function updateProductAction(formData: FormData) {
    const access = await requireAdminAccess();
    if (!access.ok) return { error: access.error };

    const productId = (formData.get("product_id") as string || "").trim();
    const name = (formData.get("name") as string || "").trim();
    const description = (formData.get("description") as string || "").trim();
    const price = parseFloat(formData.get("price") as string || "0");
    const moq = parseInt(formData.get("moq") as string || "1", 10);
    const brandFamily = (formData.get("brand_family") as string || "").trim();
    const imageUrl = (formData.get("image_url") as string || "").trim();
    const category = (formData.get("category") as string || "").trim();

    if (!productId || !name || price <= 0) {
        return { error: "Product ID, Name, and Price are required." };
    }

    const admin = createAdminClient();
    const updates: Record<string, unknown> = {
        name,
        description: description || null,
        base_price_bdt: price,
        minimum_order_quantity: Math.max(1, moq),
        brand_family: brandFamily || null,
        updated_at: new Date().toISOString(),
    };
    if (imageUrl) updates.image_url = imageUrl;
    if (category) updates.category = category;

    const { error } = await admin
        .from("empire_products")
        .update(updates)
        .eq("product_id", productId);

    if (error) {
        console.error("Update product error:", error);
        return { error: "Failed to update product." };
    }

    revalidatePath("/admin/products");
    return { success: true };
}

// ── Toggle Product Active Status ──
export async function toggleProductAction(productId: string, isActive: boolean) {
    const access = await requireAdminAccess();
    if (!access.ok) return { error: access.error };

    const admin = createAdminClient();
    const { error } = await admin
        .from("empire_products")
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq("product_id", productId);

    if (error) {
        console.error("Toggle product error:", error);
        return { error: "Failed to update product status." };
    }

    revalidatePath("/admin/products");
    return { success: true };
}

// ── Delete Product (Hard Delete) ──
export async function deleteProductAction(productId: string) {
    const access = await requireAdminAccess();
    if (!access.ok) return { error: access.error };

    const admin = createAdminClient();
    const { error } = await admin
        .from("empire_products")
        .delete()
        .eq("product_id", productId);

    if (error) {
        console.error("Delete product error:", error);
        return { error: "Failed to delete product." };
    }

    revalidatePath("/admin/products");
    return { success: true };
}

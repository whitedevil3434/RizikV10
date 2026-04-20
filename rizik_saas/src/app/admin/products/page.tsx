import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { createAdminClient } from "@/lib/supabase/admin";
import ProductCatalogClient from "@/components/admin/product-catalog-client";

export default async function AdminProductsPage() {
  // Fetch ALL products (including inactive) for admin view
  const admin = createAdminClient();
  const { data } = await admin
    .from("empire_products")
    .select("product_id, sku, name, category, description, base_price_bdt, minimum_order_quantity, image_url, image_alt, brand_family, is_active")
    .order("created_at", { ascending: true });

  const products = (data || []).map((row: Record<string, unknown>) => ({
    product_id: String(row.product_id || ""),
    sku: String(row.sku || ""),
    name: String(row.name || ""),
    category: String(row.category || "OTHER"),
    description: row.description == null ? null : String(row.description),
    base_price_bdt: Number(row.base_price_bdt) || 0,
    minimum_order_quantity: Math.max(1, Math.floor(Number(row.minimum_order_quantity) || 1)),
    image_url: row.image_url == null ? null : String(row.image_url),
    image_alt: row.image_alt == null ? null : String(row.image_alt),
    brand_family: row.brand_family == null ? null : String(row.brand_family),
    is_active: Boolean(row.is_active),
  }));

  return (
    <OpsShell
      title="Product Catalog"
      subtitle="Manage your product catalog — add, edit, toggle, or remove items."
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
      <ProductCatalogClient products={products} />
    </OpsShell>
  );
}

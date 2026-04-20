import type { OpsProduct } from "@/lib/ops/data";

export type MatAvailability = "PRE_ORDER" | "COMING_UP";

const COMING_UP_MAT_SKUS = new Set<string>([
  "MAT-GRAMIN-IND-01",
  "MAT-GRAMIN-RUST-01",
]);

export function isEcoMat(product: OpsProduct): boolean {
  return product.category === "ECO_MAT";
}

export function getMatAvailability(product: OpsProduct): MatAvailability {
  if (COMING_UP_MAT_SKUS.has(product.sku.toUpperCase())) {
    return "COMING_UP";
  }
  return "PRE_ORDER";
}

export function getMatAvailabilityLabel(product: OpsProduct): string {
  return getMatAvailability(product) === "COMING_UP" ? "Coming Up" : "Pre Order";
}

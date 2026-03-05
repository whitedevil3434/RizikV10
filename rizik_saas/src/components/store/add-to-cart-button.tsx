"use client";

import { useState } from "react";
import { CheckIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCartStore } from "@/lib/store/cart";

interface AddToCartButtonProps {
  sku: string;
  name: string;
  price: number;
  category: string;
}

export default function AddToCartButton({ sku, name, price, category }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({ sku, name, price, category });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <button
      onClick={handleAdd}
      disabled={added}
      className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold shadow-md transition-all ${
        added ? "bg-[#00B16A] text-white" : "bg-[#031E49] text-white hover:bg-[#0A2D6C]"
      }`}
    >
      {added ? (
        <>
          <CheckIcon className="w-5 h-5" /> Added to Cart
        </>
      ) : (
        <>
          <ShoppingCartIcon className="w-5 h-5" /> Add to Cart
        </>
      )}
    </button>
  );
}

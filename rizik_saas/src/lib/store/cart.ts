import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
    sku: string;
    name: string;
    price: number;
    quantity: number;
    category: string;
}

interface CartStore {
    items: CartItem[];
    addItem: (item: Omit<CartItem, "quantity">) => void;
    removeItem: (sku: string) => void;
    updateQuantity: (sku: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: () => number;
    totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item) => {
                const existing = get().items.find((i) => i.sku === item.sku);
                if (existing) {
                    set({
                        items: get().items.map((i) =>
                            i.sku === item.sku ? { ...i, quantity: i.quantity + 1 } : i
                        ),
                    });
                } else {
                    set({ items: [...get().items, { ...item, quantity: 1 }] });
                }
            },

            removeItem: (sku) => {
                set({ items: get().items.filter((i) => i.sku !== sku) });
            },

            updateQuantity: (sku, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(sku);
                    return;
                }
                set({
                    items: get().items.map((i) =>
                        i.sku === sku ? { ...i, quantity } : i
                    ),
                });
            },

            clearCart: () => set({ items: [] }),

            totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

            totalPrice: () =>
                get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        }),
        {
            name: "rizik-cart",
        }
    )
);

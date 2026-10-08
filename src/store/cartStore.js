import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],

  addItem: (product, qty) => {
    const items = [...get().items];
    const existing = items.find((i) => i.product_id === product.id);
    if (existing) existing.quantity_kg += qty;
    else
      items.push({
        product_id: product.id,
        name: product.name,
        price_per_kg: Number(product.price_per_kg),
        quantity_kg: qty,
        image_url: product.image_url,
        max_kg: Number(product.quantity_kg),
      });
    set({ items });
  },

  updateQty: (id, qty) =>
    set({
      items: get().items.map((i) =>
        i.product_id === id ? { ...i, quantity_kg: qty } : i
      ),
    }),

  removeItem: (id) =>
    set({ items: get().items.filter((i) => i.product_id !== id) }),

  clear: () => set({ items: [] }),

  subtotal: () =>
    get().items.reduce((s, i) => s + i.price_per_kg * i.quantity_kg, 0),
}));
import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  sellerId: null,       // which seller's products are in the cart
  sellerName: null,     // seller display name

  // Returns { ok: true } if added, or { ok: false, reason: 'different_seller', sellerName }
  addItem: (product, qty) => {
    const state = get();
    const thisSellerId = product.seller_id;
    const thisSellerName = product.seller_name || 'Muuzaji';

    // Cart empty → set seller and add
    if (!state.items.length) {
      set({
        items: [{
          product_id: product.id,
          name: product.name,
          price_per_kg: Number(product.price_per_kg),
          quantity_kg: qty,
          image_url: product.image_url,
          max_kg: Number(product.quantity_kg),
          seller_id: thisSellerId,
          seller_name: thisSellerName,
        }],
        sellerId: thisSellerId,
        sellerName: thisSellerName,
      });
      return { ok: true };
    }

    // Cart has items → check seller match
    if (state.sellerId && thisSellerId && state.sellerId !== thisSellerId) {
      return {
        ok: false,
        reason: 'different_seller',
        sellerName: state.sellerName,
      };
    }

    // Same seller (or seller info missing) → add / merge
    const items = [...state.items];
    const existing = items.find((i) => i.product_id === product.id);
    if (existing) {
      existing.quantity_kg += qty;
    } else {
      items.push({
        product_id: product.id,
        name: product.name,
        price_per_kg: Number(product.price_per_kg),
        quantity_kg: qty,
        image_url: product.image_url,
        max_kg: Number(product.quantity_kg),
        seller_id: thisSellerId,
        seller_name: thisSellerName,
      });
    }
    set({ items });
    return { ok: true };
  },

  // Force replace the cart with this single item (used after user confirms)
  replaceWith: (product, qty) => {
    set({
      items: [{
        product_id: product.id,
        name: product.name,
        price_per_kg: Number(product.price_per_kg),
        quantity_kg: qty,
        image_url: product.image_url,
        max_kg: Number(product.quantity_kg),
        seller_id: product.seller_id,
        seller_name: product.seller_name || 'Muuzaji',
      }],
      sellerId: product.seller_id,
      sellerName: product.seller_name || 'Muuzaji',
    });
  },

  updateQty: (id, qty) =>
    set({
      items: get().items.map((i) =>
        i.product_id === id ? { ...i, quantity_kg: qty } : i
      ),
    }),

  removeItem: (id) => {
    const remaining = get().items.filter((i) => i.product_id !== id);
    if (remaining.length === 0) {
      set({ items: [], sellerId: null, sellerName: null });
    } else {
      set({ items: remaining });
    }
  },

  clear: () => set({ items: [], sellerId: null, sellerName: null }),

  subtotal: () =>
    get().items.reduce((s, i) => s + i.price_per_kg * i.quantity_kg, 0),
}));
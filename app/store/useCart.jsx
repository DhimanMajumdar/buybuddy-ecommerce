import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Function to create a user-specific cart store
export const createCartStore = (userId) => {
  return create(
    persist(
      (set) => ({
        cart: [],

        addToCart: (product) =>
          set((state) => {
            const existing = state.cart.find((p) => p.id === product.id);

            // Calculate the actual price (with discount if applicable)
            const actualPrice = product.discount_percentage && product.discount_percentage > 0
              ? product.price * (1 - product.discount_percentage / 100)
              : product.price;

            if (existing) {
              return {
                cart: state.cart.map((p) =>
                  p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
                ),
              };
            }

            return {
              cart: [...state.cart, { ...product, price: actualPrice, quantity: 1 }],
            };
          }),

        increaseQuantity: (id) =>
          set((state) => ({
            cart: state.cart.map((p) =>
              p.id === id ? { ...p, quantity: p.quantity + 1 } : p
            ),
          })),

        decreaseQuantity: (id) =>
          set((state) => ({
            cart: state.cart
              .map((p) => (p.id === id ? { ...p, quantity: p.quantity - 1 } : p))
              .filter((p) => p.quantity > 0), // remove if 0
          })),

        removeFromCart: (id) =>
          set((state) => ({
            cart: state.cart.filter((p) => p.id !== id),
          })),

        orderPlaced: false,
        setOrderPlaced: (status) => set({ orderPlaced: status }),

        clearCart: () => set({ cart: [] }),
      }),
      {
        name: userId ? `cart-storage-${userId}` : 'cart-storage-guest', // user-specific storage key
        storage: createJSONStorage(() => localStorage),
      }
    )
  );
};

// Default store for backward compatibility (will be replaced by user-specific store)
export const useCartStore = createCartStore(null);
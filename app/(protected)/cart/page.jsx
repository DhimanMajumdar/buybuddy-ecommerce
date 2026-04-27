"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trash2,
  ShoppingBag,
  Minus,
  Plus,
  Loader2,
} from "lucide-react";
import { useUserCart } from "../../hooks/useUserCart.jsx";
import { useAuth } from "@/app/context/AuthContext";

const CartPage = () => {
  const [mounted, setMounted] = useState(false);
  const { isAdmin } = useAuth();

  // User-specific cart
  const cart = useUserCart((state) => state.cart) || [];
  const increaseQuantity = useUserCart((state) => state.increaseQuantity);
  const decreaseQuantity = useUserCart((state) => state.decreaseQuantity);
  const removeFromCart = useUserCart((state) => state.removeFromCart);

  // 🎯 Discount State
  const [discountInput, setDiscountInput] = useState("");
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculations - with array safety checks
  const subtotal = Array.isArray(cart) ? cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  ) : 0;

  const discountAmount = (subtotal * discount) / 100;

  const shipping = subtotal > 0 ? 15 : 0;

  const total = subtotal - discountAmount + shipping;

  // Apply Discount
  const handleApplyDiscount = () => {
    const value = parseFloat(discountInput);

    if (!isNaN(value) && value >= 0 && value <= 100) {
      setDiscount(value);
    } else {
      alert("Enter valid discount (0 - 100)");
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 text-sky-500 animate-spin" />
      </div>
    );
  }

  if (!Array.isArray(cart) || cart.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <ShoppingBag className="h-10 w-10 text-sky-500 mb-4" />
        <h1 className="text-2xl font-bold">Your cart is empty</h1>

        <Link href="/products" className="mt-6 bg-black text-white px-6 py-3 rounded-xl">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-10 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* LEFT: CART ITEMS */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl shadow">
              <h2 className="font-bold">{item.title}</h2>
              <img src={item.image} alt={item.title} width={100} height={100} />

              <div className="flex items-center gap-4 mt-3">
                <button onClick={() => decreaseQuantity(item.id)}>
                  <Minus />
                </button>

                <span>{item.quantity}</span>

                <button onClick={() => increaseQuantity(item.id)}>
                  <Plus />
                </button>
              </div>

              <p className="mt-2 font-bold">
                ${(item.price * item.quantity).toFixed(2)}
              </p>

              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 mt-2"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* RIGHT: SUMMARY */}
        <div className="bg-white p-8 rounded-3xl shadow-lg h-fit sticky top-20">

          <h2 className="text-2xl font-black mb-6">Summary</h2>

          {/* DISCOUNT INPUT - Only for Admins */}
          {isAdmin && (
            <div className="mb-6">
              <p className="text-xs font-bold mb-2 uppercase">Apply Discount (Admin Only)</p>

              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Enter %"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleApplyDiscount();
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg"
                />

                <button
                  onClick={handleApplyDiscount}
                  className="bg-sky-600 text-white px-4 rounded-lg"
                >
                  Apply
                </button>
              </div>

              {discount > 0 && (
                <p className="text-green-600 text-sm mt-2">
                  {discount}% discount applied 🎉
                </p>
              )}
            </div>
          )}

          {/* PRICE BREAKDOWN */}
          <div className="space-y-4">

            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            {discount > 0 && isAdmin && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Shipping</span>
              <span>${shipping}</span>
            </div>

            <hr />

            <div className="flex justify-between font-bold text-xl">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* CHECKOUT */}
          <button className="w-full mt-6 bg-black text-white py-3 rounded-xl hover:bg-sky-600 transition">
            <Link href="/checkout">
              Checkout
            </Link>
          </button>
        </div>

      </div>
    </div>
  );
};

export default CartPage;
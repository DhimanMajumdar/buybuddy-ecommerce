"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useUserCart } from "@/app/hooks/useUserCart";
import CreditCard from "@/components/CreditCard";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { CreditCard as CardIcon, MapPin, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { createClient } from "@/utils/supabase/client";

const CheckoutPage = () => {
  const { user } = useAuth();
  const supabase = createClient();
  const cart = useUserCart((state) => state.cart) || [];
  const clearCart = useUserCart((state) => state.clearCart);
  const setOrderPlaced = useUserCart((state) => state.setOrderPlaced);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form states
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const subtotal = useMemo(() => {
    return Array.isArray(cart) ? cart.reduce((acc, item) => acc + item.price * item.quantity, 0) : 0;
  }, [cart]);

  const shipping = 15;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Formatting logic for specific fields
    if (name === "cardNumber") {
      const formatted = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "").substring(0, 16);
      setFormData((prev) => ({ ...prev, [name]: formatted }));
      return;
    }
    
    if (name === "expiryDate") {
      const formatted = value.replace(/\//g, "").replace(/[^0-9]/gi, "").substring(0, 4);
      if (formatted.length >= 2) {
        setFormData((prev) => ({ ...prev, [name]: formatted.slice(0, 2) + "/" + formatted.slice(2) }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: formatted }));
      }
      return;
    }

    if (name === "cvv") {
      const formatted = value.replace(/[^0-9]/gi, "").substring(0, 3);
      setFormData((prev) => ({ ...prev, [name]: formatted }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    const { cardNumber, cardHolder, expiryDate, cvv, fullName, address, city, state, zipCode } = formData;
    return (
      cardNumber.length === 16 &&
      cardHolder.trim() !== "" &&
      expiryDate.length === 5 &&
      cvv.length === 3 &&
      fullName.trim() !== "" &&
      address.trim() !== "" &&
      city.trim() !== "" &&
      state.trim() !== "" &&
      zipCode.trim() !== ""
    );
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast.error("Please fill in all fields correctly.", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      return;
    }

    setLoading(true);

    try {
      // Create order in database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            user_email: user.email,
            total_amount: total,
            discount_amount: 0,
            shipping_amount: shipping,
            status: 'pending',
            shipping_address: {
              fullName: formData.fullName,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode,
              country: formData.country || 'USA'
            },
            payment_info: {
              cardHolder: formData.cardHolder,
              lastFourDigits: formData.cardNumber.slice(-4)
            }
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.id.toString(),
        product_title: item.title,
        product_price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast.success("Order placed successfully 🎉", {
        position: "top-right",
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });

      clearCart();
      setOrderPlaced(true);
      router.push("/updates");
    } catch (error) {
      console.error('Order error:', error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (!Array.isArray(cart) || cart.length === 0 && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-white shadow-xl rounded-full flex items-center justify-center mx-auto text-gray-400">
            <ShoppingBag size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 italic">Your cart is empty</h1>
          <p className="text-gray-500">Go back and add some luxury items to your cart.</p>
          <button 
            onClick={() => router.push("/products")}
            className="px-8 py-3 bg-black text-white rounded-full font-medium transition hover:bg-gray-800"
          >
            Explore Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-neutral-900 pb-20">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-extrabold tracking-tight italic mb-2">Checkout</h1>
        <p className="text-neutral-500 font-medium">Complete your order with secure payment.</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Section: Visuals and Summary */}
        <div className="lg:col-span-5 space-y-12">
          {/* Card Preview */}
          <div className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
              <CardIcon size={16} /> Payment Method Preview
            </h2>
            <CreditCard 
              cardNumber={formData.cardNumber}
              cardHolder={formData.cardHolder}
              expiryDate={formData.expiryDate}
              cvv={formData.cvv}
            />
          </div>

          {/* Order Summary */}
          <div className="bg-white/50 border border-neutral-100 rounded-3xl p-8 space-y-6 backdrop-blur-sm shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2">
               Your Items
            </h2>
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-neutral-100 rounded-xl overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-neutral-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-dotted border-neutral-200 space-y-3">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Estimated Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-extrabold pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handlePlaceOrder} className="space-y-10">
            {/* Shipping Address */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MapPin size={22} className="text-blue-600" /> Shipping Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <Input 
                    label="Full Name" 
                    name="fullName" 
                    value={formData.fullName} 
                    onChange={handleInputChange} 
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <Input 
                    label="Street Address" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    placeholder="123 Luxury Lane"
                  />
                </div>
                <Input 
                  label="City" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleInputChange} 
                  placeholder="San Francisco"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="State" 
                    name="state" 
                    value={formData.state} 
                    onChange={handleInputChange} 
                    placeholder="CA"
                  />
                  <Input 
                    label="Zip Code" 
                    name="zipCode" 
                    value={formData.zipCode} 
                    onChange={handleInputChange} 
                    placeholder="94103"
                  />
                </div>
              </div>
            </section>

            {/* Payment Information */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CardIcon size={22} className="text-purple-600" /> Payment Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <Input 
                    label="Card Number" 
                    name="cardNumber" 
                    value={formData.cardNumber} 
                    onChange={handleInputChange} 
                    placeholder="0000 0000 0000 0000"
                    maxLength={16}
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <Input 
                    label="Card Holder Name" 
                    name="cardHolder" 
                    value={formData.cardHolder} 
                    onChange={handleInputChange} 
                    placeholder="John Doe"
                  />
                </div>
                <Input 
                  label="Expiry Date" 
                  name="expiryDate" 
                  value={formData.expiryDate} 
                  onChange={handleInputChange} 
                  placeholder="MM/YY"
                  maxLength={5}
                />
                <Input 
                  label="CVV" 
                  name="cvv" 
                  value={formData.cvv} 
                  onChange={handleInputChange} 
                  placeholder="123"
                  maxLength={3}
                />
              </div>
            </section>

            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="w-full bg-black text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all enabled:hover:scale-[1.01] enabled:active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed group shadow-xl shadow-black/10"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> Processing...
                </>
              ) : (
                <>
                  Place Order <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-neutral-400 font-medium pb-8 uppercase tracking-widest">
              Secure Encrypted Payment • No hidden fees
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div className="space-y-1.5 flex-1">
    <label className="text-[12px] font-bold uppercase tracking-widest text-neutral-400 ml-1">
      {label}
    </label>
    <input
      {...props}
      className="w-full px-5 py-4 bg-white border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium placeholder:text-neutral-300 shadow-sm"
    />
  </div>
);

export default CheckoutPage;
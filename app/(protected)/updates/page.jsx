"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Package, ArrowLeft, Home, ShoppingCart } from "lucide-react";
import { useUserCart } from "@/app/hooks/useUserCart";

const UpdatesPage = () => {
  const orderPlaced = useUserCart((state) => state.orderPlaced) || false;
  const setOrderPlaced = useUserCart((state) => state.setOrderPlaced);
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!orderPlaced) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400">
          <ShoppingCart size={32} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold italic">No Recent Orders</h1>
          <p className="text-neutral-500 font-medium">It looks like you haven't placed an order yet.</p>
        </div>
        <Link 
          href="/products" 
          className="px-8 py-3 bg-black text-white rounded-2xl font-bold shadow-lg shadow-black/10 hover:scale-[1.02] transition"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col items-center justify-center p-6">

      <div className="max-w-md w-full text-center space-y-10 animate-in fade-in zoom-in duration-700">
        <div className="relative group">
          <div className="absolute inset-0 bg-green-500/20 blur-[60px] rounded-full scale-150 animate-pulse" />
          <div className="relative w-24 h-24 bg-green-500 text-white rounded-4xl flex items-center justify-center mx-auto shadow-2xl shadow-green-500/20 rotate-12 transition-transform hover:rotate-0 duration-500">
            <CheckCircle size={48} strokeWidth={2.5} />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight italic">
            Order Placed Successfully 🎉
          </h1>
          <p className="text-neutral-500 text-lg font-medium leading-relaxed">
            Thank you for your purchase. Your premium items are now being prepared for shipping and will be with you shortly.
          </p>
        </div>

        <div className="bg-white border border-neutral-100 p-6 rounded-3xl shadow-xl shadow-neutral-100 flex items-center gap-4 text-left">
          <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">Tracking Number</p>
            <p className="font-mono text-lg font-bold">BB-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link 
            href="/products" 
            onClick={() => setOrderPlaced(false)}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-neutral-100 text-neutral-900 rounded-2xl font-bold transition hover:bg-neutral-200"
          >
            <ArrowLeft size={18} /> Continue Shopping
          </Link>
          <Link 
            href="/" 
            onClick={() => setOrderPlaced(false)}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-black text-white rounded-2xl font-bold transition hover:scale-[1.02] active:scale-95 shadow-lg shadow-black/10"
          >
             Back Home
          </Link>
        </div>

      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default UpdatesPage;

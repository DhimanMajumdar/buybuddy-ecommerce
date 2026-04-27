"use client";

import Link from "next/link";
import React from "react";
import { ShoppingCart, LogOut, User, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserCart } from "@/app/hooks/useUserCart";
import { useAuth } from "@/app/context/AuthContext";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user, profile, signOut, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // User-specific cart
  const cart = useUserCart((state) => state.cart) || [];

  // total quantity
  const cartCount = mounted && Array.isArray(cart) ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0;

  if (loading || !mounted) return null;

  const userName = user?.email?.split("@")[0] || "User";

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-sky-200/50 bg-sky-200 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-20">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/buybuddy-logo.webp"
            alt="BuyBuddy Logo"
            className="h-10 w-auto rounded-xl border-2 border-black"
          />
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-10">
          <Link href="/products" className="text-lg font-semibold text-gray-600 hover:text-indigo-600">
            Products
          </Link>
          <Link href="/about" className="text-lg font-semibold text-gray-600 hover:text-indigo-600">
            About
          </Link>
          <Link href="/contact" className="text-lg font-semibold text-gray-600 hover:text-indigo-600">
            Contact
          </Link>

          {/* Admin Dashboard Link - Only for Admins */}
          {isAdmin && (
            <Link href="/admin" className="text-lg font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}

          {/* CART BUTTON WITH COUNT - Only show when logged in */}
          {user && (
            <button
              onClick={() => router.push("/cart")}
              className="group relative flex items-center gap-3 bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-2xl transition-all active:scale-95 shadow-lg shadow-gray-200"
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5 transition-transform group-hover:-rotate-12" />
              </div>
              <span className="text-sm font-bold tracking-wide">Cart</span>
              {cartCount > 0 && (
                <span className="text-sm font-bold tracking-wide">
                  ({cartCount})
                </span>
              )}
            </button>
          )}
        </div>

        {/* Auth Section */}
        <div className="hidden md:flex items-center gap-4">
          {!user ? (
            <>
              <Link href="/auth/login">
                <button className="px-5 py-2 rounded-xl bg-black text-white hover:scale-105 transition">
                  Login
                </button>
              </Link>

              <Link href="/auth/signup">
                <button className="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:scale-105 transition">
                  Sign Up
                </button>
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 bg-white/70 px-3 py-1.5 rounded-full shadow-sm border border-sky-100 hover:shadow-md transition"
              >
                <span className="text-sm font-semibold text-gray-700">
                  Hi, {userName}
                </span>
                <div className="h-9 w-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                  {userName[0].toUpperCase()}
                </div>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
                    {isAdmin && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
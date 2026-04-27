"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Package, Plus, FolderTree, Shield, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-sky-500 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-10 w-10 text-indigo-600" />
            <h1 className="text-4xl font-black text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600 text-lg">Manage your e-commerce platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add Product Card */}
          <Link href="/admin/add-product">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-sky-100 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group">
              <div className="h-16 w-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition">
                <Plus className="h-8 w-8 text-indigo-600 group-hover:text-white transition" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Product</h2>
              <p className="text-gray-600">Create new products for your store</p>
            </div>
          </Link>

          {/* Manage Products Card */}
          <Link href="/admin/products">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-sky-100 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group">
              <div className="h-16 w-16 bg-sky-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-sky-600 transition">
                <Package className="h-8 w-8 text-sky-600 group-hover:text-white transition" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Products</h2>
              <p className="text-gray-600">View, edit, and delete products</p>
            </div>
          </Link>

          {/* Manage Categories Card */}
          <Link href="/admin/categories">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-sky-100 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group">
              <div className="h-16 w-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition">
                <FolderTree className="h-8 w-8 text-purple-600 group-hover:text-white transition" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Categories</h2>
              <p className="text-gray-600">Create and organize categories</p>
            </div>
          </Link>

          {/* View Orders Card */}
          <Link href="/admin/orders">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-sky-100 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group">
              <div className="h-16 w-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-600 transition">
                <Shield className="h-8 w-8 text-green-600 group-hover:text-white transition" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">View Orders</h2>
              <p className="text-gray-600">See all customer orders and details</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

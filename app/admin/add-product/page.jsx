"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AddProductPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("0");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    // FakeStore API categories
    const fakeStoreCategories = [
      "electronics",
      "jewelery",
      "men's clothing",
      "women's clothing"
    ];

    // Fetch custom categories from Supabase
    const { data, error } = await supabase
      .from('categories')
      .select('name')
      .order('name');

    const customCategories = data ? data.map(c => c.name) : [];
    
    // Combine and remove duplicates
    const allCategories = [...new Set([...fakeStoreCategories, ...customCategories])];
    setCategories(allCategories);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            title,
            description,
            price: parseFloat(price),
            discount_percentage: parseFloat(discountPercentage) || 0,
            category,
            image,
            created_by: user.id,
          },
        ])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast.success('Product added successfully!');
      router.push('/admin/products');
    } catch (error) {
      console.error('Add product error:', error);
      toast.error(error.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-sky-500 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/admin" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-sky-100">
          <h1 className="text-3xl font-black text-gray-900 mb-8">Add New Product</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Product Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition"
                placeholder="Enter product title"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition"
                placeholder="Enter product description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter 0 for no discount, max 100%
                </p>
              </div>
            </div>

            {/* Price Preview */}
            {price && parseFloat(price) > 0 && (
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                <p className="text-sm font-bold text-gray-700 mb-2">Price Preview:</p>
                <div className="flex items-baseline gap-3">
                  {discountPercentage && parseFloat(discountPercentage) > 0 ? (
                    <>
                      <span className="text-2xl font-black text-green-600">
                        ${(parseFloat(price) * (1 - parseFloat(discountPercentage) / 100)).toFixed(2)}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        ${parseFloat(price).toFixed(2)}
                      </span>
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                        {discountPercentage}% OFF
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-black text-gray-900">
                      ${parseFloat(price).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition capitalize"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="capitalize">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {image && (
              <div className="mt-4">
                <p className="text-sm font-bold text-gray-700 mb-2">Preview:</p>
                <img
                  src={image}
                  alt="Preview"
                  className="w-48 h-48 object-contain border border-gray-200 rounded-xl"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Adding Product...
                </>
              ) : (
                'Add Product'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

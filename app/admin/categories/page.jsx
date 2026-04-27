"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { Loader2, Trash2, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export default function ManageCategoriesPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [adding, setAdding] = useState(false);

  // FakeStore API categories (read-only)
  const fakeStoreCategories = [
    "electronics",
    "jewelery",
    "men's clothing",
    "women's clothing"
  ];

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchCategories();
    }
  }, [isAdmin]);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (!error && data) {
      setCategories(data);
    }
    setLoading(false);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    // Check if it's a FakeStore category
    if (fakeStoreCategories.includes(newCategory.trim().toLowerCase())) {
      toast.error('This category already exists in FakeStore API');
      return;
    }

    setAdding(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: newCategory.trim() }])
        .select();

      if (error) throw error;

      toast.success('Category added successfully!');
      setCategories([...categories, data[0]]);
      setNewCategory("");
    } catch (error) {
      if (error.code === '23505') {
        toast.error('Category already exists');
      } else {
        toast.error(error.message || 'Failed to add category');
      }
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (fakeStoreCategories.includes(name.toLowerCase())) {
      toast.error('Cannot delete FakeStore API categories');
      return;
    }

    if (!confirm('Are you sure you want to delete this category?')) return;

    setDeleting(id);
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Category deleted successfully!');
      setCategories(categories.filter(c => c.id !== id));
    } catch (error) {
      toast.error(error.message || 'Failed to delete category');
    } finally {
      setDeleting(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-sky-500 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const customCategories = categories.filter(
    c => !fakeStoreCategories.includes(c.name.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Manage Categories</h1>
          <p className="text-gray-600">
            Total categories: {fakeStoreCategories.length + customCategories.length}
            <span className="ml-4 text-sm">
              (FakeStore API: {fakeStoreCategories.length}, Custom: {customCategories.length})
            </span>
          </p>
        </div>

        {/* Add Category Form */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-sky-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Category</h2>
          <form onSubmit={handleAdd} className="flex gap-4">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter category name"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition"
            />
            <button
              type="submit"
              disabled={adding || !newCategory.trim()}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {adding ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Add
                </>
              )}
            </button>
          </form>
        </div>

        {/* FakeStore API Categories */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">FakeStore API Categories (Read-Only)</h3>
            <p className="text-sm text-gray-600 mt-1">These categories come from the FakeStore API and cannot be deleted</p>
          </div>
          <div className="divide-y divide-gray-100">
            {fakeStoreCategories.map((category, index) => (
              <div key={index} className="p-6 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h3 className="text-lg font-bold text-gray-700 capitalize">{category}</h3>
                  <p className="text-sm text-gray-500">From FakeStore API</p>
                </div>
                <div className="bg-gray-200 text-gray-500 px-4 py-2 rounded-xl font-bold text-sm">
                  Read-Only
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Categories */}
        {customCategories.length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg border border-sky-100 overflow-hidden">
            <div className="bg-sky-50 px-6 py-4 border-b border-sky-100">
              <h3 className="text-lg font-bold text-gray-900">Your Custom Categories</h3>
              <p className="text-sm text-gray-600 mt-1">Categories you've added</p>
            </div>
            <div className="divide-y divide-gray-100">
              {customCategories.map((category) => (
                <div key={category.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 capitalize">{category.name}</h3>
                    <p className="text-sm text-gray-500">Custom category</p>
                  </div>
                  <button
                    onClick={() => handleDelete(category.id, category.name)}
                    disabled={deleting === category.id}
                    className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-red-600 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {deleting === category.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { Loader2, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ManageProductsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [fakeStoreProducts, setFakeStoreProducts] = useState([]);
  const [customProducts, setCustomProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editDiscount, setEditDiscount] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchAllProducts();
    }
  }, [isAdmin]);

  const fetchAllProducts = async () => {
    setLoading(true);
    
    // Fetch FakeStore API products
    try {
      const fakeStoreRes = await fetch('https://fakestoreapi.com/products');
      const fakeStoreData = await fakeStoreRes.json();
      setFakeStoreProducts(fakeStoreData);
    } catch (error) {
      console.error('Error fetching FakeStore products:', error);
    }

    // Fetch custom products from Supabase
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCustomProducts(data);
    }
    
    setLoading(false);
  };

  const handleDelete = async (id, isCustom) => {
    if (!isCustom) {
      toast.error('Cannot delete FakeStore API products');
      return;
    }

    if (!confirm('Are you sure you want to delete this product?')) return;

    setDeleting(id);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Product deleted successfully!');
      setCustomProducts(customProducts.filter(p => p.id !== id));
    } catch (error) {
      toast.error(error.message || 'Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  const handleUpdateDiscount = async (productId) => {
    const discount = parseFloat(editDiscount);
    
    if (isNaN(discount) || discount < 0 || discount > 100) {
      toast.error('Please enter a valid discount between 0 and 100');
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({ discount_percentage: discount })
        .eq('id', productId);

      if (error) throw error;

      toast.success('Discount updated successfully!');
      
      // Update local state
      setCustomProducts(customProducts.map(p => 
        p.id === productId ? { ...p, discount_percentage: discount } : p
      ));
      
      setEditingProduct(null);
      setEditDiscount("");
    } catch (error) {
      toast.error(error.message || 'Failed to update discount');
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

  const allProducts = [...customProducts, ...fakeStoreProducts];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <Link href="/admin" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Manage Products</h1>
          <p className="text-gray-600">
            Total products: {allProducts.length} 
            <span className="ml-4 text-sm">
              (Custom: {customProducts.length}, FakeStore API: {fakeStoreProducts.length})
            </span>
          </p>
        </div>

        {customProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Custom Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-sky-100">
                  <div className="aspect-square w-full bg-gray-50 p-6 relative">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-contain"
                    />
                    {product.discount_percentage > 0 && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full shadow-lg">
                        <span className="text-xs font-black">{product.discount_percentage}% OFF</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <span className="text-xs uppercase font-bold text-sky-600">
                      {product.category}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mt-2 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                      {product.description}
                    </p>
                    
                    {/* Price Display */}
                    <div className="mt-4">
                      {product.discount_percentage > 0 ? (
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-black text-green-600">
                            ${(product.price * (1 - product.discount_percentage / 100)).toFixed(2)}
                          </p>
                          <p className="text-lg text-gray-400 line-through">
                            ${product.price}
                          </p>
                        </div>
                      ) : (
                        <p className="text-2xl font-black text-gray-900">
                          ${product.price}
                        </p>
                      )}
                    </div>

                    {/* Discount Editor */}
                    {editingProduct === product.id ? (
                      <div className="mt-4 p-3 bg-sky-50 rounded-xl">
                        <label className="text-xs font-bold text-gray-700 block mb-2">
                          Update Discount (%)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editDiscount}
                            onChange={(e) => setEditDiscount(e.target.value)}
                            placeholder={product.discount_percentage}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <button
                            onClick={() => handleUpdateDiscount(product.id)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingProduct(null);
                              setEditDiscount("");
                            }}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingProduct(product.id);
                          setEditDiscount(product.discount_percentage.toString());
                        }}
                        className="w-full mt-4 bg-sky-500 text-white py-3 rounded-xl font-bold hover:bg-sky-600 transition"
                      >
                        Edit Discount
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(product.id, true)}
                      disabled={deleting === product.id}
                      className="w-full mt-2 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {deleting === product.id ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-5 w-5" />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">FakeStore API Products (Read-Only)</h2>
          <p className="text-gray-600 mb-6 text-sm">
            These products come from the FakeStore API and cannot be deleted. They are automatically available to all users.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fakeStoreProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-200 opacity-75">
                <div className="aspect-square w-full bg-gray-50 p-6">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-6">
                  <span className="text-xs uppercase font-bold text-gray-600">
                    {product.category}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mt-2 line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                    {product.description}
                  </p>
                  <p className="text-2xl font-black text-gray-900 mt-4">
                    ${product.price}
                  </p>
                  <div className="w-full mt-4 bg-gray-200 text-gray-500 py-3 rounded-xl font-bold text-center">
                    API Product (Read-Only)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {customProducts.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg mt-8">
            <p className="text-gray-600 text-lg">No custom products yet. Add your first product!</p>
            <Link href="/admin/add-product">
              <button className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
                Add Product
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

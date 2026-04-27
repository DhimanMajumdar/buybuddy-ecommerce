"use client";

import { useState, useEffect } from 'react';
import ProductExplorer from '@/components/productExplorer';
import { createClient } from '@/utils/supabase/client';
import { Loader2 } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch FakeStore API products
        const fakeStoreRes = await fetch("https://fakestoreapi.com/products");
        const fakeStoreProducts = await fakeStoreRes.json();

        // Fetch FakeStore API categories
        const fakeStoreCatRes = await fetch("https://fakestoreapi.com/products/categories");
        const fakeStoreCategories = await fakeStoreCatRes.json();

        // Fetch custom products from Supabase
        const supabase = createClient();
        const { data: customProducts, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        // Fetch custom categories from Supabase
        const { data: customCategories, error: categoriesError } = await supabase
          .from('categories')
          .select('name')
          .order('name');

        // Merge products
        const allProducts = [
          ...(customProducts || []),
          ...fakeStoreProducts
        ];

        // Merge categories
        const allCategories = [
          ...new Set([
            ...fakeStoreCategories,
            ...(customCategories?.map(c => c.name) || [])
          ])
        ];

        setProducts(allProducts);
        setCategories(allCategories);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl mb-16">
        <h1 className="text-5xl font-black tracking-tight text-gray-900 sm:text-6xl text-balance">
          Discover <span className="text-sky-600">Collections</span>
        </h1>
        <p className="mt-6 text-xl text-gray-600 leading-relaxed text-balance">
          The best items from around the world, curated by experts and delivered directly to your doorstep.
        </p>
      </div>

      <ProductExplorer initialProducts={products} categories={categories} />
    </div>
  );
}
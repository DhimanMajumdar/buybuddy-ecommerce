import ProductExplorer from '@/components/productExplorer'
import { createClient } from '@/utils/supabase/server'

async function getProducts() {
  try {
    console.log('🔍 Fetching products...');
    
    // Fetch FakeStore API products
    const fakeStoreRes = await fetch("https://fakestoreapi.com/products", {
      cache: "no-store",
    });
    const fakeStoreProducts = await fakeStoreRes.json();
    console.log('✅ FakeStore products:', fakeStoreProducts.length);

    // Fetch custom products from Supabase
    try {
      const supabase = await createClient();
      const { data: customProducts, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching custom products:', error);
        // Return only FakeStore products if Supabase fails
        return fakeStoreProducts;
      }

      console.log('✅ Custom products:', customProducts?.length || 0);

      // Merge both product lists
      const allProducts = [
        ...(customProducts || []),
        ...fakeStoreProducts
      ];

      console.log('✅ Total products:', allProducts.length);
      return allProducts;
    } catch (supabaseError) {
      console.error('❌ Supabase error:', supabaseError);
      // Return only FakeStore products if Supabase fails
      return fakeStoreProducts;
    }
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    // Return empty array if everything fails
    return [];
  }
}

async function getCategories() {
  try {
    // Fetch FakeStore API categories
    const fakeStoreRes = await fetch("https://fakestoreapi.com/products/categories", {
      cache: "no-store",
    });
    const fakeStoreCategories = await fakeStoreRes.json();

    // Fetch custom categories from Supabase
    try {
      const supabase = await createClient();
      const { data: customCategories, error } = await supabase
        .from('categories')
        .select('name')
        .order('name');

      if (error) {
        console.error('Error fetching custom categories:', error);
        // Return only FakeStore categories if Supabase fails
        return fakeStoreCategories;
      }

      // Merge and remove duplicates
      const allCategories = [
        ...new Set([
          ...fakeStoreCategories,
          ...(customCategories?.map(c => c.name) || [])
        ])
      ];

      return allCategories;
    } catch (supabaseError) {
      console.error('Supabase categories error:', supabaseError);
      // Return only FakeStore categories if Supabase fails
      return fakeStoreCategories;
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return default categories if everything fails
    return ['electronics', 'jewelery', "men's clothing", "women's clothing"];
  }
}

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories()
  ]);

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
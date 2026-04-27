import ProductExplorer from '@/components/productExplorer'
import { createClient } from '@/utils/supabase/server'

async function getProducts() {
  // Fetch FakeStore API products
  const fakeStoreRes = await fetch("https://fakestoreapi.com/products", {
    cache: "no-store",
  });
  const fakeStoreProducts = await fakeStoreRes.json();

  // Fetch custom products from Supabase
  const supabase = await createClient();
  const { data: customProducts, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching custom products:', error);
  }

  // Merge both product lists
  const allProducts = [
    ...(customProducts || []),
    ...fakeStoreProducts
  ];

  return allProducts;
}

async function getCategories() {
  // Fetch FakeStore API categories
  const fakeStoreRes = await fetch("https://fakestoreapi.com/products/categories", {
    cache: "no-store",
  });
  const fakeStoreCategories = await fakeStoreRes.json();

  // Fetch custom categories from Supabase
  const supabase = await createClient();
  const { data: customCategories, error } = await supabase
    .from('categories')
    .select('name')
    .order('name');

  if (error) {
    console.error('Error fetching custom categories:', error);
  }

  // Merge and remove duplicates
  const allCategories = [
    ...new Set([
      ...fakeStoreCategories,
      ...(customCategories?.map(c => c.name) || [])
    ])
  ];

  return allCategories;
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
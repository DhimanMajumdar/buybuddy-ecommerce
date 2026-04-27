export const dynamic = "force-dynamic";

import { createClient } from '@/utils/supabase/server';

async function getProduct(id) {
  // Check if ID is a UUID (custom product) or number (FakeStore product)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  if (isUUID) {
    // Fetch from Supabase (custom product)
    try {
      const supabase = await createClient();
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !product) {
        throw new Error("Product not found");
      }

      return product;
    } catch (error) {
      console.error('Error fetching custom product:', error);
      throw new Error("Product not found");
    }
  } else {
    // Fetch from FakeStore API
    try {
      const res = await fetch(`https://fakestoreapi.com/products/${id}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch product");
      }

      return res.json();
    } catch (error) {
      console.error('Error fetching FakeStore product:', error);
      throw new Error("Failed to fetch product");
    }
  }
}

export default async function ProductDetails({ params }) {
  const { id } = await params;

  const product = await getProduct(id);

  // Calculate discounted price if applicable
  const hasDiscount = product.discount_percentage && product.discount_percentage > 0;
  const discountedPrice = hasDiscount 
    ? (product.price * (1 - product.discount_percentage / 100)).toFixed(2)
    : product.price;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-10 border rounded-2xl shadow-lg p-8">
        
        {/* IMAGE */}
        <div className="flex items-center justify-center relative">
          <img
            src={product.image}
            alt={product.title}
            className="h-72 object-contain"
          />
          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-0 left-0 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg">
              <span className="text-sm font-black">{product.discount_percentage}% OFF</span>
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl md:text-3xl font-bold">
            {product.title}
          </h1>

          <p className="text-gray-500 mt-2 capitalize">
            {product.category}
          </p>

          {/* Price Display */}
          {hasDiscount ? (
            <div className="mt-4">
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-semibold text-green-600">
                  ${discountedPrice}
                </p>
                <p className="text-xl text-gray-400 line-through">
                  ${product.price}
                </p>
              </div>
              <p className="text-sm text-green-600 font-bold mt-1">
                You save ${(product.price - discountedPrice).toFixed(2)} ({product.discount_percentage}% off)
              </p>
            </div>
          ) : (
            <p className="text-3xl font-semibold text-green-600 mt-4">
              ${product.price}
            </p>
          )}

          <p className="text-gray-600 mt-6 leading-relaxed">
            {product.description}
          </p>

          {product.rating && (
            <div className="mt-6 flex items-center gap-2">
              <span className="font-semibold text-gray-900">Rating:</span>
              <span className="text-amber-500 font-bold flex items-center gap-1">
                ⭐ {product.rating?.rate}
              </span>
              <span className="text-gray-400 text-sm font-semibold italic">
                ({product.rating?.count} reviews)
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
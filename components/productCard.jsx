import React from 'react'
import Link from 'next/link'
import { ShoppingCart, Star, Trash2 } from 'lucide-react'
import { useUserCart } from '../app/hooks/useUserCart';

const ProductCard = ({ product }) => {
  const addToCart = useUserCart((state) => state.addToCart);
  
  // Calculate discounted price
  const hasDiscount = product.discount_percentage && product.discount_percentage > 0;
  const discountedPrice = hasDiscount 
    ? (product.price * (1 - product.discount_percentage / 100)).toFixed(2)
    : product.price;
  
  return (
    <div className="group flex flex-col bg-white rounded-4xl border border-sky-100 overflow-hidden transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,186,255,0.15)] hover:-translate-y-2">
      <div className="relative aspect-4/5 w-full overflow-hidden bg-gray-50/50 p-10">
        <img
          src={product.image}
          alt={product.title}
          className="h-full w-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-sky-100 shadow-sm">
          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
          <span className="text-[10px] font-bold text-gray-700">{product.rating?.rate || "0.0"}</span>
        </div>
        
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full shadow-lg">
            <span className="text-xs font-black">{product.discount_percentage}% OFF</span>
          </div>
        )}
      </div>  
      <div className="flex flex-1 flex-col p-6 pt-2">
        <div className="flex-1">
          <span className="text-[10px] uppercase font-black tracking-widest text-sky-500 mb-2 block">
            {product.category}
          </span>
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 leading-tight group-hover:text-sky-600 transition-colors">
            {product.title}
          </h3>
          <div className="mt-4 flex items-end justify-between">
            {hasDiscount ? (
              <div className="flex flex-col">
                <p className="text-2xl font-black text-green-600 tracking-tight">
                  ${discountedPrice}
                </p>
                <p className="text-sm text-gray-400 line-through">
                  ${product.price}
                </p>
              </div>
            ) : (
              <p className="text-2xl font-black text-gray-900 tracking-tight">
                ${product.price}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 w-full mt-auto">
          <Link
            href={`/products/${product.id}`}
            className="flex-1 inline-flex items-center justify-center rounded-2xl bg-gray-900 px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-sky-600 hover:shadow-lg hover:shadow-sky-200 active:scale-95"
          >
            View details
          </Link>
          <button onClick={() => addToCart(product)} className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-sky-100 text-sky-600 transition-all hover:bg-sky-50 active:scale-90">
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
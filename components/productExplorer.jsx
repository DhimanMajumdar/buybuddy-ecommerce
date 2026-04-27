"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, Package, X, Check } from 'lucide-react';
import ProductCard from './productCard';

const ProductExplorer = ({ initialProducts, categories }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categoryCounts = useMemo(() => {
    const counts = { all: initialProducts.length };
    initialProducts.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, initialProducts]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSearchQuery("");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="space-y-12 pb-20">
      {/* Search & Filter Section */}
      <div className="sticky top-24 z-40 px-2 lg:px-0">
        <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] p-2 shadow-[0_30px_60px_-15px_rgba(0,186,255,0.1)] border border-sky-100/50">
          <div className="flex flex-col lg:flex-row gap-2">
            {/* Search Input Container */}
            <div className="relative flex-[1.5] group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Search className={`h-5 w-5 transition-all duration-300 ${searchQuery ? "text-sky-500 scale-110" : "text-gray-400"}`} />
              </div>
              <input
                type="text"
                placeholder="Find something amazing..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-sky-50/50 hover:bg-sky-50 border-0 focus:ring-2 focus:ring-sky-200 rounded-[2rem] pl-16 pr-12 py-5 text-lg font-bold text-gray-800 placeholder-gray-400 transition-all outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Category Pills Container */}
            <div className="flex items-center gap-2 p-1 bg-gray-50/50 rounded-4xl border border-gray-100/50 overflow-x-auto no-scrollbar lg:flex-1">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`flex items-center gap-2 px-6 py-4 rounded-full text-sm font-black transition-all whitespace-nowrap ${
                  selectedCategory === "all"
                    ? "bg-white text-sky-600 shadow-[0_4px_12px_rgba(0,186,255,0.15)] ring-1 ring-sky-100"
                    : "text-gray-500 hover:text-sky-600 hover:bg-white/40"
                }`}
              >
                <span>All</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${selectedCategory === 'all' ? 'bg-sky-100 text-sky-600' : 'bg-gray-200 text-gray-500'}`}>
                  {categoryCounts.all}
                </span>
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex items-center gap-2 px-6 py-4 rounded-full text-sm font-black transition-all whitespace-nowrap capitalize ${
                    selectedCategory === category
                      ? "bg-white text-sky-600 shadow-[0_4px_12px_rgba(0,186,255,0.15)] ring-1 ring-sky-100"
                      : "text-gray-500 hover:text-sky-600 hover:bg-white/40"
                  }`}
                >
                  <span>{category}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${selectedCategory === category ? 'bg-sky-100 text-sky-600' : 'bg-gray-200 text-gray-500'}`}>
                    {categoryCounts[category]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hero-like Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-10 bg-sky-500 rounded-full"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500">Discover</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight flex items-baseline gap-3">
            {selectedCategory === 'all' ? 'Featured Items' : <span className="capitalize">{selectedCategory}</span>}
            <span className="text-sm font-bold text-sky-500 uppercase tracking-widest">{filteredProducts.length} Items found</span>
          </h2>
        </div>
        
        {(searchQuery || selectedCategory !== "all") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="group flex items-center gap-2 px-6 py-3.5 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-sky-600 transition-all active:scale-95 shadow-lg shadow-gray-200"
          >
            <X className="h-4 w-4 transition-transform group-hover:rotate-90" />
            Clear Filters
          </button>
        )}
      </div>

      {/* Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4 lg:px-0">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border border-sky-100 shadow-inner overflow-hidden relative mx-4 lg:mx-0">
          <div className="h-28 w-28 bg-sky-50 rounded-full flex items-center justify-center mb-8 ring-8 ring-sky-50/50">
            <Package className="h-14 w-14 text-sky-200" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 tracking-tight">No results found</h3>
          <p className="text-gray-500 mt-4 text-lg font-medium text-center max-w-sm px-6 leading-relaxed">
            We couldn't find anything matching your search. Try broadening your criteria or reset.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="mt-10 px-10 py-5 bg-sky-600 text-white rounded-2xl font-black shadow-xl shadow-sky-200 hover:bg-gray-900 active:scale-95 transition-all text-xs uppercase tracking-[0.2em]"
          >
            RESET ALL FILTERS
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductExplorer;

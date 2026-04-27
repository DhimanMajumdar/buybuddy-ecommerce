import Link from 'next/link'
import React from 'react'
import { ArrowRight, ShoppingBag, ShieldCheck, Zap } from 'lucide-react'

const HomePage = () => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-sky-200/30 blur-3xl" />
      <div className="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-indigo-100/40 blur-3xl" />

      <section className="relative grid min-h-[calc(100vh-160px)] grid-cols-1 lg:grid-cols-2 items-center px-6 lg:px-20 py-12 lg:py-20 gap-16">
        <div className="max-w-4xl order-2 lg:order-1 outline-none">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-600 mb-8 animate-fade-in">
            <Zap className="h-3.5 w-3.5" />
            New: Smart Recommendations are here
          </div>

          <h1 className="text-5xl font-black tracking-tight text-gray-900 sm:text-7xl lg:text-8xl leading-[0.9]">
            The next gen <br />
            <span className="bg-linear-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
              shopping hub.
            </span>
          </h1>
          
          <p className="mt-8 text-xl sm:text-2xl text-gray-600 max-w-2xl leading-relaxed">
            Experience commerce without the friction. BuyBuddy streamlines your shopping journey with curated collections.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-start gap-5">
              <Link 
                href="/products" 
                className="group flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-10 py-5 text-xl font-bold text-white shadow-2xl shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-1 active:scale-95"
              >
                Get Started
                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1.5" />
              </Link>
            
            <Link 
              href="/about" 
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border-2 border-sky-100 bg-white/50 backdrop-blur-sm px-10 py-5 text-xl font-bold text-gray-700 transition-all hover:border-sky-200 hover:bg-white active:scale-95"
            >
              Learn More
            </Link>
          </div>

          {/* Features Preview */}
          <div className="mt-20 flex flex-wrap gap-8">
            <div className="flex items-center gap-3 text-gray-500 font-semibold">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-sky-100">
                <ShoppingBag className="h-5 w-5 text-sky-600" />
              </div>
              <span>Curated Brands</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500 font-semibold">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-sky-100">
                <ShieldCheck className="h-5 w-5 text-sky-600" />
              </div>
              <span>Secure Payments</span>
            </div>
          </div>
        </div>

        {/* Image Section */}
        <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end w-full">
          <div className="absolute -inset-10 bg-linear-to-tr from-sky-400/20 to-indigo-400/20 rounded-[4rem] blur-[80px] opacity-60 animate-pulse" />
          <div className="relative w-full overflow-hidden rounded-[3rem] border-8 border-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-700 hover:scale-[1.03] sm:max-w-none lg:max-w-full">
            <img 
              src="/image.png" 
              alt="BuyBuddy App Preview" 
              className="w-full h-auto object-cover scale-105 transition-transform duration-1000 origin-center"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
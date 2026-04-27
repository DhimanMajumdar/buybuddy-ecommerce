import React from 'react'
import { Rocket, Heart, Shield } from 'lucide-react'

const AboutPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-base font-bold uppercase tracking-widest text-sky-600">Our Story</h2>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-900 sm:text-6xl">
          Redefining the <span className="text-sky-600">shopping</span> experience.
        </h1>
        <p className="mt-8 text-xl leading-8 text-gray-600">
          At BuyBuddy, we believe shopping should be intuitive, secure, and personal. We've built a platform that simplifies discovery while prioritizing your security and choice.
        </p>
      </div>

      <div className="mt-20 grid grid-cols-1 gap-12 sm:grid-cols-3">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 shadow-inner">
            <Rocket className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Innovation First</h3>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Constantly evolving our smart hub to bring you the latest products and best deals.
          </p>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 shadow-inner">
            <Heart className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">User Centric</h3>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Designed with the shopper in mind. Every click is optimized for a seamless journey.
          </p>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-inner">
            <Shield className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Trusted Security</h3>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Your data and privacy are non-negotiable. Advanced encryption on every transaction.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
"use client";

import React from "react";

const CreditCard = ({ cardNumber, cardHolder, expiryDate, cvv }) => {
  // Format card number with spaces
  const formatCardNumber = (num) => {
    const v = num.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const parts = v.match(/.{1,4}/g);
    return parts ? parts.join(" ") : num;
  };

  return (
    <div className="relative w-full max-w-md aspect-[1.586/1] group perspective-1000">
      <div className="absolute inset-0 bg-linear-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 transform group-hover:rotate-y-12 group-hover:rotate-x-6 group-hover:scale-105">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/20 blur-[80px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 blur-[80px] rounded-full" />

        <div className="relative h-full p-8 flex flex-col justify-between text-white font-sans">
          <div className="flex justify-between items-start">
            <div className="w-12 h-10 bg-linear-to-br from-yellow-400 to-yellow-600 rounded-md shadow-inner opacity-80" />
            <div className="text-xl font-bold tracking-widest italic opacity-90 uppercase">
              VISA
            </div>
          </div>

          <div className="space-y-6">
            <div className="text-2xl md:text-3xl font-mono tracking-[0.2em] drop-shadow-md transition-all duration-300">
              {formatCardNumber(cardNumber) || "•••• •••• •••• ••••"}
            </div>

            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider opacity-60 font-medium">Card Holder</p>
                <p className="text-lg font-semibold tracking-wide truncate max-w-[200px]">
                  {cardHolder || "YOUR NAME"}
                </p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] uppercase tracking-wider opacity-60 font-medium">Expires</p>
                <p className="text-lg font-semibold tracking-wide">
                  {expiryDate || "MM/YY"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS for perspective and 3D effects */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .rotate-y-12 {
          transform: rotateY(10deg);
        }
        .rotate-x-6 {
          transform: rotateX(5deg);
        }
      `}</style>
    </div>
  );
};

export default CreditCard;

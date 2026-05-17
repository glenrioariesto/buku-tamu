'use client';

import React from 'react';

export default function VisitorHeader() {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-candi-white rounded-full border-2 border-candi-gold-light/80 shadow-md mb-3">
        {/* Custom SVG Candi / Temple Logo */}
        <svg viewBox="0 0 100 100" className="w-9 h-9 fill-candi-gold">
          <path d="M50 10 L80 40 L70 40 L70 65 L85 65 L85 90 L15 90 L15 65 L30 65 L30 40 L20 40 Z" opacity="0.15" />
          <path d="M50 15 L57 25 H43 L50 15 Z M50 25 L65 40 H35 L50 25 Z M50 40 L72 65 H28 L50 40 Z M33 65 H67 V90 H33 V65 Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
          <rect x="44" y="73" width="12" height="17" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </div>
      <h1 className="font-serif text-2xl font-bold tracking-wide text-candi-charcoal">BUKU TAMU DIGITAL</h1>
      <p className="text-sm font-semibold tracking-widest text-candi-gold uppercase mt-0.5">Candi Dadi</p>
      <div className="w-24 h-0.5 bg-candi-gold/30 mx-auto mt-3"></div>
    </div>
  );
}

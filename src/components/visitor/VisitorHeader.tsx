'use client';

import React from 'react';
import Image from 'next/image';

export default function VisitorHeader() {
  return (
    <header className="text-center pt-11 pb-8 border-b border-tamu-parch3 mb-7">
      <Image 
        src="/logo.webp" 
        alt="Logo Candi Dadi" 
        width={64} 
        height={64} 
        className="mx-auto mb-2 rounded-full"
        priority
      />
      <div className="flex items-center justify-center gap-3 text-candi-gold text-[11px] tracking-[5px] uppercase mb-2.5 w-full max-w-[350px] mx-auto">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-candi-gold-light max-w-[70px]"></div>
        <span>Warisan Budaya Nusantara</span>
        <div className="flex-1 h-px bg-gradient-to-r from-candi-gold-light to-transparent max-w-[70px]"></div>
      </div>
      <h1 
        className="font-serif font-semibold tracking-[2px]" 
        style={{
          fontSize: 'clamp(24px, 6vw, 42px)',
          background: 'linear-gradient(135deg, var(--color-candi-charcoal) 0%, var(--color-candi-gold) 50%, var(--color-candi-gold-dark) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        Candi Dadi
      </h1>
      <p className="font-crimson italic text-base text-candi-muted mt-1.5">Buku Tamu Pengunjung</p>
      <div className="text-candi-gold-light text-[13px] tracking-[8px] mt-3.5">◆ ◇ ◆ ◇ ◆</div>
    </header>
  );
}

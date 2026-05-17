'use client';

import React from 'react';

interface SuccessCardProps {
  name: string;
  onReset: () => void;
}

export default function SuccessCard({ name, onReset }: SuccessCardProps) {
  return (
    <div className="bg-white rounded-[14px] shadow-[0_4px_24px_rgba(44,36,22,0.18)] border border-tamu-parch3 p-[36px_24px] relative overflow-hidden text-center animate-fade-in">
      {/* Top decorative line */}
      <div 
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: 'linear-gradient(90deg, var(--color-candi-gold-dark), var(--color-candi-gold), var(--color-candi-gold-light), var(--color-candi-gold), var(--color-candi-gold-dark))' }}
      ></div>

      <div className="text-[52px] mb-3.5 leading-none">🏛️</div>
      <h2 className="font-serif text-[22px] text-tamu-moss mb-2 font-bold">Terima Kasih!</h2>
      <p className="text-[14px] text-candi-muted leading-[1.7]">
        Kunjungan Anda ke <strong>Candi Dadi</strong> telah tercatat.<br/>
        Semoga perjalanan Anda menyenangkan dan penuh makna.
      </p>
      <div className="font-crimson italic text-[16px] text-candi-gold mt-3">
        "Menjaga warisan, merawat peradaban"
      </div>
      
      <button
        onClick={onReset}
        className="mt-5 px-7 py-[11px] bg-transparent border-[1.5px] border-candi-gold rounded-lg font-sans text-[13px] text-candi-gold cursor-pointer transition-all duration-200 hover:bg-[#ede4ce]"
      >
        ← Isi Lagi (Tamu Berikutnya)
      </button>
    </div>
  );
}

'use client';

import React from 'react';
import { CheckCircle, Sparkles } from 'lucide-react';

interface SuccessCardProps {
  name: string;
  onReset: () => void;
}

export default function SuccessCard({ name, onReset }: SuccessCardProps) {
  return (
    <div className="w-full bg-candi-white rounded-2xl shadow-xl border border-candi-gold-light/60 p-6 md:p-8 text-center animate-fade-in">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-candi-gold-light/40 rounded-full flex items-center justify-center border border-candi-gold/30">
          <CheckCircle className="w-12 h-12 text-candi-gold animate-bounce" />
        </div>
      </div>
      <h2 className="font-serif text-3xl font-bold text-candi-charcoal mb-3">Matur Nuwun!</h2>
      <p className="text-candi-muted text-base mb-6 leading-relaxed">
        Data kunjungan <strong>{name}</strong> telah berhasil disimpan ke dalam Buku Tamu Resmi Candi Dadi. Terima kasih atas partisipasi Anda dalam melestarikan warisan budaya nusantara.
      </p>
      <div className="border-t border-b border-candi-gold-light py-4 px-3 mb-6 bg-candi-cream/40 rounded-lg flex items-center justify-center gap-2 text-sm text-candi-charcoal font-medium">
        <Sparkles className="w-4 h-4 text-candi-gold shrink-0" />
        <span>Semoga perjalanan Anda menyenangkan & penuh berkah!</span>
      </div>
      <button
        onClick={onReset}
        className="w-full py-3.5 bg-candi-gold hover:bg-candi-gold-dark text-white font-semibold rounded-xl transition duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer font-sans"
      >
        Isi Buku Tamu Baru
      </button>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import VisitorHeader from '@/components/visitor/VisitorHeader';
import CheckInForm from '@/components/visitor/CheckInForm';
import SuccessCard from '@/components/visitor/SuccessCard';

export default function GuestBookPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [guestName, setGuestName] = useState('');

  const handleSuccess = (name: string) => {
    setGuestName(name);
    setIsSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-candi-cream selection:bg-candi-gold/20 py-10 px-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative Traditional Border Accents */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-candi-gold-light via-candi-gold to-candi-gold-dark"></div>

      <div className="w-full max-w-md relative z-10">
        <VisitorHeader />

        {isSuccess ? (
          <SuccessCard name={guestName} onReset={() => setIsSuccess(false)} />
        ) : (
          <CheckInForm onSuccess={handleSuccess} />
        )}

        {/* Footer Accent */}
        <div className="text-center mt-8 text-xs text-candi-muted font-medium">
          <p suppressHydrationWarning>© {new Date().getFullYear()} Candi Dadi. All rights reserved.</p>
          <p className="mt-1">Pemerintah Kabupaten Tulungagung - Balai Pelestarian Kebudayaan</p>
        </div>
      </div>
    </div>
  );
}

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
    <div className="w-full max-w-[600px] mx-auto px-4 pb-16 selection:bg-candi-gold/20">
      <VisitorHeader />

      {isSuccess ? (
        <SuccessCard name={guestName} onReset={() => setIsSuccess(false)} />
      ) : (
        <CheckInForm onSuccess={handleSuccess} />
      )}

      {/* Footer */}
      <footer className="text-center py-5 text-[11px] text-tamu-stone-lt tracking-[0.5px] mt-2">
        <p suppressHydrationWarning>© {new Date().getFullYear()} Candi Dadi. All rights reserved.</p>
        <p className="mt-1">Pemerintah Kabupaten Tulungagung - Balai Pelestarian Kebudayaan</p>
      </footer>
    </div>
  );
}

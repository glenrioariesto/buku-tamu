'use client';

import React from 'react';
import { useAdminStore } from '@/store/useAdminStore';

export default function StatCards() {
  const guests = useAdminStore((s) => s.guests);
  const isLoading = useAdminStore((s) => s.isLoading);

  // Calculate statistics metrics
  const totalGuests = guests.length;
  
  const todayGuests = guests.filter((g) => {
    const today = new Date().toDateString();
    const guestDate = new Date(g.createdAt).toDateString();
    return today === guestDate;
  }).length;

  const personalGuests = guests.filter((g) => g.type === 'personal').length;
  const rombonganGuests = guests.filter((g) => g.type === 'rombongan').length;
  
  const uniqueCities = new Set(guests.map((g) => g.city.toLowerCase().trim())).size;

  const ratedGuests = guests.filter((g) => g.rating && g.rating > 0);
  const avgRating = ratedGuests.length > 0
    ? (ratedGuests.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedGuests.length).toFixed(1)
    : '—';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
      {/* Card 1: Total */}
      <div className="bg-candi-white p-5 rounded-2xl shadow-sm border border-candi-gold-light/40 flex flex-col items-center text-center">
        <span className="text-3xl font-bold text-candi-gold leading-none mb-2">
          {isLoading ? '—' : totalGuests}
        </span>
        <span className="text-[10px] font-bold text-candi-muted tracking-wider uppercase">
          Total Tamu
        </span>
      </div>
      {/* Card 2: Hari Ini */}
      <div className="bg-candi-white p-5 rounded-2xl shadow-sm border border-candi-gold-light/40 flex flex-col items-center text-center">
        <span className="text-3xl font-bold text-candi-gold leading-none mb-2">
          {isLoading ? '—' : todayGuests}
        </span>
        <span className="text-[10px] font-bold text-candi-muted tracking-wider uppercase">
          Tamu Hari Ini
        </span>
      </div>
      {/* Card 3: Personal */}
      <div className="bg-candi-white p-5 rounded-2xl shadow-sm border border-candi-gold-light/40 flex flex-col items-center text-center">
        <span className="text-3xl font-bold text-candi-gold leading-none mb-2">
          {isLoading ? '—' : personalGuests}
        </span>
        <span className="text-[10px] font-bold text-candi-muted tracking-wider uppercase">
          Personal
        </span>
      </div>
      {/* Card 4: Rombongan */}
      <div className="bg-candi-white p-5 rounded-2xl shadow-sm border border-candi-gold-light/40 flex flex-col items-center text-center">
        <span className="text-3xl font-bold text-candi-gold leading-none mb-2">
          {isLoading ? '—' : rombonganGuests}
        </span>
        <span className="text-[10px] font-bold text-candi-muted tracking-wider uppercase">
          Rombongan
        </span>
      </div>
      {/* Card 5: Kota Asal */}
      <div className="bg-candi-white p-5 rounded-2xl shadow-sm border border-candi-gold-light/40 flex flex-col items-center text-center">
        <span className="text-3xl font-bold text-candi-gold leading-none mb-2">
          {isLoading ? '—' : uniqueCities}
        </span>
        <span className="text-[10px] font-bold text-candi-muted tracking-wider uppercase">
          Kota Asal
        </span>
      </div>
      {/* Card 6: Average Rating */}
      <div className="bg-candi-white p-5 rounded-2xl shadow-sm border border-candi-gold-light/40 flex flex-col items-center text-center">
        <span className="text-3xl font-bold text-candi-gold leading-none mb-2 flex items-center justify-center gap-1">
          {avgRating} <span className="text-lg text-candi-gold">★</span>
        </span>
        <span className="text-[10px] font-bold text-candi-muted tracking-wider uppercase">
          Avg Rating
        </span>
      </div>
    </div>
  );
}

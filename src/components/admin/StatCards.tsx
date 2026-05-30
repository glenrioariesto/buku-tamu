'use client';

import React from 'react';
import { useAdminStore } from '@/store/useAdminStore';

export default function StatCards() {
  const stats = useAdminStore((s) => s.stats);
  const isLoading = useAdminStore((s) => s.isLoading);

  const cardClass = "bg-candi-white p-5 rounded-2xl shadow-sm border border-candi-gold-light/40 flex flex-col items-center text-center";
  const numClass = "text-3xl font-bold text-candi-gold leading-none mb-2";
  const labelClass = "text-[10px] font-bold text-candi-muted tracking-wider uppercase";
  const dash = isLoading ? '—' : null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
      <div className={cardClass}>
        <span className={numClass}>{dash ?? stats.total}</span>
        <span className={labelClass}>Total Entri</span>
      </div>
      <div className={cardClass}>
        <span className={numClass}>{dash ?? stats.todayCount}</span>
        <span className={labelClass}>Tamu Hari Ini</span>
      </div>
      <div className={cardClass}>
        <span className={numClass}>{dash ?? stats.personalCount}</span>
        <span className={labelClass}>Personal</span>
      </div>
      <div className={cardClass}>
        <span className={numClass}>{dash ?? stats.rombonganCount}</span>
        <span className={labelClass}>Rombongan</span>
      </div>
      <div className={cardClass}>
        <span className={numClass}>{dash ?? stats.totalOrgMembers}</span>
        <span className={labelClass}>Anggota Rombongan</span>
      </div>
      <div className={`${cardClass} sm:col-span-2 lg:col-span-1 border-candi-gold/30 bg-candi-cream/30`}>
        <span className={`${numClass} text-candi-gold-dark`}>{dash ?? stats.totalVisitors}</span>
        <span className={`${labelClass} text-candi-gold-dark`}>Total Pengunjung</span>
      </div>
      <div className={cardClass}>
        <span className={numClass}>{dash ?? stats.uniqueCities}</span>
        <span className={labelClass}>Kota Asal</span>
      </div>
      <div className={cardClass}>
        <span className={`${numClass} flex items-center justify-center gap-1`}>
          {dash ?? stats.avgRating} <span className="text-lg">★</span>
        </span>
        <span className={labelClass}>Avg Rating</span>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface Option {
  value: string;
  label: string;
  isGroup?: boolean;
}

interface CustomSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export default function CustomSelect({
  id,
  value,
  onChange,
  options,
  placeholder = '-- Pilih --',
  disabled = false,
  error = false,
  className = ''
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value && !opt.isGroup);

  const handleSelect = (val: string, isGroup?: boolean) => {
    if (isGroup) return; // Cannot select a group header
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full py-[11px] px-[13px] bg-white border-[1.5px] rounded-lg text-[14px] font-sans transition-colors duration-200 text-left cursor-pointer flex items-center justify-between outline-none ${
          disabled 
            ? 'opacity-60 cursor-not-allowed border-[#ede4ce] bg-[#faf8f5]' 
            : error 
              ? 'border-[#d35a5a] bg-[#fff8f7]' 
              : isOpen 
                ? 'border-candi-gold' 
                : 'border-[#ede4ce] hover:border-candi-gold/60'
        }`}
      >
        <span className={`block truncate mr-2 ${selectedOption ? 'text-[#2c2416]' : 'text-candi-muted'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-candi-gold transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu Options Panel */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-[#ede4ce] rounded-lg shadow-[0_4px_24px_rgba(44,36,22,0.15)] max-h-[300px] overflow-y-auto animate-fade-in py-1.5 font-sans">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-candi-muted italic text-center">
              Tidak ada pilihan
            </div>
          ) : (
            options.map((opt) => {
              if (opt.isGroup) {
                return (
                  <div key={`group-${opt.label}`} className="px-3 pt-3 pb-1.5 text-[11px] font-semibold text-[#9a8468] uppercase tracking-wide">
                    {opt.label}
                  </div>
                );
              }

              const isSelected = opt.value === value;
              return (
                <button
                  key={`opt-${opt.value}`}
                  type="button"
                  onClick={() => handleSelect(opt.value, opt.isGroup)}
                  className={`w-full px-3 py-2 text-left text-[14px] transition-colors duration-100 flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#f7f0e2] text-candi-gold font-medium'
                      : 'text-[#2c2416] hover:bg-[#faf8f5]'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-candi-gold shrink-0 ml-2" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

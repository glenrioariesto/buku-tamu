'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
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

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full py-3 pl-4 pr-10 bg-candi-cream/30 border rounded-xl text-sm transition duration-150 text-left cursor-pointer flex items-center justify-between outline-none focus:border-candi-gold focus:ring-1 focus:ring-candi-gold/30 ${
          disabled 
            ? 'opacity-50 cursor-not-allowed bg-candi-cream/10 border-candi-gold-light/40' 
            : error 
              ? 'border-red-400 bg-red-50/20' 
              : 'border-candi-gold-light hover:border-candi-gold/60'
        }`}
      >
        <span className={`block truncate mr-2 ${selectedOption ? 'text-candi-charcoal font-medium' : 'text-candi-muted'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-candi-gold transition duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu Options Panel */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1.5 bg-candi-white border border-candi-gold-light/70 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-fade-in py-1">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-candi-muted italic text-center">
              Tidak ada pilihan
            </div>
          ) : (
            options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full px-4 py-2.5 text-left text-sm transition duration-100 flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-candi-gold/10 text-candi-gold font-semibold'
                      : 'text-candi-charcoal hover:bg-candi-cream/40'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-candi-gold shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Search, Globe, Compass, Sparkles, Filter, X } from 'lucide-react';
import { Continent } from '../types/recipe';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedContinent: Continent | 'All';
  onSelectContinent: (c: Continent | 'All') => void;
  starterOnly: boolean;
  onToggleStarterOnly: () => void;
  offlineOnly: boolean;
  onToggleOfflineOnly: () => void;
  quickTimeFilter: number | null;
  onSelectTimeFilter: (time: number | null) => void;
  totalFilteredCount: number;
}

const CONTINENTS: Array<{ label: Continent | 'All'; icon: string }> = [
  { label: 'All', icon: '🌍' },
  { label: 'Africa', icon: '🌍' },
  { label: 'Asia', icon: '🌏' },
  { label: 'Europe', icon: '🏛️' },
  { label: 'North America', icon: '🌮' },
  { label: 'South America', icon: '🏔️' },
  { label: 'Oceania', icon: '🏝️' }
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  selectedContinent,
  onSelectContinent,
  starterOnly,
  onToggleStarterOnly,
  offlineOnly,
  onToggleOfflineOnly,
  quickTimeFilter,
  onSelectTimeFilter,
  totalFilteredCount
}) => {
  return (
    <div className="relative pt-6 pb-8 sm:pt-10 sm:pb-12 border-b border-stone-800/80 bg-gradient-to-b from-stone-900/40 via-stone-950 to-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold tracking-wider uppercase">
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive World Cookbook & Food Passport</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black text-stone-100 tracking-tight leading-[1.15]">
            Explore the world. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
              One recipe at a time.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl mx-auto">
            From smoky Nigerian Jollof and Tokyo Shoyu Ramen to authentic Bolognese and Fijian Kokoda. 
            Enjoy <strong className="text-stone-100">50 free starter recipes ready offline</strong>, stamp your personal Food Passport, and cook with local-first culinary tools and AI chef guidance.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="relative flex items-center bg-stone-900/90 rounded-2xl border border-stone-800 shadow-2xl focus-within:border-amber-500/80 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
            <Search className="w-5 h-5 text-stone-400 ml-4 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search recipes, countries, ingredients (e.g. jollof, ceviche, coconut, lamb)..."
              className="w-full py-3.5 pl-3 pr-10 bg-transparent text-sm sm:text-base text-stone-100 placeholder-stone-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="p-2 mr-2 text-stone-400 hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Continent Filter Pills */}
        <div className="mt-6 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CONTINENTS.map((cont) => {
            const isSelected = selectedContinent === cont.label;
            return (
              <button
                key={cont.label}
                onClick={() => onSelectContinent(cont.label)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 scale-105'
                    : 'bg-stone-900/80 text-stone-300 hover:text-stone-100 hover:bg-stone-850 border border-stone-800'
                }`}
              >
                <span>{cont.icon}</span>
                <span>{cont.label}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Quick-Filter Chips */}
        <div className="mt-4 flex items-center justify-center flex-wrap gap-2 text-xs">
          {/* Free Starter toggle */}
          <button
            onClick={onToggleStarterOnly}
            className={`px-3 py-1.5 rounded-full font-medium transition-all ${
              starterOnly
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            ★ 50 Free Starters
          </button>

          {/* Offline only toggle */}
          <button
            onClick={onToggleOfflineOnly}
            className={`px-3 py-1.5 rounded-full font-medium transition-all ${
              offlineOnly
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/50'
                : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            ✓ Offline Available
          </button>

          {/* Quick time filters */}
          <button
            onClick={() => onSelectTimeFilter(quickTimeFilter === 30 ? null : 30)}
            className={`px-3 py-1.5 rounded-full font-medium transition-all ${
              quickTimeFilter === 30
                ? 'bg-stone-200 text-stone-950 font-bold'
                : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            ⚡ Under 30 Mins
          </button>

          <button
            onClick={() => onSelectTimeFilter(quickTimeFilter === 45 ? null : 45)}
            className={`px-3 py-1.5 rounded-full font-medium transition-all ${
              quickTimeFilter === 45
                ? 'bg-stone-200 text-stone-950 font-bold'
                : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            ⏱️ Under 45 Mins
          </button>

          <span className="text-stone-400 ml-2 font-mono">
            ({totalFilteredCount} recipes found)
          </span>
        </div>
      </div>
    </div>
  );
};

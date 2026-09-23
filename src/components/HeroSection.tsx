import React from 'react';
import { 
  Search, 
  Compass, 
  SlidersHorizontal, 
  X, 
  Sparkles, 
  Check, 
  RotateCcw,
  Clock,
  Globe
} from 'lucide-react';
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
  selectedDietary: string[];
  onRemoveDietary: (tag: string) => void;
  selectedDifficulty: string;
  onResetDifficulty: () => void;
  selectedMealType: string;
  onResetMealType: () => void;
  onOpenFilterDrawer: () => void;
  onResetAllFilters: () => void;
  activeFiltersCount: number;
  totalFilteredCount: number;
  continentCounts: Record<string, number>;
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
  selectedDietary,
  onRemoveDietary,
  selectedDifficulty,
  onResetDifficulty,
  selectedMealType,
  onResetMealType,
  onOpenFilterDrawer,
  onResetAllFilters,
  activeFiltersCount,
  totalFilteredCount,
  continentCounts
}) => {
  return (
    <div className="relative pt-4 pb-6 sm:pt-10 sm:pb-10 border-b border-stone-800/80 bg-gradient-to-b from-stone-900/40 via-stone-950 to-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header / Brand Title - Streamlined for Mobile Viewports */}
        <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[11px] sm:text-xs font-semibold tracking-wider uppercase">
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive World Cookbook</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-5xl lg:text-6xl font-black text-stone-100 tracking-tight leading-[1.2]">
            Explore the world. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
              One recipe at a time.
            </span>
          </h1>

          <p className="hidden sm:block text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl mx-auto">
            From Nigerian Jollof and Tokyo Ramen to authentic Bolognese and Fijian Kokoda. 
            Enjoy <strong className="text-stone-100">50 free starter recipes ready offline</strong>, stamp your personal Food Passport, and cook with local-first culinary guidance.
          </p>
        </div>

        {/* Unified Search & Quick Filter Bar */}
        <div className="mt-4 sm:mt-8 max-w-2xl mx-auto flex items-center gap-2">
          {/* Search Input Box */}
          <div className="relative flex-1 flex items-center bg-stone-900/90 rounded-2xl border border-stone-800 shadow-xl focus-within:border-amber-500/80 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400 ml-3.5 sm:ml-4 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search recipes, ingredients, countries..."
              className="w-full py-3 sm:py-3.5 pl-2.5 sm:pl-3 pr-9 bg-transparent text-xs sm:text-base text-stone-100 placeholder-stone-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="p-1.5 mr-2 text-stone-400 hover:text-stone-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Primary Filter Drawer Trigger Button */}
          <button
            onClick={onOpenFilterDrawer}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-2xl border font-bold text-xs sm:text-sm transition-all shadow-xl shrink-0 min-h-[44px] min-w-[44px] ${
              activeFiltersCount > 0
                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-amber-500/20'
                : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-700 hover:text-stone-100'
            }`}
            title="Open Recipe Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden xs:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeFiltersCount > 0 ? 'bg-stone-950 text-amber-400' : 'bg-amber-500 text-stone-950'
              }`}>
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Continent Filter Scroller with Live Counts */}
        <div className="mt-4 sm:mt-6 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:justify-center">
          {CONTINENTS.map((cont) => {
            const isSelected = selectedContinent === cont.label;
            const count = continentCounts[cont.label] || 0;
            return (
              <button
                key={cont.label}
                onClick={() => onSelectContinent(cont.label)}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 min-h-[40px] shrink-0 border ${
                  isSelected
                    ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-500/20 scale-102 font-bold'
                    : 'bg-stone-900/80 text-stone-300 hover:text-stone-100 hover:bg-stone-800 border-stone-800/80'
                }`}
              >
                <span>{cont.icon}</span>
                <span>{cont.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-stone-950/20 text-stone-950 font-bold' : 'bg-stone-800 text-stone-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Filter Shortcut Bar (Time & Access) */}
        <div className="mt-3 flex items-center justify-start sm:justify-center overflow-x-auto pb-1 gap-1.5 text-xs scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {/* Free Starter toggle */}
          <button
            onClick={onToggleStarterOnly}
            className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap shrink-0 border min-h-[36px] flex items-center gap-1 ${
              starterOnly
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-semibold'
                : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 border-stone-800'
            }`}
          >
            <span>★ 50 Starters</span>
            {starterOnly && <Check className="w-3 h-3 text-amber-400" />}
          </button>

          {/* Offline only toggle */}
          <button
            onClick={onToggleOfflineOnly}
            className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap shrink-0 border min-h-[36px] flex items-center gap-1 ${
              offlineOnly
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60 font-semibold'
                : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 border-stone-800'
            }`}
          >
            <span>✓ Offline Ready</span>
            {offlineOnly && <Check className="w-3 h-3 text-emerald-400" />}
          </button>

          {/* Quick time filter */}
          <button
            onClick={() => onSelectTimeFilter(quickTimeFilter === 30 ? null : 30)}
            className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap shrink-0 border min-h-[36px] flex items-center gap-1 ${
              quickTimeFilter === 30
                ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 border-stone-800'
            }`}
          >
            <span>⚡ Under 30m</span>
          </button>

          <button
            onClick={() => onSelectTimeFilter(quickTimeFilter === 45 ? null : 45)}
            className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap shrink-0 border min-h-[36px] flex items-center gap-1 ${
              quickTimeFilter === 45
                ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 border-stone-800'
            }`}
          >
            <span>⏱️ Under 45m</span>
          </button>

          <span className="text-stone-400 text-[11px] font-mono whitespace-nowrap shrink-0 px-2">
            ({totalFilteredCount} recipes)
          </span>
        </div>

        {/* Active Filters Removable Chips Strip (High Efficiency) */}
        {activeFiltersCount > 0 && (
          <div className="mt-3.5 pt-3 border-t border-stone-800/60 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-stone-400 font-medium mr-1">Active filters:</span>
            
            {selectedContinent !== 'All' && (
              <button
                onClick={() => onSelectContinent('All')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-medium transition-colors"
              >
                <span>Region: {selectedContinent}</span>
                <X className="w-3 h-3 text-stone-400" />
              </button>
            )}

            {quickTimeFilter && (
              <button
                onClick={() => onSelectTimeFilter(null)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-medium transition-colors"
              >
                <span>≤ {quickTimeFilter} mins</span>
                <X className="w-3 h-3 text-stone-400" />
              </button>
            )}

            {starterOnly && (
              <button
                onClick={onToggleStarterOnly}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-medium transition-colors"
              >
                <span>50 Starters</span>
                <X className="w-3 h-3 text-stone-400" />
              </button>
            )}

            {offlineOnly && (
              <button
                onClick={onToggleOfflineOnly}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-medium transition-colors"
              >
                <span>Offline Only</span>
                <X className="w-3 h-3 text-stone-400" />
              </button>
            )}

            {selectedDietary.map((tag) => (
              <button
                key={tag}
                onClick={() => onRemoveDietary(tag)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-medium border border-amber-500/30 transition-colors"
              >
                <span>{tag}</span>
                <X className="w-3 h-3 text-amber-400" />
              </button>
            ))}

            {selectedDifficulty !== 'All' && (
              <button
                onClick={onResetDifficulty}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-medium transition-colors"
              >
                <span>Difficulty: {selectedDifficulty}</span>
                <X className="w-3 h-3 text-stone-400" />
              </button>
            )}

            {selectedMealType !== 'All' && (
              <button
                onClick={onResetMealType}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-medium transition-colors"
              >
                <span>Course: {selectedMealType}</span>
                <X className="w-3 h-3 text-stone-400" />
              </button>
            )}

            <button
              onClick={onResetAllFilters}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 ml-1"
            >
              Clear all
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

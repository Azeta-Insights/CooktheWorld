import React, { useEffect } from 'react';
import { 
  X, 
  RotateCcw, 
  Check, 
  Clock, 
  Sparkles, 
  Globe, 
  Flame, 
  Utensils, 
  SlidersHorizontal 
} from 'lucide-react';
import { Continent } from '../types/recipe';

interface FilterDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalFilteredCount: number;
  selectedContinent: Continent | 'All';
  onSelectContinent: (c: Continent | 'All') => void;
  starterOnly: boolean;
  onToggleStarterOnly: () => void;
  offlineOnly: boolean;
  onToggleOfflineOnly: () => void;
  quickTimeFilter: number | null;
  onSelectTimeFilter: (time: number | null) => void;
  selectedDietary: string[];
  onToggleDietary: (tag: string) => void;
  selectedDifficulty: string;
  onSelectDifficulty: (diff: string) => void;
  selectedMealType: string;
  onSelectMealType: (type: string) => void;
  sortBy: 'recommended' | 'time' | 'title' | 'country';
  onSelectSortBy: (sort: 'recommended' | 'time' | 'title' | 'country') => void;
  onResetAllFilters: () => void;
  activeFiltersCount: number;
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

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Halal',
  'Dairy-Free',
  'Keto'
];

const MEAL_TYPES = [
  { value: 'All', label: 'All Courses' },
  { value: 'main', label: 'Main Course' },
  { value: 'soup_stew', label: 'Soups & Stews' },
  { value: 'street_food', label: 'Street Food' },
  { value: 'breakfast_baking', label: 'Baking & Breakfast' },
  { value: 'salad_side', label: 'Salads & Sides' },
  { value: 'dessert', label: 'Desserts' }
];

const COOK_TIMES = [
  { label: 'Any Time', value: null },
  { label: '⚡ Under 30m', value: 30 },
  { label: '⏱️ Under 45m', value: 45 },
  { label: '🍲 Under 60m', value: 60 }
];

const DIFFICULTIES = [
  { value: 'All', label: 'Any Level' },
  { value: 'Easy', label: 'Easy' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Hard', label: 'Advanced' }
];

const SORT_OPTIONS: Array<{ value: 'recommended' | 'time' | 'title' | 'country'; label: string }> = [
  { value: 'recommended', label: 'Curated (Default)' },
  { value: 'time', label: 'Cook Time (Fastest)' },
  { value: 'title', label: 'Dish Name (A-Z)' },
  { value: 'country', label: 'Country (A-Z)' }
];

export const FilterDrawerModal: React.FC<FilterDrawerModalProps> = ({
  isOpen,
  onClose,
  totalFilteredCount,
  selectedContinent,
  onSelectContinent,
  starterOnly,
  onToggleStarterOnly,
  offlineOnly,
  onToggleOfflineOnly,
  quickTimeFilter,
  onSelectTimeFilter,
  selectedDietary,
  onToggleDietary,
  selectedDifficulty,
  onSelectDifficulty,
  selectedMealType,
  onSelectMealType,
  sortBy,
  onSelectSortBy,
  onResetAllFilters,
  activeFiltersCount
}) => {
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        onClick={onClose}
        className="fixed inset-0"
      />

      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-xl bg-stone-900 rounded-t-3xl sm:rounded-3xl border border-stone-800 shadow-2xl flex flex-col max-h-[88vh] sm:max-h-[85vh] overflow-hidden z-10 animate-in slide-in-from-bottom duration-250"
      >
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1 bg-stone-700 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <h2 className="font-serif text-lg font-bold text-stone-100">Recipe Filters</h2>
            {activeFiltersCount > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {activeFiltersCount} Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <button
                onClick={onResetAllFilters}
                className="text-xs text-stone-400 hover:text-amber-400 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-stone-800 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Filter Options */}
        <div className="overflow-y-auto px-5 py-4 space-y-6 flex-1 scrollbar-thin">
          
          {/* Section: Sort By */}
          <div>
            <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block mb-2.5">
              Sort By
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SORT_OPTIONS.map((opt) => {
                const isSelected = sortBy === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => onSelectSortBy(opt.value)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all border ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold'
                        : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Continent */}
          <div>
            <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block mb-2.5">
              Region / Continent
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {CONTINENTS.map((c) => {
                const isSelected = selectedContinent === c.label;
                return (
                  <button
                    key={c.label}
                    onClick={() => onSelectContinent(c.label)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md font-bold'
                        : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                    }`}
                  >
                    <span>{c.icon}</span>
                    <span className="truncate">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Max Cook Time */}
          <div>
            <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block mb-2.5">
              Total Preparation & Cook Time
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COOK_TIMES.map((time) => {
                const isSelected = quickTimeFilter === time.value;
                return (
                  <button
                    key={time.label}
                    onClick={() => onSelectTimeFilter(time.value)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border text-center ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-md'
                        : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {time.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Dietary Preferences */}
          <div>
            <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block mb-2.5">
              Dietary & Lifestyle Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((tag) => {
                const isSelected = selectedDietary.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => onToggleDietary(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                        : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-amber-400" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Course / Meal Type */}
          <div>
            <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block mb-2.5">
              Meal Course
            </label>
            <div className="flex flex-wrap gap-2">
              {MEAL_TYPES.map((type) => {
                const isSelected = selectedMealType === type.value;
                return (
                  <button
                    key={type.value}
                    onClick={() => onSelectMealType(type.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                        : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Difficulty */}
          <div>
            <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block mb-2.5">
              Difficulty Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DIFFICULTIES.map((d) => {
                const isSelected = selectedDifficulty === d.value;
                return (
                  <button
                    key={d.value}
                    onClick={() => onSelectDifficulty(d.value)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold text-center transition-all border ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                        : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Access & Offline Availability */}
          <div>
            <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block mb-2.5">
              Availability & Offline Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onToggleStarterOnly}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all border flex items-center justify-between ${
                  starterOnly
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                    : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>★ 50 Free Starters</span>
                {starterOnly && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              <button
                onClick={onToggleOfflineOnly}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all border flex items-center justify-between ${
                  offlineOnly
                    ? 'bg-emerald-950/80 border-emerald-600/60 text-emerald-300'
                    : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>✓ Offline Saved Only</span>
                {offlineOnly && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            </div>
          </div>

        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/90 flex items-center gap-3">
          <button
            onClick={onResetAllFilters}
            className="py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold min-h-[44px]"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/20 active:scale-98 transition-all min-h-[44px] flex items-center justify-center gap-2"
          >
            <span>Show {totalFilteredCount} Recipes</span>
          </button>
        </div>

      </div>
    </div>
  );
};

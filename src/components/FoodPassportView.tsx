import React, { useState } from 'react';
import { 
  Compass, 
  Award, 
  Globe, 
  Calendar, 
  Utensils, 
  CheckCircle2, 
  Share2, 
  Search, 
  ChevronRight,
  Sparkles,
  Lock
} from 'lucide-react';
import { PassportCountry, Continent } from '../types/recipe';
import { COUNTRIES_DATABASE } from '../data/premiumCatalogData';

interface FoodPassportViewProps {
  passport: Record<string, PassportCountry>;
  onExploreCountry: (countryName: string) => void;
  onOpenCookbook: () => void;
}

export const FoodPassportView: React.FC<FoodPassportViewProps> = ({
  passport,
  onExploreCountry,
  onOpenCookbook
}) => {
  const [selectedContinentFilter, setSelectedContinentFilter] = useState<Continent | 'All'>('All');

  const visitedCountries = Object.values(passport);
  const totalVisited = visitedCountries.length;
  const totalDishesCooked = visitedCountries.reduce((acc, c) => acc + c.recipesCooked, 0);

  // Continents visited
  const visitedContinents = new Set(visitedCountries.map(c => c.continent));

  // Continents Explorer Badges
  const continentBadges: Array<{ id: string; name: string; continent: Continent; icon: string; unlocked: boolean }> = [
    { id: 'africa', name: 'African Pioneer', continent: 'Africa', icon: '🌍', unlocked: visitedContinents.has('Africa') },
    { id: 'asia', name: 'Asian Feast Master', continent: 'Asia', icon: '🥢', unlocked: visitedContinents.has('Asia') },
    { id: 'europe', name: 'European Tour Gourmet', continent: 'Europe', icon: '🏛️', unlocked: visitedContinents.has('Europe') },
    { id: 'na', name: 'North American Explorer', continent: 'North America', icon: '🌮', unlocked: visitedContinents.has('North America') },
    { id: 'sa', name: 'South American Asador', continent: 'South America', icon: '🥩', unlocked: visitedContinents.has('South America') },
    { id: 'oceania', name: 'Oceania Voyager', continent: 'Oceania', icon: '🏝️', unlocked: visitedContinents.has('Oceania') }
  ];

  const isGlobeTrotter = continentBadges.every(b => b.unlocked);

  // Filter countries
  const filteredCountries = COUNTRIES_DATABASE.filter(c => {
    if (selectedContinentFilter !== 'All' && c.continent !== selectedContinentFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Passport Book Cover Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-amber-950/60 via-stone-900 to-stone-950 border border-amber-500/30 p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
              <Compass className="w-4 h-4" />
              <span>Official Global Culinary Document</span>
            </div>
            
            <h1 className="font-serif text-3xl sm:text-5xl font-black text-white tracking-tight">
              Food Passport
            </h1>
            
            <p className="text-sm sm:text-base text-stone-300 max-w-xl leading-relaxed">
              Every time you prepare a recipe, stamp this passport with that nation’s culinary seal. 
              Track your journey across 50+ countries and all 6 continents.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-950/60 p-4 rounded-2xl border border-stone-800 backdrop-blur-md">
            <div className="text-center p-2">
              <p className="font-mono text-2xl sm:text-3xl font-bold text-amber-400">{totalVisited}</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Nations Stamped</p>
            </div>
            <div className="text-center p-2">
              <p className="font-mono text-2xl sm:text-3xl font-bold text-stone-100">{totalDishesCooked}</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Dishes Cooked</p>
            </div>
            <div className="text-center p-2">
              <p className="font-mono text-2xl sm:text-3xl font-bold text-amber-400">{visitedContinents.size}/6</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Continents</p>
            </div>
            <div className="text-center p-2">
              <p className="font-mono text-2xl sm:text-3xl font-bold text-emerald-400">
                {Math.round((totalVisited / COUNTRIES_DATABASE.length) * 100)}%
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">World Complete</p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTINENT EXPLORER BADGES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif text-xl font-bold text-stone-100">
              Continental Milestones & Badges
            </h2>
          </div>
          {isGlobeTrotter && (
            <span className="text-xs px-3 py-1 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center gap-1 shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              Master Globe Trotter (6/6)
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {continentBadges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border text-center transition-all ${
                badge.unlocked
                  ? 'bg-stone-900/90 border-amber-500/50 shadow-lg shadow-amber-500/5'
                  : 'bg-stone-900/40 border-stone-800/60 opacity-60'
              }`}
            >
              <div className="text-2xl mb-2">{badge.icon}</div>
              <p className="font-bold text-xs text-stone-100 line-clamp-1">{badge.name}</p>
              <p className="text-[10px] text-stone-400 mt-0.5">{badge.continent}</p>
              <span className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                badge.unlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-stone-800 text-stone-500'
              }`}>
                {badge.unlocked ? 'Unlocked' : 'Locked'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* PASSPORT STAMPS GRID */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-800">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-100">
              National Passport Stamps
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Click any nation to find authentic recipes or see your cooked milestones.
            </p>
          </div>

          {/* Continent Filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {['All', 'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedContinentFilter(c as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedContinentFilter === c
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-900 text-stone-400 hover:text-stone-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Countries Stamp Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCountries.map((c) => {
            const stampedInfo = passport[c.code];
            const isStamped = !!stampedInfo;

            return (
              <div
                key={c.code}
                onClick={() => onExploreCountry(c.country)}
                className={`group relative p-5 rounded-3xl border transition-all cursor-pointer overflow-hidden ${
                  isStamped
                    ? 'bg-stone-900/90 border-amber-500/40 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/10'
                    : 'bg-stone-900/30 border-stone-800/70 hover:border-stone-700 opacity-75'
                }`}
              >
                {/* Stamp graphic seal in corner if visited */}
                {isStamped && (
                  <div className="absolute top-3 right-3 w-14 h-14 rounded-full border-2 border-amber-400/30 flex items-center justify-center rotate-12 pointer-events-none">
                    <div className="w-11 h-11 rounded-full border border-dashed border-amber-400/40 flex flex-col items-center justify-center text-[8px] font-mono text-amber-400/80 font-bold uppercase tracking-tighter">
                      <span>PASSPORT</span>
                      <span>STAMPED</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-amber-400">{c.code}</span>
                      <h3 className="font-serif text-lg font-bold text-stone-100 group-hover:text-amber-400 transition-colors">
                        {c.country}
                      </h3>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {c.cuisine} Cuisine • {c.region}
                    </p>
                  </div>
                </div>

                {isStamped ? (
                  <div className="mt-4 pt-3 border-t border-stone-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs text-stone-300">
                      <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Cooked {stampedInfo.recipesCooked} {stampedInfo.recipesCooked === 1 ? 'dish' : 'dishes'}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {new Date(stampedInfo.lastCookedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {stampedInfo.dishNames.slice(0, 2).map((d, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-medium">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 pt-3 border-t border-stone-800/50 flex items-center justify-between text-xs text-stone-500">
                    <span>Awaiting your culinary arrival</span>
                    <span className="text-amber-400/70 group-hover:text-amber-400 group-hover:underline flex items-center gap-0.5 text-[11px] font-medium">
                      Cook this country →
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

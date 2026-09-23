import React from 'react';
import { 
  Compass, 
  Sparkles, 
  Clock, 
  ChefHat, 
  ArrowRight, 
  Flame, 
  CheckCircle2, 
  Globe 
} from 'lucide-react';
import { Continent, Recipe } from '../types/recipe';
import { RecipeCard } from './RecipeCard';

interface DiscoveryHubProps {
  onSelectContinent: (continent: Continent) => void;
  onSelectStarterOnly: () => void;
  onSelectQuickTime: (time: number) => void;
  onViewAllRecipes: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  continentCounts: Record<string, number>;
  starterRecipes: Recipe[];
  quickRecipes: Recipe[];
  favorites: Set<string>;
  downloadedRecipeIds: Set<string>;
  isPremium: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onDownload: (id: string, e: React.MouseEvent) => void;
  onOpenUnlockModal: () => void;
}

interface ContinentCardData {
  continent: Continent;
  icon: string;
  image: string;
  tagline: string;
  signatureDishes: string;
  accentGradient: string;
}

const CONTINENT_CARDS: ContinentCardData[] = [
  {
    continent: 'Africa',
    icon: '🌍',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    tagline: 'Vibrant spices, slow-simmered stews & smoky heritage',
    signatureDishes: 'Jollof Rice, Moroccan Tagine, Bobotie, Bunny Chow',
    accentGradient: 'from-amber-600/80 to-amber-950/90'
  },
  {
    continent: 'Asia',
    icon: '🌏',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    tagline: 'Rich broths, fiery woks, aromatic curries & street delicacies',
    signatureDishes: 'Tokyo Shoyu Ramen, Pad Kra Pao, Biryani, Pho',
    accentGradient: 'from-red-600/80 to-stone-950/90'
  },
  {
    continent: 'Europe',
    icon: '🏛️',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
    tagline: 'Old-world traditions, artisan pastas & rustic coastal feasts',
    signatureDishes: 'Tagliatelle Bolognese, Paella Valenciana, Coq au Vin',
    accentGradient: 'from-blue-600/80 to-stone-950/90'
  },
  {
    continent: 'North America',
    icon: '🌮',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
    tagline: 'Melting-pot street tacos, Cajun spice & indigenous staples',
    signatureDishes: 'Birria Tacos, New Orleans Gumbo, Quebec Poutine',
    accentGradient: 'from-orange-600/80 to-stone-950/90'
  },
  {
    continent: 'South America',
    icon: '🏔️',
    image: 'https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&w=800&q=80',
    tagline: 'Fresh ceviches, open-flame grills & Andean superfoods',
    signatureDishes: 'Peruvian Ceviche, Brazilian Feijoada, Empanadas',
    accentGradient: 'from-emerald-600/80 to-stone-950/90'
  },
  {
    continent: 'Oceania',
    icon: '🏝️',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    tagline: 'Island coconut cream, earth-oven cooking & fresh seafood',
    signatureDishes: 'Fijian Kokoda, Samoan Palusami, Kiwi Pavlova',
    accentGradient: 'from-teal-600/80 to-stone-950/90'
  }
];

export const DiscoveryHub: React.FC<DiscoveryHubProps> = ({
  onSelectContinent,
  onSelectStarterOnly,
  onSelectQuickTime,
  onViewAllRecipes,
  onSelectRecipe,
  continentCounts,
  starterRecipes,
  quickRecipes,
  favorites,
  downloadedRecipeIds,
  isPremium,
  onToggleFavorite,
  onDownload,
  onOpenUnlockModal
}) => {
  return (
    <div className="space-y-10 sm:space-y-14 py-6">
      
      {/* SECTION 1: Region / Continent Hub Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 sm:mb-6 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Step 1: Choose Your Destination</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100 tracking-tight">
              Explore by Continent
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
              Select a region to browse its authentic dishes without endless scrolling.
            </p>
          </div>

          <button
            onClick={onViewAllRecipes}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 py-1.5"
          >
            <span>Browse All 360 Dishes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Responsive Grid of Continent Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {CONTINENT_CARDS.map((card) => {
            const count = continentCounts[card.continent] || 0;
            return (
              <div
                key={card.continent}
                onClick={() => onSelectContinent(card.continent)}
                className="group relative rounded-3xl overflow-hidden cursor-pointer border border-stone-800 hover:border-amber-500/60 bg-stone-900 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1 active:scale-[0.98]"
              >
                {/* Visual Image Banner */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-950">
                  <img
                    src={card.image}
                    alt={card.continent}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${card.accentGradient} opacity-60 group-hover:opacity-75 transition-opacity`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

                  {/* Continent Badge & Dish Count */}
                  <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-950/80 backdrop-blur-md border border-stone-800/80 text-xs font-bold text-white shadow-md">
                      <span>{card.icon}</span>
                      <span>{card.continent}</span>
                    </span>

                    <span className="px-2.5 py-1 rounded-full bg-amber-500 text-stone-950 text-xs font-black shadow-md">
                      {count} Recipes
                    </span>
                  </div>

                  {/* Signature Dishes Preview */}
                  <div className="absolute bottom-3 inset-x-3.5">
                    <p className="text-[11px] text-amber-300 font-medium truncate">
                      ★ {card.signatureDishes}
                    </p>
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="p-4 bg-stone-900/90 flex items-center justify-between border-t border-stone-800/60">
                  <span className="text-xs text-stone-300 font-medium line-clamp-1">
                    {card.tagline}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-stone-800 group-hover:bg-amber-500 text-stone-300 group-hover:text-stone-950 flex items-center justify-center shrink-0 transition-colors shadow-sm ml-2">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: 50 Free Starter Dishes (Horizontal Carousel) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-0.5">
              <ChefHat className="w-3.5 h-3.5" />
              <span>Offline Ready</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100">
              50 Free Starter Dishes
            </h3>
          </div>

          <button
            onClick={onSelectStarterOnly}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>View All 50</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal Card Carousel with smooth touch swipe */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {starterRecipes.slice(0, 6).map((recipe) => (
            <div key={recipe.recipeId} className="w-[260px] sm:w-[280px] shrink-0">
              <RecipeCard
                recipe={recipe}
                isFavorite={favorites.has(recipe.recipeId)}
                isDownloaded={downloadedRecipeIds.has(recipe.recipeId)}
                isPremiumUser={isPremium}
                onSelect={onSelectRecipe}
                onToggleFavorite={onToggleFavorite}
                onDownload={onDownload}
                onOpenUnlockModal={onOpenUnlockModal}
              />
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: Quick Weeknight Wonders (<= 30 mins) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Fast & Fresh</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100">
              Weeknight Dinners in 30 Mins or Less
            </h3>
          </div>

          <button
            onClick={() => onSelectQuickTime(30)}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>See All Fast Dishes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal Card Carousel */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {quickRecipes.slice(0, 6).map((recipe) => (
            <div key={recipe.recipeId} className="w-[260px] sm:w-[280px] shrink-0">
              <RecipeCard
                recipe={recipe}
                isFavorite={favorites.has(recipe.recipeId)}
                isDownloaded={downloadedRecipeIds.has(recipe.recipeId)}
                isPremiumUser={isPremium}
                onSelect={onSelectRecipe}
                onToggleFavorite={onToggleFavorite}
                onDownload={onDownload}
                onOpenUnlockModal={onOpenUnlockModal}
              />
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: Browse Complete Cookbook Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-stone-800 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left shadow-xl">
          <div className="space-y-2">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100">
              Looking for a specific dish or country?
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 max-w-xl">
              Use the top search bar or browse all 360 recipes with paginated chunks of 12 dishes at a time.
            </p>
          </div>

          <button
            onClick={onViewAllRecipes}
            className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all shrink-0 min-h-[48px] flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            <span>Browse All 360 Dishes</span>
          </button>
        </div>
      </div>

    </div>
  );
};

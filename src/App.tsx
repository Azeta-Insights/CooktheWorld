import React, { useState, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ALL_RECIPES, searchAndFilterRecipes, RecipeFilterOptions } from './data/recipes';
import { Recipe, Continent } from './types/recipe';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { AIChefDrawer } from './components/AIChefDrawer';
import { FoodPassportView } from './components/FoodPassportView';
import { MyKitchenView } from './components/MyKitchenView';
import { WorldUnlockModal } from './components/WorldUnlockModal';
import { AdminConsoleModal } from './components/AdminConsoleModal';
import { AuthModal } from './components/AuthModal';
import { FilterDrawerModal } from './components/FilterDrawerModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DiscoveryHub } from './components/DiscoveryHub';
import { ActiveTimerOverlay, ActiveTimer } from './components/ActiveTimerOverlay';
import { Sparkles, Compass, ChefHat, BookOpen, Layers, ArrowLeft } from 'lucide-react';

function AppContent() {
  const {
    user,
    profile,
    isPremium,
    isOnline,
    favorites,
    passport,
    cookingHistory,
    shoppingList,
    downloadedRecipeIds,
    toggleFavorite,
    recordCookedRecipe,
    addToShoppingList,
    downloadRecipe
  } = useAuth();

  // Navigation view state
  const [currentView, setCurrentView] = useState<'cookbook' | 'passport' | 'kitchen'>('cookbook');

  // Filter state
  const [selectedContinent, setSelectedContinent] = useState<Continent | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [starterOnly, setStarterOnly] = useState(false);
  const [offlineOnly, setOfflineOnly] = useState(false);
  const [quickTimeFilter, setQuickTimeFilter] = useState<number | null>(null);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedMealType, setSelectedMealType] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'time' | 'title' | 'country'>('recommended');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Paginated Discovery State (Eliminates mobile lag and endless scrolling)
  const [showAllDishes, setShowAllDishes] = useState(false);
  const [visibleRecipeCount, setVisibleRecipeCount] = useState(12);

  // Modals & Drawers state
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isAIChefOpen, setIsAIChefOpen] = useState(false);
  const [aiChefInitialPrompt, setAiChefInitialPrompt] = useState<string | undefined>(undefined);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isUnlockOpen, setIsUnlockOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Kitchen timers
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);

  const handleUpdateTimer = (id: string, updates: Partial<ActiveTimer>) => {
    setActiveTimers(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleRemoveTimer = (id: string) => {
    setActiveTimers(prev => prev.filter(t => t.id !== id));
  };

  const handleStartTimer = (timer: ActiveTimer) => {
    setActiveTimers(prev => [timer, ...prev]);
  };

  // Pre-filtered subsets for discovery carousels
  const starterRecipes = useMemo(() => ALL_RECIPES.filter(r => r.isStarter), []);
  const quickRecipes = useMemo(() => ALL_RECIPES.filter(r => r.totalTime <= 30), []);

  // Memoized continent recipe counts
  const continentCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'All': ALL_RECIPES.length,
      'Africa': 0,
      'Asia': 0,
      'Europe': 0,
      'North America': 0,
      'South America': 0,
      'Oceania': 0
    };
    ALL_RECIPES.forEach(r => {
      if (counts[r.continent] !== undefined) {
        counts[r.continent]++;
      }
    });
    return counts;
  }, []);

  // Compute active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedContinent !== 'All') count++;
    if (starterOnly) count++;
    if (offlineOnly) count++;
    if (quickTimeFilter !== null) count++;
    count += selectedDietary.length;
    if (selectedDifficulty !== 'All') count++;
    if (selectedMealType !== 'All') count++;
    if (sortBy !== 'recommended') count++;
    return count;
  }, [selectedContinent, starterOnly, offlineOnly, quickTimeFilter, selectedDietary, selectedDifficulty, selectedMealType, sortBy]);

  // Is user actively filtering/searching or requested full browse?
  const isFilteringOrSearching = useMemo(() => {
    return (
      selectedContinent !== 'All' ||
      searchQuery.trim() !== '' ||
      starterOnly ||
      offlineOnly ||
      quickTimeFilter !== null ||
      selectedDietary.length > 0 ||
      selectedDifficulty !== 'All' ||
      selectedMealType !== 'All' ||
      showAllDishes
    );
  }, [
    selectedContinent,
    searchQuery,
    starterOnly,
    offlineOnly,
    quickTimeFilter,
    selectedDietary.length,
    selectedDifficulty,
    selectedMealType,
    showAllDishes
  ]);

  // Reset all filters
  const handleResetAllFilters = () => {
    setSearchQuery('');
    setSelectedContinent('All');
    setStarterOnly(false);
    setOfflineOnly(false);
    setQuickTimeFilter(null);
    setSelectedDietary([]);
    setSelectedDifficulty('All');
    setSelectedMealType('All');
    setSortBy('recommended');
    setShowAllDishes(false);
    setVisibleRecipeCount(12);
  };

  const handleSelectContinentFromHub = (continent: Continent) => {
    setSelectedContinent(continent);
    setVisibleRecipeCount(12);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleDietary = (tag: string) => {
    setSelectedDietary(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
    setVisibleRecipeCount(12);
  };

  const handleRemoveDietary = (tag: string) => {
    setSelectedDietary(prev => prev.filter(t => t !== tag));
    setVisibleRecipeCount(12);
  };

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    const effectiveDietary = selectedDietary.length > 0 ? selectedDietary : profile?.preferences?.dietary;
    const options: RecipeFilterOptions = {
      query: searchQuery,
      continent: selectedContinent,
      starterOnly,
      offlineOnly,
      maxCookTime: quickTimeFilter || undefined,
      dietary: effectiveDietary && effectiveDietary.length > 0 ? effectiveDietary : undefined,
      difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined,
      mealType: selectedMealType !== 'All' ? selectedMealType : undefined,
    };
    let results = searchAndFilterRecipes(ALL_RECIPES, options, downloadedRecipeIds);
    if (sortBy === 'time') {
      results = [...results].sort((a, b) => a.totalTime - b.totalTime);
    } else if (sortBy === 'title') {
      results = [...results].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'country') {
      results = [...results].sort((a, b) => a.country.localeCompare(b.country));
    }
    return results;
  }, [searchQuery, selectedContinent, starterOnly, offlineOnly, quickTimeFilter, selectedDietary, profile?.preferences?.dietary, selectedDifficulty, selectedMealType, sortBy, downloadedRecipeIds]);

  // Phase 8: Personalization Engine & Recommendations
  const recommendedRecipes = useMemo(() => {
    const dietaryPrefs = profile?.preferences?.dietary || [];
    const cookedIds = new Set(cookingHistory.map(h => h.recipeId));
    const cookedContinents = new Set(cookingHistory.map(h => h.continent));

    const candidates = ALL_RECIPES.filter(r => !cookedIds.has(r.recipeId));

    return candidates
      .map(r => {
        let score = 0;
        if (dietaryPrefs.some(d => r.dietaryTags.some(tag => tag.toLowerCase().includes(d.toLowerCase())))) {
          score += 5;
        }
        if (cookedContinents.has(r.continent)) {
          score += 3;
        }
        if (r.isStarter) {
          score += 2;
        }
        return { recipe: r, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(item => item.recipe);
  }, [cookingHistory, profile?.preferences?.dietary]);

  const handleOpenChefWithRecipe = (recipe: Recipe, prompt?: string) => {
    setSelectedRecipe(recipe);
    setAiChefInitialPrompt(prompt);
    setIsAIChefOpen(true);
  };

  const handleCountryExploreFromPassport = (countryName: string) => {
    setSearchQuery(countryName);
    setSelectedContinent('All');
    setCurrentView('cookbook');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-amber-500 selection:text-stone-950">
      
      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        onSelectView={(v) => {
          setCurrentView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenUnlock={() => setIsUnlockOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenAIChef={() => {
          setAiChefInitialPrompt(undefined);
          setIsAIChefOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-24 sm:pb-16">
        {currentView === 'cookbook' && (
          <div>
            {/* Hero Section */}
            <HeroSection
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedContinent={selectedContinent}
              onSelectContinent={setSelectedContinent}
              starterOnly={starterOnly}
              onToggleStarterOnly={() => setStarterOnly(!starterOnly)}
              offlineOnly={offlineOnly}
              onToggleOfflineOnly={() => setOfflineOnly(!offlineOnly)}
              quickTimeFilter={quickTimeFilter}
              onSelectTimeFilter={setQuickTimeFilter}
              selectedDietary={selectedDietary}
              onRemoveDietary={handleRemoveDietary}
              selectedDifficulty={selectedDifficulty}
              onResetDifficulty={() => setSelectedDifficulty('All')}
              selectedMealType={selectedMealType}
              onResetMealType={() => setSelectedMealType('All')}
              onOpenFilterDrawer={() => setIsFilterDrawerOpen(true)}
              onResetAllFilters={handleResetAllFilters}
              activeFiltersCount={activeFiltersCount}
              totalFilteredCount={filteredRecipes.length}
              continentCounts={continentCounts}
            />

            {/* Phase 8: Personalized Recommendations Section (shown when on main portal) */}
            {!isFilteringOrSearching && recommendedRecipes.length > 0 && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-100">
                      {cookingHistory.length > 0 ? 'Curated Next For You' : 'Chef’s Recommended Starter Dishes'}
                    </h2>
                  </div>
                  <span className="text-xs text-stone-400">
                    {profile?.preferences?.dietary?.length ? `Filtered for ${profile.preferences.dietary.join(', ')}` : 'Handpicked for your kitchen'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 border-b border-stone-800/80">
                  {recommendedRecipes.map((recipe) => (
                    <RecipeCard
                      key={`rec-${recipe.recipeId}`}
                      recipe={recipe}
                      isFavorite={favorites.has(recipe.recipeId)}
                      isDownloaded={downloadedRecipeIds.has(recipe.recipeId)}
                      isPremiumUser={isPremium}
                      onSelect={(r) => setSelectedRecipe(r)}
                      onToggleFavorite={(id, e) => {
                        e.stopPropagation();
                        toggleFavorite(id);
                      }}
                      onDownload={(id, e) => {
                        e.stopPropagation();
                        downloadRecipe(id);
                      }}
                      onOpenUnlockModal={() => setIsUnlockOpen(true)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* View Branch 1: VISUAL DISCOVERY HUB (Select continent/category first) */}
            {!isFilteringOrSearching && (
              <DiscoveryHub
                onSelectContinent={handleSelectContinentFromHub}
                onSelectStarterOnly={() => {
                  setStarterOnly(true);
                  setVisibleRecipeCount(12);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSelectQuickTime={(time) => {
                  setQuickTimeFilter(time);
                  setVisibleRecipeCount(12);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onViewAllRecipes={() => {
                  setShowAllDishes(true);
                  setVisibleRecipeCount(12);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSelectRecipe={(r) => setSelectedRecipe(r)}
                continentCounts={continentCounts}
                starterRecipes={starterRecipes}
                quickRecipes={quickRecipes}
                favorites={favorites}
                downloadedRecipeIds={downloadedRecipeIds}
                isPremium={isPremium}
                onToggleFavorite={(id, e) => {
                  e.stopPropagation();
                  toggleFavorite(id);
                }}
                onDownload={(id, e) => {
                  e.stopPropagation();
                  downloadRecipe(id);
                }}
                onOpenUnlockModal={() => setIsUnlockOpen(true)}
              />
            )}

            {/* View Branch 2: PAGINATED RECIPE GRID (Active search/continent view) */}
            {isFilteringOrSearching && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Result header & Back to Continents Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-stone-800/80 mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100">
                        {selectedContinent !== 'All' 
                          ? `${selectedContinent} Recipes`
                          : searchQuery.trim() 
                          ? `Results for "${searchQuery}"`
                          : starterOnly
                          ? '50 Free Starter Dishes'
                          : quickTimeFilter
                          ? `Quick Meals (≤ ${quickTimeFilter} mins)`
                          : 'Complete Global Cookbook'}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold">
                        {filteredRecipes.length}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-1">
                      {selectedContinent !== 'All'
                        ? `Explore regional dishes from ${selectedContinent}.`
                        : `Showing filtered selections from 50+ countries.`}
                    </p>
                  </div>

                  <button
                    onClick={handleResetAllFilters}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs font-semibold self-start sm:self-auto transition-all min-h-[40px]"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Continents Hub</span>
                  </button>
                </div>

                {filteredRecipes.length === 0 ? (
                  <div className="text-center py-20 rounded-3xl bg-stone-900/30 border border-stone-800 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-stone-800 text-amber-400 flex items-center justify-center mx-auto">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-stone-200">
                      No recipes match your criteria
                    </h3>
                    <p className="text-xs text-stone-400 max-w-sm mx-auto">
                      Try clearing your search query or removing filters to browse all 300+ global recipes.
                    </p>
                    <button
                      onClick={handleResetAllFilters}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold shadow-lg min-h-[44px]"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Paginated Card Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredRecipes.slice(0, visibleRecipeCount).map((recipe) => (
                        <RecipeCard
                          key={recipe.recipeId}
                          recipe={recipe}
                          isFavorite={favorites.has(recipe.recipeId)}
                          isDownloaded={downloadedRecipeIds.has(recipe.recipeId)}
                          isPremiumUser={isPremium}
                          onSelect={(r) => setSelectedRecipe(r)}
                          onToggleFavorite={(id, e) => {
                            e.stopPropagation();
                            toggleFavorite(id);
                          }}
                          onDownload={(id, e) => {
                            e.stopPropagation();
                            downloadRecipe(id);
                          }}
                          onOpenUnlockModal={() => setIsUnlockOpen(true)}
                        />
                      ))}
                    </div>

                    {/* Pagination / Load More Controls */}
                    {visibleRecipeCount < filteredRecipes.length && (
                      <div className="mt-10 pt-6 border-t border-stone-800/80 text-center space-y-3 pb-8">
                        <p className="text-xs text-stone-400 font-mono">
                          Showing {Math.min(visibleRecipeCount, filteredRecipes.length)} of {filteredRecipes.length} recipes
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                          <button
                            onClick={() => setVisibleRecipeCount((prev) => prev + 12)}
                            className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all min-h-[46px]"
                          >
                            Show 12 More Dishes (+12)
                          </button>
                          {filteredRecipes.length > visibleRecipeCount + 12 && (
                            <button
                              onClick={() => setVisibleRecipeCount(filteredRecipes.length)}
                              className="px-5 py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-300 font-semibold text-xs transition-all border border-stone-800 min-h-[46px]"
                            >
                              Show All ({filteredRecipes.length})
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {currentView === 'passport' && (
          <FoodPassportView
            passport={passport}
            onExploreCountry={handleCountryExploreFromPassport}
            onOpenCookbook={() => setCurrentView('cookbook')}
          />
        )}

        {currentView === 'kitchen' && (
          <MyKitchenView
            onSelectRecipe={(r) => setSelectedRecipe(r)}
            onOpenUnlockModal={() => setIsUnlockOpen(true)}
          />
        )}
      </main>

      {/* Floating AI Chef Trigger Button (Desktop Only) */}
      <button
        onClick={() => {
          setAiChefInitialPrompt(undefined);
          setIsAIChefOpen(true);
        }}
        className="fixed bottom-6 left-6 z-30 hidden sm:flex px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
      >
        <Sparkles className="w-4 h-4 fill-stone-950" />
        <span>Ask AI Chef</span>
      </button>

      {/* Mobile Bottom Navigation Bar (Natural Thumb Zone) */}
      <MobileBottomNav
        currentView={currentView}
        onSelectView={(v) => {
          setCurrentView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAIChef={() => {
          setAiChefInitialPrompt(undefined);
          setIsAIChefOpen(true);
        }}
        countriesVisitedCount={Object.keys(passport).length}
        shoppingListCount={shoppingList.filter(i => !i.checked).length}
        activeTimers={activeTimers}
      />

      {/* Comprehensive Recipe Filter Drawer / Bottom Sheet */}
      <FilterDrawerModal
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        totalFilteredCount={filteredRecipes.length}
        selectedContinent={selectedContinent}
        onSelectContinent={setSelectedContinent}
        starterOnly={starterOnly}
        onToggleStarterOnly={() => setStarterOnly(!starterOnly)}
        offlineOnly={offlineOnly}
        onToggleOfflineOnly={() => setOfflineOnly(!offlineOnly)}
        quickTimeFilter={quickTimeFilter}
        onSelectTimeFilter={setQuickTimeFilter}
        selectedDietary={selectedDietary}
        onToggleDietary={handleToggleDietary}
        selectedDifficulty={selectedDifficulty}
        onSelectDifficulty={setSelectedDifficulty}
        selectedMealType={selectedMealType}
        onSelectMealType={setSelectedMealType}
        sortBy={sortBy}
        onSelectSortBy={setSortBy}
        onResetAllFilters={handleResetAllFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Active Kitchen Timers Overlay */}
      <ActiveTimerOverlay
        timers={activeTimers}
        onUpdateTimer={handleUpdateTimer}
        onRemoveTimer={handleRemoveTimer}
      />

      {/* Detailed Recipe Modal */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          isFavorite={favorites.has(selectedRecipe.recipeId)}
          isDownloaded={downloadedRecipeIds.has(selectedRecipe.recipeId)}
          onClose={() => setSelectedRecipe(null)}
          onToggleFavorite={toggleFavorite}
          onDownload={downloadRecipe}
          onAddToShoppingList={addToShoppingList}
          onCookedRecipe={recordCookedRecipe}
          onStartTimer={handleStartTimer}
          onOpenChefWithRecipe={handleOpenChefWithRecipe}
        />
      )}

      {/* AI Chef Mentor Drawer */}
      <AIChefDrawer
        isOpen={isAIChefOpen}
        onClose={() => setIsAIChefOpen(false)}
        activeRecipe={selectedRecipe}
        userProfile={profile}
        isPremiumUser={isPremium}
        isOnline={isOnline}
        downloadedIds={downloadedRecipeIds}
        onStartTimer={handleStartTimer}
        onOpenUnlockModal={() => setIsUnlockOpen(true)}
        initialPrompt={aiChefInitialPrompt}
      />

      {/* World Unlock Modal */}
      <WorldUnlockModal
        isOpen={isUnlockOpen}
        onClose={() => setIsUnlockOpen(false)}
      />

      {/* Admin Console Modal */}
      <AdminConsoleModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-stone-800/80 bg-stone-950 py-10 text-stone-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-500" />
            <span className="font-serif font-bold text-stone-200">Cook The World</span>
            <span>—</span>
            <span>Explore the world. One recipe at a time.</span>
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            <span>50 Free Starter Recipes</span>
            <span>•</span>
            <span>Offline Ready</span>
            <span>•</span>
            <span>Paystack ₦2,500 Lifetime</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}


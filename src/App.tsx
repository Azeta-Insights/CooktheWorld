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
import { ActiveTimerOverlay, ActiveTimer } from './components/ActiveTimerOverlay';
import { Sparkles, Compass, ChefHat, BookOpen, Layers } from 'lucide-react';

function AppContent() {
  const {
    user,
    profile,
    isPremium,
    isOnline,
    favorites,
    passport,
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

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    const options: RecipeFilterOptions = {
      query: searchQuery,
      continent: selectedContinent,
      starterOnly,
      offlineOnly,
      maxCookTime: quickTimeFilter || undefined,
      dietary: profile?.preferences?.dietary
    };
    return searchAndFilterRecipes(ALL_RECIPES, options, downloadedRecipeIds);
  }, [searchQuery, selectedContinent, starterOnly, offlineOnly, quickTimeFilter, profile?.preferences?.dietary, downloadedRecipeIds]);

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
      <main className="flex-1 pb-16">
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
              totalFilteredCount={filteredRecipes.length}
            />

            {/* Recipe Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedContinent('All');
                      setStarterOnly(false);
                      setOfflineOnly(false);
                      setQuickTimeFilter(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredRecipes.map((recipe) => (
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
              )}
            </div>
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

      {/* Floating AI Chef Trigger Button */}
      <button
        onClick={() => {
          setAiChefInitialPrompt(undefined);
          setIsAIChefOpen(true);
        }}
        className="fixed bottom-6 left-6 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
      >
        <Sparkles className="w-4 h-4 fill-stone-950" />
        <span className="hidden sm:inline">Ask AI Chef</span>
        <span className="sm:hidden">Chef</span>
      </button>

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

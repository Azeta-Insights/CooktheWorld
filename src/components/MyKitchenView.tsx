import React, { useState } from 'react';
import { 
  History, 
  Download, 
  ShoppingBag, 
  Heart, 
  Sliders, 
  Trash2, 
  Plus, 
  Star, 
  CheckCircle2, 
  WifiOff, 
  HardDrive, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Globe,
  Award,
  Sparkles,
  Camera,
  Compass,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Recipe, ShoppingItem } from '../types/recipe';
import { ALL_RECIPES, ALL_STARTER_RECIPES, getRecipeById } from '../data/recipes';
import { OfflineStorageService } from '../services/offlineStorage';

interface MyKitchenViewProps {
  onSelectRecipe: (recipe: Recipe) => void;
  onOpenUnlockModal: () => void;
  onOpenAdmin?: () => void;
}

export const MyKitchenView: React.FC<MyKitchenViewProps> = ({
  onSelectRecipe,
  onOpenUnlockModal,
  onOpenAdmin
}) => {
  const {
    user,
    profile,
    isPremium,
    favorites,
    cookingHistory,
    shoppingList,
    downloadedRecipeIds,
    toggleFavorite,
    updatePreferences,
    toggleShoppingItem,
    removeShoppingItem,
    clearCompletedShopping,
    removeDownloadedRecipe,
    downloadAllPremiumRecipes
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'history' | 'insights' | 'shopping' | 'offline' | 'favorites' | 'preferences'>('history');

  // Custom shopping item state
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientAmount, setNewIngredientAmount] = useState('');

  // Storage stats
  const storageStats = OfflineStorageService.getEstimatedStorageUsage();

  // Dietary options
  const DIETARY_OPTIONS = [
    'Gluten-Free',
    'Dairy-Free',
    'Halal',
    'Vegetarian',
    'Vegan',
    'Pescatarian',
    'Nut-Free',
    'Keto'
  ];

  const handleAddCustomShoppingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredientName.trim()) return;

    const currentList = OfflineStorageService.getLocalShoppingList();
    const newItem: ShoppingItem = {
      id: `shop-custom-${Date.now()}`,
      name: newIngredientName.trim(),
      amount: parseFloat(newIngredientAmount) || 1,
      unit: newIngredientAmount ? '' : 'item',
      checked: false,
      category: 'Pantry & Market',
      createdAt: new Date().toISOString()
    };

    const updated = [newItem, ...currentList];
    OfflineStorageService.saveLocalShoppingList(updated);
    // Reload state via context
    window.location.reload();
  };

  const handleToggleDietaryPref = (tag: string) => {
    const current = profile?.preferences?.dietary || [];
    const next = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag];
    updatePreferences({ dietary: next });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-stone-900/90 border border-stone-800 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Personal Culinary Workspace
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-100">
              My Kitchen
            </h1>
            <p className="text-xs sm:text-sm text-stone-400">
              Manage your cooking records, offline recipe storage, shopping list, and flavor profile.
            </p>
          </div>

          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="self-start sm:self-auto px-4 py-2 rounded-2xl bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/70 text-xs font-semibold flex items-center gap-2 shadow-lg transition-all"
            >
              <Shield className="w-4 h-4 text-red-400" />
              <span>Admin Approvals</span>
            </button>
          )}
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-stone-950 p-1.5 rounded-2xl border border-stone-800 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            History ({cookingHistory.length})
          </button>

          <button
            onClick={() => setActiveTab('insights')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'insights'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Insights
          </button>

          <button
            onClick={() => setActiveTab('shopping')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'shopping'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Shopping ({shoppingList.length})
          </button>

          <button
            onClick={() => setActiveTab('offline')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'offline'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Offline ({storageStats.recipeCount})
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'favorites'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            Favorites ({favorites.size})
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'preferences'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Preferences
          </button>
        </div>
      </div>

      {/* 1. COOKING HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-stone-100">
              Cooking Log & Personal Tasting Notes
            </h2>
            <span className="text-xs text-stone-400 font-mono">
              {cookingHistory.length} dishes prepared
            </span>
          </div>

          {cookingHistory.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-stone-900/40 border border-stone-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-800 text-stone-400 flex items-center justify-center mx-auto">
                <History className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-200">No dishes logged yet</h3>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                Whenever you cook a dish, tap "I Cooked This" on the recipe page to log your rating, personal tasting notes, and stamp your Food Passport!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cookingHistory.map((item) => {
                const recipe = getRecipeById(item.recipeId);
                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-3xl bg-stone-900/90 border border-stone-800 hover:border-amber-500/40 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold font-mono text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                          {item.countryCode} • {item.country}
                        </span>
                        <h4 className="font-serif text-base font-bold text-stone-100 mt-1">
                          {item.recipeTitle}
                        </h4>
                      </div>

                      {/* Star Rating */}
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: item.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    {/* Meal Photo (Phase 7) */}
                    {item.photoUrl && (
                      <div className="relative rounded-2xl overflow-hidden border border-stone-800 h-40 bg-stone-950">
                        <img
                          src={item.photoUrl}
                          alt={item.recipeTitle}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-sm text-[10px] font-medium text-amber-300 flex items-center gap-1 border border-stone-700/50">
                          <Camera className="w-3 h-3 text-amber-400" />
                          <span>My Kitchen Creation</span>
                        </div>
                      </div>
                    )}

                    {item.notes && (
                      <p className="text-xs text-stone-300 italic bg-stone-950/60 p-3 rounded-xl border border-stone-800/80">
                        "{item.notes}"
                      </p>
                    )}

                    <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
                      <span>Cooked for {item.servingsCooked || 4} people</span>
                      <span>{new Date(item.cookedAt).toLocaleDateString()}</span>
                    </div>

                    {recipe && (
                      <button
                        onClick={() => onSelectRecipe(recipe)}
                        className="w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                      >
                        <span>Cook Again</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. INSIGHTS TAB (Phase 8) */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-100">
              Culinary Intelligence & Kitchen Insights
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Personalized analytics computed from your global cooking journey and tasting notes.
            </p>
          </div>

          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-stone-900/80 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-amber-400">
                <span className="text-xs font-semibold text-stone-400">Passport Rank</span>
                <Award className="w-5 h-5" />
              </div>
              <div className="font-serif text-2xl font-bold text-stone-100">
                {cookingHistory.length === 0 ? 'Novice Traveler' :
                 cookingHistory.length < 5 ? 'Curious Cook' :
                 cookingHistory.length < 15 ? 'Kitchen Adventurer' :
                 'Global Master Chef'}
              </div>
              <p className="text-[11px] text-stone-400">
                {cookingHistory.length} dishes prepared across {Object.keys(useAuth().passport).length} countries
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-stone-900/80 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-amber-400">
                <span className="text-xs font-semibold text-stone-400">Continents Tasted</span>
                <Globe className="w-5 h-5" />
              </div>
              <div className="font-serif text-2xl font-bold text-stone-100">
                {new Set(cookingHistory.map(h => h.continent)).size} / 6
              </div>
              <p className="text-[11px] text-stone-400">
                Global culinary reach across continents
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-stone-900/80 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-amber-400">
                <span className="text-xs font-semibold text-stone-400">Average Rating</span>
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
              <div className="font-serif text-2xl font-bold text-stone-100">
                {cookingHistory.length > 0
                  ? (cookingHistory.reduce((acc, h) => acc + h.rating, 0) / cookingHistory.length).toFixed(1)
                  : '5.0'} <span className="text-sm font-sans text-stone-400 font-normal">/ 5.0</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Based on your logged tasting reviews
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-stone-900/80 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-amber-400">
                <span className="text-xs font-semibold text-stone-400">Dishes Photographed</span>
                <Camera className="w-5 h-5" />
              </div>
              <div className="font-serif text-2xl font-bold text-stone-100">
                {cookingHistory.filter(h => h.photoUrl).length}
              </div>
              <p className="text-[11px] text-stone-400">
                Meal creations photographed & preserved
              </p>
            </div>
          </div>

          {/* Continent Breakdown Progress */}
          <div className="p-6 rounded-3xl bg-stone-900/70 border border-stone-800 space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-200 flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Continental Exploration Progress</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {(['Africa', 'Asia', 'Europe', 'Americas', 'Middle East', 'Oceania'] as const).map((cont) => {
                const count = cookingHistory.filter(h => h.continent === cont).length;
                const percentage = Math.min(100, Math.round((count / 10) * 100));
                return (
                  <div key={cont} className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-200">{cont}</span>
                      <span className="font-mono text-amber-400">{count} cooked</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(count > 0 ? 15 : 0, percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. SHOPPING LIST TAB */}
      {activeTab === 'shopping' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-100">
                Market & Grocery List
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Automatically gathered from recipes or added manually for grocery trips.
              </p>
            </div>

            {shoppingList.length > 0 && (
              <button
                onClick={clearCompletedShopping}
                className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 text-xs font-semibold transition-colors"
              >
                Clear Checked Items
              </button>
            )}
          </div>

          {/* Add custom item form */}
          <form onSubmit={handleAddCustomShoppingItem} className="flex gap-2">
            <input
              type="text"
              value={newIngredientName}
              onChange={(e) => setNewIngredientName(e.target.value)}
              placeholder="Add market item (e.g. 500g ripe plantains, ground crayfish)..."
              className="flex-1 py-2.5 px-4 rounded-xl bg-stone-900 border border-stone-800 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>

          {shoppingList.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-stone-900/40 border border-stone-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-800 text-stone-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-200">Your shopping list is empty</h3>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                Browse any recipe in the cookbook and tap "Add All to Shopping List" to automatically gather the ingredients!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {shoppingList.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    item.checked
                      ? 'bg-stone-900/30 border-stone-800/40 opacity-50 line-through'
                      : 'bg-stone-900/90 border-stone-800 hover:border-amber-500/30'
                  }`}
                >
                  <div
                    onClick={() => toggleShoppingItem(item.id)}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                      item.checked ? 'bg-amber-500 border-amber-500 text-stone-950' : 'border-stone-600'
                    }`}>
                      {item.checked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div className="truncate">
                      <span className="font-semibold text-stone-100 text-sm">
                        {item.amount && item.amount > 0 ? `${item.amount} ${item.unit || ''} ` : ''}
                      </span>
                      <span className="text-stone-200 text-sm">{item.name}</span>
                      {item.recipeTitle && (
                        <p className="text-[10px] text-amber-400/80 font-mono">
                          For: {item.recipeTitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => removeShoppingItem(item.id)}
                    className="p-1.5 text-stone-500 hover:text-rose-400"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. OFFLINE & STORAGE MANAGER TAB */}
      {activeTab === 'offline' && (
        <div className="space-y-6">
          {/* Storage Meter Card */}
          <div className="p-6 rounded-3xl bg-stone-900/90 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-emerald-400" />
                <h3 className="font-serif text-lg font-bold text-stone-100">
                  Local Device Storage
                </h3>
              </div>
              <p className="text-xs text-stone-400">
                All 50 Starter Recipes are bundled locally. Downloaded recipes function 100% offline without internet.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-stone-950 p-4 rounded-2xl border border-stone-800">
              <div>
                <p className="text-[11px] text-stone-400">Recipes Available Offline</p>
                <p className="font-mono text-xl font-bold text-emerald-400">{storageStats.recipeCount}</p>
              </div>
              <div className="h-8 w-px bg-stone-800" />
              <div>
                <p className="text-[11px] text-stone-400">Estimated Cache Size</p>
                <p className="font-mono text-xl font-bold text-stone-200">{storageStats.sizeMB}</p>
              </div>
            </div>
          </div>

          {/* Premium Download All CTA */}
          {isPremium ? (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-xs font-bold text-emerald-300">World Pass: Unlimited Offline Downloads</p>
                  <p className="text-[11px] text-stone-400">Download the entire 300+ recipe global cookbook for travel and offline use.</p>
                </div>
              </div>

              <button
                onClick={() => downloadAllPremiumRecipes(ALL_RECIPES.map(r => r.recipeId))}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs shadow-lg whitespace-nowrap"
              >
                Download Full 300+ Catalog
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/50 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-amber-300">Unlock Full Cookbook Downloads</p>
                <p className="text-[11px] text-stone-400">Upgrade to World Pass (₦2,500) to download all 300+ recipes for travel and low-connectivity kitchens.</p>
              </div>
              <button
                onClick={onOpenUnlockModal}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs whitespace-nowrap"
              >
                Upgrade to Unlock
              </button>
            </div>
          )}

          {/* List of Available Offline Recipes */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-stone-200">
              Recipes Stored on This Device
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ALL_STARTER_RECIPES.slice(0, 12).map((r) => (
                <div
                  key={r.recipeId}
                  className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 flex items-center justify-between gap-3"
                >
                  <div 
                    onClick={() => onSelectRecipe(r)}
                    className="cursor-pointer truncate flex-1"
                  >
                    <p className="text-xs font-bold text-stone-200 truncate hover:text-amber-400">
                      {r.title}
                    </p>
                    <p className="text-[10px] text-stone-400 font-mono">
                      {r.country} • Free Starter
                    </p>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-semibold border border-emerald-800/50">
                    Bundled
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. FAVORITES TAB */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-stone-100">
              Saved Favorite Dishes
            </h2>
            <span className="text-xs text-stone-400 font-mono">
              {favorites.size} saved
            </span>
          </div>

          {favorites.size === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-stone-900/40 border border-stone-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-800 text-stone-400 flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-200">No favorite dishes yet</h3>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                Tap the heart icon on any recipe card or detailed recipe view to quickly save dishes for your weekly meal rotation.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from(favorites).map((favId) => {
                const recipe = getRecipeById(favId);
                if (!recipe) return null;
                return (
                  <div
                    key={favId}
                    onClick={() => onSelectRecipe(recipe)}
                    className="group p-4 rounded-3xl bg-stone-900/90 border border-stone-800 hover:border-amber-500/50 cursor-pointer transition-all flex items-center gap-3"
                  >
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-16 h-16 rounded-2xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-amber-400 font-mono">{recipe.country}</p>
                      <h4 className="font-serif text-sm font-bold text-stone-100 truncate group-hover:text-amber-400">
                        {recipe.title}
                      </h4>
                      <p className="text-xs text-stone-400 flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3" />
                        {recipe.totalTime} mins
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(recipe.recipeId);
                      }}
                      className="p-2 text-rose-400 hover:text-stone-400"
                    >
                      <Heart className="w-4 h-4 fill-rose-500" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. PREFERENCES TAB */}
      {activeTab === 'preferences' && (
        <div className="max-w-2xl space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-100">
              Dietary & Culinary Preferences
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Customize your dietary restrictions to automatically prioritize matching global dishes.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-4">
            <label className="text-xs font-bold text-stone-300 uppercase tracking-wide">
              Dietary Restrictions & Lifestyle
            </label>

            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((tag) => {
                const isSelected = profile?.preferences?.dietary?.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => handleToggleDietaryPref(tag)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                        : 'bg-stone-950 text-stone-400 border border-stone-800 hover:text-stone-200'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

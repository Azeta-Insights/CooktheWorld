import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Flame, 
  Users, 
  Plus, 
  Minus, 
  Heart, 
  Download, 
  CheckCircle2, 
  ShoppingBag, 
  Sparkles, 
  Maximize2, 
  Award, 
  Compass, 
  Utensils, 
  Info, 
  ChefHat,
  RotateCcw,
  Star,
  Check,
  Camera,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Recipe, Ingredient } from '../types/recipe';
import { ActiveTimer } from './ActiveTimerOverlay';

interface RecipeDetailModalProps {
  recipe: Recipe;
  isFavorite: boolean;
  isDownloaded: boolean;
  onClose: () => void;
  onToggleFavorite: (recipeId: string) => void;
  onDownload: (recipeId: string) => void;
  onAddToShoppingList: (recipe: Recipe) => void;
  onCookedRecipe: (data: {
    recipeId: string;
    recipeTitle: string;
    country: string;
    countryCode: string;
    continent: any;
    servingsCooked: number;
    rating: number;
    notes?: string;
    photoUrl?: string;
  }) => void;
  onStartTimer: (timer: ActiveTimer) => void;
  onOpenChefWithRecipe: (recipe: Recipe, prompt?: string) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  isFavorite,
  isDownloaded,
  onClose,
  onToggleFavorite,
  onDownload,
  onAddToShoppingList,
  onCookedRecipe,
  onStartTimer,
  onOpenChefWithRecipe
}) => {
  // Servings Scaler state
  const [servings, setServings] = useState(recipe.servings);
  const scalingFactor = servings / recipe.servings;

  // Unit toggle: 'metric' | 'imperial'
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');

  // Interactive Checklist
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Distraction-free Cooking Mode
  const [isCookingMode, setIsCookingMode] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // "I Cooked This" Completion Modal State
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [cookingNotes, setCookingNotes] = useState('');
  const [mealPhoto, setMealPhoto] = useState<string | null>(null);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [hasRecordedCompletion, setHasRecordedCompletion] = useState(false);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingPhoto(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
          setMealPhoto(compressedDataUrl);
        }
        setIsCompressingPhoto(false);
      };
      img.onerror = () => setIsCompressingPhoto(false);
      img.src = event.target?.result as string;
    };
    reader.onerror = () => setIsCompressingPhoto(false);
    reader.readAsDataURL(file);
  };

  // Added to shopping list toast state
  const [addedToListToast, setAddedToListToast] = useState(false);

  // Keyboard Escape and browser Back listener for seamless navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isCookingMode) {
          setIsCookingMode(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    window.history.pushState({ modal: `recipe-${recipe.recipeId}` }, '');
    const handlePopState = () => {
      onClose();
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onClose, isCookingMode, recipe.recipeId]);

  // Unit conversion helper
  const formatScaledAmount = (amount: number, unit: string) => {
    let scaled = amount * scalingFactor;
    let finalUnit = unit;

    if (unitSystem === 'imperial') {
      if (unit === 'g') {
        scaled = scaled * 0.035274;
        finalUnit = scaled >= 16 ? 'lb' : 'oz';
        if (finalUnit === 'lb') scaled = scaled / 16;
      } else if (unit === 'ml') {
        scaled = scaled * 0.033814;
        finalUnit = 'fl oz';
      }
    }

    const rounded = Math.round(scaled * 10) / 10;
    return `${rounded} ${finalUnit}`;
  };

  const toggleCheckIngredient = (index: number) => {
    const next = new Set(checkedIngredients);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setCheckedIngredients(next);
  };

  const toggleCompleteStep = (stepNumber: number) => {
    const next = new Set(completedSteps);
    if (next.has(stepNumber)) next.delete(stepNumber);
    else next.add(stepNumber);
    setCompletedSteps(next);
  };

  const handleStartStepTimer = (minutes: number, label: string) => {
    onStartTimer({
      id: `timer-${Date.now()}`,
      label: `${recipe.title}: ${label}`,
      totalSeconds: minutes * 60,
      remainingSeconds: minutes * 60,
      isRunning: true
    });
  };

  const handleCompleteDish = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });

    onCookedRecipe({
      recipeId: recipe.recipeId,
      recipeTitle: recipe.title,
      country: recipe.country,
      countryCode: recipe.countryCode,
      continent: recipe.continent,
      servingsCooked: servings,
      rating: userRating,
      notes: cookingNotes,
      photoUrl: mealPhoto || undefined
    });

    setHasRecordedCompletion(true);
    setShowCompletionModal(false);
  };

  const handleShoppingListClick = () => {
    onAddToShoppingList(recipe);
    setAddedToListToast(true);
    setTimeout(() => setAddedToListToast(false), 2500);
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200"
    >
      
      {/* Main Container */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-stone-950 sm:rounded-3xl border border-stone-800 shadow-2xl overflow-hidden min-h-screen sm:min-h-0 sm:max-h-[92vh] flex flex-col"
      >
        
        {/* Top Floating Control Bar */}
        <div className="absolute top-4 inset-x-4 sm:inset-x-6 z-20 flex items-center justify-between pointer-events-none">
          {/* Country Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-950/80 backdrop-blur-md border border-stone-800 text-xs font-bold text-stone-200 pointer-events-auto">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>{recipe.country}</span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-400">{recipe.continent}</span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Cooking Mode Button */}
            <button
              onClick={() => setIsCookingMode(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-lg transition-all"
              title="Enter distraction-free cooking mode"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cooking Mode</span>
            </button>

            {/* Favorite Button */}
            <button
              onClick={() => onToggleFavorite(recipe.recipeId)}
              className={`p-2 rounded-full backdrop-blur-md transition-all ${
                isFavorite
                  ? 'bg-rose-950 text-rose-400 border border-rose-700'
                  : 'bg-stone-950/80 hover:bg-stone-900 text-stone-200 border border-stone-800'
              }`}
              title="Save to favorites"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-stone-950/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Recipe Body */}
        <div className="overflow-y-auto flex-1">
          
          {/* Hero Image Section */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full bg-stone-900">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

            <div className="absolute bottom-4 sm:bottom-6 inset-x-4 sm:inset-x-8">
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-tight">
                {recipe.title}
              </h2>
              {recipe.alternateName && (
                <p className="text-sm sm:text-base text-amber-300 font-medium italic mt-1">
                  {recipe.alternateName}
                </p>
              )}
            </div>
          </div>

          {/* Core Content Grid */}
          <div className="p-4 sm:p-8 space-y-8">
            
            {/* Quick Metadata Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-stone-900/80 border border-stone-800 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-stone-400">Prep / Cook</p>
                  <p className="text-sm font-bold text-stone-200">{recipe.prepTime}m / {recipe.cookTime}m</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-stone-900/80 border border-stone-800 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-stone-400">Spice Level</p>
                  <p className="text-sm font-bold text-stone-200">
                    {recipe.spiceLevel === 0 ? 'Mild' : `${recipe.spiceLevel} / 5`}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-stone-900/80 border border-stone-800 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <ChefHat className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-stone-400">Difficulty</p>
                  <p className="text-sm font-bold text-stone-200">{recipe.difficulty}</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-stone-900/80 border border-stone-800 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-stone-400">Offline Status</p>
                  <p className="text-sm font-bold text-emerald-400">
                    {recipe.isStarter || isDownloaded ? 'Saved for Offline' : 'Online Recipe'}
                  </p>
                </div>
              </div>
            </div>

            {/* Cultural Background & Story */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/20 border border-stone-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 tracking-wide uppercase">
                <Info className="w-4 h-4" />
                <span>Cultural Heritage & Origins</span>
              </div>
              <p className="text-sm text-stone-300 leading-relaxed">
                {recipe.culturalBackground}
              </p>
              <p className="text-xs text-stone-400 italic pt-1">
                {recipe.description}
              </p>
            </div>

            {/* Interactive Ingredients Section with Scaler & Unit Toggle */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-800">
                <div className="flex items-center gap-3">
                  <h3 className="font-serif text-xl font-bold text-stone-100">
                    Ingredients
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 font-mono">
                    {recipe.ingredients.length} items
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Servings Scaler */}
                  <div className="flex items-center bg-stone-900 rounded-xl border border-stone-800 p-1">
                    <span className="text-xs text-stone-400 px-2 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      Serves
                    </span>
                    <button
                      onClick={() => setServings(Math.max(1, servings - 1))}
                      className="p-1 rounded-lg hover:bg-stone-800 text-stone-300"
                      title="Decrease servings"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 text-center font-bold text-sm text-amber-400">
                      {servings}
                    </span>
                    <button
                      onClick={() => setServings(servings + 1)}
                      className="p-1 rounded-lg hover:bg-stone-800 text-stone-300"
                      title="Increase servings"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Unit Switcher */}
                  <div className="flex bg-stone-900 rounded-xl border border-stone-800 p-1 text-xs">
                    <button
                      onClick={() => setUnitSystem('metric')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        unitSystem === 'metric' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
                      }`}
                    >
                      Metric
                    </button>
                    <button
                      onClick={() => setUnitSystem('imperial')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        unitSystem === 'imperial' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
                      }`}
                    >
                      Imperial
                    </button>
                  </div>
                </div>
              </div>

              {/* Ingredient Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {recipe.ingredients.map((ing, idx) => {
                  const isChecked = checkedIngredients.has(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCheckIngredient(idx)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                        isChecked
                          ? 'bg-stone-900/40 border-stone-800/50 opacity-60 line-through'
                          : 'bg-stone-900/80 border-stone-800 hover:border-amber-500/40'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                        isChecked ? 'bg-amber-500 border-amber-500 text-stone-950' : 'border-stone-600'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-stone-100 text-sm">
                          {formatScaledAmount(ing.amount, ing.unit)}
                        </span>
                        <span className="text-stone-300 text-sm ml-1.5">
                          {ing.name}
                        </span>
                        {ing.notes && (
                          <p className="text-[11px] text-stone-400 italic mt-0.5">
                            {ing.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Shopping List Action Bar */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleShoppingListClick}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 text-xs font-semibold transition-all active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>{addedToListToast ? '✓ Added to Shopping List!' : 'Add All to Shopping List'}</span>
                </button>

                <button
                  onClick={() => onOpenChefWithRecipe(recipe, `What substitutions can I make for ${recipe.title}?`)}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Missing an ingredient? Ask Chef
                </button>
              </div>
            </div>

            {/* Preparation Steps Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <h3 className="font-serif text-xl font-bold text-stone-100">
                  Step-by-Step Preparation
                </h3>
                <span className="text-xs text-stone-400">
                  {completedSteps.size} of {recipe.preparationSteps.length} completed
                </span>
              </div>

              <div className="space-y-4">
                {recipe.preparationSteps.map((step) => {
                  const isDone = completedSteps.has(step.stepNumber);
                  return (
                    <div
                      key={step.stepNumber}
                      className={`p-4 rounded-2xl border transition-all ${
                        isDone
                          ? 'bg-stone-900/30 border-stone-800/40 opacity-70'
                          : 'bg-stone-900/80 border-stone-800 hover:border-amber-500/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleCompleteStep(step.stepNumber)}
                          className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                            isDone
                              ? 'bg-amber-500 text-stone-950'
                              : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                          }`}
                        >
                          {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.stepNumber}
                        </button>

                        <div className="space-y-2 flex-1">
                          <p className={`text-sm leading-relaxed ${isDone ? 'line-through text-stone-400' : 'text-stone-200'}`}>
                            {step.instruction}
                          </p>

                          {/* Embedded Step Timer button */}
                          {step.timerMinutes && (
                            <button
                              onClick={() => handleStartStepTimer(step.timerMinutes!, `Step ${step.stepNumber}`)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-400 text-xs font-semibold transition-all"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Start {step.timerMinutes}m Timer</span>
                            </button>
                          )}

                          {step.tip && (
                            <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 text-xs text-amber-300 flex items-start gap-2">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <span>{step.tip}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Equipment & Chef Tips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recipe.equipment.length > 0 && (
                <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-300 uppercase">
                    <Utensils className="w-3.5 h-3.5 text-amber-400" />
                    <span>Recommended Equipment</span>
                  </div>
                  <ul className="text-xs text-stone-400 space-y-1">
                    {recipe.equipment.map((eq, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>{eq}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {recipe.cookingTips.length > 0 && (
                <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-300 uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Executive Chef Advice</span>
                  </div>
                  <ul className="text-xs text-stone-400 space-y-1">
                    {recipe.cookingTips.map((tip, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Substitutions */}
            {recipe.substitutions.length > 0 && (
              <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-2">
                <p className="text-xs font-bold text-stone-300 uppercase">
                  Known Substitutions & Swaps
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {recipe.substitutions.map((sub, i) => (
                    <div key={i} className="p-2 rounded-xl bg-stone-950/80 border border-stone-800">
                      <p className="font-semibold text-stone-200">Replace {sub.ingredient}</p>
                      <p className="text-amber-400 mt-0.5">Use {sub.substitute}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Celebration / "I Cooked This" & Ask Chef Bar */}
            <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => onOpenChefWithRecipe(recipe)}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Ask Chef AI About This Recipe</span>
              </button>

              <button
                onClick={() => setShowCompletionModal(true)}
                disabled={hasRecordedCompletion}
                className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
                  hasRecordedCompletion
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 cursor-default'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-amber-500/20'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>{hasRecordedCompletion ? '✓ Stamped in Food Passport!' : 'I Cooked This (Stamp Passport)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* DISTRACTION-FREE COOKING MODE OVERLAY */}
        {isCookingMode && (
          <div className="fixed inset-0 z-50 bg-stone-950 flex flex-col p-6 sm:p-12 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-6 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <span className="text-xs px-3 py-1 rounded-full bg-amber-500 text-stone-950 font-bold uppercase tracking-wider">
                  Cooking Mode
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-100 truncate">
                  {recipe.title}
                </h3>
              </div>
              <button
                onClick={() => setIsCookingMode(false)}
                className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Step Big Typography */}
            <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full py-8 space-y-6">
              <div className="flex items-center justify-between text-amber-400 font-mono text-sm">
                <span>STEP {activeStepIndex + 1} OF {recipe.preparationSteps.length}</span>
                {recipe.preparationSteps[activeStepIndex]?.timerMinutes && (
                  <button
                    onClick={() => handleStartStepTimer(recipe.preparationSteps[activeStepIndex].timerMinutes!, `Step ${activeStepIndex + 1}`)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold text-xs"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Start {recipe.preparationSteps[activeStepIndex].timerMinutes}m Timer</span>
                  </button>
                )}
              </div>

              <p className="font-serif text-2xl sm:text-4xl text-stone-100 leading-relaxed">
                {recipe.preparationSteps[activeStepIndex]?.instruction}
              </p>

              {recipe.preparationSteps[activeStepIndex]?.tip && (
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-sm text-amber-300 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{recipe.preparationSteps[activeStepIndex].tip}</span>
                </div>
              )}
            </div>

            {/* Step Controls */}
            <div className="flex items-center justify-between max-w-3xl mx-auto w-full pt-6 border-t border-stone-800">
              <button
                disabled={activeStepIndex === 0}
                onClick={() => setActiveStepIndex(Math.max(0, activeStepIndex - 1))}
                className="px-6 py-3 rounded-2xl bg-stone-900 disabled:opacity-30 hover:bg-stone-800 text-stone-200 font-bold text-sm"
              >
                Previous Step
              </button>

              <button
                onClick={() => {
                  toggleCompleteStep(recipe.preparationSteps[activeStepIndex].stepNumber);
                  if (activeStepIndex < recipe.preparationSteps.length - 1) {
                    setActiveStepIndex(activeStepIndex + 1);
                  } else {
                    setIsCookingMode(false);
                    setShowCompletionModal(true);
                  }
                }}
                className="px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-xl"
              >
                {activeStepIndex === recipe.preparationSteps.length - 1 ? 'Finish & Stamp Passport' : 'Next Step →'}
              </button>
            </div>
          </div>
        )}

        {/* "I COOKED THIS" COMPLETION & RATING MODAL */}
        {showCompletionModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-stone-900 rounded-3xl border border-stone-800 p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-stone-100">
                  Congratulations, Chef!
                </h3>
                <p className="text-xs text-stone-400">
                  You just brought {recipe.country} into your kitchen. Stamp your Food Passport and save your personal review.
                </p>
              </div>

              {/* Star Rating */}
              <div className="space-y-1 text-center">
                <label className="text-xs font-semibold text-stone-300">How did it turn out?</label>
                <div className="flex items-center justify-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="p-1 text-stone-600 hover:text-amber-400 transition-colors"
                    >
                      <Star className={`w-6 h-6 ${star <= userRating ? 'fill-amber-400 text-amber-400' : 'text-stone-600'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Cooking Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300">Personal Notes (optional)</label>
                <textarea
                  value={cookingNotes}
                  onChange={(e) => setCookingNotes(e.target.value)}
                  placeholder="e.g. Added extra garlic, cooked for 5 minutes less, family loved it..."
                  rows={2}
                  className="w-full p-3 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Meal Photo (Phase 7) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dish Photo (optional)</span>
                  </span>
                  {mealPhoto && (
                    <button
                      type="button"
                      onClick={() => setMealPhoto(null)}
                      className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </label>

                {mealPhoto ? (
                  <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 h-28 bg-stone-950">
                    <img
                      src={mealPhoto}
                      alt="Cooked Dish"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-medium text-amber-300">
                      Photo captured
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-dashed border-stone-700 hover:border-amber-500/60 bg-stone-950/60 hover:bg-stone-950 transition-all text-xs text-stone-400 hover:text-stone-200">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>{isCompressingPhoto ? 'Optimizing photo...' : 'Snap or upload your finished dish'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoSelect}
                      disabled={isCompressingPhoto}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="flex-1 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteDish}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-lg"
                >
                  Stamp Passport
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

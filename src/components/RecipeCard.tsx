import React from 'react';
import { Clock, Flame, Heart, Download, CheckCircle2, Lock, ChefHat } from 'lucide-react';
import { Recipe } from '../types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  isDownloaded: boolean;
  isPremiumUser: boolean;
  onSelect: (recipe: Recipe) => void;
  onToggleFavorite: (recipeId: string, e: React.MouseEvent) => void;
  onDownload: (recipeId: string, e: React.MouseEvent) => void;
  onOpenUnlockModal: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  isFavorite,
  isDownloaded,
  isPremiumUser,
  onSelect,
  onToggleFavorite,
  onDownload,
  onOpenUnlockModal
}) => {
  const isLocked = recipe.isPremium && !isPremiumUser;
  const isOfflineReady = recipe.isStarter || isDownloaded;

  const handleClick = () => {
    if (isLocked) {
      onOpenUnlockModal();
    } else {
      onSelect(recipe);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative rounded-3xl bg-stone-900/90 border transition-all duration-300 overflow-hidden cursor-pointer flex flex-col ${
        isLocked
          ? 'border-stone-800/80 hover:border-amber-500/40 opacity-90'
          : 'border-stone-800/80 hover:border-amber-500/60 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1'
      }`}
    >
      {/* Recipe Photo Header */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-950">
        <img
          src={recipe.image}
          alt={recipe.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          {/* Country Flag & Continent Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-950/80 backdrop-blur-md border border-stone-800/80 text-[11px] font-semibold text-stone-200 pointer-events-auto">
            <span className="font-mono text-amber-400 font-bold">{recipe.countryCode}</span>
            <span>•</span>
            <span className="truncate max-w-[100px]">{recipe.country}</span>
          </div>

          {/* Action Buttons: Favorite & Download */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Download status / button */}
            {!isLocked && (
              <button
                onClick={(e) => onDownload(recipe.recipeId, e)}
                title={isOfflineReady ? 'Available Offline' : 'Download for Offline Cooking'}
                className={`p-2 rounded-full backdrop-blur-md transition-all ${
                  isOfflineReady
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/50'
                    : 'bg-stone-950/70 hover:bg-stone-900 text-stone-300 border border-stone-800'
                }`}
              >
                {isOfflineReady ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Favorite heart */}
            <button
              onClick={(e) => onToggleFavorite(recipe.recipeId, e)}
              title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
              className={`p-2 rounded-full backdrop-blur-md transition-all ${
                isFavorite
                  ? 'bg-rose-950/80 text-rose-400 border border-rose-700/50'
                  : 'bg-stone-950/70 hover:bg-stone-900 text-stone-300 border border-stone-800'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Lock Overlay or Starter Badge */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none">
          {recipe.isStarter ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/90 text-stone-950 shadow-md">
              <ChefHat className="w-3 h-3" />
              Free Starter
            </span>
          ) : isLocked ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-900/95 text-amber-400 border border-amber-500/40 shadow-md">
              <Lock className="w-3 h-3" />
              World Unlock
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-900/80 text-stone-300">
              {recipe.mealType}
            </span>
          )}

          {recipe.spiceLevel > 0 && (
            <div className="flex items-center gap-0.5 text-amber-500" title={`Spice Level: ${recipe.spiceLevel}/5`}>
              {Array.from({ length: Math.min(3, recipe.spiceLevel) }).map((_, i) => (
                <Flame key={i} className="w-3 h-3 fill-amber-500" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif text-base sm:text-lg font-bold text-stone-100 group-hover:text-amber-400 transition-colors line-clamp-1">
            {recipe.title}
          </h3>
          {recipe.alternateName && (
            <p className="text-xs text-stone-400 italic line-clamp-1 mt-0.5">
              {recipe.alternateName}
            </p>
          )}

          <p className="text-xs text-stone-300 line-clamp-2 mt-2 leading-relaxed">
            {recipe.description}
          </p>
        </div>

        {/* Meta info & Dietary tags */}
        <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              {recipe.totalTime}m
            </span>
            <span className="font-medium text-stone-400">
              {recipe.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-hidden">
            {recipe.dietaryTags.slice(0, 1).map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-medium whitespace-nowrap">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

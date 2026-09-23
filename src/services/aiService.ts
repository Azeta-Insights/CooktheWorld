import { Recipe, UserProfile } from '../types/recipe';
import { evaluateLocalCookingQuery, LocalIntelligenceResult } from './localIntelligence';

export interface ChefResponse {
  handledLocally: boolean;
  category: string;
  title?: string;
  response: string;
  actionPayload?: any;
  remainingThisMonth?: number;
  limitReached?: boolean;
}

export class AIChefService {
  static async askChef(
    question: string,
    recipe?: Recipe,
    userProfile?: UserProfile | null,
    downloadedIds: Set<string> = new Set(),
    isOnline: boolean = navigator.onLine,
    conversationHistory: any[] = []
  ): Promise<ChefResponse> {
    // 1. Check Local Cooking Intelligence FIRST
    const localResult = evaluateLocalCookingQuery(question, recipe, downloadedIds);
    if (localResult) {
      return {
        handledLocally: true,
        category: localResult.category,
        title: localResult.title,
        response: localResult.response,
        actionPayload: localResult.actionPayload
      };
    }

    // 2. If requiring natural-language reasoning but device is OFFLINE
    if (!isOnline) {
      return {
        handledLocally: true,
        category: 'offline',
        title: 'Offline Mode Notice',
        response: `📡 **Chef requires an internet connection** to answer new cooking questions.\n\nGood news: Your saved recipes, serving adjustments (like "make for 4"), kitchen timers, and ingredient swap guides work completely offline!`
      };
    }

    // 3. Online: Call backend server endpoint with recipe context
    try {
      const payload = {
        userId: userProfile?.uid,
        userEntitlement: userProfile?.entitlement?.tier || 'free',
        currentUsage: userProfile?.aiUsage || { totalCount: 0, rollingCount: 0, todayCount: 0 },
        recipeId: recipe?.recipeId,
        userQuestion: question,
        recipeContext: recipe ? {
          title: recipe.title,
          country: recipe.country,
          continent: recipe.continent,
          servings: recipe.servings,
          ingredients: recipe.ingredients,
          preparationSteps: recipe.preparationSteps,
          substitutions: recipe.substitutions,
          cookingTips: recipe.cookingTips,
          spiceLevel: recipe.spiceLevel
        } : undefined,
        conversationHistory
      };

      const res = await fetch('/api/ai/ask-chef', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.limitReached) {
          return {
            handledLocally: false,
            category: 'limit',
            title: 'Monthly Question Limit Reached',
            response: data.message || "You've reached your chef questions limit for this month. Recipe adjustments, kitchen timers, and ingredient swaps remain unlimited.",
            limitReached: true
          };
        }
        throw new Error(data.message || 'Error communicating with Chef');
      }

      return {
        handledLocally: false,
        category: data.category || 'general',
        response: data.response,
        remainingThisMonth: data.remainingThisMonth
      };
    } catch (err: any) {
      console.error('Chef network error:', err);
      return {
        handledLocally: true,
        category: 'error',
        title: 'Chef is momentarily busy',
        response: 'Chef could not be reached right now. Please check your connection or ask for serving adjustments, ingredient swaps, or timers which work offline.'
      };
    }
  }
}

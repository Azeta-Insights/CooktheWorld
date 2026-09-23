import { Recipe, CookingRecord, ShoppingItem, PassportCountry } from '../types/recipe';
import { ALL_STARTER_RECIPES, getRecipeById } from '../data/recipes';

const STORAGE_KEYS = {
  DOWNLOADED_RECIPES: 'ctw_downloaded_recipes_v1',
  OFFLINE_COOKING_QUEUE: 'ctw_offline_cooking_queue_v1',
  LOCAL_FAVORITES: 'ctw_local_favorites_v1',
  LOCAL_SHOPPING_LIST: 'ctw_local_shopping_list_v1',
  LOCAL_PASSPORT: 'ctw_local_passport_v1',
  AI_USAGE_LOCAL: 'ctw_ai_usage_local_v1',
  ACTIVE_TIMERS: 'ctw_active_timers_v1'
};

// Safe JSON parser
function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

export class OfflineStorageService {
  // Get set of downloaded recipe IDs
  static getDownloadedRecipeIds(): Set<string> {
    const list = safeGet<string[]>(STORAGE_KEYS.DOWNLOADED_RECIPES, []);
    return new Set(list);
  }

  // Download a single recipe
  static downloadRecipe(recipeId: string): boolean {
    const current = this.getDownloadedRecipeIds();
    current.add(recipeId);
    safeSet(STORAGE_KEYS.DOWNLOADED_RECIPES, Array.from(current));
    return true;
  }

  // Remove a downloaded recipe
  static removeDownloadedRecipe(recipeId: string): void {
    const current = this.getDownloadedRecipeIds();
    current.delete(recipeId);
    safeSet(STORAGE_KEYS.DOWNLOADED_RECIPES, Array.from(current));
  }

  // Download all recipes (for premium users)
  static downloadAllRecipes(recipeIds: string[]): void {
    const current = this.getDownloadedRecipeIds();
    recipeIds.forEach(id => current.add(id));
    safeSet(STORAGE_KEYS.DOWNLOADED_RECIPES, Array.from(current));
  }

  // Calculate approximate offline storage size in MB
  static getEstimatedStorageUsage(): { recipeCount: number; sizeMB: string } {
    const downloadedIds = this.getDownloadedRecipeIds();
    // 50 starter recipes are already built-in offline
    const totalOfflineCount = downloadedIds.size + ALL_STARTER_RECIPES.length;
    // Each recipe with steps, ingredients, metadata & cached photo thumbnail is approx 45 KB
    const totalBytes = totalOfflineCount * 45 * 1024;
    const mb = (totalBytes / (1024 * 1024)).toFixed(1);
    return {
      recipeCount: totalOfflineCount,
      sizeMB: `${mb} MB`
    };
  }

  // Get all locally available recipes (Starters + Downloaded)
  static getAvailableOfflineRecipes(): Recipe[] {
    const downloaded = this.getDownloadedRecipeIds();
    const result: Recipe[] = [...ALL_STARTER_RECIPES];

    downloaded.forEach(id => {
      // Check if already in starter
      if (!result.some(r => r.recipeId === id)) {
        const recipe = getRecipeById(id);
        if (recipe) result.push(recipe);
      }
    });

    return result;
  }

  // Offline Cooking Record Queue
  static queueOfflineCookingRecord(record: CookingRecord): void {
    const queue = safeGet<CookingRecord[]>(STORAGE_KEYS.OFFLINE_COOKING_QUEUE, []);
    queue.push({ ...record, synced: false });
    safeSet(STORAGE_KEYS.OFFLINE_COOKING_QUEUE, queue);
  }

  static getOfflineCookingQueue(): CookingRecord[] {
    return safeGet<CookingRecord[]>(STORAGE_KEYS.OFFLINE_COOKING_QUEUE, []);
  }

  static clearOfflineCookingQueue(): void {
    safeSet(STORAGE_KEYS.OFFLINE_COOKING_QUEUE, []);
  }

  // Local Favorites
  static getLocalFavorites(): string[] {
    return safeGet<string[]>(STORAGE_KEYS.LOCAL_FAVORITES, []);
  }

  static toggleLocalFavorite(recipeId: string): boolean {
    const favs = new Set(this.getLocalFavorites());
    let isFav = false;
    if (favs.has(recipeId)) {
      favs.delete(recipeId);
    } else {
      favs.add(recipeId);
      isFav = true;
    }
    safeSet(STORAGE_KEYS.LOCAL_FAVORITES, Array.from(favs));
    return isFav;
  }

  // Local Shopping List
  static getLocalShoppingList(): ShoppingItem[] {
    return safeGet<ShoppingItem[]>(STORAGE_KEYS.LOCAL_SHOPPING_LIST, []);
  }

  static saveLocalShoppingList(items: ShoppingItem[]): void {
    safeSet(STORAGE_KEYS.LOCAL_SHOPPING_LIST, items);
  }

  static addRecipeToShoppingList(recipe: Recipe): ShoppingItem[] {
    const current = this.getLocalShoppingList();
    const newItems: ShoppingItem[] = recipe.ingredients.map(ing => ({
      id: `shop-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      recipeId: recipe.recipeId,
      recipeTitle: recipe.title,
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      checked: false,
      category: recipe.country,
      createdAt: new Date().toISOString()
    }));

    const combined = [...current, ...newItems];
    this.saveLocalShoppingList(combined);
    return combined;
  }

  // Local Food Passport
  static getLocalPassport(): Record<string, PassportCountry> {
    return safeGet<Record<string, PassportCountry>>(STORAGE_KEYS.LOCAL_PASSPORT, {});
  }

  static stampLocalPassport(countryCode: string, country: string, continent: any, dishName: string): PassportCountry {
    const passport = this.getLocalPassport();
    const existing = passport[countryCode];
    const now = new Date().toISOString();

    if (existing) {
      existing.recipesCooked++;
      existing.lastCookedAt = now;
      if (!existing.dishNames.includes(dishName)) {
        existing.dishNames.push(dishName);
      }
      passport[countryCode] = existing;
    } else {
      passport[countryCode] = {
        countryCode,
        country,
        continent,
        recipesCooked: 1,
        firstCookedAt: now,
        lastCookedAt: now,
        dishNames: [dishName]
      };
    }

    safeSet(STORAGE_KEYS.LOCAL_PASSPORT, passport);
    return passport[countryCode];
  }
}

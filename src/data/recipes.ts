import { Recipe, Continent } from '../types/recipe';
import { STARTER_RECIPES } from './starterRecipes';
import { STARTER_RECIPES_PART2 } from './starterRecipesPart2';
import { STARTER_RECIPES_PART3 } from './starterRecipesPart3';
import { generatePremiumRecipes } from './premiumRecipeGenerator';

// Exactly 50 Starter Recipes representing all 6 continents
export const ALL_STARTER_RECIPES: Recipe[] = [
  ...STARTER_RECIPES,
  ...STARTER_RECIPES_PART2,
  ...STARTER_RECIPES_PART3
];

// All Premium Recipes
export const ALL_PREMIUM_RECIPES: Recipe[] = generatePremiumRecipes();

// Total Cookbook (300+ recipes across 50+ countries)
export const ALL_RECIPES: Recipe[] = [
  ...ALL_STARTER_RECIPES,
  ...ALL_PREMIUM_RECIPES
];

// Fast in-memory lookup map
const RECIPES_BY_ID = new Map<string, Recipe>(
  ALL_RECIPES.map(r => [r.recipeId, r])
);

export function getRecipeById(id: string): Recipe | undefined {
  return RECIPES_BY_ID.get(id);
}

export function getStarterRecipes(): Recipe[] {
  return ALL_STARTER_RECIPES;
}

export function getRecipesByContinent(continent: Continent): Recipe[] {
  return ALL_RECIPES.filter(r => r.continent === continent);
}

export function getDistinctCountries(): Array<{ country: string; countryCode: string; continent: Continent; recipeCount: number }> {
  const map = new Map<string, { country: string; countryCode: string; continent: Continent; recipeCount: number }>();
  for (const r of ALL_RECIPES) {
    const existing = map.get(r.country);
    if (existing) {
      existing.recipeCount++;
    } else {
      map.set(r.country, {
        country: r.country,
        countryCode: r.countryCode,
        continent: r.continent,
        recipeCount: 1
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.country.localeCompare(b.country));
}

// Search and filter engine
export interface RecipeFilterOptions {
  query?: string;
  continent?: Continent | 'All';
  country?: string;
  cuisine?: string;
  mealType?: string;
  difficulty?: string;
  maxCookTime?: number;
  dietary?: string[];
  starterOnly?: boolean;
  offlineOnly?: boolean;
}

export function searchAndFilterRecipes(
  recipes: Recipe[],
  options: RecipeFilterOptions,
  offlineRecipeIds: Set<string> = new Set()
): Recipe[] {
  const query = options.query?.toLowerCase().trim() || '';

  return recipes.filter(recipe => {
    // Free starter filter
    if (options.starterOnly && !recipe.isStarter) return false;

    // Offline filter
    if (options.offlineOnly) {
      const isDownloaded = offlineRecipeIds.has(recipe.recipeId);
      const isStarter = recipe.isStarter;
      if (!isDownloaded && !isStarter) return false;
    }

    // Continent
    if (options.continent && options.continent !== 'All' && recipe.continent !== options.continent) {
      return false;
    }

    // Country
    if (options.country && recipe.country !== options.country) {
      return false;
    }

    // Cuisine
    if (options.cuisine && recipe.cuisine.toLowerCase() !== options.cuisine.toLowerCase()) {
      return false;
    }

    // Meal Type
    if (options.mealType && options.mealType !== 'All' && recipe.mealType !== options.mealType) {
      return false;
    }

    // Difficulty
    if (options.difficulty && options.difficulty !== 'All' && recipe.difficulty !== options.difficulty) {
      return false;
    }

    // Cook time
    if (options.maxCookTime && recipe.totalTime > options.maxCookTime) {
      return false;
    }

    // Dietary
    if (options.dietary && options.dietary.length > 0) {
      const matchesAll = options.dietary.every(d =>
        recipe.dietaryTags.some(tag => tag.toLowerCase().includes(d.toLowerCase()))
      );
      if (!matchesAll) return false;
    }

    // Query match across title, alternateName, country, cuisine, ingredients, tags
    if (query) {
      const inTitle = recipe.title.toLowerCase().includes(query);
      const inAlt = recipe.alternateName?.toLowerCase().includes(query);
      const inCountry = recipe.country.toLowerCase().includes(query);
      const inCuisine = recipe.cuisine.toLowerCase().includes(query);
      const inTags = recipe.searchTags.some(t => t.toLowerCase().includes(query));
      const inIngredients = recipe.ingredients.some(i => i.name.toLowerCase().includes(query));

      if (!inTitle && !inAlt && !inCountry && !inCuisine && !inTags && !inIngredients) {
        return false;
      }
    }

    return true;
  });
}

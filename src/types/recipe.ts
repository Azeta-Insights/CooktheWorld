export type Continent = 
  | 'Africa' 
  | 'Asia' 
  | 'Europe' 
  | 'North America' 
  | 'South America' 
  | 'Oceania';

export type Difficulty = 'Easy' | 'Medium' | 'Advanced';

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Dessert' | 'Snack' | 'Side Dish';

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  notes?: string;
}

export interface PreparationStep {
  stepNumber: number;
  instruction: string;
  timerMinutes?: number;
  tip?: string;
}

export interface Substitution {
  ingredient: string;
  substitute: string;
  ratio?: string;
  notes?: string;
}

export interface RecipeFAQ {
  question: string;
  category: 'substitutions' | 'cooking_time' | 'texture' | 'spice_level' | 'equipment' | 'storage' | 'dietary';
  answer: string;
}

export interface Recipe {
  recipeId: string;
  title: string;
  alternateName?: string;
  country: string;
  countryCode: string;
  continent: Continent;
  region: string;
  cuisine: string;
  description: string;
  culturalBackground: string;
  mealType: MealType;
  categories: string[];
  dietaryTags: string[]; // e.g. ['Gluten-Free', 'Vegetarian', 'Dairy-Free', 'Halal']
  allergens: string[];
  ingredients: Ingredient[];
  preparationSteps: PreparationStep[];
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  totalTime: number; // in minutes
  servings: number;
  difficulty: Difficulty;
  equipment: string[];
  cookingTips: string[];
  substitutions: Substitution[];
  servingSuggestions: string;
  storageInstructions: string;
  reheatingInstructions?: string;
  image: string;
  isStarter: boolean;
  isPremium: boolean;
  offlineAvailable: boolean;
  searchTags: string[];
  spiceLevel: 0 | 1 | 2 | 3 | 4 | 5; // 0 = None, 5 = Very Hot
  estimatedCost?: 'Budget' | 'Moderate' | 'Special Occasion';
  faqs?: RecipeFAQ[];
}

export interface CookingRecord {
  id: string;
  recipeId: string;
  recipeTitle: string;
  country: string;
  countryCode: string;
  continent: Continent;
  servingsCooked?: number;
  rating: number; // 1 - 5
  notes?: string;
  photoUrl?: string; // base64 or storage url
  cookedAt: string; // ISO date string
  synced?: boolean;
}

export interface PassportCountry {
  countryCode: string;
  country: string;
  continent: Continent;
  recipesCooked: number;
  firstCookedAt: string;
  lastCookedAt: string;
  dishNames: string[];
}

export interface ShoppingItem {
  id: string;
  recipeId?: string;
  recipeTitle?: string;
  name: string;
  amount?: number;
  unit?: string;
  checked: boolean;
  category?: string;
  createdAt: string;
}

export interface UserEntitlement {
  tier: 'free' | 'premium' | 'test_premium';
  source: 'default' | 'purchase' | 'test' | 'dev';
  unlockedAt?: string;
  paystackReference?: string;
}

export interface AIUsage {
  totalCount: number;
  rollingCount: number; // rolling 30-day count
  todayCount: number;
  lastResetDay: string;
  lastResetMonth: string;
}

export interface UserPreferences {
  dietary: string[];
  allergies: string[];
  favoriteIngredients: string[];
  avoidIngredients: string[];
  preferredCookingTime: string; // 'under_30', '30_60', 'any'
  spicePreference: string; // 'mild', 'medium', 'hot'
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  entitlement: UserEntitlement;
  preferences: UserPreferences;
  aiUsage: AIUsage;
  createdAt: string;
  updatedAt: string;
}

export interface PremiumRequest {
  id: string;
  userId: string;
  name: string;
  email: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface RecipeQuestionInsight {
  recipeId: string;
  recipeTitle: string;
  category: string;
  frequency: number;
  exampleQuestion: string;
  resolvedLocally: boolean;
  lastAskedAt: string;
}

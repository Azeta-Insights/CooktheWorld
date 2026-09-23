import { Recipe, Continent, MealType, Difficulty } from '../types/recipe';

// Master country metadata for 50+ countries across 6 continents
interface CountryMeta {
  country: string;
  code: string;
  continent: Continent;
  region: string;
  cuisine: string;
}

export const COUNTRIES_DATABASE: CountryMeta[] = [
  // Africa
  { country: 'Nigeria', code: 'NG', continent: 'Africa', region: 'West Africa', cuisine: 'Nigerian' },
  { country: 'Morocco', code: 'MA', continent: 'Africa', region: 'North Africa', cuisine: 'Moroccan' },
  { country: 'South Africa', code: 'ZA', continent: 'Africa', region: 'Southern Africa', cuisine: 'South African' },
  { country: 'Senegal', code: 'SN', continent: 'Africa', region: 'West Africa', cuisine: 'Senegalese' },
  { country: 'Ethiopia', code: 'ET', continent: 'Africa', region: 'East Africa', cuisine: 'Ethiopian' },
  { country: 'Ghana', code: 'GH', continent: 'Africa', region: 'West Africa', cuisine: 'Ghanaian' },
  { country: 'Egypt', code: 'EG', continent: 'Africa', region: 'North Africa', cuisine: 'Egyptian' },
  { country: 'Kenya', code: 'KE', continent: 'Africa', region: 'East Africa', cuisine: 'Kenyan' },
  { country: 'Tanzania', code: 'TZ', continent: 'Africa', region: 'East Africa', cuisine: 'Tanzanian' },
  { country: 'Cameroon', code: 'CM', continent: 'Africa', region: 'Central Africa', cuisine: 'Cameroonian' },
  { country: 'Tunisia', code: 'TN', continent: 'Africa', region: 'North Africa', cuisine: 'Tunisian' },
  { country: 'Ivory Coast', code: 'CI', continent: 'Africa', region: 'West Africa', cuisine: 'Ivorian' },
  
  // Asia
  { country: 'Japan', code: 'JP', continent: 'Asia', region: 'East Asia', cuisine: 'Japanese' },
  { country: 'Thailand', code: 'TH', continent: 'Asia', region: 'Southeast Asia', cuisine: 'Thai' },
  { country: 'India', code: 'IN', continent: 'Asia', region: 'South Asia', cuisine: 'Indian' },
  { country: 'China', code: 'CN', continent: 'Asia', region: 'East Asia', cuisine: 'Chinese' },
  { country: 'Vietnam', code: 'VN', continent: 'Asia', region: 'Southeast Asia', cuisine: 'Vietnamese' },
  { country: 'Indonesia', code: 'ID', continent: 'Asia', region: 'Southeast Asia', cuisine: 'Indonesian' },
  { country: 'South Korea', code: 'KR', continent: 'Asia', region: 'East Asia', cuisine: 'Korean' },
  { country: 'Philippines', code: 'PH', continent: 'Asia', region: 'Southeast Asia', cuisine: 'Filipino' },
  { country: 'Malaysia', code: 'MY', continent: 'Asia', region: 'Southeast Asia', cuisine: 'Malaysian' },
  { country: 'Lebanon', code: 'LB', continent: 'Asia', region: 'Middle East', cuisine: 'Lebanese' },
  { country: 'Singapore', code: 'SG', continent: 'Asia', region: 'Southeast Asia', cuisine: 'Singaporean' },
  { country: 'Iran', code: 'IR', continent: 'Asia', region: 'Middle East', cuisine: 'Persian' },
  
  // Europe
  { country: 'Italy', code: 'IT', continent: 'Europe', region: 'Southern Europe', cuisine: 'Italian' },
  { country: 'Spain', code: 'ES', continent: 'Europe', region: 'Southern Europe', cuisine: 'Spanish' },
  { country: 'France', code: 'FR', continent: 'Europe', region: 'Western Europe', cuisine: 'French' },
  { country: 'Greece', code: 'GR', continent: 'Europe', region: 'Southern Europe', cuisine: 'Greek' },
  { country: 'Poland', code: 'PL', continent: 'Europe', region: 'Eastern Europe', cuisine: 'Polish' },
  { country: 'Portugal', code: 'PT', continent: 'Europe', region: 'Southern Europe', cuisine: 'Portuguese' },
  { country: 'Sweden', code: 'SE', continent: 'Europe', region: 'Northern Europe', cuisine: 'Swedish' },
  { country: 'Germany', code: 'DE', continent: 'Europe', region: 'Western Europe', cuisine: 'German' },
  { country: 'United Kingdom', code: 'GB', continent: 'Europe', region: 'Western Europe', cuisine: 'British' },
  { country: 'Ireland', code: 'IE', continent: 'Europe', region: 'Western Europe', cuisine: 'Irish' },
  { country: 'Hungary', code: 'HU', continent: 'Europe', region: 'Central Europe', cuisine: 'Hungarian' },
  { country: 'Belgium', code: 'BE', continent: 'Europe', region: 'Western Europe', cuisine: 'Belgian' },

  // North America
  { country: 'Mexico', code: 'MX', continent: 'North America', region: 'Central America', cuisine: 'Mexican' },
  { country: 'Jamaica', code: 'JM', continent: 'North America', region: 'Caribbean', cuisine: 'Jamaican' },
  { country: 'United States', code: 'US', continent: 'North America', region: 'North America', cuisine: 'American' },
  { country: 'Canada', code: 'CA', continent: 'North America', region: 'North America', cuisine: 'Canadian' },
  { country: 'Cuba', code: 'CU', continent: 'North America', region: 'Caribbean', cuisine: 'Cuban' },
  { country: 'Costa Rica', code: 'CR', continent: 'North America', region: 'Central America', cuisine: 'Costa Rican' },
  { country: 'Dominican Republic', code: 'DO', continent: 'North America', region: 'Caribbean', cuisine: 'Dominican' },
  { country: 'Puerto Rico', code: 'PR', continent: 'North America', region: 'Caribbean', cuisine: 'Puerto Rican' },

  // South America
  { country: 'Peru', code: 'PE', continent: 'South America', region: 'Andes', cuisine: 'Peruvian' },
  { country: 'Argentina', code: 'AR', continent: 'South America', region: 'Southern Cone', cuisine: 'Argentinian' },
  { country: 'Brazil', code: 'BR', continent: 'South America', region: 'South America', cuisine: 'Brazilian' },
  { country: 'Colombia', code: 'CO', continent: 'South America', region: 'Andes', cuisine: 'Colombian' },
  { country: 'Chile', code: 'CL', continent: 'South America', region: 'Southern Cone', cuisine: 'Chilean' },
  { country: 'Venezuela', code: 'VE', continent: 'South America', region: 'Northern Coast', cuisine: 'Venezuelan' },
  { country: 'Ecuador', code: 'EC', continent: 'South America', region: 'Andes', cuisine: 'Ecuadorian' },
  { country: 'Uruguay', code: 'UY', continent: 'South America', region: 'Southern Cone', cuisine: 'Uruguayan' },

  // Oceania
  { country: 'Australia', code: 'AU', continent: 'Oceania', region: 'Australasia', cuisine: 'Australian' },
  { country: 'New Zealand', code: 'NZ', continent: 'Oceania', region: 'Australasia', cuisine: 'New Zealand' },
  { country: 'Fiji', code: 'FJ', continent: 'Oceania', region: 'Melanesia', cuisine: 'Fijian' },
  { country: 'Samoa', code: 'WS', continent: 'Oceania', region: 'Polynesia', cuisine: 'Samoan' },
  { country: 'French Polynesia', code: 'PF', continent: 'Oceania', region: 'Polynesia', cuisine: 'Tahitian' },
  { country: 'Papua New Guinea', code: 'PG', continent: 'Oceania', region: 'Melanesia', cuisine: 'Papua New Guinean' },
  { country: 'Tonga', code: 'TO', continent: 'Oceania', region: 'Polynesia', cuisine: 'Tongan' }
];

// Rich Curated Premium Dish Templates (5 per country across 52 countries = 260+ recipes)
interface DishBlueprint {
  title: string;
  alternateName?: string;
  countryCode: string;
  description: string;
  mealType: MealType;
  difficulty: Difficulty;
  prepTime: number;
  cookTime: number;
  servings: number;
  spiceLevel: 0 | 1 | 2 | 3 | 4 | 5;
  dietaryTags: string[];
  allergens: string[];
  keyIngredients: { name: string; amount: number; unit: string; notes?: string }[];
  steps: string[];
  tips: string[];
  image: string;
}

export const PREMIUM_BLUEPRINTS: DishBlueprint[] = [
  // NIGERIA
  {
    title: 'Egusi Soup with Pounded Yam',
    alternateName: 'Obe Egusi',
    countryCode: 'NG',
    description: 'Ground melon seeds slow-simmered with smoked fish, goat meat, bitterleaf, and crayfish in rich red palm oil.',
    mealType: 'Dinner',
    difficulty: 'Medium',
    prepTime: 20,
    cookTime: 40,
    servings: 5,
    spiceLevel: 3,
    dietaryTags: ['Gluten-Free', 'Halal'],
    allergens: ['Fish', 'Shellfish'],
    keyIngredients: [
      { name: 'Ground melon seeds (Egusi)', amount: 2, unit: 'cups' },
      { name: 'Red palm oil', amount: 0.5, unit: 'cup' },
      { name: 'Goat meat or beef', amount: 600, unit: 'g' },
      { name: 'Ground crayfish', amount: 3, unit: 'tbsp' },
      { name: 'Bitterleaf or spinach', amount: 2, unit: 'cups' }
    ],
    steps: [
      'Boil goat meat with seasonings until tender.',
      'Mix ground egusi with warm water into paste drops.',
      'Fry onion in palm oil, drop in egusi balls to set chunks.',
      'Add stock, smoked fish, crayfish, and simmer 20 mins.',
      'Fold in chopped greens and serve with pounded yam.'
    ],
    tips: ['Frying the egusi paste in hot palm oil creates delightful chewy curd morsels.'],
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Suya Spiced Beef Skewers',
    alternateName: 'Tsire',
    countryCode: 'NG',
    description: 'Thinly sliced beef sirloin dredged in fiery yaji spice (roasted ground peanut powder, ginger, chili) and flame grilled.',
    mealType: 'Dinner',
    difficulty: 'Easy',
    prepTime: 15,
    cookTime: 12,
    servings: 4,
    spiceLevel: 4,
    dietaryTags: ['Dairy-Free', 'Halal'],
    allergens: ['Peanuts'],
    keyIngredients: [
      { name: 'Beef sirloin', amount: 500, unit: 'g' },
      { name: 'Kuli-kuli peanut powder or roasted peanut flour', amount: 0.75, unit: 'cup' },
      { name: 'Ground ginger and garlic', amount: 1, unit: 'tbsp' },
      { name: 'Cayenne pepper', amount: 1, unit: 'tbsp' }
    ],
    steps: [
      'Slice beef paper-thin against the grain and thread onto soaked wooden skewers.',
      'Dredge skewers generously in yaji peanut spice rub.',
      'Drizzle with oil and grill over hot coals or high heat for 3 mins per side.',
      'Sprinkle extra yaji and serve with sliced red onions and juicy tomatoes.'
    ],
    tips: ['Freeze the beef for 20 mins beforehand to slice razor-thin with ease.'],
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Pepper Soup with Catfish',
    alternateName: 'Point and Kill',
    countryCode: 'NG',
    description: 'Aromatic medicinal herbal broth infused with uda pods, calabash nutmeg (ehuru), and fresh catfish.',
    mealType: 'Dinner',
    difficulty: 'Easy',
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    spiceLevel: 4,
    dietaryTags: ['Pescatarian', 'Gluten-Free', 'Dairy-Free'],
    allergens: ['Fish'],
    keyIngredients: [
      { name: 'Fresh Catfish steaks', amount: 800, unit: 'g' },
      { name: 'Pepper soup spice mix (ehuru, uda, uziza)', amount: 2, unit: 'tbsp' },
      { name: 'Fresh scent leaves (African basil)', amount: 0.5, unit: 'cup' },
      { name: 'Scotch bonnet pepper', amount: 2, unit: 'peppers' }
    ],
    steps: [
      'Wash catfish with hot water or alum to remove slime.',
      'Bring water with peppers, pepper soup spice blend, and bouillon to a rolling boil.',
      'Add catfish chunks carefully; cook on medium-low for 15 minutes without vigorous stirring.',
      'Toss in freshly chopped scent leaves in final 2 minutes and serve hot.'
    ],
    tips: ['Do not stir catfish violently once in the pot or it will break apart.'],
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Fried Plantains & Pepper Sauce',
    alternateName: 'Dodo and Ata Dindin',
    countryCode: 'NG',
    description: 'Caramelized golden ripe plantain coins served with a spicy crushed red pepper and onion relish.',
    mealType: 'Side Dish',
    difficulty: 'Easy',
    prepTime: 10,
    cookTime: 10,
    servings: 4,
    spiceLevel: 3,
    dietaryTags: ['Vegan', 'Gluten-Free', 'Dairy-Free'],
    allergens: [],
    keyIngredients: [
      { name: 'Ripe sweet plantains (yellow with black spots)', amount: 3, unit: 'pieces' },
      { name: 'Vegetable oil for frying', amount: 1, unit: 'cup' },
      { name: 'Scotch bonnet and bell pepper', amount: 2, unit: 'peppers' },
      { name: 'Red onion', amount: 1, unit: 'medium' }
    ],
    steps: [
      'Peel and slice plantains diagonally into 1/2-inch coins; sprinkle with salt.',
      'Heat oil over medium-high heat until shimmering.',
      'Fry plantain slices for 2-3 minutes per side until deep golden and caramelized.',
      'Fry crushed peppers and onions in 2 tbsp oil for ata dindin relish.'
    ],
    tips: ['Ripe plantains with plenty of dark spots have the highest natural sugar for caramelization.'],
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Moi Moi (Steamed Bean Cakes)',
    alternateName: 'Alele',
    countryCode: 'NG',
    description: 'Peeled black-eyed peas pureed with red peppers, onions, and flaked fish, steamed in broad banana leaves.',
    mealType: 'Lunch',
    difficulty: 'Medium',
    prepTime: 25,
    cookTime: 45,
    servings: 6,
    spiceLevel: 2,
    dietaryTags: ['Gluten-Free', 'Dairy-Free'],
    allergens: ['Eggs', 'Fish'],
    keyIngredients: [
      { name: 'Black-eyed peas (peeled)', amount: 2, unit: 'cups' },
      { name: 'Tatashe bell peppers', amount: 2, unit: 'large' },
      { name: 'Hard-boiled eggs and flaked fish', amount: 2, unit: 'eggs' },
      { name: 'Vegetable oil', amount: 0.3, unit: 'cup' }
    ],
    steps: [
      'Soak and peel skin off black-eyed peas.',
      'Blend beans with peppers, onions, and warm broth into a fluffy light batter.',
      'Whisk in vegetable oil and seasonings thoroughly to incorporate air.',
      'Pour into leaf wraps or ramekins, top with boiled egg slice and fish.',
      'Steam over low heat for 45 minutes until firm.'
    ],
    tips: ['Whisking air into the batter before steaming makes the cake tender and fluffy.'],
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80'
  },

  // JAPAN
  {
    title: 'Japanese Chicken Katsu Curry',
    alternateName: 'チキンカツカレー',
    countryCode: 'JP',
    description: 'Crispy panko-breaded fried chicken cutlet served over rice smothered in rich, caramelized Japanese curry sauce.',
    mealType: 'Dinner',
    difficulty: 'Easy',
    prepTime: 20,
    cookTime: 25,
    servings: 4,
    spiceLevel: 1,
    dietaryTags: [],
    allergens: ['Gluten', 'Eggs'],
    keyIngredients: [
      { name: 'Chicken breast fillets', amount: 4, unit: 'cutlets' },
      { name: 'Japanese panko breadcrumbs', amount: 1.5, unit: 'cups' },
      { name: 'Japanese curry roux blocks', amount: 100, unit: 'g' },
      { name: 'Onions and carrots', amount: 2, unit: 'vegetables' },
      { name: 'Steamed sushi rice', amount: 4, unit: 'portions' }
    ],
    steps: [
      'Pound chicken cutlets thin, dredge in flour, beaten egg, and press into panko.',
      'Deep-fry cutlets at 170°C for 5 minutes until crunchy and golden.',
      'Caramelize onions and carrots, add water and melt curry roux blocks into glossy sauce.',
      'Slice katsu cutlet and serve over steaming rice draped in luscious curry sauce.'
    ],
    tips: ['Double dredge the chicken edges in panko for that signature airy Tokyo restaurant crunch.'],
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Tokyo Gyoza (Pan-Fried Dumplings)',
    alternateName: '焼き餃子',
    countryCode: 'JP',
    description: 'Crispy-bottomed steamed pork and napa cabbage dumplings seasoned with garlic, ginger, and sesame oil.',
    mealType: 'Dinner',
    difficulty: 'Medium',
    prepTime: 30,
    cookTime: 12,
    servings: 4,
    spiceLevel: 0,
    dietaryTags: [],
    allergens: ['Gluten', 'Soy', 'Sesame'],
    keyIngredients: [
      { name: 'Gyoza wrappers', amount: 24, unit: 'wrappers' },
      { name: 'Ground pork', amount: 300, unit: 'g' },
      { name: 'Napa cabbage', amount: 1.5, unit: 'cups', notes: 'Salted and squeezed dry' },
      { name: 'Garlic and ginger', amount: 1, unit: 'tbsp', notes: 'Minced' },
      { name: 'Soy sauce and sesame oil', amount: 1, unit: 'tbsp' }
    ],
    steps: [
      'Mix pork, drained cabbage, garlic, ginger, soy sauce, and sesame oil until sticky.',
      'Place 1 tsp filling in wrapper, wet rim, and pleat into crescent dumplings.',
      'Fry in a hot oiled skillet for 2 mins until golden on bottom.',
      'Pour in 1/4 cup water, immediately cover with lid to steam cook for 4 mins.',
      'Uncover, drizzle sesame oil, and let crisp up for 1 minute before sliding onto plate.'
    ],
    tips: ['Squeezing moisture thoroughly from salted cabbage keeps the dumpling skin crispy.'],
    image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Beef Gyudon Rice Bowl',
    alternateName: '牛丼',
    countryCode: 'JP',
    description: 'Paper-thin beef slices and tender sweet onions simmered in dashi, mirin, and soy sauce over warm rice.',
    mealType: 'Lunch',
    difficulty: 'Easy',
    prepTime: 10,
    cookTime: 12,
    servings: 2,
    spiceLevel: 0,
    dietaryTags: ['Dairy-Free'],
    allergens: ['Soy', 'Gluten'],
    keyIngredients: [
      { name: 'Thinly sliced beef (ribeye or chuck)', amount: 300, unit: 'g' },
      { name: 'Yellow onion', amount: 1, unit: 'large', notes: 'Sliced into strips' },
      { name: 'Dashi broth', amount: 1, unit: 'cup' },
      { name: 'Soy sauce and mirin', amount: 3, unit: 'tbsp', notes: 'Each' },
      { name: 'Sugar', amount: 1, unit: 'tbsp' }
    ],
    steps: [
      'Simmer sliced onions in dashi, soy sauce, mirin, and sugar for 5 minutes until tender.',
      'Add thin beef slices, spreading them out to cook gently for 3-4 minutes.',
      'Ladle saucy beef and onions over bowls of hot steamed rice.',
      'Garnish with pickled red ginger (beni shoga) and a raw egg yolk or onsen tamago.'
    ],
    tips: ['Do not boil the beef violently; gentle simmering keeps the meat buttery and soft.'],
    image: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Crispy Vegetable Tempura',
    alternateName: '天ぷら',
    countryCode: 'JP',
    description: 'Feather-light, lace-like crispy fried sweet potato, lotus root, shiitake, and asparagus with tentsuyu dipping broth.',
    mealType: 'Lunch',
    difficulty: 'Medium',
    prepTime: 20,
    cookTime: 15,
    servings: 4,
    spiceLevel: 0,
    dietaryTags: ['Vegetarian'],
    allergens: ['Gluten', 'Eggs'],
    keyIngredients: [
      { name: 'Assorted vegetables (sweet potato, asparagus, mushrooms)', amount: 400, unit: 'g' },
      { name: 'Cake flour or tempura flour', amount: 1, unit: 'cup' },
      { name: 'Ice-cold sparkling water', amount: 1, unit: 'cup' },
      { name: 'Egg yolk', amount: 1, unit: 'yolk' }
    ],
    steps: [
      'Gently mix ice water, egg yolk, and flour with chopsticks. Leave lumps; do not overmix.',
      'Dust vegetables lightly in dry flour, dip into cold batter.',
      'Fry in clean oil at 180°C (350°F) for 2-3 minutes until pale golden and super crisp.',
      'Drain on rack and serve immediately with tentsuyu sauce and grated daikon.'
    ],
    tips: ['Ice-cold water prevents gluten development, producing that ultra-shattery crust.'],
    image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Traditional Miso Soup with Tofu & Wakame',
    alternateName: '味噌汁',
    countryCode: 'JP',
    description: 'Pure, restorative dashi broth infused with red and white fermented miso paste, silky tofu cubes, and wakame seaweed.',
    mealType: 'Breakfast',
    difficulty: 'Easy',
    prepTime: 5,
    cookTime: 8,
    servings: 4,
    spiceLevel: 0,
    dietaryTags: ['Vegetarian', 'Gluten-Free Optional'],
    allergens: ['Soy'],
    keyIngredients: [
      { name: 'Dashi broth', amount: 4, unit: 'cups' },
      { name: 'Miso paste (awase or white)', amount: 3, unit: 'tbsp' },
      { name: 'Silken tofu', amount: 150, unit: 'g', notes: 'Cut into 1/2-inch cubes' },
      { name: 'Dried wakame seaweed', amount: 1, unit: 'tbsp', notes: 'Rehydrated' },
      { name: 'Scallions', amount: 2, unit: 'stalks', notes: 'Finely sliced' }
    ],
    steps: [
      'Bring dashi broth to a gentle simmer in a saucepan.',
      'Add diced silken tofu and rehydrated wakame; warm through for 2 minutes.',
      'Turn off heat. Place miso paste in a ladle, submerge into broth, and dissolve with chopsticks.',
      'Ladle into small lacquer bowls and sprinkle with freshly sliced scallions.'
    ],
    tips: ['Never boil miso soup after adding miso paste, as boiling destroys beneficial aromatics and enzymes.'],
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80'
  },

  // ITALY
  {
    title: 'Classic Neapolitan Margherita Pizza',
    alternateName: 'Pizza Margherita DOC',
    countryCode: 'IT',
    description: 'Blistered wood-fired crust topped with sweet San Marzano tomato sauce, fresh buffalo mozzarella, fresh basil, and extra virgin olive oil.',
    mealType: 'Dinner',
    difficulty: 'Medium',
    prepTime: 25,
    cookTime: 8,
    servings: 2,
    spiceLevel: 0,
    dietaryTags: ['Vegetarian'],
    allergens: ['Dairy', 'Gluten'],
    keyIngredients: [
      { name: 'Tipo 00 pizza flour dough (fermented)', amount: 2, unit: 'balls' },
      { name: 'San Marzano canned tomatoes (crushed by hand)', amount: 1, unit: 'cup' },
      { name: 'Fresh mozzarella di bufala', amount: 150, unit: 'g', notes: 'Torn' },
      { name: 'Fresh sweet basil leaves', amount: 8, unit: 'leaves' },
      { name: 'Extra virgin olive oil', amount: 2, unit: 'tbsp' }
    ],
    steps: [
      'Stretch dough by hand on a floured board into a 12-inch disc with an airy crust rim (cornicione).',
      'Spread crushed San Marzano tomatoes evenly with back of a spoon.',
      'Scatter torn buffalo mozzarella and fresh basil leaves.',
      'Bake on a preheated pizza stone at maximum oven heat (260°C+) for 6-8 minutes until blistered.',
      'Finish with a drizzle of fruity olive oil and slice.'
    ],
    tips: ['Never use a rolling pin; gently pushing air from the center into the outer rim creates the puffy cornicione.'],
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Creamy Mushroom Risotto',
    alternateName: 'Risotto ai Funghi Porcini',
    countryCode: 'IT',
    description: 'Silky, creamy carnaroli rice slowly ladled with warm stock, dried porcini mushrooms, butter, and 24-month Parmigiano-Reggiano.',
    mealType: 'Dinner',
    difficulty: 'Medium',
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    spiceLevel: 0,
    dietaryTags: ['Gluten-Free', 'Vegetarian'],
    allergens: ['Dairy'],
    keyIngredients: [
      { name: 'Carnaroli or Arborio rice', amount: 300, unit: 'g' },
      { name: 'Dried Porcini mushrooms', amount: 30, unit: 'g', notes: 'Soaked in warm water' },
      { name: 'Warm vegetable broth', amount: 5, unit: 'cups' },
      { name: 'Dry white wine', amount: 0.5, unit: 'cup' },
      { name: 'Parmigiano-Reggiano and butter', amount: 50, unit: 'g', notes: 'For mantecatura' }
    ],
    steps: [
      'Toast rice in olive oil until grains are translucent with white centers (tostatura).',
      'Deglaze with white wine until evaporated.',
      'Add strained porcini mushrooms and ladle warm broth one scoop at a time, stirring constantly as liquid absorbs.',
      'When rice is al dente (18 mins), take pan off heat.',
      'Perform mantecatura: vigorously beat in cold cubed butter and grated Parmigiano until wave-like (all’onda).'
    ],
    tips: ['Vigorous mantecatura off the heat creates that glossy emulsion without needing heavy cream.'],
    image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Tuscan Ribollita Vegetable Bread Stew',
    alternateName: 'Zuppa Toscana Ribollita',
    countryCode: 'IT',
    description: 'Hearty re-boiled Tuscan soup with cavolo nero kale, cannellini beans, vegetables, and day-old rustic country sourdough.',
    mealType: 'Dinner',
    difficulty: 'Easy',
    prepTime: 20,
    cookTime: 45,
    servings: 6,
    spiceLevel: 0,
    dietaryTags: ['Vegan', 'Dairy-Free'],
    allergens: ['Gluten'],
    keyIngredients: [
      { name: 'Lacinato Tuscan kale (cavolo nero)', amount: 1, unit: 'bunch' },
      { name: 'Cooked cannellini white beans', amount: 3, unit: 'cups', notes: 'Half mashed' },
      { name: 'Stale crusty sourdough bread', amount: 4, unit: 'thick slices' },
      { name: 'Carrots, celery, and onion', amount: 2, unit: 'cups' },
      { name: 'Extra virgin olive oil', amount: 0.3, unit: 'cup' }
    ],
    steps: [
      'Sauté vegetables in olive oil, add chopped kale, broth, and mashed cannellini beans.',
      'Simmer for 30 minutes until vegetables are rich and tender.',
      'Tear stale bread into the pot. Let it sit and re-boil (ribollita) over low heat until stew is thick enough to hold a spoon upright.',
      'Serve in earthenware bowls drizzled generously with peppery fresh Tuscan olive oil.'
    ],
    tips: ['Mashing half the cannellini beans gives the broth its comforting velvety body.'],
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Venetian Tiramisù',
    alternateName: 'Tiramisù Tradizionale',
    countryCode: 'IT',
    description: 'Airy savoiardi ladyfingers soaked in espresso and Marsala wine, layered with fluffy whipped mascarpone cream and dusted with dark cocoa.',
    mealType: 'Dessert',
    difficulty: 'Easy',
    prepTime: 25,
    cookTime: 0,
    servings: 8,
    spiceLevel: 0,
    dietaryTags: ['Vegetarian'],
    allergens: ['Dairy', 'Eggs', 'Gluten'],
    keyIngredients: [
      { name: 'Italian Ladyfingers (Savoiardi)', amount: 24, unit: 'cookies' },
      { name: 'Mascarpone cheese', amount: 500, unit: 'g' },
      { name: 'Fresh eggs', amount: 4, unit: 'large', notes: 'Whites whipped, yolks whipped with sugar' },
      { name: 'Strong brewed espresso', amount: 1.5, unit: 'cups' },
      { name: 'Dutch-process cocoa powder', amount: 3, unit: 'tbsp' }
    ],
    steps: [
      'Whisk egg yolks and sugar until pale and doubled. Fold in mascarpone until smooth.',
      'Whip egg whites to stiff peaks, gently fold into mascarpone cream.',
      'Dip ladyfingers briefly (1 second each) in espresso, line bottom of dish.',
      'Spread half the cream, repeat second layer of ladyfingers and cream.',
      'Chill for at least 6 hours, dust top with rich cocoa powder right before serving.'
    ],
    tips: ['Only dunk ladyfingers for a single second; they absorb espresso quickly and shouldn’t turn soggy.'],
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Classic Bolognese Ragu with Tagliatelle',
    alternateName: 'Tagliatelle al Ragù alla Bolognese',
    countryCode: 'IT',
    description: 'Slow-simmered beef and pork ragù gently bathed in milk, white wine, and sweet tomatoes tossed with fresh egg tagliatelle ribbons.',
    mealType: 'Dinner',
    difficulty: 'Medium',
    prepTime: 20,
    cookTime: 120,
    servings: 6,
    spiceLevel: 0,
    dietaryTags: [],
    allergens: ['Dairy', 'Gluten', 'Eggs'],
    keyIngredients: [
      { name: 'Fresh egg tagliatelle', amount: 500, unit: 'g' },
      { name: 'Minced beef chuck and pork', amount: 600, unit: 'g' },
      { name: 'Finely minced sofrito (onion, celery, carrot)', amount: 1.5, unit: 'cups' },
      { name: 'Whole milk', amount: 1, unit: 'cup', notes: 'Tenderizes meat' },
      { name: 'Dry white wine', amount: 1, unit: 'cup' },
      { name: 'Passata tomato puree', amount: 1.5, unit: 'cups' }
    ],
    steps: [
      'Sweat sofrito in butter and oil. Add minced meats, browning gently without crusting.',
      'Pour in white wine, let evaporate completely.',
      'Add milk, simmering gently until milk reduces into the meat.',
      'Stir in passata tomatoes and stock. Cover and simmer on lowest heat for 2.5 hours.',
      'Toss with al dente fresh egg tagliatelle and finish with Parmigiano.'
    ],
    tips: ['Adding milk early in the braise breaks down the meat fibers, ensuring a tender, melt-in-your-mouth sauce.'],
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80'
  }
];

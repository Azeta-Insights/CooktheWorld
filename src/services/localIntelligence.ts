import { Recipe, Ingredient } from '../types/recipe';
import { ALL_RECIPES } from '../data/recipes';

export interface LocalIntelligenceResult {
  handledLocally: boolean;
  category: 'scaling' | 'substitution' | 'quantities' | 'steps' | 'time' | 'difficulty' | 'equipment' | 'conversion' | 'pantry' | 'timer' | 'faq' | 'general';
  title?: string;
  response: string;
  actionPayload?: {
    type: 'scale_servings' | 'set_timer' | 'add_to_shopping_list' | 'show_recipes';
    data?: any;
  };
}

export function evaluateLocalCookingQuery(
  question: string,
  recipe?: Recipe,
  downloadedRecipeIds: Set<string> = new Set()
): LocalIntelligenceResult | null {
  const q = question.toLowerCase().trim();

  // 1. RECIPE SCALING INTENT (e.g. "make this for 2", "scale to 6", "for 8 people")
  const scaleMatch = q.match(/(?:make|scale|adjust|cook|for)\s+(?:this\s+)?(?:for\s+)?(\d+)\s*(?:people|servings|persons|portions)?/i);
  if (scaleMatch && recipe) {
    const targetServings = parseInt(scaleMatch[1], 10);
    if (targetServings > 0 && targetServings <= 50) {
      const factor = targetServings / recipe.servings;
      const scaledIngredients = recipe.ingredients.map(ing => {
        const scaledAmt = Math.round((ing.amount * factor) * 10) / 10;
        return `• ${ing.name}: ${scaledAmt} ${ing.unit}${ing.notes ? ` (${ing.notes})` : ''}`;
      }).join('\n');

      return {
        handledLocally: true,
        category: 'scaling',
        title: `Scaled to ${targetServings} Servings (${factor.toFixed(1)}x)`,
        response: `Here are the adjusted ingredient quantities for ${targetServings} servings (originally ${recipe.servings}):\n\n${scaledIngredients}\n\n💡 Chef Tip: Cooking times remain roughly the same, but larger quantities may need 3-5 extra minutes for moisture reduction.`,
        actionPayload: {
          type: 'scale_servings',
          data: { servings: targetServings, factor }
        }
      };
    }
  }

  // 2. COOKING TIMER (e.g. "set 20 minute timer", "start 15 min timer", "timer for 10 mins")
  const timerMatch = q.match(/(?:set|start|give me|begin)?\s*(?:a\s+)?(\d+)\s*(?:min|minute|minutes|mins)\s*(?:timer|alarm)?/i);
  if (timerMatch && (q.includes('timer') || q.includes('alarm') || q.includes('min'))) {
    const minutes = parseInt(timerMatch[1], 10);
    if (minutes > 0 && minutes <= 240) {
      return {
        handledLocally: true,
        category: 'timer',
        title: `${minutes}-Minute Cooking Timer`,
        response: `⏰ I have started a ${minutes}-minute cooking timer for you. You will hear an alert when it is time to check your dish!`,
        actionPayload: {
          type: 'set_timer',
          data: { minutes }
        }
      };
    }
  }

  // 3. TEMPERATURE CONVERSIONS (e.g. "convert 180C to F", "180c to fahrenheit", "350f in c")
  const cToFMatch = q.match(/(\d+)\s*°?\s*c(?:elsius)?\s*(?:in|to)?\s*°?\s*f(?:ahrenheit)?/i);
  if (cToFMatch) {
    const c = parseFloat(cToFMatch[1]);
    const f = Math.round((c * 9 / 5) + 32);
    return {
      handledLocally: true,
      category: 'conversion',
      title: 'Temperature Conversion',
      response: `${c}°C is equal to **${f}°F** (standard oven temperature: ${f}°F / gas mark ${Math.max(1, Math.round((c - 120) / 14))}).`
    };
  }

  const fToCMatch = q.match(/(\d+)\s*°?\s*f(?:ahrenheit)?\s*(?:in|to)?\s*°?\s*c(?:elsius)?/i);
  if (fToCMatch) {
    const f = parseFloat(fToCMatch[1]);
    const c = Math.round((f - 32) * 5 / 9);
    return {
      handledLocally: true,
      category: 'conversion',
      title: 'Temperature Conversion',
      response: `${f}°F is equal to **${c}°C**.`
    };
  }

  // 4. INGREDIENT SUBSTITUTIONS (Recipe specific or global culinary logic)
  if (q.includes('substitute') || q.includes('replace') || q.includes('don\'t have') || q.includes('dont have') || q.includes('instead of')) {
    if (recipe && recipe.substitutions.length > 0) {
      for (const sub of recipe.substitutions) {
        if (q.includes(sub.ingredient.toLowerCase()) || q.includes(sub.ingredient.split(' ')[0].toLowerCase())) {
          return {
            handledLocally: true,
            category: 'substitution',
            title: `Substitution for ${sub.ingredient}`,
            response: `For **${sub.ingredient}** in ${recipe.title}, you can use:\n\n• **${sub.substitute}** ${sub.ratio ? `(Ratio: ${sub.ratio})` : ''}\n${sub.notes ? `\nNote: ${sub.notes}` : ''}`
          };
        }
      }
    }

    // Common universal substitutions
    const universalSubs: Record<string, string> = {
      thyme: 'Oregano, marjoram, or Italian seasoning (1:1 ratio).',
      butter: 'Olive oil, vegetable oil, or coconut oil (3/4 cup oil for every 1 cup butter).',
      garlic: 'Garlic powder (1/8 tsp per clove) or shallots.',
      onion: 'Shallots, leeks, scallions, or 1 tsp onion powder per small onion.',
      egg: 'Applesauce (1/4 cup per egg), mashed banana, or 1 tbsp flaxseed meal mixed with 3 tbsp water.',
      buttermilk: '1 cup milk + 1 tbsp lemon juice or white vinegar (let sit 5 mins).',
      'heavy cream': 'Equal parts milk and melted butter, or coconut cream for dairy-free.',
      'soy sauce': 'Tamari, coconut aminos, or Worcestershire sauce diluted with a little water.',
      'scotch bonnet': 'Habanero pepper (identical fruity heat) or red jalapeño for a milder dish.'
    };

    for (const [k, v] of Object.entries(universalSubs)) {
      if (q.includes(k)) {
        return {
          handledLocally: true,
          category: 'substitution',
          title: `Substitute for ${k.charAt(0).toUpperCase() + k.slice(1)}`,
          response: `You can substitute **${k}** with: **${v}**`
        };
      }
    }
  }

  // 5. RECIPE FAQ CHECK (Structured FAQs on recipe)
  if (recipe && recipe.faqs && recipe.faqs.length > 0) {
    for (const faq of recipe.faqs) {
      const faqWords = faq.question.toLowerCase().split(' ').filter(w => w.length > 3);
      const matchCount = faqWords.filter(w => q.includes(w)).length;
      if (matchCount >= 2 || q.includes(faq.category)) {
        return {
          handledLocally: true,
          category: 'faq',
          title: faq.question,
          response: `${faq.answer}`
        };
      }
    }
  }

  // 6. COOKING TIME / PREP TIME
  if ((q.includes('how long') || q.includes('cooking time') || q.includes('prep time') || q.includes('total time')) && recipe) {
    return {
      handledLocally: true,
      category: 'time',
      title: `Cooking Time for ${recipe.title}`,
      response: `⏱️ **Preparation Time:** ${recipe.prepTime} minutes\n🔥 **Active Cook Time:** ${recipe.cookTime} minutes\n⏳ **Total Time:** ${recipe.totalTime} minutes (${(recipe.totalTime / 60).toFixed(1)} hours)`
    };
  }

  // 7. INGREDIENT QUANTITY LOOKUP (e.g. "how much onion", "amount of rice", "what ingredients")
  if (recipe) {
    if (q.includes('what ingredients') || q.includes('ingredient list') || q.includes('show ingredients')) {
      const list = recipe.ingredients.map(i => `• ${i.amount} ${i.unit} ${i.name}${i.notes ? ` (${i.notes})` : ''}`).join('\n');
      return {
        handledLocally: true,
        category: 'quantities',
        title: `Ingredients for ${recipe.title} (${recipe.servings} servings)`,
        response: list
      };
    }

    for (const ing of recipe.ingredients) {
      const ingNameClean = ing.name.toLowerCase();
      if (q.includes(ingNameClean) || ingNameClean.split(' ').some(w => w.length > 3 && q.includes(w))) {
        if (q.includes('how much') || q.includes('how many') || q.includes('amount') || q.includes('quantity')) {
          return {
            handledLocally: true,
            category: 'quantities',
            title: `Quantity for ${ing.name}`,
            response: `For ${recipe.title} (${recipe.servings} servings), you need **${ing.amount} ${ing.unit}** of ${ing.name}${ing.notes ? ` (${ing.notes})` : ''}.`
          };
        }
      }
    }
  }

  // 8. EQUIPMENT INQUIRY
  if (q.includes('equipment') || q.includes('what pot') || q.includes('what pan') || q.includes('tools do i need')) {
    if (recipe) {
      const eq = recipe.equipment.map(e => `• ${e}`).join('\n');
      return {
        handledLocally: true,
        category: 'equipment',
        title: `Recommended Equipment for ${recipe.title}`,
        response: `To prepare this dish smoothly, you'll need:\n\n${eq}`
      };
    }
  }

  // 9. DIFFICULTY / BEGINNER FRIENDLY
  if (q.includes('difficulty') || q.includes('is this easy') || q.includes('beginner') || q.includes('hard to cook')) {
    if (recipe) {
      return {
        handledLocally: true,
        category: 'difficulty',
        title: `Difficulty: ${recipe.difficulty}`,
        response: `${recipe.title} is classified as **${recipe.difficulty}** difficulty. ${
          recipe.difficulty === 'Easy' 
            ? 'It is straightforward and beginner-friendly with accessible steps.' 
            : recipe.difficulty === 'Medium'
            ? 'It requires moderate attention to timing and heat management.'
            : 'It involves advanced traditional technique or multiple steps.'
        }`
      };
    }
  }

  // 10. RECIPE STEPS / NEXT STEP
  if (recipe && (q.includes('first step') || q.includes('next step') || q.includes('steps') || q.includes('instructions'))) {
    const stepsFormatted = recipe.preparationSteps.map(s => 
      `**Step ${s.stepNumber}:** ${s.instruction}${s.tip ? `\n💡 Tip: ${s.tip}` : ''}`
    ).join('\n\n');
    return {
      handledLocally: true,
      category: 'steps',
      title: `Preparation Steps for ${recipe.title}`,
      response: stepsFormatted
    };
  }

  // 11. SHOPPING LIST ADDITION
  if (q.includes('shopping list') || q.includes('add to my list') || q.includes('grocery list')) {
    if (recipe) {
      return {
        handledLocally: true,
        category: 'general',
        title: 'Added to Shopping List',
        response: `✅ All ingredients for **${recipe.title}** have been prepared for your shopping list.`,
        actionPayload: {
          type: 'add_to_shopping_list',
          data: { recipe }
        }
      };
    }
  }

  // 12. OFFLINE AVAILABILITY QUERY
  if (q.includes('offline') || q.includes('downloaded') || q.includes('without internet')) {
    if (recipe) {
      const isAvailableOffline = recipe.isStarter || downloadedRecipeIds.has(recipe.recipeId);
      return {
        handledLocally: true,
        category: 'general',
        title: 'Offline Status',
        response: isAvailableOffline 
          ? `✓ **${recipe.title}** is downloaded and 100% available offline on this device!` 
          : `📥 **${recipe.title}** is currently in cloud mode. Tap the "Download for Offline" button to save it locally for cooking without internet.`
      };
    }
  }

  // 13. PANTRY MATCHING ("I have chicken, rice and onions")
  if (q.includes('i have') || q.includes('what can i make with') || q.includes('pantry')) {
    const words = q.replace(/i have|what can i make with|pantry|and|,/g, ' ').split(/\s+/).filter(w => w.length > 2);
    if (words.length > 0) {
      const matches: Array<{ recipe: Recipe; matchedIngredients: string[] }> = [];
      for (const r of ALL_RECIPES.slice(0, 50)) { // Starter + top
        const matched = r.ingredients.filter(ing => 
          words.some(w => ing.name.toLowerCase().includes(w))
        ).map(i => i.name);

        if (matched.length > 0) {
          matches.push({ recipe: r, matchedIngredients: matched });
        }
      }

      matches.sort((a, b) => b.matchedIngredients.length - a.matchedIngredients.length);
      const topMatches = matches.slice(0, 3);

      if (topMatches.length > 0) {
        const list = topMatches.map(m => 
          `• **${m.recipe.title}** (${m.recipe.country}) — matches ${m.matchedIngredients.join(', ')}`
        ).join('\n');

        return {
          handledLocally: true,
          category: 'pantry',
          title: 'Matching Dishes From Your Pantry',
          response: `Based on your ingredients, you can make:\n\n${list}\n\nTap on any dish to view the full recipe and step-by-step instructions.`,
          actionPayload: {
            type: 'show_recipes',
            data: { recipeIds: topMatches.map(m => m.recipe.recipeId) }
          }
        };
      }
    }
  }

  // Not handled by deterministic local intelligence; defer to Gemini!
  return null;
}

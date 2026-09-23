import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (e) {
    console.error('Failed to initialize GoogleGenAI client in Vercel function:', e);
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { 
      userQuestion, 
      recipeContext, 
      userTier = 'free', 
      currentUsage = { rollingCount: 0, todayCount: 0, totalCount: 0 }, 
      category = 'general' 
    } = body;

    if (!userQuestion || typeof userQuestion !== 'string' || !userQuestion.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const maxMonthly = (userTier === 'premium' || userTier === 'test_premium') ? 100 : 5;
    if (currentUsage.rollingCount >= maxMonthly) {
      return res.status(429).json({
        error: 'Monthly chef question quota reached',
        message: userTier === 'free'
          ? 'You have used all 5 complimentary questions this month. Upgrade to the Lifetime World Pass for 100 questions every month!'
          : 'You have reached your 100 chef questions for this month. Your quota will refresh next month.'
      });
    }

    if (!aiClient) {
      const runtimeKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      if (runtimeKey) {
        aiClient = new GoogleGenAI({ apiKey: runtimeKey });
      }
    }

    if (!aiClient) {
      return res.status(503).json({
        error: 'AI service unavailable',
        message: 'The AI Chef backend is currently initializing. Please try again in a moment.'
      });
    }

    let systemInstruction = `You are the executive culinary mentor and master chef of "Cook The World", an elite global cookbook.
Your role: Warm, authoritative, deeply knowledgeable, culturally respectful, and practical.
Tone: Encouraging, concise, direct, helpful for home cooks. Avoid rambling. Keep answers focused on actionable cooking advice in 2-4 short paragraphs or bullet points.`;

    if (recipeContext) {
      systemInstruction += `\n\nAUTHORITATIVE CURRENT RECIPE CONTEXT:
Recipe: ${recipeContext.title} (${recipeContext.country}, ${recipeContext.continent})
Servings: ${recipeContext.servings}
Ingredients: ${JSON.stringify(recipeContext.ingredients)}
Instructions: ${JSON.stringify(recipeContext.preparationSteps)}
Known Substitutions: ${JSON.stringify(recipeContext.substitutions || [])}
Chef Tips: ${JSON.stringify(recipeContext.cookingTips || [])}
Spice Level: ${recipeContext.spiceLevel} / 5

CRITICAL GROUNDING RULES:
1. Always remain strictly grounded in this specific recipe.
2. Do not invent contradictory ingredients, times, or steps that conflict with this recipe.
3. If fixing a mistake (e.g. too much salt, burnt pan, undercooked rice), provide immediate culinary troubleshooting remedies without judgment.
4. Adapt smoothly to dietary needs, lack of equipment, or ingredient shortages while preserving the cultural soul of the dish.`;
    }

    const prompt = `User cooking question: "${userQuestion}"`;
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.6,
        maxOutputTokens: 600
      }
    });

    const replyText = response.text || "I'm here to help with your cooking! Could you rephrase your question?";

    return res.status(200).json({
      success: true,
      handledByGemini: true,
      category,
      response: replyText,
      usage: {
        totalCount: currentUsage.totalCount + 1,
        rollingCount: currentUsage.rollingCount + 1,
        todayCount: currentUsage.todayCount + 1
      },
      remainingThisMonth: Math.max(0, maxMonthly - (currentUsage.rollingCount + 1))
    });
  } catch (error: any) {
    console.error('Gemini Ask Chef Error:', error);
    return res.status(500).json({
      error: 'Chef is temporarily indisposed',
      message: 'Unable to reach AI Chef at this moment. Please check your internet connection or use the local cooking tools.'
    });
  }
}

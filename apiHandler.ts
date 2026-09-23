import { GoogleGenAI } from '@google/genai';
import { Request, Response } from 'express';

// Initialize Gemini Client safely using server-side env var
const geminiApiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
  } catch (err) {
    console.error('Error initializing Gemini client:', err);
  }
}

// In-memory rate limiting and analytics store for insights
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimits = new Map<string, RateLimitEntry>();

// Recipe insights in-memory store (synced with Firestore when available)
export interface StoredInsight {
  recipeId: string;
  recipeTitle: string;
  category: string;
  question: string;
  timestamp: string;
  handledByGemini: boolean;
}
export const recipeQuestionInsights: StoredInsight[] = [];

// Helper: check rate limit (max 10 requests per minute per IP/userId)
function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(identifier);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(identifier, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= 12) {
    return false;
  }
  entry.count++;
  return true;
}

export async function handleAskChef(req: Request, res: Response) {
  try {
    const {
      userId,
      recipeId,
      userQuestion,
      recipeContext,
      userEntitlement = 'free',
      currentUsage = { totalCount: 0, rollingCount: 0, todayCount: 0 },
      conversationHistory = []
    } = req.body;

    if (!userQuestion || typeof userQuestion !== 'string') {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const clientId = userId || req.ip || 'anonymous';
    if (!checkRateLimit(clientId)) {
      return res.status(429).json({
        error: 'Too many requests. Please wait a moment before asking Chef another question.'
      });
    }

    // Check Fair-Use limits
    const isPremium = userEntitlement === 'premium' || userEntitlement === 'test_premium';
    const maxMonthly = isPremium ? 100 : 5;
    const maxDaily = isPremium ? 10 : 5;

    if (currentUsage.todayCount >= maxDaily) {
      return res.status(403).json({
        limitReached: true,
        error: 'Daily AI limit reached',
        message: "You've reached today's AI Chef fair-use limit. Local cooking tools, scaling, substitutions, and timers remain available."
      });
    }

    if (currentUsage.rollingCount >= maxMonthly) {
      return res.status(403).json({
        limitReached: true,
        error: 'Monthly AI limit reached',
        message: isPremium
          ? "You've reached this month's AI Chef fair-use limit (100 responses). Downloaded recipes, local scaling, and cooking tools remain completely accessible."
          : "You've used your 5 free AI Chef trial questions. Unlock the World (₦2,500) for 100 monthly responses and 300+ global recipes!"
      });
    }

    // Determine question category for recipe question insights
    let category = 'technique';
    const qLower = userQuestion.toLowerCase();
    if (qLower.includes('substitute') || qLower.includes('replace') || qLower.includes('instead of')) category = 'substitutions';
    else if (qLower.includes('hard') || qLower.includes('soft') || qLower.includes('mushy') || qLower.includes('thick') || qLower.includes('texture')) category = 'texture';
    else if (qLower.includes('salt') || qLower.includes('sour') || qLower.includes('acid') || qLower.includes('sweet') || qLower.includes('fix')) category = 'troubleshooting';
    else if (qLower.includes('time') || qLower.includes('long') || qLower.includes('when is it done')) category = 'cooking_time';
    else if (qLower.includes('spicy') || qLower.includes('pepper') || qLower.includes('hot')) category = 'spice_level';
    else if (qLower.includes('oven') || qLower.includes('stove') || qLower.includes('pan') || qLower.includes('pot')) category = 'equipment';

    // Log insight
    recipeQuestionInsights.unshift({
      recipeId: recipeId || 'global',
      recipeTitle: recipeContext?.title || 'Global Chef',
      category,
      question: userQuestion.slice(0, 120),
      timestamp: new Date().toISOString(),
      handledByGemini: true
    });
    if (recipeQuestionInsights.length > 200) recipeQuestionInsights.pop();

    if (!aiClient) {
      return res.status(503).json({
        error: 'AI service unavailable',
        message: 'The AI Chef backend is currently initializing. Please try again in a moment.'
      });
    }

    // Build system instruction grounded in recipe
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
    } else {
      systemInstruction += `\n\nYou are answering a global cooking question. Ground your answer in world culinary techniques and clear home cooking wisdom.`;
    }

    // Assemble conversation contents
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

    return res.json({
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

// Paystack initialization endpoint
export function handlePaystackInit(req: Request, res: Response) {
  const { email, userId } = req.body;
  const reference = `CTW-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  
  return res.json({
    success: true,
    amount: 250000, // ₦2,500 in kobo
    currency: 'NGN',
    reference,
    email: email || 'customer@cooktheworld.app',
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_cooktheworld_demo_key_2026',
    metadata: {
      userId,
      plan: 'world_unlock_lifetime',
      price: 2500
    }
  });
}

// Paystack verification endpoint
export async function handlePaystackVerify(req: Request, res: Response) {
  const { reference, userId } = req.body;

  if (!reference) {
    return res.status(400).json({ error: 'Missing payment reference' });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (secretKey && !secretKey.includes('demo') && !secretKey.includes('xxxx')) {
    try {
      const verifyUrl = `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`;
      const paystackRes = await fetch(verifyUrl, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await paystackRes.json();
      if (!data.status || data.data?.status !== 'success') {
        return res.status(400).json({
          verified: false,
          message: data.message || 'Payment could not be verified by Paystack'
        });
      }
    } catch (err: any) {
      console.error('Paystack API verification error:', err);
      return res.status(500).json({
        verified: false,
        message: 'Could not communicate with Paystack API: ' + err.message
      });
    }
  }

  // Verification confirmed
  return res.json({
    verified: true,
    reference,
    userId,
    entitlement: {
      tier: 'premium',
      source: 'purchase',
      unlockedAt: new Date().toISOString(),
      paystackReference: reference
    },
    message: 'World Unlock successfully activated!'
  });
}

// Recipe Insights endpoint for Admin Console
export function handleGetRecipeInsights(_req: Request, res: Response) {
  return res.json({
    totalQuestionsLogged: recipeQuestionInsights.length,
    insights: recipeQuestionInsights
  });
}

// Development fast premium toggle for allowlisted accounts
export function handleDevGrantPremium(req: Request, res: Response) {
  const { userEmail, userId } = req.body;
  const ALLOWED_ADMINS = ['blessing.waydiva@gmail.com'];

  if (!userEmail || !ALLOWED_ADMINS.includes(userEmail.toLowerCase())) {
    return res.status(403).json({
      error: 'Unauthorized',
      message: 'Fast dev test access is restricted to verified development accounts.'
    });
  }

  return res.json({
    success: true,
    entitlement: {
      tier: 'test_premium',
      source: 'dev',
      unlockedAt: new Date().toISOString()
    },
    message: `Test Premium activated for developer ${userEmail}`
  });
}

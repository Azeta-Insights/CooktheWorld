export default async function handler(req: any, res: any) {
  // CORS configuration for Vercel
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

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { email, userId } = body;
    const reference = `CTW-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Clean public key: trim spaces and surrounding quotes
    let rawKey = (process.env.PAYSTACK_PUBLIC_KEY || '').trim().replace(/^["']|["']$/g, '');

    // Check if a Secret Key was mistakenly provided in PAYSTACK_PUBLIC_KEY
    let keyError: string | null = null;
    if (rawKey.startsWith('sk_')) {
      keyError = "A Secret Key ('sk_...') was configured in PAYSTACK_PUBLIC_KEY. Please update Vercel Environment Variables with your Public Key ('pk_...').";
      rawKey = '';
    }

    // Validate standard Paystack public key format: pk_live_... or pk_test_...
    const isRealKey = /^(pk_live_|pk_test_)[a-zA-Z0-9]{20,}$/.test(rawKey);

    return res.status(200).json({
      success: true,
      amount: 250000, // ₦2,500 in kobo
      currency: 'NGN',
      reference,
      email: email || 'customer@cooktheworld.app',
      publicKey: isRealKey ? rawKey : '',
      isLiveKey: isRealKey,
      keyError,
      metadata: {
        userId,
        plan: 'world_unlock_lifetime',
        price: 2500
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'Initialization error'
    });
  }
}

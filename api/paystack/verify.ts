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
    const { reference, userId } = body;

    if (!reference) {
      return res.status(400).json({ error: 'Missing payment reference' });
    }

    const secretKey = (process.env.PAYSTACK_SECRET_KEY || '').trim().replace(/^["']|["']$/g, '');
    if (secretKey && !secretKey.includes('demo') && !secretKey.includes('xxxx') && secretKey.startsWith('sk_')) {
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

    return res.status(200).json({
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
  } catch (err: any) {
    return res.status(500).json({
      verified: false,
      message: err?.message || 'Verification error'
    });
  }
}

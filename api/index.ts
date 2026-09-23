export default function handler(_req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  return res.status(200).json({
    status: 'ok',
    service: 'Cook The World API',
    endpoints: [
      '/api/paystack/initialize',
      '/api/paystack/verify',
      '/api/ai/ask-chef',
      '/api/recipe-insights'
    ]
  });
}

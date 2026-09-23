import express from 'express';
import {
  handleAskChef,
  handlePaystackInit,
  handlePaystackVerify,
  handleGetRecipeInsights,
  handleDevGrantPremium
} from '../apiHandler';

const app = express();

app.use(express.json());

// Enable CORS
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Options preflight
app.options('*', (_req, res) => {
  res.status(200).end();
});

// Map routes with and without /api prefix
app.post(['/api/paystack/initialize', '/paystack/initialize'], handlePaystackInit);
app.post(['/api/paystack/verify', '/paystack/verify'], handlePaystackVerify);
app.post(['/api/ai/ask-chef', '/ai/ask-chef'], handleAskChef);
app.post(['/api/admin/dev-grant-premium', '/admin/dev-grant-premium'], handleDevGrantPremium);
app.get(['/api/recipe-insights', '/recipe-insights'], handleGetRecipeInsights);

// Health check endpoint
app.get(['/api/health', '/health', '/api', '/'], (_req, res) => {
  res.json({ status: 'ok', service: 'Cook The World API' });
});

export default app;

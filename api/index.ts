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

// API Endpoints
app.post('/api/ai/ask-chef', handleAskChef);
app.post('/api/paystack/initialize', handlePaystackInit);
app.post('/api/paystack/verify', handlePaystackVerify);
app.post('/api/admin/dev-grant-premium', handleDevGrantPremium);
app.get('/api/recipe-insights', handleGetRecipeInsights);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Cook The World API' });
});

export default app;

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import {
  handleAskChef,
  handlePaystackInit,
  handlePaystackVerify,
  handleGetRecipeInsights,
  handleDevGrantPremium
} from './apiHandler.ts';

// Custom Vite plugin to mount backend Express API routes on port 3000
function apiPlugin(): Plugin {
  return {
    name: 'api-server-middleware',
    configureServer(server) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        // Parse JSON body for POST requests
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: Buffer) => {
            body += chunk.toString();
          });
          req.on('end', async () => {
            try {
              req.body = body ? JSON.parse(body) : {};
            } catch {
              req.body = {};
            }

            // Express-compatible response methods
            res.status = (code: number) => {
              res.statusCode = code;
              return res;
            };
            res.json = (data: any) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return res;
            };

            const url = req.url.split('?')[0];

            if (url === '/api/ai/ask-chef') {
              return handleAskChef(req, res);
            }
            if (url === '/api/paystack/initialize') {
              return handlePaystackInit(req, res);
            }
            if (url === '/api/paystack/verify') {
              return handlePaystackVerify(req, res);
            }
            if (url === '/api/admin/dev-grant-premium') {
              return handleDevGrantPremium(req, res);
            }

            res.status(404).json({ error: 'API route not found' });
          });
          return;
        }

        // GET requests
        res.status = (code: number) => {
          res.statusCode = code;
          return res;
        };
        res.json = (data: any) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return res;
        };

        const url = req.url.split('?')[0];
        if (url === '/api/recipe-insights') {
          return handleGetRecipeInsights(req, res);
        }

        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

/**
 * Local development server that wraps Vercel API handlers
 * Run with: npx ts-node server/dev-server.ts
 */

import express, { Request, Response } from 'express';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Type for Vercel-style handlers
type VercelHandler = (req: VercelRequest, res: VercelResponse) => Promise<unknown>;

// Minimal VercelRequest/VercelResponse compatible types
interface VercelRequest {
  method: string;
  body: unknown;
  query: Record<string, string | string[]>;
  headers: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
  send: (data: unknown) => void;
  setHeader: (name: string, value: string) => VercelResponse;
}

// Adapter to convert Express req/res to Vercel-compatible req/res
function adaptHandler(handler: VercelHandler) {
  return async (req: Request, res: Response) => {
    const vercelReq: VercelRequest = {
      method: req.method,
      body: req.body,
      query: req.query as Record<string, string | string[]>,
      headers: req.headers as Record<string, string | string[] | undefined>,
    };

    const vercelRes: VercelResponse = {
      status: (code: number) => {
        res.status(code);
        return vercelRes;
      },
      json: (data: unknown) => {
        res.json(data);
      },
      send: (data: unknown) => {
        res.send(data);
      },
      setHeader: (name: string, value: string) => {
        res.setHeader(name, value);
        return vercelRes;
      },
    };

    try {
      await handler(vercelReq, vercelRes);
    } catch (error) {
      console.error('Handler error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}

async function startServer() {
  const app = express();
  const PORT = 3001;

  // Parse JSON bodies (with increased limit for base64 images)
  app.use(express.json({ limit: '50mb' }));

  // Import API handlers dynamically
  const apiDir = path.resolve(__dirname, '../api');

  try {
    const analyzeModule = await import(path.join(apiDir, 'analyze.ts'));
    const trendsModule = await import(path.join(apiDir, 'trends.ts'));
    const briefsModule = await import(path.join(apiDir, 'briefs.ts'));
    const generateModule = await import(path.join(apiDir, 'generate.ts'));

    // Register routes
    app.post('/api/analyze', adaptHandler(analyzeModule.default));
    app.post('/api/trends', adaptHandler(trendsModule.default));
    app.post('/api/briefs', adaptHandler(briefsModule.default));
    app.post('/api/generate', adaptHandler(generateModule.default));

    // Health check endpoint
    app.get('/api/health', (_req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    app.listen(PORT, () => {
      console.log(`\n🚀 Local API server running at http://localhost:${PORT}`);
      console.log('\nAvailable endpoints:');
      console.log('  POST /api/analyze  - Analyze app description/screenshots');
      console.log('  POST /api/trends   - Get market trend synthesis');
      console.log('  POST /api/briefs   - Generate creative direction briefs');
      console.log('  POST /api/generate - Generate icon images');
      console.log('  GET  /api/health   - Health check');
      console.log('\nMake sure GEMINI_API_KEY is set in .env.local\n');
    });
  } catch (error) {
    console.error('Failed to load API handlers:', error);
    process.exit(1);
  }
}

startServer();

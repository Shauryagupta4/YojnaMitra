import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Populate process.env for local server handlers
  for (const [key, val] of Object.entries(env)) {
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }

  return {
    plugins: [
      react(),
      {
        name: 'local-vercel-api-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const urlObj = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

            if (urlObj.pathname.startsWith('/api/')) {
              try {
                if (req.method === 'POST') {
                  let bodyStr = '';
                  for await (const chunk of req) {
                    bodyStr += chunk;
                  }
                  try {
                    req.body = JSON.parse(bodyStr);
                  } catch {
                    req.body = {};
                  }
                }
                req.query = Object.fromEntries(urlObj.searchParams);

                let endpointPath = '.' + urlObj.pathname + '.ts';
                try {
                  const fs = await import('node:fs');
                  if (!fs.existsSync(endpointPath)) {
                    endpointPath = '.' + urlObj.pathname + '.js';
                  }
                } catch {}

                const mod = await server.ssrLoadModule(endpointPath);
                const handler = mod.default || mod.handler;

                res.status = (code) => {
                  res.statusCode = code;
                  return res;
                };
                res.json = (data) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                };

                await handler(req, res);
                return;
              } catch (err) {
                console.error('[API Middleware Error]:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: err.message || 'Internal Server Error' }));
                return;
              }
            }
            next();
          });
        }
      }
    ],
    server: {
      fs: {
        strict: true,
        deny: ['.env', '.env.*', '.git', 'package.json', 'package-lock.json']
      }
    },
    build: {
      sourcemap: false
    }
  };
});

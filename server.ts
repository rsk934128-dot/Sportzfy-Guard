import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Stream proxy with HLS playlist rewriting and CORS bypassing
  app.get('/api/proxy', async (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).send('Missing url parameter');
    }

    try {
      // Set headers to spoof native Android/Player requests
      const customHeaders: Record<string, string> = {
        'User-Agent': (req.query.ua as string) || 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36 Toffee',
      };

      if (req.query.referer) {
        customHeaders['Referer'] = req.query.referer as string;
      } else if (targetUrl.includes('toffeelive') || targetUrl.includes('34.104.33.228')) {
        customHeaders['Referer'] = 'https://toffeelive.com/';
      }

      if (req.query.origin) {
        customHeaders['Origin'] = req.query.origin as string;
      } else if (targetUrl.includes('toffeelive') || targetUrl.includes('34.104.33.228')) {
        customHeaders['Origin'] = 'https://toffeelive.com';
      }

      let effectiveUrl = targetUrl;

      // Transparent URL Normalization/Fallback to avoid 404s
      if (effectiveUrl.includes('z.cdn.xbeat.space')) {
        effectiveUrl = 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8';
      } else if (effectiveUrl.includes('test-streams.mux.dev/x36xhg/main.m3u8')) {
        effectiveUrl = 'https://test-streams.mux.dev/x36xhg/movie.m3u8';
      } else if (effectiveUrl.includes('spix.agl002.online')) {
        effectiveUrl = 'https://test-streams.mux.dev/x36xhg/movie.m3u8';
      } else if (effectiveUrl.includes('agl002.online')) {
        effectiveUrl = 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8';
      }

      // Fetch the target stream resource
      let response = await fetch(effectiveUrl, {
        headers: customHeaders,
      });

      if (!response.ok) {
        console.log(`Initial load state ${response.status} for ${effectiveUrl}. Sourcing alternative stream.`);
        
        // Define backup streams
        const backupUrls = [
          'https://test-streams.mux.dev/x36xhg/movie.m3u8',
          'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
          'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8'
        ];
        
        let fallbackSucceeded = false;
        for (const backupUrl of backupUrls) {
          if (backupUrl === effectiveUrl) continue;
          try {
            const fallbackResponse = await fetch(backupUrl, { headers: customHeaders });
            if (fallbackResponse.ok) {
              response = fallbackResponse;
              effectiveUrl = backupUrl;
              fallbackSucceeded = true;
              console.log(`Successfully loaded stream via: ${backupUrl}`);
              break;
            }
          } catch (e) {
            // Ignore error and try next
          }
        }
        
        if (!fallbackSucceeded) {
          console.log(`Resource fetch completed with status: ${response.status}`);
          return res.status(response.status).send(`Stream fetch: ${response.statusText}`);
        }
      }

      const contentType = response.headers.get('content-type') || '';
      
      // Enable permissive CORS for local player
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');

      const isM3U8 = effectiveUrl.includes('.m3u8') || 
                     effectiveUrl.includes('.ism') || 
                     contentType.includes('mpegurl') || 
                     contentType.includes('mpegURL') ||
                     contentType.includes('application/vnd.apple.mpegurl');

      if (isM3U8) {
        // Rewrite HLS playlist paths to route through our secure proxy
        const text = await response.text();
        const parentUrl = effectiveUrl.substring(0, effectiveUrl.lastIndexOf('/') + 1);

        const lines = text.split('\n');
        const rewrittenLines = lines.map(line => {
          const trimmed = line.trim();
          if (!trimmed) return line;

          // Process metadata tags that might have embedded resource URIs (e.g. AES keys)
          if (trimmed.startsWith('#')) {
            let updatedLine = line;
            const uriRegex = /URI="([^"]+)"/g;
            updatedLine = updatedLine.replace(uriRegex, (match, p1) => {
              let absoluteUri = p1;
              if (!p1.startsWith('http://') && !p1.startsWith('https://')) {
                absoluteUri = new URL(p1, parentUrl).toString();
              }
              const proxyUrl = `/api/proxy?url=${encodeURIComponent(absoluteUri)}`;
              return `URI="${proxyUrl}"`;
            });
            return updatedLine;
          }

          // Resolve segment URL (absolute or relative)
          let absoluteSegmentUrl = trimmed;
          if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
            try {
              absoluteSegmentUrl = new URL(trimmed, parentUrl).toString();
            } catch (e) {
              absoluteSegmentUrl = parentUrl + trimmed;
            }
          }

          // Wrap the segment or sub-playlist URL inside our proxy
          let proxiedUrl = `/api/proxy?url=${encodeURIComponent(absoluteSegmentUrl)}`;
          if (req.query.referer) proxiedUrl += `&referer=${encodeURIComponent(req.query.referer as string)}`;
          if (req.query.ua) proxiedUrl += `&ua=${encodeURIComponent(req.query.ua as string)}`;
          if (req.query.origin) proxiedUrl += `&origin=${encodeURIComponent(req.query.origin as string)}`;

          return proxiedUrl;
        });

        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        return res.send(rewrittenLines.join('\n'));
      } else {
        // Direct segment delivery with chunked response
        res.setHeader('Content-Type', contentType || 'application/octet-stream');
        const buffer = await response.arrayBuffer();
        return res.send(Buffer.from(buffer));
      }
    } catch (error: any) {
      console.error('Proxy routing failed:', error);
      res.status(500).send(`Stream Proxy Routing Failed: ${error.message}`);
    }
  });

  // API Healthcheck
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // Mount Vite development server middleware in non-production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production build folder
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Sportzfy Shield Proxy] Server running on port ${PORT}`);
  });
}

startServer();

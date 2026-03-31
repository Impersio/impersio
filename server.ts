import express from "express";
import { createServer as createViteServer } from "vite";
import path from "node:path";
import fetch from "node-fetch";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Proxy endpoint for suggestions
  app.get("/api/suggestions", async (req, res) => {
    const query = req.query.q as string;
    if (!query) {
      return res.json([]);
    }
    try {
      const response = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=${encodeURIComponent(query)}`, { timeout: 5000 } as any);
      const data = await response.json();
      // Wikipedia format: [query, [suggestion1, suggestion2, ...], ...]
      const suggestions = data[1] || [];
      res.json(suggestions.map((s: string) => ({ phrase: s })));
    } catch (e) {
      console.error("Proxy error:", e);
      res.status(500).json({ error: "Failed to fetch suggestions" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

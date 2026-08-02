import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Gemini AI endpoint for custom Sigma rule creation or security architecture guidance
  app.post("/api/ai/generate-sigma", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(400).json({
          error: "GEMINI_API_KEY environment variable is missing or default placeholder.",
        });
      }

      const { prompt, logType } = req.body;
      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `You are a Principal Cloud Security Architect & Threat Detection Specialist.
Generate a valid YAML Sigma rule based on the user's threat detection request for log type: ${logType || "General Security Log"}.
Include:
- title
- id (uuid format)
- status (experimental / test / production)
- description
- references
- author
- date
- logsource (category, product, service)
- detection (selection, condition)
- falsepositives
- level (low, medium, high, critical)
Return only a valid YAML block wrapped in markdown fences \`\`\`yaml ... \`\`\` and a brief 2-sentence tactical explanation.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt || "Detect SSH brute force attacks with more than 5 failed logins within 1 minute",
        config: {
          systemInstruction,
        },
      });

      res.json({ result: response.text });
    } catch (err: any) {
      console.error("Gemini API error:", err);
      res.status(500).json({ error: err.message || "Failed to generate Sigma rule with AI." });
    }
  });

  // AI Security Architecture Reviewer endpoint
  app.post("/api/ai/analyze-architecture", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(400).json({
          error: "GEMINI_API_KEY environment variable is missing or default placeholder.",
        });
      }

      const { question, terraformContext } = req.body;
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `User Question: ${question}\n\nTerraform Context:\n${terraformContext || "Hybrid Cybersecurity Data Pipeline with MSK, Vector, EKS, Matano S3 Iceberg"}`,
        config: {
          systemInstruction: "You are a DevSecOps Lead & AWS Cloud Security Architect. Give concise, actionable, expert answers with specific Terraform or AWS configuration advice where relevant.",
        },
      });

      res.json({ result: response.text });
    } catch (err: any) {
      console.error("Gemini API error:", err);
      res.status(500).json({ error: err.message || "Failed to analyze architecture." });
    }
  });

  // Vite middleware for development vs production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

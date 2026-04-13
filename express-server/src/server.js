import express from "express";

const app = express();
const port = process.env.PORT || 5000;
const fastApiBaseUrl = process.env.FASTAPI_BASE_URL || "http://127.0.0.1:8000";

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "express-server" });
});

app.post("/api/predict", async (req, res) => {
  try {
    const response = await fetch(`${fastApiBaseUrl}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        detail: data.detail || "Prediction request failed",
      });
    }

    return res.json(data);
  } catch (_error) {
    return res.status(502).json({
      detail: "Could not reach FastAPI server",
    });
  }
});

app.listen(port, () => {
  console.log(`Express server listening on http://127.0.0.1:${port}`);
});

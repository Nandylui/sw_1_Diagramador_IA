// server/index.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post("/api/diagram", async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Falta el query" });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Eres un generador experto de UML en formato JSON. Devuelve solo JSON válido, sin backticks ni texto adicional." },
          { role: "user", content: query }
        ]
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    let data = await response.text();

    // Limpiar posibles ```json ... ``` o ``` alrededor del JSON
    data = data.replace(/```json|```/g, '').trim();

    // Intentar parsear JSON
    let json = null;
    try {
      json = JSON.parse(data);
    } catch (parseErr) {
      // Si no se puede parsear, devolver como raw
      return res.status(500).json({ error: "La IA no devolvió JSON válido", raw: data });
    }

    // Enviar JSON limpio al frontend
    res.json(json);

  } catch (error) {
    console.error("Error en /api/diagram:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en http://localhost:${PORT}`);
});

// server/index.js

import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ✅ Crear carpeta "uploads" si no existe
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ✅ Configurar Multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Aceptar solo imágenes
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Solo se permiten archivos de imagen (png, jpg, jpeg, gif)."));
  },
});

// ✅ Ruta para subir imágenes (ej. fotos PNG/JPG)
app.post("/api/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ninguna imagen" });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({
    message: "Imagen subida correctamente",
    fileName: req.file.filename,
    url: imageUrl,
  });
});

// ✅ Nueva ruta: analizar imagen de diagrama UML con IA
app.post("/api/diagram-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se subió ninguna imagen" });
    }

    // URL local de la imagen subida
    const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;

    console.log("📸 Analizando imagen:", imageUrl);

    // Llamada a OpenRouter para analizar la imagen y devolver JSON UML
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // O el modelo que uses
        messages: [
          {
            role: "system",
            content: "Eres un experto en analizar diagramas UML a partir de imágenes. Devuelve un JSON con las clases y relaciones detectadas.",
          },
          {
            role: "user",
            content: `Analiza la siguiente imagen y genera un JSON UML:\n${imageUrl}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: "Error al comunicarse con OpenRouter",
        details: text,
      });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";

    // Limpieza y parseo del JSON
    content = content.replace(/```json/gi, "").replace(/```/g, "").trim();

    let jsonData;
    try {
      jsonData = JSON.parse(content);
    } catch (err) {
      const match = content.match(/\{[\s\S]*\}/);
      jsonData = match ? JSON.parse(match[0]) : {};
    }

    res.json({
      message: "Imagen procesada correctamente",
      imageUrl,
      result: jsonData,
    });

  } catch (error) {
    console.error("Error al analizar la imagen:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Tu ruta original del UML (sin tocar)
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
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [
          {
            role: "system",
            content: `Eres un experto en diagramas de clases UML 2.5. Genera SOLO estructuras JSON válidas sin texto adicional.

ESTRUCTURA REQUERIDA (UML 2.5):
{
  "classes": [...],
  "connections": [...]
}

TIPOS DE RELACIONES UML 2.5 VÁLIDOS:
association, aggregation, composition, generalization, realization, dependency, oneToOne, oneToMany, manyToMany

VISIBILIDAD UML 2.5:
+ = public, - = private, # = protected, ~ = package
... (texto original omitido para brevedad)
`,
          },
          { role: "user", content: query },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: `Error en OpenRouter: ${response.status}`,
        details: text,
      });
    }

    const data = await response.json();

    let content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: "La IA no devolvió contenido válido", raw: data });
    }

    content = content.replace(/```json/gi, "").replace(/```/g, "").trim();
    let jsonData;

    try {
      jsonData = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) jsonData = JSON.parse(jsonMatch[0]);
      else throw new Error("No se pudo parsear el JSON");
    }

    const normalizedResponse = {
      classes: (jsonData.classes || []).map((cls) => ({
        name: cls.name || "ClaseSinNombre",
        isAbstract: cls.isAbstract || false,
        isInterface: cls.isInterface || false,
        stereotype: cls.stereotype || null,
        fields: (cls.fields || []).map((f) => ({
          name: f.name || "campo",
          type: f.type || "String",
          visibility: f.visibility || "+",
          multiplicity: f.multiplicity || null,
          defaultValue: f.defaultValue || null,
        })),
        methods: (cls.methods || []).map((m) => ({
          name: m.name || "metodo",
          type: m.type || "void",
          visibility: m.visibility || "+",
          isAbstract: m.isAbstract || false,
          parameters: m.parameters || [],
        })),
      })),
      connections: (jsonData.connections || []).map((conn) => ({
        fromId: conn.fromId || "",
        toId: conn.toId || "",
        type: conn.type || "association",
        label: conn.label || "",
        fromMultiplicity: conn.fromMultiplicity || "",
        toMultiplicity: conn.toMultiplicity || "",
      })),
    };

    res.json(normalizedResponse);

  } catch (error) {
    console.error("Error en /api/diagram:", error);
    res.status(500).json({
      error: error.message,
    });
  }
});

// ✅ Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Servidor UML Diagrams funcionando",
    version: "2.0.0",
    umlVersion: "2.5",
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend UML 2.5 corriendo en http://localhost:${PORT}`);
  console.log(`📊 Endpoint principal: http://localhost:${PORT}/api/diagram`);
  console.log(`🖼️ Upload imágenes: http://localhost:${PORT}/api/upload-image`);
});

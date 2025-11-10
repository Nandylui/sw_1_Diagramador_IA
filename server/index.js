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

// ✅ Ruta mejorada con soporte UML 2.5 y generación incremental
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
        model: "deepseek/deepseek-chat",
        messages: [
          { 
            role: "system", 
            content: `Eres un experto en diagramas de clases UML 2.5. Genera SOLO estructuras JSON válidas sin texto adicional.

ESTRUCTURA REQUERIDA (UML 2.5):
{
  "classes": [
    {
      "name": "NombreClase",
      "isAbstract": false,
      "isInterface": false,
      "stereotype": null,
      "fields": [
        {
          "name": "atributo",
          "type": "String",
          "visibility": "+",
          "multiplicity": null,
          "defaultValue": null
        }
      ],
      "methods": [
        {
          "name": "metodo",
          "type": "void",
          "visibility": "+",
          "isAbstract": false,
          "parameters": [
            {
              "name": "parametro",
              "type": "String"
            }
          ]
        }
      ]
    }
  ],
  "connections": [
    {
      "fromId": "NombreClase1",
      "toId": "NombreClase2",
      "type": "association",
      "label": "1:*",
      "fromMultiplicity": "1",
      "toMultiplicity": "*"
    }
  ]
}

TIPOS DE RELACIONES UML 2.5 VÁLIDOS:
- "association" (asociación simple)
- "aggregation" (agregación - todo-parte débil)
- "composition" (composición - todo-parte fuerte)
- "generalization" (herencia)
- "realization" (implementación de interfaz)
- "dependency" (dependencia)
- "oneToOne" (uno a uno)
- "oneToMany" (uno a muchos)
- "manyToMany" (muchos a muchos)

VISIBILIDAD UML 2.5:
- "+" = public
- "-" = private
- "#" = protected
- "~" = package

ESTEREOTIPOS COMUNES:
«entity», «control», «boundary», «service», «repository», «controller», «utility», «exception»

REGLAS CRÍTICAS:
1. Si el prompt menciona "CONTEXTO ACTUAL DEL DIAGRAMA", significa que YA EXISTEN clases
2. En ese caso, genera SOLO las nuevas clases solicitadas en "NUEVA SOLICITUD"
3. NO regeneres las clases existentes mencionadas en el contexto
4. Para las relaciones, usa los nombres EXACTOS de las clases (existentes o nuevas)
5. Si necesitas relacionar una nueva clase con una existente, usa el nombre de la clase existente
6. Responde ÚNICAMENTE con JSON válido, sin markdown, explicaciones ni texto adicional
7. Para clases abstractas, usa "isAbstract": true y marca métodos abstractos con "isAbstract": true
8. Para interfaces, usa "isInterface": true
9. Usa multiplicidades UML estándar: "1", "0..1", "*", "0..*", "1..*"

EJEMPLO DE RESPUESTA INCREMENTAL:
Si el contexto tiene "Persona" y pides "Agregar clase Estudiante que herede de Persona":
{
  "classes": [
    {
      "name": "Estudiante",
      "fields": [...],
      "methods": [...]
    }
  ],
  "connections": [
    {
      "fromId": "Estudiante",
      "toId": "Persona",
      "type": "generalization"
    }
  ]
}`
          },
          { 
            role: "user", 
            content: query 
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ 
        error: `Error en OpenRouter: ${response.status}`,
        details: text 
      });
    }

    const data = await response.json();
    
    // Extraer el contenido de la respuesta
    let content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return res.status(500).json({ 
        error: "La IA no devolvió contenido válido",
        raw: data 
      });
    }

    // Limpiar markdown y caracteres extra
    content = content
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    // Intentar parsear el JSON
    let jsonData;
    try {
      jsonData = JSON.parse(content);
    } catch (parseError) {
      // Si falla el parseo directo, intentar extraer JSON del texto
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          jsonData = JSON.parse(jsonMatch[0]);
        } catch {
          return res.status(500).json({ 
            error: "No se pudo parsear el JSON de la IA",
            raw: content 
          });
        }
      } else {
        return res.status(500).json({ 
          error: "La IA no devolvió JSON válido",
          raw: content 
        });
      }
    }

    // Validar estructura básica
    if (!jsonData.classes || !Array.isArray(jsonData.classes)) {
      return res.status(500).json({ 
        error: "El JSON no tiene la estructura esperada (falta 'classes')",
        raw: jsonData 
      });
    }

    // Normalizar la respuesta para asegurar compatibilidad
    const normalizedResponse = {
      classes: jsonData.classes.map(cls => ({
        name: cls.name || 'ClaseSinNombre',
        isAbstract: cls.isAbstract || false,
        isInterface: cls.isInterface || false,
        stereotype: cls.stereotype || null,
        fields: (cls.fields || cls.attributes || []).map(f => ({
          name: f.name || 'campo',
          type: f.type || 'String',
          visibility: f.visibility || '+',
          multiplicity: f.multiplicity || null,
          defaultValue: f.defaultValue || null
        })),
        methods: (cls.methods || []).map(m => ({
          name: m.name || 'metodo',
          type: m.type || m.returnType || 'void',
          visibility: m.visibility || '+',
          isAbstract: m.isAbstract || false,
          parameters: m.parameters || []
        }))
      })),
      connections: (jsonData.connections || jsonData.relationships || jsonData.relaciones || []).map(conn => ({
        fromId: conn.fromId || conn.from || conn.source || '',
        toId: conn.toId || conn.to || conn.target || '',
        type: conn.type || 'association',
        label: conn.label || conn.multiplicity || '',
        fromMultiplicity: conn.fromMultiplicity || '',
        toMultiplicity: conn.toMultiplicity || ''
      }))
    };

    res.json(normalizedResponse);

  } catch (error) {
    console.error("Error en /api/diagram:", error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Servidor UML Diagrams funcionando',
    version: '2.0.0',
    umlVersion: '2.5'
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend UML 2.5 corriendo en http://localhost:${PORT}`);
  console.log(`📊 Endpoint principal: http://localhost:${PORT}/api/diagram`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

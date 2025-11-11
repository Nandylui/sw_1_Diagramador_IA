// server/index.js

import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import fsp from "fs/promises";
import fse from "fs-extra";
import os from "os";
import ejs from "ejs";
import archiver from "archiver";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" })); // aumentar tamaño si es necesario

// ✅ Crear carpeta "uploads" si no existe
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
// Servir archivos estáticos subidos
app.use("/uploads", express.static(uploadDir));

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

// ------------------ RUTAS EXISTENTES ------------------

// Ruta para subir imágenes (ej. fotos PNG/JPG)
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

// Nueva ruta: analizar imagen de diagrama UML con IA
app.post("/api/diagram-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se subió ninguna imagen" });
    }

    // URL local de la imagen subida (servida por express)
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
        model: "gpt-4o-mini",
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

// Tu ruta original del UML (sin tocar)
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

// ------------------ NUEVA RUTA: export (genera zip de Spring Boot) ------------------

/**
 * Helper: mapea tipos SQL -> tipos Java (simple)
 */
const sqlToJava = (sqlType) => {
  const t = (sqlType || "").toUpperCase();
  if (t.startsWith("VARCHAR") || t.includes("CHAR") || t === "TEXT") return "String";
  if (t === "INT" || t === "INTEGER" || t === "SMALLINT") return "Integer";
  if (t === "BIGINT") return "Long";
  if (t === "BOOLEAN" || t === "BIT") return "Boolean";
  if (t === "DATE") return "LocalDate";
  if (t === "TIMESTAMP" || t === "DATETIME") return "LocalDateTime";
  if (t === "DECIMAL" || t.startsWith("NUMERIC")) return "BigDecimal";
  return "String";
};
const toFieldName = (name) => name.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// render template from server/templates
// async function renderTemplate(templateName, data) {
//   const tplPath = path.join(process.cwd(), "server", "templates", templateName);
//   const tpl = await fsp.readFile(tplPath, "utf8");
//   return ejs.render(tpl, data);
// }

async function renderTemplate(templateName, data) {
  // Primero intenta: templates junto al archivo index.js (server/templates)
  const tryPaths = [
    path.join(__dirname, "templates", templateName),      // ideal: server/templates
    path.join(process.cwd(), "templates", templateName),  // si ejecutas desde repo root: ./templates
    path.join(process.cwd(), "server", "templates", templateName) // fallback antiguo
  ];

  for (const p of tryPaths) {
    try {
      const tpl = await fsp.readFile(p, "utf8");
      return ejs.render(tpl, data);
    } catch (err) {
      // no existe en esa ruta → probar siguiente
    }
  }

  // Si llegamos aquí, ninguna ruta funcionó -> lanzar error claro
  throw new Error(`Template not found: tried paths:\n${tryPaths.join("\n")}`);
}


app.post("/api/export", async (req, res) => {
  try {
    const diagram = req.body; // espera { name, tables: [...] } o { name, classes, connections } si adaptas
    // Soporte para recibir classes/connections (desde frontend)
    let tables = diagram.tables;
    if ((!tables || !Array.isArray(tables)) && Array.isArray(diagram.classes)) {
      // convertir classes -> tables (campo fields -> columns)
      tables = diagram.classes.map((cls) => ({
        name: cls.name,
        columns: (cls.fields || []).map((f) => ({
          name: f.name,
          type: f.type || "VARCHAR(255)",
          pk: (f.name || "").toLowerCase() === "id",
          nullable: f.nullable !== undefined ? f.nullable : !((f.name || "").toLowerCase() === "id")
        }))
      }));
    }

    const projectName = (diagram.name || "demo").replace(/\s+/g, "").toLowerCase();

    // carpeta temporal
    const tmpRoot = await fsp.mkdtemp(path.join(os.tmpdir(), `sb-${projectName}-`));
    const baseJavaPath = path.join(tmpRoot, "src", "main", "java", "com", "example", projectName);
    const resourcesPath = path.join(tmpRoot, "src", "main", "resources");

    await fse.ensureDir(baseJavaPath);
    await fse.ensureDir(resourcesPath);

    // pom.xml
    const pom = await renderTemplate("pom.xml.ejs", { projectName });
    await fsp.writeFile(path.join(tmpRoot, "pom.xml"), pom, "utf8");

    // DemoApplication
    const demoApp = await renderTemplate("DemoApplication.java.ejs", { projectName });
    await fsp.writeFile(path.join(baseJavaPath, "DemoApplication.java"), demoApp, "utf8");

    // por cada tabla generar archivos
    for (const table of tables || []) {
      const tableName = table.name;
      const EntityName = capitalize(toFieldName(tableName));
      const entityDir = path.join(baseJavaPath, "domain");
      const dtoDir = path.join(baseJavaPath, "dto");
      const repoDir = path.join(baseJavaPath, "repository");
      const controllerDir = path.join(baseJavaPath, "controller");
      const serviceDir = path.join(baseJavaPath, "service");

      await fse.ensureDir(entityDir);
      await fse.ensureDir(dtoDir);
      await fse.ensureDir(repoDir);
      await fse.ensureDir(controllerDir);
      await fse.ensureDir(serviceDir);

      const cols = (table.columns || []).map(c => {
        const javaType = sqlToJava(c.type);
        return {
          name: c.name,
          fieldName: toFieldName(c.name),
          FieldNameCapital: capitalize(toFieldName(c.name)),
          javaType,
          nullable: c.nullable !== false,
          pk: !!c.pk
        };
      });

      const entityCode = await renderTemplate("entity.ejs", {
        projectName, tableName, EntityName, columns: cols,
        hasLocalDate: cols.some(c => c.javaType === "LocalDate"),
        hasLocalDateTime: cols.some(c => c.javaType === "LocalDateTime")
      });
      await fsp.writeFile(path.join(entityDir, `${EntityName}.java`), entityCode, "utf8");

      const dtoCode = await renderTemplate("dto.ejs", { projectName, EntityName, columns: cols });
      await fsp.writeFile(path.join(dtoDir, `${EntityName}Dto.java`), dtoCode, "utf8");

      const repoCode = await renderTemplate("repository.ejs", { projectName, EntityName });
      await fsp.writeFile(path.join(repoDir, `${EntityName}Repository.java`), repoCode, "utf8");

      const serviceCode = await renderTemplate("service.ejs", { projectName, EntityName });
      await fsp.writeFile(path.join(serviceDir, `${EntityName}Service.java`), serviceCode, "utf8");

      try {
        const serviceImplCode = await renderTemplate("serviceImpl.ejs", { projectName, EntityName, columns: cols });
        await fsp.writeFile(path.join(serviceDir, `${EntityName}ServiceImpl.java`), serviceImplCode, "utf8");
      } catch (err) {
      console.warn("No se generó ServiceImpl para", EntityName, ":", err.message);
}

      const controllerCode = await renderTemplate("controller.ejs", {
        projectName, EntityName, entityPath: toFieldName(tableName)
      });
      await fsp.writeFile(path.join(controllerDir, `${EntityName}Controller.java`), controllerCode, "utf8");
    }

    // application.properties
    const appProps = `spring.datasource.url=jdbc:h2:mem:testdb\nspring.datasource.driverClassName=org.h2.Driver\nspring.jpa.hibernate.ddl-auto=update\n`;
    await fsp.writeFile(path.join(resourcesPath, "application.properties"), appProps, "utf8");

    // enviar zip al cliente
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename=${projectName}.zip`);

    const archive = archiver("zip", { zlib: { level: 9 }});
    archive.on("error", err => { throw err; });
    archive.pipe(res);
    archive.directory(tmpRoot, false);
    await archive.finalize();

    // limpieza best-effort
    setTimeout(() => fse.remove(tmpRoot).catch(()=>{}), 30_000);

  } catch (err) {
    console.error("Export error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ------------------ FIN: export ------------------

// Health check
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

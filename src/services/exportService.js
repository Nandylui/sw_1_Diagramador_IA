// src/services/exportService.js
const DEFAULT_SERVER = "http://localhost:5000"; // ajusta si tu backend corre en otro host/puerto

class ExportService {
  // Mapear tipos Java/JS a tipos SQL (simple)
  mapTypeToSQL(type) {
    if (!type) return "VARCHAR(255)";
    const t = String(type).toLowerCase();
    if (t.includes("string") || t === "varchar") return "VARCHAR(255)";
    if (t === "int" || t === "integer" || t === "number" || t === "long") return "INT";
    if (t === "bigint" || t === "long") return "BIGINT";
    if (t === "double" || t === "float" || t === "decimal") return "DECIMAL(10,2)";
    if (t.includes("date") || t === "localdate") return "DATE";
    if (t.includes("time") || t === "timestamp" || t === "localdatetime") return "TIMESTAMP";
    if (t === "boolean" || t === "bool") return "BOOLEAN";
    return "VARCHAR(255)";
  }

  // Construir el payload que espera el backend (/api/export)
  buildExportPayload({ name, classes = [], connections = [] }) {
    // Convertir cada clase en una "table" con columns
    const tables = classes.map((cls) => {
      const columns = (cls.fields || []).map((f) => {
        // si el front ya guarda tipos Java, mapeamos; si no, asumimos String
        const sqlType = this.mapTypeToSQL(f.type || "String");
        return {
          name: f.name,
          type: sqlType,
          pk: f.name.toLowerCase() === "id", // heurística: campo "id" -> pk
          nullable: f.nullable !== undefined ? f.nullable : !(f.name.toLowerCase() === "id")
        };
      });
      return {
        id: cls.id,
        name: cls.name,
        columns
      };
    });

    // Podríamos mapear relaciones a FK si lo necesitamos; por ahora el backend genera Entities desde tablas
    return {
      name: name || "project",
      tables,
      relations: [] // por ahora vacío; podemos enriquecer luego
    };
  }

  // Llamada al backend para generar y descargar ZIP
  async exportToZip(diagramData) {
    const payload = this.buildExportPayload(diagramData);
    const url = `${DEFAULT_SERVER}/api/export`;

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Export failed: ${resp.status} ${text}`);
      }

      const blob = await resp.blob();
      const filename = `${(payload.name || "project").replace(/\s+/g, "")}.zip`;
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(link.href);
      return { ok: true, filename };
    } catch (err) {
      console.error("ExportService.exportToZip error:", err);
      return { ok: false, error: err.message || String(err) };
    }
  }
}

export default new ExportService();

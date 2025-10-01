// src/services/aiService.js

export default class AIService {
  async generateDiagram(query) {
    if (!query || !query.trim()) {
      throw new Error("Por favor ingresa una descripción del sistema");
    }

    const response = await fetch("http://localhost:5000/api/diagram", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Error en el backend: ${response.status} ${response.statusText} - ${text}`);
    }

    const data = await response.json();

    // Si la IA devolvió texto crudo, intentar parsearlo como JSON
    if (data.content && typeof data.content === "string") {
      try {
        return JSON.parse(data.content);
      } catch {
        // Si sigue sin ser JSON, devolvemos un objeto con el texto crudo
        return { classes: [], connections: [], raw: data.content };
      }
    }

    // Si ya viene como JSON, lo retornamos directamente
    return data;
  }
}

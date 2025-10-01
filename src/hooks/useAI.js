// src/hooks/useAI.js
import { useState, useCallback } from 'react';
import AIService from '../services/aiService';

export const useAI = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateDiagram = useCallback(async (query) => {
    if (!query || !query.trim()) {
      setError('Por favor ingresa una descripción del sistema');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const service = new AIService();
      const response = await service.generateDiagram(query.trim());

      const { classes, relationships } = await parseAIResponse(response);

      const normalizedClasses = classes.map((cls, index) => ({
        id: cls.id || cls.name || `class-${index}`,
        name: cls.name || 'Clase',
        x: cls.x || 50 + index * 30,
        y: cls.y || 50 + index * 30,
        width: 200,
        height: calculateClassHeight(cls),
        fields: normalizeAttributes(cls),
        methods: normalizeMethods(cls)
      }));

      const normalizedConnections = (relationships || []).map((conn, index) => ({
        id: conn.id || `conn-${index}`,
        fromId: conn.source || conn.from || conn.fromId || '',
        toId: conn.target || conn.to || conn.toId || '',
        type: 'oneToMany',
        label: conn.label || conn.multiplicity || conn.type || '1:*'
      }));

      return { classes: normalizedClasses, connections: normalizedConnections };
    } catch (err) {
      setError(`Error: ${err.message || 'Error desconocido al generar el diagrama'}`);
      console.error('Error generating diagram:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const calculateClassHeight = (cls) => {
    const baseHeight = 60;
    const itemHeight = 25;
    const fieldsHeight = (cls.fields?.length || 0) * itemHeight;
    const methodsHeight = (cls.methods?.length || 0) * itemHeight;
    const separatorHeight = (fieldsHeight > 0 && methodsHeight > 0) ? 2 : 0;
    return Math.max(120, baseHeight + fieldsHeight + methodsHeight + separatorHeight);
  };

  return { generateDiagram, isGenerating, error, clearError };
};

// 🔧 parse AI response
async function parseAIResponse(response) {
  if (!response) throw new Error("Respuesta vacía de la IA");

  if (response.classes || response.relationships || response.relaciones || response.types || response.classDiagram) {
    return normalizeAIFormat(response);
  }

  if (response.choices?.[0]?.message?.content) {
    let content = response.choices[0].message.content.trim();
    content = content.replace(/```json/gi, "").replace(/```/g, "").trim();

    try {
      const parsed = JSON.parse(content);
      return normalizeAIFormat(parsed);
    } catch (e) {
      console.error("❌ No se pudo parsear el JSON de OpenAI:", content);
      throw new Error("La IA devolvió un formato ilegible");
    }
  }

  throw new Error("Formato desconocido de la IA");
}

// 🔧 Normaliza cualquier formato
function normalizeAIFormat(data) {
  let classes = [];
  let relationships = [];

  // Caso: respuesta con package
  if (data.package) {
    classes = data.package.classes || [];
    relationships = data.package.associations || [];
  }

  // Caso: respuesta con types
  if (data.types) {
    classes = data.types.map(t => ({
      name: t.name,
      attributes: t.attributes || [],
      methods: t.methods || []
    }));
  }

  // Caso: respuesta con classDiagram
  if (data.classDiagram) {
    classes = data.classDiagram.classes || [];
    relationships = data.classDiagram.relationships || [];
  }

  // Caso: respuesta con clases y relaciones
  if (data.classes) classes = data.classes;
  if (data.relationships) relationships = data.relationships;
  if (data.relaciones) relationships = data.relaciones;

  if (!classes?.length) {
    throw new Error("No se encontraron clases válidas");
  }

  return { classes, relationships };
}

// 🔧 Normalizar atributos como objetos {name, type}
function normalizeAttributes(cls) {
  if (!cls) return [];
  const attrs = cls.attributes || cls.fields || [];
  return attrs.map(a => {
    if (typeof a === 'string') {
      const [name, type] = a.split(':').map(s => s.trim());
      return { name: name || '', type: type || '', visibility: '+' };
    }
    return { name: a.name || '', type: a.type || '', visibility: a.visibility || '+' };
  });
}

// 🔧 Normalizar métodos como objetos {name, type}
function normalizeMethods(cls) {
  if (!cls) return [];
  const methods = cls.methods || [];
  return methods.map(m => {
    if (!m) return { name: '', type: '', visibility: '+' };
    if (typeof m === 'string') return { name: m, type: 'void', visibility: '+' };
    return {
      name: m.name || '',
      type: m.type || m.returnType || 'void',
      visibility: m.visibility || '+',
      parameters: m.parameters || []
    };
  });
}

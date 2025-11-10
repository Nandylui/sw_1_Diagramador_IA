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

      // ✅ Parseamos la respuesta de la IA
      const { classes, relationships } = await parseAIResponse(response);

      // ✅ Normalizamos clases con todos los campos UML 2.5
      const normalizedClasses = classes.map((cls, index) => ({
        id: cls.id || cls.name || `class-${index}`,
        name: cls.name || 'Clase',
        x: cls.x || 50 + index * 30,
        y: cls.y || 50 + index * 30,
        width: cls.width || 200,
        height: calculateClassHeight(cls),
        isAbstract: cls.isAbstract || false,
        isInterface: cls.isInterface || false,
        stereotype: cls.stereotype || null,
        fields: normalizeAttributes(cls),
        methods: normalizeMethods(cls)
      }));

      // ✅ Normalizamos conexiones con tipos UML 2.5
      const normalizedConnections = (relationships || []).map((conn, index) => ({
        id: conn.id || `conn-${index}`,
        fromId: conn.source || conn.from || conn.fromId || '',
        toId: conn.target || conn.to || conn.toId || '',
        type: normalizeConnectionType(conn.type) || 'association',
        label: conn.label || conn.multiplicity || getDefaultLabel(conn.type),
        fromMultiplicity: conn.fromMultiplicity || '',
        toMultiplicity: conn.toMultiplicity || ''
      }));

      return { 
        classes: normalizedClasses, 
        connections: normalizedConnections 
      };

    } catch (err) {
      const errorMessage = `Error: ${err.message || 'Error desconocido al generar el diagrama'}`;
      setError(errorMessage);
      console.error('Error generating diagram:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // ✅ Calcula altura dinámica de la clase
  const calculateClassHeight = (cls) => {
    const baseHeight = 60; // Header
    const itemHeight = 25;
    const stereotypeHeight = cls.stereotype ? 20 : 0;
    const fieldsHeight = (cls.fields?.length || 0) * itemHeight;
    const methodsHeight = (cls.methods?.length || 0) * itemHeight;
    const separatorHeight = (fieldsHeight > 0 && methodsHeight > 0) ? 2 : 0;
    
    return Math.max(
      120, 
      baseHeight + stereotypeHeight + fieldsHeight + methodsHeight + separatorHeight
    );
  };

  return { generateDiagram, isGenerating, error, clearError };
};

// ============================================================================
// FUNCIONES AUXILIARES DE PARSEO
// ============================================================================

// ✅ Parsea la respuesta de la IA
async function parseAIResponse(response) {
  if (!response) throw new Error("Respuesta vacía de la IA");

  // Si ya es un objeto con la estructura correcta
  if (response.classes || response.relationships || response.relaciones) {
    return normalizeAIFormat(response);
  }

  // Si viene del backend de OpenRouter
  if (response.choices?.[0]?.message?.content) {
    let content = response.choices[0].message.content.trim();
    content = content.replace(/```json/gi, "").replace(/```/g, "").trim();

    try {
      const parsed = JSON.parse(content);
      return normalizeAIFormat(parsed);
    } catch (e) {
      console.error("❌ No se pudo parsear el JSON:", content);
      throw new Error("La IA devolvió un formato ilegible");
    }
  }

  // Si es un string JSON
  if (typeof response === 'string') {
    try {
      const parsed = JSON.parse(response);
      return normalizeAIFormat(parsed);
    } catch (e) {
      throw new Error("No se pudo parsear la respuesta como JSON");
    }
  }

  throw new Error("Formato desconocido de la IA");
}

// ✅ Normaliza cualquier formato de respuesta IA
function normalizeAIFormat(data) {
  let classes = [];
  let relationships = [];

  // Variaciones de nombres de propiedades
  if (data.package) {
    classes = data.package.classes || [];
    relationships = data.package.associations || data.package.relationships || [];
  }
  

  if (data.types) {
    classes = data.types.map(t => ({
      name: t.name,
      attributes: t.attributes || [],
      methods: t.methods || [],
      isAbstract: t.isAbstract || false,
      isInterface: t.isInterface || false,
      stereotype: t.stereotype || null
    }));
  }


  if (data.classDiagram) {
    classes = data.classDiagram.classes || [];
    relationships = data.classDiagram.relationships || [];
  }


  if (data.classes) classes = data.classes;
  if (data.relationships) relationships = data.relationships;
  if (data.relaciones) relationships = data.relaciones;
  if (data.connections) relationships = data.connections;

  if (!classes?.length) {
    throw new Error("No se encontraron clases válidas en la respuesta");
  }

  return { classes, relationships };
}

// ✅ Normaliza atributos con soporte UML 2.5
function normalizeAttributes(cls) {
  if (!cls) return [];
  const attrs = cls.attributes || cls.fields || [];
  
  return attrs.map(a => {
    if (typeof a === 'string') {
      const [name, type] = a.split(':').map(s => s.trim());
      return { 
        name: name || '', 
        type: type || 'String', 
        visibility: '+',
        multiplicity: null,
        defaultValue: null
      };
    }
    return { 
      name: a.name || '', 
      type: a.type || 'String', 
      visibility: a.visibility || '+',
      multiplicity: a.multiplicity || null,
      defaultValue: a.defaultValue || null
    };
  });
}

// ✅ Normaliza métodos con soporte UML 2.5
function normalizeMethods(cls) {
  if (!cls) return [];
  const methods = cls.methods || [];
  
  return methods.map(m => {
    if (!m) return { 
      name: '', 
      type: 'void', 
      visibility: '+',
      isAbstract: false,
      parameters: []
    };
    
    if (typeof m === 'string') {
      return { 
        name: m, 
        type: 'void', 
        visibility: '+',
        isAbstract: false,
        parameters: []
      };
    }
    
    return {
      name: m.name || '',
      type: m.type || m.returnType || 'void',
      visibility: m.visibility || '+',
      isAbstract: m.isAbstract || false,
      parameters: m.parameters || []
    };
  });
}

// ✅ Normaliza tipos de conexión UML 2.5
function normalizeConnectionType(type) {
  if (!type) return 'association';
  
  const typeMap = {
    // Asociaciones
    'association': 'association',
    'asociacion': 'association',
    'associate': 'association',
    
    // Agregación
    'aggregation': 'aggregation',
    'agregacion': 'aggregation',
    'aggregate': 'aggregation',
    
    // Composición
    'composition': 'composition',
    'composicion': 'composition',
    'composite': 'composition',
    
    // Herencia
    'generalization': 'generalization',
    'generalizacion': 'generalization',
    'inheritance': 'generalization',
    'herencia': 'generalization',
    'extends': 'generalization',
    
    // Realización
    'realization': 'realization',
    'realizacion': 'realization',
    'implements': 'realization',
    'implementa': 'realization',
    
    // Dependencia
    'dependency': 'dependency',
    'dependencia': 'dependency',
    'depends': 'dependency',
    
    // Multiplicidades
    '1:1': 'oneToOne',
    'one-to-one': 'oneToOne',
    'onetoone': 'oneToOne',
    
    '1:n': 'oneToMany',
    '1:*': 'oneToMany',
    'one-to-many': 'oneToMany',
    'onetomany': 'oneToMany',
    
    'n:m': 'manyToMany',
    '*:*': 'manyToMany',
    'many-to-many': 'manyToMany',
    'manytomany': 'manyToMany'
  };
  
  const normalized = typeMap[type.toLowerCase()];
  return normalized || 'association';
}

// ✅ Obtiene etiqueta por defecto según el tipo
function getDefaultLabel(type) {
  const labels = {
    'association': '',
    'aggregation': '',
    'composition': '',
    'generalization': '',
    'realization': '',
    'dependency': '',
    'oneToOne': '1:1',
    'oneToMany': '1:*',
    'manyToMany': '*:*'
  };
  
  return labels[type] || '';
}
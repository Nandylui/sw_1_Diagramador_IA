import { useState, useCallback } from 'react';
//import aiService from '../services/aiService';
import aiService from '../../services/aiService'; // ✅ Ruta corregida

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
      const diagram = await aiService.generateDiagram(query.trim());
      
      if (!diagram || !diagram.classes || diagram.classes.length === 0) {
        throw new Error('No se pudieron generar clases válidas desde la consulta');
      }

      // Validar y normalizar las clases generadas
      const normalizedClasses = diagram.classes.map((cls, index) => {
        // Asegurar que cada clase tenga propiedades válidas
        const validatedClass = {
          id: cls.id || Date.now() + index,
          name: cls.name || `Clase${index + 1}`,
          x: typeof cls.x === 'number' ? cls.x : 50 + (index % 3) * 250,
          y: typeof cls.y === 'number' ? cls.y : 50 + Math.floor(index / 3) * 200,
          width: cls.width || 200,
          height: cls.height || calculateClassHeight(cls),
          fields: Array.isArray(cls.fields) ? cls.fields : [],
          methods: Array.isArray(cls.methods) ? cls.methods : [],
          isIntermediate: Boolean(cls.isIntermediate)
        };

        return validatedClass;
      });

      // Validar conexiones
      const normalizedConnections = Array.isArray(diagram.connections) 
        ? diagram.connections.filter(conn => {
            // Solo incluir conexiones válidas
            return conn.from && conn.to && 
                   normalizedClasses.some(c => c.id === conn.from) &&
                   normalizedClasses.some(c => c.id === conn.to);
          }).map((conn, index) => ({
            id: conn.id || Date.now() + 1000 + index,
            from: conn.from,
            to: conn.to,
            type: conn.type || 'oneToMany',
            label: conn.label || '1:*'
          }))
        : [];

      return {
        classes: normalizedClasses,
        connections: normalizedConnections
      };

    } catch (err) {
      const errorMessage = err.message || 'Error desconocido al generar el diagrama';
      setError(`Error: ${errorMessage}`);
      console.error('Error generating diagram:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Calcular altura de clase basada en contenido
  const calculateClassHeight = (cls) => {
    const baseHeight = 60; // Header
    const itemHeight = 25;
    const fieldsHeight = (cls.fields?.length || 0) * itemHeight;
    const methodsHeight = (cls.methods?.length || 0) * itemHeight;
    const separatorHeight = (cls.fields?.length > 0 && cls.methods?.length > 0) ? 2 : 0;
    
    return Math.max(120, baseHeight + fieldsHeight + methodsHeight + separatorHeight);
  };

  return {
    generateDiagram,
    isGenerating,
    error,
    clearError
  };
};
export default useAI;

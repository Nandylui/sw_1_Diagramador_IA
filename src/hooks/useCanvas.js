import { useState, useCallback } from 'react';
import { DEFAULT_CLASS_TEMPLATE } from '../utils/constants';

export const useCanvas = () => {
  const [classes, setClasses] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);

  // Crear nueva clase
  const createClass = useCallback((x, y, name = 'NuevaClase') => {
    const newClass = {
      id: Date.now(),
      name,
      x: x - 100,
      y: y - 60,
      ...DEFAULT_CLASS_TEMPLATE
    };
    
    setClasses(prev => [...prev, newClass]);
    return newClass;
  }, []);

  // Actualizar clase específica
  const updateClass = useCallback((classId, updates) => {
    setClasses(prev => prev.map(cls => 
      cls.id === classId ? { ...cls, ...updates } : cls
    ));
  }, []);

  // Eliminar clase y sus conexiones
  const removeClass = useCallback((classId) => {
    setClasses(prev => prev.filter(cls => cls.id !== classId));
    // Eliminar conexiones relacionadas
    setConnections(prev => prev.filter(conn => 
      conn.from !== classId && conn.to !== classId
    ));
    // Limpiar selección si era la clase eliminada
    if (selectedClass === classId) {
      setSelectedClass(null);
    }
  }, [selectedClass]);

  // Agregar campo a una clase
  const addField = useCallback((classId) => {
    const newField = { name: 'nuevoField', type: 'String', visibility: '+' };
    setClasses(prev => prev.map(cls => 
      cls.id === classId 
        ? { 
            ...cls, 
            fields: [...(cls.fields || []), newField], 
            height: cls.height + 25 
          }
        : cls
    ));
  }, []);

  // Eliminar campo de una clase
  const removeField = useCallback((classId, fieldIndex) => {
    setClasses(prev => prev.map(cls => 
      cls.id === classId 
        ? { 
            ...cls, 
            fields: cls.fields.filter((_, index) => index !== fieldIndex),
            height: Math.max(120, cls.height - 25)
          }
        : cls
    ));
  }, []);

  // Agregar método a una clase
  const addMethod = useCallback((classId) => {
    const newMethod = { name: 'nuevoMetodo()', type: 'void', visibility: '+' };
    setClasses(prev => prev.map(cls => 
      cls.id === classId 
        ? { 
            ...cls, 
            methods: [...(cls.methods || []), newMethod], 
            height: cls.height + 25 
          }
        : cls
    ));
  }, []);

  // Eliminar método de una clase
  const removeMethod = useCallback((classId, methodIndex) => {
    setClasses(prev => prev.map(cls => 
      cls.id === classId 
        ? { 
            ...cls, 
            methods: cls.methods.filter((_, index) => index !== methodIndex),
            height: Math.max(120, cls.height - 25)
          }
        : cls
    ));
  }, []);

  // Crear conexión entre clases
  const createConnection = useCallback((fromId, toId, type, label) => {
    // Verificar que las clases existen
    const fromExists = classes.some(cls => cls.id === fromId);
    const toExists = classes.some(cls => cls.id === toId);
    
    if (!fromExists || !toExists) {
      console.warn('No se puede crear conexión: una o ambas clases no existen');
      return null;
    }

    const newConnection = {
      id: Date.now(),
      from: fromId,
      to: toId,
      type,
      label
    };
    
    setConnections(prev => [...prev, newConnection]);
    return newConnection;
  }, [classes]);

  // Eliminar conexión
  const removeConnection = useCallback((connectionId) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
    if (selectedConnection === connectionId) {
      setSelectedConnection(null);
    }
  }, [selectedConnection]);

  // Crear clase intermedia para relaciones muchos-a-muchos
  const createIntermediateClass = useCallback((class1, class2, relationName) => {
    const intermediateClass = {
      id: Date.now(),
      name: relationName || `${class1.name}_${class2.name}`,
      x: (class1.x + class2.x) / 2,
      y: (class1.y + class2.y) / 2 - 100,
      width: 200,
      height: 120,
      fields: [
        { name: `${class1.name.toLowerCase()}Id`, type: 'int', visibility: '+' },
        { name: `${class2.name.toLowerCase()}Id`, type: 'int', visibility: '+' }
      ],
      methods: [
        { name: 'getId()', type: 'int', visibility: '+' }
      ],
      isIntermediate: true
    };
    
    setClasses(prev => [...prev, intermediateClass]);
    
    // Crear conexiones automáticamente después de un breve delay
    setTimeout(() => {
      const connection1 = {
        id: Date.now(),
        from: intermediateClass.id,
        to: class1.id,
        type: 'oneToMany',
        label: '1:*'
      };
      
      const connection2 = {
        id: Date.now() + 1,
        from: intermediateClass.id,
        to: class2.id,
        type: 'oneToMany',
        label: '1:*'
      };
      
      setConnections(prev => [...prev, connection1, connection2]);
    }, 100);
    
    return intermediateClass;
  }, []);

  // Limpiar todo el canvas
  const clearCanvas = useCallback(() => {
    setClasses([]);
    setConnections([]);
    setSelectedClass(null);
    setSelectedConnection(null);
  }, []);

  // Cargar diagrama completo
  const loadDiagram = useCallback((diagram) => {
    setClasses(diagram.classes || []);
    setConnections(diagram.connections || []);
    setSelectedClass(null);
    setSelectedConnection(null);
  }, []);

  // Obtener estadísticas del diagrama
  const getDiagramStats = useCallback(() => {
    return {
      totalClasses: classes.length,
      totalConnections: connections.length,
      intermediateClasses: classes.filter(cls => cls.isIntermediate).length,
      regularClasses: classes.filter(cls => !cls.isIntermediate).length,
      totalFields: classes.reduce((sum, cls) => sum + (cls.fields?.length || 0), 0),
      totalMethods: classes.reduce((sum, cls) => sum + (cls.methods?.length || 0), 0),
      relationshipTypes: {
        oneToOne: connections.filter(c => c.type === 'oneToOne').length,
        oneToMany: connections.filter(c => c.type === 'oneToMany').length,
        manyToMany: connections.filter(c => c.type === 'manyToMany').length
      }
    };
  }, [classes, connections]);

  return {
    // Estado
    classes,
    connections,
    selectedClass,
    selectedConnection,
    
    // Setters directos
    setClasses,
    setConnections,
    setSelectedClass,
    setSelectedConnection,
    
    // Métodos de manipulación de clases
    createClass,
    updateClass,
    removeClass,
    addField,
    removeField,
    addMethod,
    removeMethod,
    
    // Métodos de conexiones
    createConnection,
    removeConnection,
    createIntermediateClass,
    
    // Utilidades
    clearCanvas,
    loadDiagram,
    getDiagramStats
  };
};
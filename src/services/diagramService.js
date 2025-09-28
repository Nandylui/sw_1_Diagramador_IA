class DiagramService {
  // Validar estructura del diagrama
  validateDiagram(diagram) {
    if (!diagram) return false;
    
    // Validar que tenga la estructura básica
    if (!diagram.classes || !Array.isArray(diagram.classes)) {
      return false;
    }

    // Validar cada clase
    for (const cls of diagram.classes) {
      if (!cls.id || !cls.name || typeof cls.x !== 'number' || typeof cls.y !== 'number') {
        return false;
      }
    }

    return true;
  }

  // Crear clase intermedia para relaciones muchos-a-muchos
  createIntermediateClass(class1, class2, relationName) {
    const intermediateClass = {
      id: Date.now(),
      name: relationName || `${class1.name}_${class2.name}`,
      x: (class1.x + class2.x) / 2,
      y: (class1.y + class2.y) / 2 - 100,
      width: 200,
      height: 120,
      fields: [
        { 
          name: `${class1.name.toLowerCase()}Id`, 
          type: 'int', 
          visibility: '+' 
        },
        { 
          name: `${class2.name.toLowerCase()}Id`, 
          type: 'int', 
          visibility: '+' 
        }
      ],
      methods: [
        { 
          name: 'getId()', 
          type: 'int', 
          visibility: '+' 
        }
      ],
      isIntermediate: true
    };

    return intermediateClass;
  }

  // Crear conexiones para clase intermedia
  createIntermediateConnections(intermediateClass, class1, class2) {
    return [
      {
        id: Date.now(),
        from: intermediateClass.id,
        to: class1.id,
        type: 'oneToMany',
        label: '1:*'
      },
      {
        id: Date.now() + 1,
        from: intermediateClass.id,
        to: class2.id,
        type: 'oneToMany',
        label: '1:*'
      }
    ];
  }

  // Encontrar clases conectadas
  getConnectedClasses(classId, connections) {
    return connections.filter(conn => 
      conn.from === classId || conn.to === classId
    );
  }

  // Calcular posición automática para nuevas clases
  calculateAutoPosition(existingClasses, index = 0) {
    const cols = 3;
    const spacing = { x: 250, y: 200 };
    const margin = { x: 50, y: 50 };
    
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    return {
      x: margin.x + col * spacing.x,
      y: margin.y + row * spacing.y
    };
  }

  // Detectar solapamiento entre clases
  detectOverlap(class1, class2, padding = 10) {
    return !(
      class1.x + class1.width + padding < class2.x ||
      class2.x + class2.width + padding < class1.x ||
      class1.y + class1.height + padding < class2.y ||
      class2.y + class2.height + padding < class1.y
    );
  }

  // Resolver solapamientos automáticamente
  resolveOverlaps(classes) {
    const resolvedClasses = [...classes];
    
    for (let i = 0; i < resolvedClasses.length; i++) {
      for (let j = i + 1; j < resolvedClasses.length; j++) {
        const class1 = resolvedClasses[i];
        const class2 = resolvedClasses[j];
        
        if (this.detectOverlap(class1, class2)) {
          // Mover class2 a la derecha
          class2.x = class1.x + class1.width + 20;
        }
      }
    }
    
    return resolvedClasses;
  }

  // Generar ID único
  generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
  }

  // Calcular dimensiones de clase basadas en contenido
  calculateClassDimensions(cls) {
    const baseHeight = 60; // Header
    const itemHeight = 25;
    const minWidth = 200;
    const padding = 20;
    
    const fieldsHeight = (cls.fields?.length || 0) * itemHeight;
    const methodsHeight = (cls.methods?.length || 0) * itemHeight;
    const separatorHeight = (cls.fields?.length > 0 && cls.methods?.length > 0) ? 2 : 0;
    
    const height = baseHeight + fieldsHeight + methodsHeight + separatorHeight;
    
    // Calcular ancho basado en el contenido más largo
    let maxWidth = minWidth;
    const items = [
      cls.name,
      ...(cls.fields?.map(f => `${f.visibility} ${f.name}: ${f.type}`) || []),
      ...(cls.methods?.map(m => `${m.visibility} ${m.name}: ${m.type}`) || [])
    ];
    
    items.forEach(item => {
      const estimatedWidth = item.length * 8 + padding;
      if (estimatedWidth > maxWidth) {
        maxWidth = estimatedWidth;
      }
    });
    
    return { width: Math.min(maxWidth, 300), height };
  }

  // Optimizar layout del diagrama
  optimizeLayout(classes, connections) {
    // Implementar algoritmo simple de optimización
    const optimizedClasses = classes.map(cls => ({
      ...cls,
      ...this.calculateClassDimensions(cls)
    }));
    
    return this.resolveOverlaps(optimizedClasses);
  }

  // Exportar estadísticas del diagrama
  getDiagramStats(classes, connections) {
    return {
      totalClasses: classes.length,
      totalConnections: connections.length,
      intermediateClasses: classes.filter(cls => cls.isIntermediate).length,
      relationshipTypes: {
        oneToOne: connections.filter(c => c.type === 'oneToOne').length,
        oneToMany: connections.filter(c => c.type === 'oneToMany').length,
        manyToMany: connections.filter(c => c.type === 'manyToMany').length
      },
      totalFields: classes.reduce((sum, cls) => sum + (cls.fields?.length || 0), 0),
      totalMethods: classes.reduce((sum, cls) => sum + (cls.methods?.length || 0), 0)
    };
  }
}

export default new DiagramService();
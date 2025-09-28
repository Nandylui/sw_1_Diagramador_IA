export const parseAIResponse = (response) => {
  try {
    // Limpiar la respuesta de markdown o texto extra
    let cleanResponse = response;
    
    // Remover markdown code blocks
    cleanResponse = cleanResponse.replace(/```json\s*|\s*```/g, '');
    cleanResponse = cleanResponse.replace(/```\s*|\s*```/g, '');
    
    // Buscar el JSON en la respuesta
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return validateAndNormalizeDiagram(parsed);
    }
    
    throw new Error('No se encontró JSON válido en la respuesta');
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return null;
  }
};

const validateAndNormalizeDiagram = (diagram) => {
  // Validar que tenga la estructura correcta
  if (!diagram.classes || !Array.isArray(diagram.classes)) {
    throw new Error('Estructura de diagrama inválida: falta array de clases');
  }
  
  // Normalizar clases
  diagram.classes = diagram.classes.map((cls, index) => {
    // Generar ID único si no existe
    const id = cls.id || Date.now() + index;
    
    // Posición por defecto si no está definida
    const x = typeof cls.x === 'number' ? cls.x : 50 + (index % 3) * 250;
    const y = typeof cls.y === 'number' ? cls.y : 50 + Math.floor(index / 3) * 200;
    
    // Dimensiones por defecto
    const width = cls.width || 200;
    const height = cls.height || calculateClassHeight(cls);
    
    // Normalizar campos
    const fields = Array.isArray(cls.fields) ? cls.fields.map(normalizeField) : [];
    
    // Normalizar métodos
    const methods = Array.isArray(cls.methods) ? cls.methods.map(normalizeMethod) : [];
    
    return {
      id,
      name: cls.name || `Clase${index + 1}`,
      x,
      y,
      width,
      height,
      fields,
      methods,
      isIntermediate: cls.isIntermediate || false
    };
  });
  
  // Normalizar conexiones
  if (diagram.connections) {
    diagram.connections = diagram.connections.map((conn, index) => ({
      id: conn.id || Date.now() + index + 1000,
      from: conn.from,
      to: conn.to,
      type: normalizeConnectionType(conn.type),
      label: conn.label || getConnectionLabel(conn.type)
    })).filter(conn => 
      // Filtrar conexiones inválidas
      diagram.classes.some(c => c.id === conn.from) &&
      diagram.classes.some(c => c.id === conn.to)
    );
  } else {
    diagram.connections = [];
  }
  
  return diagram;
};

const normalizeField = (field) => {
  return {
    name: field.name || 'campo',
    type: field.type || 'String',
    visibility: normalizeVisibility(field.visibility)
  };
};

const normalizeMethod = (method) => {
  return {
    name: method.name || 'metodo()',
    type: method.type || 'void',
    visibility: normalizeVisibility(method.visibility)
  };
};

const normalizeVisibility = (visibility) => {
  const validVisibilities = ['+', '-', '#'];
  if (validVisibilities.includes(visibility)) {
    return visibility;
  }
  
  // Convertir de texto a símbolos
  switch (visibility?.toLowerCase()) {
    case 'public':
      return '+';
    case 'private':
      return '-';
    case 'protected':
      return '#';
    default:
      return '+';
  }
};

const normalizeConnectionType = (type) => {
  const validTypes = ['oneToOne', 'oneToMany', 'manyToMany'];
  if (validTypes.includes(type)) {
    return type;
  }
  
  // Mapear variaciones comunes
  switch (type?.toLowerCase()) {
    case '1:1':
    case 'one-to-one':
    case 'onetoone':
      return 'oneToOne';
    case '1:n':
    case '1:*':
    case 'one-to-many':
    case 'onetomany':
      return 'oneToMany';
    case 'n:m':
    case '*:*':
    case 'many-to-many':
    case 'manytomany':
      return 'manyToMany';
    default:
      return 'oneToMany'; // Por defecto
  }
};

const getConnectionLabel = (type) => {
  switch (type) {
    case 'oneToOne':
      return '1:1';
    case 'oneToMany':
      return '1:*';
    case 'manyToMany':
      return '*:*';
    default:
      return '1:*';
  }
};

const calculateClassHeight = (cls) => {
  const baseHeight = 60; // Header
  const itemHeight = 25;
  const fieldsHeight = (cls.fields?.length || 0) * itemHeight;
  const methodsHeight = (cls.methods?.length || 0) * itemHeight;
  const separatorHeight = (cls.fields?.length > 0 && cls.methods?.length > 0) ? 2 : 0;
  
  return Math.max(120, baseHeight + fieldsHeight + methodsHeight + separatorHeight);
};

// Función para parsear texto plano y convertir a diagrama
export const parseTextToDiagram = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  const classes = [];
  let currentClass = null;
  let currentSection = null; // 'fields' o 'methods'
  
  for (const line of lines) {
    // Detectar nueva clase
    if (line.startsWith('class ') || line.match(/^[A-Z]\w+$/)) {
      if (currentClass) {
        classes.push(currentClass);
      }
      
      const className = line.startsWith('class ') ? 
        line.substring(6).replace(/\s*\{.*$/, '') : line;
      
      currentClass = {
        id: Date.now() + classes.length,
        name: className,
        x: 50 + (classes.length % 3) * 250,
        y: 50 + Math.floor(classes.length / 3) * 200,
        width: 200,
        height: 120,
        fields: [],
        methods: []
      };
      currentSection = null;
    }
    // Detectar secciones
    else if (line.toLowerCase().includes('field') || line.toLowerCase().includes('atributo')) {
      currentSection = 'fields';
    }
    else if (line.toLowerCase().includes('method') || line.toLowerCase().includes('método')) {
      currentSection = 'methods';
    }
    // Parsear campos y métodos
    else if (currentClass && line.includes(':')) {
      const [name, type] = line.split(':').map(s => s.trim());
      const visibility = line.startsWith('+') || line.startsWith('-') || line.startsWith('#') ? 
        line[0] : '+';
      
      const item = {
        name: name.replace(/^[+\-#]\s*/, ''),
        type: type || 'String',
        visibility
      };
      
      if (currentSection === 'methods' || name.includes('(')) {
        currentClass.methods.push(item);
      } else {
        currentClass.fields.push(item);
      }
    }
  }
  
  // Agregar la última clase
  if (currentClass) {
    classes.push(currentClass);
  }
  
  return {
    classes: classes.map(cls => ({
      ...cls,
      height: calculateClassHeight(cls)
    })),
    connections: []
  };
};

// Función para validar tipos de datos comunes
export const validateDataType = (type) => {
  const validTypes = [
    'int', 'Integer', 'long', 'Long', 'float', 'Float', 'double', 'Double',
    'boolean', 'Boolean', 'String', 'char', 'Character',
    'Date', 'LocalDate', 'LocalDateTime', 'Timestamp',
    'List', 'ArrayList', 'Set', 'HashSet', 'Map', 'HashMap',
    'Object', 'void'
  ];
  
  // Verificar tipos exactos
  if (validTypes.includes(type)) {
    return type;
  }
  
  // Verificar tipos genéricos como List<String>
  if (type.includes('<') && type.includes('>')) {
    return type;
  }
  
  // Verificar arrays
  if (type.endsWith('[]')) {
    return type;
  }
  
  // Si no coincide con ningún patrón, devolver String por defecto
  return 'String';
};

// Función para generar sugerencias de métodos basados en campos
export const generateMethodSuggestions = (fields) => {
  const suggestions = [];
  
  fields.forEach(field => {
    // Getters
    suggestions.push({
      name: `get${capitalize(field.name)}()`,
      type: field.type,
      visibility: '+'
    });
    
    // Setters
    suggestions.push({
      name: `set${capitalize(field.name)}(${field.type} ${field.name})`,
      type: 'void',
      visibility: '+'
    });
  });
  
  // Métodos comunes
  suggestions.push(
    { name: 'toString()', type: 'String', visibility: '+' },
    { name: 'equals(Object obj)', type: 'boolean', visibility: '+' },
    { name: 'hashCode()', type: 'int', visibility: '+' }
  );
  
  return suggestions;
};

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Función para detectar patrones en nombres de clases
export const detectClassPattern = (className) => {
  const patterns = {
    entity: /^[A-Z][a-z]+$/,
    service: /Service$/,
    controller: /Controller$/,
    repository: /Repository$/,
    dto: /(DTO|Dto)$/,
    model: /Model$/,
    intermediate: /_/
  };
  
  for (const [pattern, regex] of Object.entries(patterns)) {
    if (regex.test(className)) {
      return pattern;
    }
  }
  
  return 'entity';
};

export default {
  parseAIResponse,
  parseTextToDiagram,
  validateDataType,
  generateMethodSuggestions,
  detectClassPattern
};
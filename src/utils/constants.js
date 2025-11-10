// src/utils/constants.js

// ✅ UML 2.5 - Tipos de relaciones completas
export const RELATIONSHIP_TYPES = {
  association: { 
    label: 'Asociación', 
    symbol: '───>', 
    needsIntermediateClass: false,
    description: 'Relación estructural entre clases'
  },
  aggregation: { 
    label: 'Agregación', 
    symbol: '◇──>', 
    needsIntermediateClass: false,
    description: 'Relación todo-parte (el todo puede existir sin las partes)'
  },
  composition: { 
    label: 'Composición', 
    symbol: '◆──>', 
    needsIntermediateClass: false,
    description: 'Relación todo-parte fuerte (las partes no existen sin el todo)'
  },
  generalization: { 
    label: 'Herencia/Generalización', 
    symbol: '▷──', 
    needsIntermediateClass: false,
    description: 'Relación de herencia entre clases'
  },
  realization: { 
    label: 'Realización', 
    symbol: '▷··', 
    needsIntermediateClass: false,
    description: 'Implementación de una interfaz'
  },
  dependency: { 
    label: 'Dependencia', 
    symbol: '··>', 
    needsIntermediateClass: false,
    description: 'Una clase usa otra temporalmente'
  },
  oneToOne: { 
    label: '1:1 (Uno a Uno)', 
    symbol: '1:1', 
    needsIntermediateClass: false,
    description: 'Cada instancia se relaciona con exactamente una instancia'
  },
  oneToMany: { 
    label: '1:N (Uno a Muchos)', 
    symbol: '1:*', 
    needsIntermediateClass: false,
    description: 'Una instancia se relaciona con múltiples instancias'
  },
  manyToMany: { 
    label: 'N:M (Muchos a Muchos)', 
    symbol: '*:*', 
    needsIntermediateClass: true,
    description: 'Múltiples instancias se relacionan con múltiples instancias'
  }
};

// ✅ UML 2.5 - Tipos de visibilidad completos
export const VISIBILITY_TYPES = {
  '+': 'public',
  '-': 'private',
  '#': 'protected',
  '~': 'package'  // Package-private (UML 2.5)
};

// ✅ UML 2.5 - Estereotipos comunes
export const COMMON_STEREOTYPES = [
  'entity',
  'control',
  'boundary',
  'service',
  'repository',
  'controller',
  'utility',
  'exception',
  'enumeration',
  'value object',
  'aggregate root'
];

// ✅ UML 2.5 - Tipos de datos comunes
export const COMMON_DATA_TYPES = [
  'int',
  'Integer',
  'long',
  'Long',
  'float',
  'Float',
  'double',
  'Double',
  'boolean',
  'Boolean',
  'String',
  'char',
  'Character',
  'byte',
  'Byte',
  'short',
  'Short',
  'Date',
  'LocalDate',
  'LocalDateTime',
  'LocalTime',
  'Timestamp',
  'BigDecimal',
  'BigInteger',
  'UUID',
  'List',
  'ArrayList',
  'Set',
  'HashSet',
  'Map',
  'HashMap',
  'Collection',
  'void',
  'Object'
];

// ✅ Plantilla de clase UML 2.5
export const DEFAULT_CLASS_TEMPLATE = {
  width: 200,
  height: 120,
  isAbstract: false,
  isInterface: false,
  stereotype: null,
  fields: [
    { 
      name: 'id', 
      type: 'int', 
      visibility: '-',
      multiplicity: null,
      defaultValue: null
    }
  ],
  methods: [
    { 
      name: 'metodo', 
      type: 'void', 
      visibility: '+',
      isAbstract: false,
      parameters: []
    }
  ]
};

// ✅ Ejemplos de prompts para IA
export const AI_EXAMPLES = [
  'Sistema de gestión de colegio con estudiantes y profesores',
  'Tienda online con productos, clientes y ventas',
  'Biblioteca con libros, usuarios y préstamos',
  'Hospital con pacientes, doctores y citas',
  'Red social con usuarios, posts y comentarios',
  'Sistema bancario con cuentas, transacciones y clientes',
  'Sistema de reservas de hotel',
  'Plataforma de cursos online',
  'Sistema de gestión de inventario',
  'Aplicación de delivery de comida'
];

// ✅ Multiplicidades comunes en UML
export const COMMON_MULTIPLICITIES = [
  '1',
  '0..1',
  '*',
  '0..*',
  '1..*',
  'n',
  'n..m'
];

// ✅ Configuración de exportación
export const EXPORT_FORMATS = {
  JAVA: 'java',
  CSHARP: 'csharp',
  SQL: 'sql',
  SPRINGBOOT: 'springboot',
  JSON: 'json'
};

export default {
  RELATIONSHIP_TYPES,
  VISIBILITY_TYPES,
  COMMON_STEREOTYPES,
  COMMON_DATA_TYPES,
  DEFAULT_CLASS_TEMPLATE,
  AI_EXAMPLES,
  COMMON_MULTIPLICITIES,
  EXPORT_FORMATS
};
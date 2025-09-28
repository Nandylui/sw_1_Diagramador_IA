export const RELATIONSHIP_TYPES = {
  oneToOne: { label: '1:1 (Uno a Uno)', symbol: '1:1', needsIntermediateClass: false },
  oneToMany: { label: '1:N (Uno a Muchos)', symbol: '1:*', needsIntermediateClass: false },
  manyToMany: { label: 'N:M (Muchos a Muchos)', symbol: '*:*', needsIntermediateClass: true }
};

export const VISIBILITY_TYPES = {
  '+': 'public',
  '-': 'private',
  '#': 'protected'
};

export const AI_EXAMPLES = [
  'Sistema de gestión de colegio con estudiantes y profesores',
  'Tienda online con productos, clientes y ventas',
  'Biblioteca con libros, usuarios y préstamos',
  'Hospital con pacientes, doctores y citas',
  'Red social con usuarios, posts y comentarios',
  'Sistema bancario con cuentas, transacciones y clientes'
];

export const DEFAULT_CLASS_TEMPLATE = {
  width: 200,
  height: 120,
  fields: [
    { name: 'id', type: 'int', visibility: '+' }
  ],
  methods: [
    { name: 'metodo()', type: 'void', visibility: '+' }
  ]
};
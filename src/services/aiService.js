class AIService {
  async generateDiagram(query) {
    const lowerQuery = query.toLowerCase();
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (lowerQuery.includes('colegio') || lowerQuery.includes('escuela') || lowerQuery.includes('estudiante') || lowerQuery.includes('universidad')) {
      return {
        classes: [
          {
            id: 1,
            name: 'Estudiante',
            x: 50,
            y: 50,
            width: 200,
            height: 200,
            fields: [
              { name: 'id', type: 'int', visibility: '+' },
              { name: 'nombre', type: 'String', visibility: '+' },
              { name: 'apellido', type: 'String', visibility: '+' },
              { name: 'fechaNacimiento', type: 'Date', visibility: '+' },
              { name: 'email', type: 'String', visibility: '+' },
              { name: 'telefono', type: 'String', visibility: '+' }
            ],
            methods: [
              { name: 'inscribir()', type: 'void', visibility: '+' },
              { name: 'calcularEdad()', type: 'int', visibility: '+' },
              { name: 'obtenerPromedio()', type: 'double', visibility: '+' }
            ]
          },
          {
            id: 2,
            name: 'Profesor',
            x: 300,
            y: 50,
            width: 200,
            height: 200,
            fields: [
              { name: 'id', type: 'int', visibility: '+' },
              { name: 'nombre', type: 'String', visibility: '+' },
              { name: 'apellido', type: 'String', visibility: '+' },
              { name: 'especialidad', type: 'String', visibility: '+' },
              { name: 'email', type: 'String', visibility: '+' },
              { name: 'salario', type: 'double', visibility: '-' }
            ],
            methods: [
              { name: 'ensenar()', type: 'void', visibility: '+' },
              { name: 'evaluarEstudiante()', type: 'double', visibility: '+' },
              { name: 'crearExamen()', type: 'void', visibility: '+' }
            ]
          },
          {
            id: 3,
            name: 'Materia',
            x: 550,
            y: 50,
            width: 200,
            height: 180,
            fields: [
              { name: 'id', type: 'int', visibility: '+' },
              { name: 'nombre', type: 'String', visibility: '+' },
              { name: 'codigo', type: 'String', visibility: '+' },
              { name: 'creditos', type: 'int', visibility: '+' },
              { name: 'descripcion', type: 'String', visibility: '+' }
            ],
            methods: [
              { name: 'obtenerCreditos()', type: 'int', visibility: '+' },
              { name: 'obtenerRequisitos()', type: 'List', visibility: '+' }
            ]
          }
        ],
        connections: [
          {
            id: 1,
            from: 2,
            to: 3,
            type: 'oneToMany',
            label: '1:*'
          }
        ]
      };
    }
    
    if (lowerQuery.includes('tienda') || lowerQuery.includes('producto') || lowerQuery.includes('venta') || lowerQuery.includes('ecommerce')) {
      return {
        classes: [
          {
            id: 1,
            name: 'Cliente',
            x: 50,
            y: 50,
            width: 200,
            height: 180,
            fields: [
              { name: 'id', type: 'int', visibility: '+' },
              { name: 'nombre', type: 'String', visibility: '+' },
              { name: 'email', type: 'String', visibility: '+' },
              { name: 'telefono', type: 'String', visibility: '+' },
              { name: 'direccion', type: 'String', visibility: '+' }
            ],
            methods: [
              { name: 'realizarCompra()', type: 'void', visibility: '+' },
              { name: 'verHistorial()', type: 'List', visibility: '+' }
            ]
          },
          {
            id: 2,
            name: 'Producto',
            x: 300,
            y: 50,
            width: 200,
            height: 180,
            fields: [
              { name: 'id', type: 'int', visibility: '+' },
              { name: 'nombre', type: 'String', visibility: '+' },
              { name: 'descripcion', type: 'String', visibility: '+' },
              { name: 'precio', type: 'double', visibility: '+' },
              { name: 'stock', type: 'int', visibility: '+' }
            ],
            methods: [
              { name: 'actualizarStock()', type: 'void', visibility: '+' },
              { name: 'aplicarDescuento()', type: 'void', visibility: '+' }
            ]
          },
          {
            id: 3,
            name: 'Venta',
            x: 175,
            y: 280,
            width: 200,
            height: 180,
            fields: [
              { name: 'id', type: 'int', visibility: '+' },
              { name: 'clienteId', type: 'int', visibility: '+' },
              { name: 'fecha', type: 'Date', visibility: '+' },
              { name: 'total', type: 'double', visibility: '+' },
              { name: 'estado', type: 'String', visibility: '+' }
            ],
            methods: [
              { name: 'calcularTotal()', type: 'double', visibility: '+' },
              { name: 'procesarPago()', type: 'boolean', visibility: '+' }
            ]
          }
        ],
        connections: [
          {
            id: 1,
            from: 1,
            to: 3,
            type: 'oneToMany',
            label: '1:*'
          }
        ]
      };
    }

    if (lowerQuery.includes('biblioteca') || lowerQuery.includes('libro') || lowerQuery.includes('prestamo')) {
      return {
        classes: [
          {
            id: 1,
            name: 'Usuario',
            x: 50,
            y: 50,
            width: 200,
            height: 160,
            fields: [
              { name: 'id', type: 'int', visibility: '+' },
              { name: 'nombre', type: 'String', visibility: '+' },
              { name: 'email', type: 'String', visibility: '+' },
              { name: 'telefono', type: 'String', visibility: '+' }
            ],
            methods: [
              { name: 'solicitarPrestamo()', type: 'void', visibility: '+' },
              { name: 'devolverLibro()', type: 'void', visibility: '+' }
            ]
          },
          {
            id: 2,
            name: 'Libro',
            x: 300,
            y: 50,
            width: 200,
            height: 180,
            fields: [
              { name: 'id', type: 'int', visibility: '+' },
              { name: 'titulo', type: 'String', visibility: '+' },
              { name: 'autor', type: 'String', visibility: '+' },
              { name: 'isbn', type: 'String', visibility: '+' },
              { name: 'disponible', type: 'boolean', visibility: '+' }
            ],
            methods: [
              { name: 'marcarPrestado()', type: 'void', visibility: '+' },
              { name: 'marcarDisponible()', type: 'void', visibility: '+' }
            ]
          },
          {
            id: 3,
            name: 'Prestamo',
            x: 175,
            y: 280,
            width: 200,
            height: 180,
            fields: [
              { name: 'id', type: 'int', visibility: '+' },
              { name: 'usuarioId', type: 'int', visibility: '+' },
              { name: 'libroId', type: 'int', visibility: '+' },
              { name: 'fechaPrestamo', type: 'Date', visibility: '+' },
              { name: 'fechaDevolucion', type: 'Date', visibility: '+' }
            ],
            methods: [
              { name: 'calcularMulta()', type: 'double', visibility: '+' },
              { name: 'extenderPrestamo()', type: 'void', visibility: '+' }
            ]
          }
        ],
        connections: [
          {
            id: 1,
            from: 1,
            to: 3,
            type: 'oneToMany',
            label: '1:*'
          },
          {
            id: 2,
            from: 2,
            to: 3,
            type: 'oneToMany',
            label: '1:*'
          }
        ]
      };
    }

    if (lowerQuery.includes('hospital') || lowerQuery.includes('medico') || lowerQuery.includes('paciente')) {
      return {
        classes: [
          {
            id: 1,
            name: 'Paciente',
            x: 50,
            y: 50,
            width: 200,
            height: 180,
            fields: [
              { name: 'id', type: 'int', visibility: '+' },
              { name: 'nombre', type: 'String', visibility: '+' },
              { name: 'fechaNacimiento', type: 'Date', visibility: '+' },
              { name: 'telefono', type: 'String', visibility: '+' },
              { name: 'direccion', type: 'String', visibility: '+' }
            ],
            methods: [
              { name: 'agendarCita()', type: 'void', visibility: '+' },
              { name: 'obtenerHistorial()', type: 'List', visibility: '+' }
            ]
          },
          {
            id: 2,
            name: 'Doctor',
            x: 300,
            y: 50,
            width: 200,
            height: 180,
            fields: [
              { name: 'id', type: 'int', visibility: '+' },
              { name: 'nombre', type: 'String', visibility: '+' },
              { name: 'especialidad', type: 'String', visibility: '+' },
              { name: 'licencia', type: 'String', visibility: '+' }
            ],
            methods: [
              { name: 'atenderPaciente()', type: 'void', visibility: '+' },
              { name: 'prescribirMedicamento()', type: 'void', visibility: '+' }
            ]
          },
          {
            id: 3,
            name: 'Cita',
            x: 175,
            y: 280,
            width: 200,
            height: 160,
            fields: [
              { name: 'id', type: 'int', visibility: '+' },
              { name: 'pacienteId', type: 'int', visibility: '+' },
              { name: 'doctorId', type: 'int', visibility: '+' },
              { name: 'fecha', type: 'Date', visibility: '+' },
              { name: 'diagnostico', type: 'String', visibility: '+' }
            ],
            methods: [
              { name: 'confirmarCita()', type: 'boolean', visibility: '+' },
              { name: 'cancelarCita()', type: 'void', visibility: '+' }
            ]
          }
        ],
        connections: [
          {
            id: 1,
            from: 1,
            to: 3,
            type: 'oneToMany',
            label: '1:*'
          },
          {
            id: 2,
            from: 2,
            to: 3,
            type: 'oneToMany',
            label: '1:*'
          }
        ]
      };
    }
    
    // Respuesta genérica
    return {
      classes: [
        {
          id: 1,
          name: 'ClaseGenerada',
          x: 200,
          y: 200,
          width: 200,
          height: 120,
          fields: [
            { name: 'id', type: 'int', visibility: '+' }
          ],
          methods: [
            { name: 'metodo()', type: 'void', visibility: '+' }
          ]
        }
      ]
    };
  }
}

export default new AIService();
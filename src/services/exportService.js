import { VISIBILITY_TYPES } from '../utils/constants';

class ExportService {
  exportDiagram(classes, connections) {
    const diagram = {
      classes,
      connections,
      metadata: {
        created: new Date().toISOString(),
        version: '2.0',
        generator: 'UML Class Diagrams'
      }
    };
    
    const dataStr = JSON.stringify(diagram, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'class-diagram.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  exportAsJavaCode(classes, connections) {
    let code = '// Diagrama de Clases UML - Generado automáticamente\n';
    code += '// Incluye relaciones y clases intermedias\n\n';
    
    classes.forEach(cls => {
      if (cls.isIntermediate) {
        code += `/**\n * Clase intermedia para relación muchos-a-muchos\n */\n`;
      }
      
      code += `public class ${cls.name} {\n`;
      
      // Campos
      if (cls.fields) {
        cls.fields.forEach(field => {
          const visibility = VISIBILITY_TYPES[field.visibility] || 'public';
          code += `    ${visibility} ${field.type} ${field.name};\n`;
        });
      }
      
      if (cls.fields?.length > 0 && cls.methods?.length > 0) code += '\n';
      
      // Constructores
      code += `    public ${cls.name}() {\n        // Constructor por defecto\n    }\n\n`;
      
      // Métodos
      if (cls.methods) {
        cls.methods.forEach(method => {
          const visibility = VISIBILITY_TYPES[method.visibility] || 'public';
          code += `    ${visibility} ${method.type} ${method.name} {\n        // TODO: Implementar lógica\n    }\n\n`;
        });
      }
      
      code += '}\n\n';
    });
    
    // Documentar conexiones
    if (connections.length > 0) {
      code += '/*\n=== RELACIONES DEL DIAGRAMA ===\n';
      connections.forEach(conn => {
        const fromClass = classes.find(c => c.id === conn.from);
        const toClass = classes.find(c => c.id === conn.to);
        if (fromClass && toClass) {
          code += `${fromClass.name} ${conn.label} ${toClass.name}\n`;
        }
      });
      code += '*/\n';
    }
    
    this.downloadFile(code, 'classes.java', 'text/plain');
  }

  exportAsSQLSchema(classes, connections) {
    let sql = '-- Esquema de Base de Datos\n';
    sql += '-- Generado desde Diagrama UML\n\n';
    
    classes.forEach(cls => {
      sql += `CREATE TABLE ${cls.name.toLowerCase()} (\n`;
      
      if (cls.fields) {
        cls.fields.forEach((field, index) => {
          const sqlType = this.mapJavaTypeToSQL(field.type);
          const isPrimaryKey = field.name.toLowerCase() === 'id';
          const constraints = isPrimaryKey ? ' PRIMARY KEY AUTO_INCREMENT' : '';
          const isLast = index === cls.fields.length - 1;
          sql += `    ${field.name} ${sqlType}${constraints}${isLast ? '' : ','}\n`;
        });
      }
      
      sql += ');\n\n';
    });

    // Agregar claves foráneas basadas en conexiones
    connections.forEach(conn => {
      const fromClass = classes.find(c => c.id === conn.from);
      const toClass = classes.find(c => c.id === conn.to);
      if (fromClass && toClass) {
        sql += `ALTER TABLE ${fromClass.name.toLowerCase()}\n`;
        sql += `ADD FOREIGN KEY (${toClass.name.toLowerCase()}_id)\n`;
        sql += `REFERENCES ${toClass.name.toLowerCase()}(id);\n\n`;
      }
    });
    
    this.downloadFile(sql, 'schema.sql', 'text/plain');
  }

  mapJavaTypeToSQL(javaType) {
    const typeMap = {
      'int': 'INTEGER',
      'Integer': 'INTEGER',
      'String': 'VARCHAR(255)',
      'double': 'DECIMAL(10,2)',
      'Double': 'DECIMAL(10,2)',
      'boolean': 'BOOLEAN',
      'Boolean': 'BOOLEAN',
      'Date': 'TIMESTAMP',
      'LocalDate': 'DATE',
      'LocalDateTime': 'TIMESTAMP',
      'long': 'BIGINT',
      'Long': 'BIGINT',
      'float': 'FLOAT',
      'Float': 'FLOAT'
    };
    return typeMap[javaType] || 'VARCHAR(255)';
  }

  downloadFile(content, filename, mimeType) {
    const dataBlob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}

export default new ExportService();
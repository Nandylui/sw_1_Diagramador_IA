import { VISIBILITY_TYPES } from './constants';

export const generateJavaCode = (classes, connections) => {
  let code = '// Diagrama de Clases UML - Generado automáticamente\n';
  code += '// Generado con IA y editor visual\n';
  code += `// Fecha: ${new Date().toLocaleString()}\n\n`;
  
  classes.forEach(cls => {
    // Comentario para clases intermedias
    if (cls.isIntermediate) {
      code += `/**\n`;
      code += ` * Clase intermedia para relación muchos-a-muchos\n`;
      code += ` * Esta clase gestiona la relación entre las entidades conectadas\n`;
      code += ` */\n`;
    }
    
    code += `public class ${cls.name} {\n`;
    
    // Campos/Atributos
    if (cls.fields && cls.fields.length > 0) {
      code += `    // Atributos\n`;
      cls.fields.forEach(field => {
        const visibility = VISIBILITY_TYPES[field.visibility] || 'public';
        code += `    ${visibility} ${field.type} ${field.name};\n`;
      });
      code += '\n';
    }
    
    // Constructor por defecto
    code += `    // Constructor por defecto\n`;
    code += `    public ${cls.name}() {\n`;
    code += `        // Inicialización si es necesaria\n`;
    code += `    }\n\n`;
    
    // Constructor con parámetros si hay campos
    if (cls.fields && cls.fields.length > 0) {
      code += `    // Constructor con parámetros\n`;
      code += `    public ${cls.name}(`;
      const params = cls.fields.map(field => `${field.type} ${field.name}`).join(', ');
      code += params;
      code += `) {\n`;
      cls.fields.forEach(field => {
        code += `        this.${field.name} = ${field.name};\n`;
      });
      code += `    }\n\n`;
    }
    
    // Getters y Setters para campos públicos y privados
    if (cls.fields && cls.fields.length > 0) {
      code += `    // Getters y Setters\n`;
      cls.fields.forEach(field => {
        const capitalizedName = field.name.charAt(0).toUpperCase() + field.name.slice(1);
        
        // Getter
        code += `    public ${field.type} get${capitalizedName}() {\n`;
        code += `        return this.${field.name};\n`;
        code += `    }\n\n`;
        
        // Setter
        code += `    public void set${capitalizedName}(${field.type} ${field.name}) {\n`;
        code += `        this.${field.name} = ${field.name};\n`;
        code += `    }\n\n`;
      });
    }
    
    // Métodos personalizados
    if (cls.methods && cls.methods.length > 0) {
      code += `    // Métodos personalizados\n`;
      cls.methods.forEach(method => {
        const visibility = VISIBILITY_TYPES[method.visibility] || 'public';
        code += `    ${visibility} ${method.type} ${method.name} {\n`;
        code += `        // TODO: Implementar lógica del método\n`;
        
        // Retorno por defecto según el tipo
        if (method.type !== 'void') {
          const defaultReturn = getDefaultReturnValue(method.type);
          code += `        return ${defaultReturn};\n`;
        }
        
        code += `    }\n\n`;
      });
    }
    
    // Métodos estándar (toString, equals, hashCode)
    code += `    // Métodos estándar\n`;
    code += `    @Override\n`;
    code += `    public String toString() {\n`;
    code += `        return "${cls.name}{" +\n`;
    if (cls.fields && cls.fields.length > 0) {
      cls.fields.forEach((field, index) => {
        const isLast = index === cls.fields.length - 1;
        code += `                "${field.name}=" + ${field.name}${isLast ? ' +' : ' + ", " +'}\n`;
      });
    }
    code += `                "}";\n`;
    code += `    }\n\n`;
    
    // Método equals
    code += `    @Override\n`;
    code += `    public boolean equals(Object obj) {\n`;
    code += `        if (this == obj) return true;\n`;
    code += `        if (obj == null || getClass() != obj.getClass()) return false;\n`;
    code += `        ${cls.name} other = (${cls.name}) obj;\n`;
    code += `        // TODO: Implementar comparación de campos\n`;
    code += `        return true;\n`;
    code += `    }\n\n`;
    
    // Método hashCode
    code += `    @Override\n`;
    code += `    public int hashCode() {\n`;
    code += `        // TODO: Implementar hash basado en campos relevantes\n`;
    code += `        return Objects.hash(`;
    if (cls.fields && cls.fields.length > 0) {
      code += cls.fields.map(field => field.name).join(', ');
    }
    code += `);\n`;
    code += `    }\n`;
    
    code += '}\n\n';
  });
  
  // Documentar relaciones
  if (connections && connections.length > 0) {
    code += '/*\n';
    code += '=== DOCUMENTACIÓN DE RELACIONES ===\n\n';
    connections.forEach(conn => {
      const fromClass = classes.find(c => c.id === conn.from);
      const toClass = classes.find(c => c.id === conn.to);
      if (fromClass && toClass) {
        code += `${fromClass.name} ${conn.label} ${toClass.name}\n`;
        code += `  Tipo: ${getRelationshipDescription(conn.type)}\n`;
        code += `  Descripción: ${getRelationshipExplanation(conn.type, fromClass.name, toClass.name)}\n\n`;
      }
    });
    code += '*/\n';
  }
  
  return code;
};

// Generar código C#
export const generateCSharpCode = (classes, connections) => {
  let code = '// Diagrama de Clases UML - Generado automáticamente\n';
  code += '// Generado para C# .NET\n';
  code += `// Fecha: ${new Date().toLocaleString()}\n\n`;
  code += 'using System;\nusing System.Collections.Generic;\nusing System.ComponentModel.DataAnnotations;\n\n';
  
  classes.forEach(cls => {
    if (cls.isIntermediate) {
      code += `/// <summary>\n`;
      code += `/// Clase intermedia para relación muchos-a-muchos\n`;
      code += `/// </summary>\n`;
    }
    
    code += `public class ${cls.name}\n{\n`;
    
    // Propiedades
    if (cls.fields && cls.fields.length > 0) {
      cls.fields.forEach(field => {
        const visibility = field.visibility === '-' ? 'private' : 'public';
        const csharpType = mapJavaToCSharp(field.type);
        
        if (field.name.toLowerCase().includes('id')) {
          code += `    [Key]\n`;
        }
        
        code += `    ${visibility} ${csharpType} ${capitalizeFirst(field.name)} { get; set; }\n`;
      });
      code += '\n';
    }
    
    // Métodos
    if (cls.methods && cls.methods.length > 0) {
      cls.methods.forEach(method => {
        const visibility = VISIBILITY_TYPES[method.visibility] || 'public';
        const csharpType = mapJavaToCSharp(method.type);
        code += `    ${visibility} ${csharpType} ${method.name}\n`;
        code += `    {\n`;
        code += `        // TODO: Implementar lógica\n`;
        if (csharpType !== 'void') {
          code += `        return default(${csharpType});\n`;
        }
        code += `    }\n\n`;
      });
    }
    
    code += '}\n\n';
  });
  
  return code;
};

// Generar esquema SQL
export const generateSQLSchema = (classes, connections) => {
  let sql = '-- Esquema de Base de Datos\n';
  sql += '-- Generado desde Diagrama UML\n';
  sql += `-- Fecha: ${new Date().toLocaleString()}\n\n`;
  
  classes.forEach(cls => {
    sql += `-- Tabla: ${cls.name}\n`;
    sql += `CREATE TABLE ${cls.name.toLowerCase()} (\n`;
    
    if (cls.fields && cls.fields.length > 0) {
      cls.fields.forEach((field, index) => {
        const sqlType = mapJavaTypeToSQL(field.type);
        const isId = field.name.toLowerCase().includes('id');
        const isPrimaryKey = field.name.toLowerCase() === 'id';
        const constraints = isPrimaryKey ? ' PRIMARY KEY AUTO_INCREMENT' : 
                           isId ? ' NOT NULL' : '';
        const isLast = index === cls.fields.length - 1;
        
        sql += `    ${field.name.toLowerCase()} ${sqlType}${constraints}${isLast ? '' : ','}\n`;
      });
    }
    
    sql += ');\n\n';
  });

  // Agregar claves foráneas basadas en conexiones
  if (connections && connections.length > 0) {
    sql += '-- Relaciones (Claves Foráneas)\n';
    connections.forEach(conn => {
      const fromClass = classes.find(c => c.id === conn.from);
      const toClass = classes.find(c => c.id === conn.to);
      
      if (fromClass && toClass && !fromClass.isIntermediate) {
        sql += `ALTER TABLE ${fromClass.name.toLowerCase()}\n`;
        sql += `ADD CONSTRAINT fk_${fromClass.name.toLowerCase()}_${toClass.name.toLowerCase()}\n`;
        sql += `FOREIGN KEY (${toClass.name.toLowerCase()}_id)\n`;
        sql += `REFERENCES ${toClass.name.toLowerCase()}(id)\n`;
        sql += `ON DELETE CASCADE ON UPDATE CASCADE;\n\n`;
      }
    });
  }
  
  return sql;
};

// Utilidades
const getDefaultReturnValue = (type) => {
  const defaults = {
    'int': '0',
    'Integer': '0',
    'long': '0L',
    'Long': '0L',
    'double': '0.0',
    'Double': '0.0',
    'float': '0.0f',
    'Float': '0.0f',
    'boolean': 'false',
    'Boolean': 'false',
    'String': '""',
    'Date': 'new Date()',
    'LocalDate': 'LocalDate.now()',
    'LocalDateTime': 'LocalDateTime.now()',
    'List': 'new ArrayList<>()',
    'ArrayList': 'new ArrayList<>()',
    'Set': 'new HashSet<>()',
    'HashSet': 'new HashSet<>()',
    'Map': 'new HashMap<>()',
    'HashMap': 'new HashMap<>()'
  };
  
  return defaults[type] || 'null';
};

const mapJavaToCSharp = (javaType) => {
  const typeMap = {
    'int': 'int',
    'Integer': 'int?',
    'long': 'long',
    'Long': 'long?',
    'double': 'double',
    'Double': 'double?',
    'float': 'float',
    'Float': 'float?',
    'boolean': 'bool',
    'Boolean': 'bool?',
    'String': 'string',
    'Date': 'DateTime',
    'LocalDate': 'DateTime',
    'LocalDateTime': 'DateTime',
    'List': 'List<object>',
    'ArrayList': 'List<object>',
    'Set': 'HashSet<object>',
    'Map': 'Dictionary<object, object>',
    'void': 'void'
  };
  
  return typeMap[javaType] || 'object';
};

const mapJavaTypeToSQL = (javaType) => {
  const typeMap = {
    'int': 'INTEGER',
    'Integer': 'INTEGER',
    'long': 'BIGINT',
    'Long': 'BIGINT',
    'String': 'VARCHAR(255)',
    'double': 'DECIMAL(10,2)',
    'Double': 'DECIMAL(10,2)',
    'float': 'FLOAT',
    'Float': 'FLOAT',
    'boolean': 'BOOLEAN',
    'Boolean': 'BOOLEAN',
    'Date': 'TIMESTAMP',
    'LocalDate': 'DATE',
    'LocalDateTime': 'TIMESTAMP'
  };
  
  return typeMap[javaType] || 'VARCHAR(255)';
};

const getRelationshipDescription = (type) => {
  switch (type) {
    case 'oneToOne':
      return 'Relación Uno a Uno';
    case 'oneToMany':
      return 'Relación Uno a Muchos';
    case 'manyToMany':
      return 'Relación Muchos a Muchos';
    default:
      return 'Relación';
  }
};

const getRelationshipExplanation = (type, fromClass, toClass) => {
  switch (type) {
    case 'oneToOne':
      return `Cada instancia de ${fromClass} se relaciona con exactamente una instancia de ${toClass}`;
    case 'oneToMany':
      return `Una instancia de ${fromClass} puede relacionarse con múltiples instancias de ${toClass}`;
    case 'manyToMany':
      return `Múltiples instancias de ${fromClass} pueden relacionarse con múltiples instancias de ${toClass}`;
    default:
      return `${fromClass} está relacionado con ${toClass}`;
  }
};

const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export default {
  generateJavaCode,
  generateCSharpCode,
  generateSQLSchema
};
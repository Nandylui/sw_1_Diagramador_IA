import { saveAs } from 'file-saver';

/**
 * Exporta todo el diagrama de clases a un solo archivo .txt
 * con modelos, DTOs, repositorios, servicios y serviceImpl.
 * @param {Array} classes - Array de clases del diagrama
 */
export function exportSpringBoot(classes) {
  if (!classes || classes.length === 0) return;

  let fullContent = '';

  classes.forEach(clase => {
    const className = clase.name;
    const fields = clase.fields || [];
    const methods = clase.methods || [];

    // ====== Modelo ======
    let modelContent = `// ===== Model: ${className} =====\n`;
    modelContent += `package com.example.demo.model;\n\n`;
    modelContent += `import jakarta.persistence.*;\nimport lombok.*;\n\n`;
    modelContent += `@Entity\n@Data\n@NoArgsConstructor\n@AllArgsConstructor\n`;
    modelContent += `public class ${className} {\n\n`;
    modelContent += `    @Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)\n`;
    modelContent += `    private Long id;\n\n`;

    fields.forEach(f => {
      modelContent += `    private ${f.type} ${f.name};\n`;
    });
    modelContent += `}\n\n`;

    // ====== DTO ======
    let dtoContent = `// ===== DTO: ${className}DTO =====\n`;
    dtoContent += `package com.example.demo.dto;\n\n`;
    dtoContent += `import lombok.*;\n\n`;
    dtoContent += `@Data\n@NoArgsConstructor\n@AllArgsConstructor\n`;
    dtoContent += `public class ${className}DTO {\n\n`;
    fields.forEach(f => {
      dtoContent += `    private ${f.type} ${f.name};\n`;
    });
    dtoContent += `}\n\n`;

    // ====== Repositorio ======
    let repoContent = `// ===== Repository: ${className}Repository =====\n`;
    repoContent += `package com.example.demo.repository;\n\n`;
    repoContent += `import com.example.demo.model.${className};\n`;
    repoContent += `import org.springframework.data.jpa.repository.JpaRepository;\n\n`;
    repoContent += `public interface ${className}Repository extends JpaRepository<${className}, Long> {}\n\n`;

    // ====== Servicio ======
    let serviceContent = `// ===== Service: ${className}Service =====\n`;
    serviceContent += `package com.example.demo.service;\n\n`;
    serviceContent += `import com.example.demo.model.${className};\n`;
    serviceContent += `import java.util.List;\n\n`;
    serviceContent += `public interface ${className}Service {\n`;
    serviceContent += `    ${className} save(${className} ${className.toLowerCase()});\n`;
    serviceContent += `    List<${className}> findAll();\n`;
    serviceContent += `    ${className} findById(Long id);\n`;
    serviceContent += `    void deleteById(Long id);\n`;
    serviceContent += `}\n\n`;

    // ====== Servicio Impl ======
    let serviceImplContent = `// ===== ServiceImpl: ${className}ServiceImpl =====\n`;
    serviceImplContent += `package com.example.demo.service.impl;\n\n`;
    serviceImplContent += `import com.example.demo.model.${className};\n`;
    serviceImplContent += `import com.example.demo.repository.${className}Repository;\n`;
    serviceImplContent += `import com.example.demo.service.${className}Service;\n`;
    serviceImplContent += `import org.springframework.stereotype.Service;\nimport java.util.List;\n\n`;
    serviceImplContent += `@Service\npublic class ${className}ServiceImpl implements ${className}Service {\n\n`;
    serviceImplContent += `    private final ${className}Repository repository;\n\n`;
    serviceImplContent += `    public ${className}ServiceImpl(${className}Repository repository) {\n`;
    serviceImplContent += `        this.repository = repository;\n    }\n\n`;
    serviceImplContent += `    @Override\n    public ${className} save(${className} ${className.toLowerCase()}) {\n`;
    serviceImplContent += `        return repository.save(${className.toLowerCase()});\n    }\n\n`;
    serviceImplContent += `    @Override\n    public List<${className}> findAll() {\n        return repository.findAll();\n    }\n\n`;
    serviceImplContent += `    @Override\n    public ${className} findById(Long id) {\n`;
    serviceImplContent += `        return repository.findById(id).orElse(null);\n    }\n\n`;
    serviceImplContent += `    @Override\n    public void deleteById(Long id) {\n        repository.deleteById(id);\n    }\n`;
    serviceImplContent += `}\n\n`;

    // Concatenar todos los contenidos
    fullContent += modelContent + dtoContent + repoContent + serviceContent + serviceImplContent;
  });

  // Descargar en un solo archivo
  const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `springboot_generated_${Date.now()}.txt`);
}

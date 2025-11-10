import { saveAs } from 'file-saver';

/**
 * ✅ VERSIÓN COMPLETA: Genera backend Spring Boot con CRUD REST
 * - Models (entidades JPA)
 * - DTOs (Data Transfer Objects)
 * - Repositories (JPA)
 * - Services (interfaces)
 * - ServiceImpl (implementaciones)
 * - Controllers REST (endpoints CRUD completos)
 * - application.properties
 * - pom.xml
 * - Guía de Postman
 */
export function exportSpringBoot(classes) {
  if (!classes || classes.length === 0) {
    alert('No hay clases para exportar');
    return;
  }

  let fullContent = '';
  fullContent += generateHeader();
  fullContent += generatePomXml();
  fullContent += generateApplicationProperties();
  
  classes.forEach(clase => {
    fullContent += generateModel(clase);
    fullContent += generateDTO(clase);
    fullContent += generateRepository(clase);
    fullContent += generateService(clase);
    fullContent += generateServiceImpl(clase);
    fullContent += generateController(clase);
  });

  fullContent += generateMainApplication();
  fullContent += generatePostmanGuide(classes);

  const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `springboot_complete_${Date.now()}.txt`);
}

// =====================================
// CONFIGURACIÓN DEL PROYECTO
// =====================================

function generateHeader() {
  return `
╔══════════════════════════════════════════════════════════╗
║  SPRING BOOT PROJECT - GENERADO AUTOMÁTICAMENTE         ║
║  Compatible con: Spring Boot 3.x + Java 17+             ║
║  Base de datos: PostgreSQL (configurable)                ║
║  Fecha: ${new Date().toLocaleString()}                    ║
╚══════════════════════════════════════════════════════════╝

📁 ESTRUCTURA DEL PROYECTO:
src/
├── main/
│   ├── java/com/example/demo/
│   │   ├── DemoApplication.java
│   │   ├── model/          (Entidades JPA)
│   │   ├── dto/            (DTOs)
│   │   ├── repository/     (Repositorios)
│   │   ├── service/        (Interfaces de servicio)
│   │   ├── service/impl/   (Implementaciones)
│   │   └── controller/     (REST Controllers)
│   └── resources/
│       └── application.properties
└── pom.xml

═══════════════════════════════════════════════════════════

`;
}

function generatePomXml() {
  return `
// ===== pom.xml =====
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>
    
    <groupId>com.example</groupId>
    <artifactId>demo</artifactId>
    <version>1.0.0</version>
    <name>Generated Project</name>
    
    <properties>
        <java.version>17</java.version>
    </properties>
    
    <dependencies>
        <!-- Spring Boot Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <!-- Spring Boot JPA -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        
        <!-- PostgreSQL Driver -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        
        <!-- Validation -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        
        <!-- Swagger/OpenAPI -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>2.2.0</version>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>

`;
}

function generateApplicationProperties() {
  return `
// ===== application.properties =====
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/demo_db
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Server Configuration
server.port=8080
server.error.include-message=always

# Swagger/OpenAPI
springdoc.api-docs.path=/api-docs
springdoc.swagger-ui.path=/swagger-ui.html

# Logging
logging.level.org.springframework.web=DEBUG
logging.level.org.hibernate.SQL=DEBUG

`;
}

// =====================================
// GENERADORES POR CLASE
// =====================================

function generateModel(clase) {
  const className = clase.name;
  const fields = clase.fields || [];
  
  return `
// ===== Model: ${className}.java =====
package com.example.demo.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "${className.toLowerCase()}s")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ${className} {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

${fields.map(f => `    @Column(name = "${f.name.toLowerCase()}")
    private ${f.type} ${f.name};`).join('\n\n')}

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

`;
}

function generateDTO(clase) {
  const className = clase.name;
  const fields = clase.fields || [];
  
  return `
// ===== DTO: ${className}DTO.java =====
package com.example.demo.dto;

import lombok.*;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ${className}DTO {

${fields.map(f => {
  let validation = '';
  if (f.type === 'String') {
    validation = `    @NotBlank(message = "${f.name} no puede estar vacío")`;
  } else if (f.type === 'int' || f.type === 'Integer' || f.type === 'Long') {
    validation = `    @NotNull(message = "${f.name} es requerido")`;
  }
  return `${validation}\n    private ${f.type} ${f.name};`;
}).join('\n\n')}
}

`;
}

function generateRepository(clase) {
  const className = clase.name;
  
  return `
// ===== Repository: ${className}Repository.java =====
package com.example.demo.repository;

import com.example.demo.model.${className};
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ${className}Repository extends JpaRepository<${className}, Long> {
    // Métodos personalizados pueden agregarse aquí
    // Ejemplo: Optional<${className}> findByNombre(String nombre);
}

`;
}

function generateService(clase) {
  const className = clase.name;
  
  return `
// ===== Service: ${className}Service.java =====
package com.example.demo.service;

import com.example.demo.dto.${className}DTO;
import java.util.List;

public interface ${className}Service {
    ${className}DTO create(${className}DTO dto);
    ${className}DTO update(Long id, ${className}DTO dto);
    ${className}DTO findById(Long id);
    List<${className}DTO> findAll();
    void deleteById(Long id);
}

`;
}

function generateServiceImpl(clase) {
  const className = clase.name;
  const fields = clase.fields || [];
  
  return `
// ===== ServiceImpl: ${className}ServiceImpl.java =====
package com.example.demo.service.impl;

import com.example.demo.dto.${className}DTO;
import com.example.demo.model.${className};
import com.example.demo.repository.${className}Repository;
import com.example.demo.service.${className}Service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ${className}ServiceImpl implements ${className}Service {

    private final ${className}Repository repository;

    @Override
    @Transactional
    public ${className}DTO create(${className}DTO dto) {
        ${className} entity = ${className}.builder()
${fields.map(f => `                .${f.name}(dto.get${capitalize(f.name)}())`).join('\n')}
                .build();
        
        ${className} saved = repository.save(entity);
        return convertToDTO(saved);
    }

    @Override
    @Transactional
    public ${className}DTO update(Long id, ${className}DTO dto) {
        ${className} entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("${className} no encontrado con ID: " + id));
        
${fields.map(f => `        entity.set${capitalize(f.name)}(dto.get${capitalize(f.name)}());`).join('\n')}
        
        ${className} updated = repository.save(entity);
        return convertToDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public ${className}DTO findById(Long id) {
        ${className} entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("${className} no encontrado con ID: " + id));
        return convertToDTO(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<${className}DTO> findAll() {
        return repository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("${className} no encontrado con ID: " + id);
        }
        repository.deleteById(id);
    }

    private ${className}DTO convertToDTO(${className} entity) {
        return ${className}DTO.builder()
${fields.map(f => `                .${f.name}(entity.get${capitalize(f.name)}())`).join('\n')}
                .build();
    }
}

`;
}

function generateController(clase) {
  const className = clase.name;
  const endpoint = className.toLowerCase() + 's';
  
  return `
// ===== Controller: ${className}Controller.java =====
package com.example.demo.controller;

import com.example.demo.dto.${className}DTO;
import com.example.demo.service.${className}Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/${endpoint}")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "${className}", description = "API para gestión de ${endpoint}")
public class ${className}Controller {

    private final ${className}Service service;

    @PostMapping
    @Operation(summary = "Crear nuevo ${className}")
    public ResponseEntity<${className}DTO> create(@Valid @RequestBody ${className}DTO dto) {
        ${className}DTO created = service.create(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Obtener todos los ${endpoint}")
    public ResponseEntity<List<${className}DTO>> getAll() {
        List<${className}DTO> list = service.findAll();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener ${className} por ID")
    public ResponseEntity<${className}DTO> getById(@PathVariable Long id) {
        ${className}DTO dto = service.findById(id);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar ${className}")
    public ResponseEntity<${className}DTO> update(
            @PathVariable Long id,
            @Valid @RequestBody ${className}DTO dto) {
        ${className}DTO updated = service.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar ${className}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

`;
}

function generateMainApplication() {
  return `
// ===== DemoApplication.java =====
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
        System.out.println("\\n✅ Servidor iniciado en: http://localhost:8080");
        System.out.println("📖 Swagger UI: http://localhost:8080/swagger-ui.html");
        System.out.println("📄 API Docs: http://localhost:8080/api-docs\\n");
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*");
            }
        };
    }
}

`;
}

function generatePostmanGuide(classes) {
  let guide = `
╔══════════════════════════════════════════════════════════╗
║           GUÍA DE PRUEBAS CON POSTMAN                    ║
╚══════════════════════════════════════════════════════════╝

📍 BASE URL: http://localhost:8080/api

`;

  classes.forEach(clase => {
    const endpoint = clase.name.toLowerCase() + 's';
    const sampleData = generateSampleJSON(clase);
    
    guide += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 ENDPOINTS PARA: ${clase.name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ CREAR (POST)
   URL: http://localhost:8080/api/${endpoint}
   Método: POST
   Headers: Content-Type: application/json
   Body (raw JSON):
${sampleData}

2️⃣ LISTAR TODOS (GET)
   URL: http://localhost:8080/api/${endpoint}
   Método: GET

3️⃣ OBTENER POR ID (GET)
   URL: http://localhost:8080/api/${endpoint}/1
   Método: GET

4️⃣ ACTUALIZAR (PUT)
   URL: http://localhost:8080/api/${endpoint}/1
   Método: PUT
   Headers: Content-Type: application/json
   Body (raw JSON):
${sampleData}

5️⃣ ELIMINAR (DELETE)
   URL: http://localhost:8080/api/${endpoint}/1
   Método: DELETE

`;
  });

  guide += `
╔══════════════════════════════════════════════════════════╗
║  PASOS PARA EJECUTAR EL PROYECTO                        ║
╚══════════════════════════════════════════════════════════╝

1. Crear base de datos PostgreSQL:
   CREATE DATABASE demo_db;

2. Compilar el proyecto:
   mvn clean install

3. Ejecutar:
   mvn spring-boot:run

4. Probar en Postman o visitar:
   http://localhost:8080/swagger-ui.html

`;

  return guide;
}

// =====================================
// UTILIDADES
// =====================================

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateSampleJSON(clase) {
  const fields = clase.fields || [];
  const sampleObj = {};
  
  fields.forEach(f => {
    if (f.type === 'String') {
      sampleObj[f.name] = `ejemplo_${f.name}`;
    } else if (f.type === 'int' || f.type === 'Integer' || f.type === 'Long') {
      sampleObj[f.name] = 123;
    } else if (f.type === 'boolean' || f.type === 'Boolean') {
      sampleObj[f.name] = true;
    } else if (f.type === 'double' || f.type === 'Double') {
      sampleObj[f.name] = 99.99;
    } else {
      sampleObj[f.name] = `valor_${f.name}`;
    }
  });
  
  return JSON.stringify(sampleObj, null, 4);
}
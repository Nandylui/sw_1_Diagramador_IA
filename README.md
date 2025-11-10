# Diagramador UML de Clases con IA

Una aplicación web completa para crear diagramas UML de clases con funcionalidad de IA integrada, desarrollada en React.

## Características

- **Editor visual de diagramas UML** con drag & drop
- **Tres tipos de relaciones**: 1:1, 1:N, N:M (con clases intermedias automáticas)
- **Generación con IA** usando consultas en lenguaje natural
- **Exportación múltiple**: JSON, Java, C#, SQL
- **Historial completo** (Undo/Redo)
- **Interfaz intuitiva** con panel de propiedades

## Backend(server/ )
## --> Lenguaje: JavaScript(Node.js)
## --> Framework: Express.js
## --> Tecnologia: Express "maneja la ruta para comunicarse con la IA"


## Frontend(src/ )
## --> Lenguaje: JavaScript(React)"encargado del editor visual de diagramas UML"
## --> Framework: React



## Instalación

```bash
# 1. Clonar o crear el proyecto
mkdir uml-class-diagrams
cd uml-class-diagrams

# 2. Crear package.json (copiar desde los archivos proporcionados)
# 3. Instalar dependencias
npm install

# 4. Instalar Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 5. Iniciar el proyecto - PARA EL BACKEN
cd server # primero se mueva a la carpeta server
node index.js # como segundo paso, para iniciar el backend

# 6. Iniciar el proyecto - PARA EL FRONT
npm start


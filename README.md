# React + Vite

# This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

# Currently, two official plugins are available:

# - [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) # uses [Babel](https://babeljs.io/) for Fast Refresh
# - [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

# The React Compiler is not enabled on this template. To add it, see [this documentation](https://react. dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

# If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# Diagramador UML de Clases con IA

Una aplicación web completa para crear diagramas UML de clases con funcionalidad de IA integrada, desarrollada en React.

## ✨ Características

- **Editor visual de diagramas UML** con drag & drop
- **Tres tipos de relaciones**: 1:1, 1:N, N:M (con clases intermedias automáticas)
- **Generación con IA** usando consultas en lenguaje natural
- **Exportación múltiple**: JSON, Java, C#, SQL
- **Historial completo** (Undo/Redo)
- **Interfaz intuitiva** con panel de propiedades

## 🚀 Instalación

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

# 5. Iniciar el proyecto
npm start
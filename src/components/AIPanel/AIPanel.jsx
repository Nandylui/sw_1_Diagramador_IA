// src/components/AIPanel/AIPanel.jsx
import React, { useState } from "react";
import { Sparkles, RefreshCw, Info } from "lucide-react";
import { analyzeDiagramImage } from "../../services/aiImageService";
import { useDiagramContext } from "../../context/DiagramContext";

const AIPanel = ({
  isOpen,
  onClose,
  query,
  setQuery,
  onGenerate,
  isGenerating,
}) => {
  const [showExamples, setShowExamples] = useState(false);
  const [file, setFile] = useState(null); // ✅ para la imagen
  const [isLoadingImage, setLoadingImage] = useState(false); // ✅ estado de carga de imagen
  const { loadDiagram } = useDiagramContext(); // ✅ cargar diagrama al canvas

  if (!isOpen) return null;

  // ✅ Nueva función para analizar imagen UML
  const handleAnalyzeImage = async () => {
    if (!file) return alert("Selecciona una imagen primero");
    try {
      setLoadingImage(true);
      const result = await analyzeDiagramImage(file);
      loadDiagram(result);
      alert("✅ Diagrama generado desde imagen con éxito");
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("❌ Error al procesar la imagen");
    } finally {
      setLoadingImage(false);
    }
  };

  const examples = [
    {
      category: "Clases Básicas",
      items: [
        "Sistema de gestión de colegio con Estudiante y Profesor",
        "Tienda online con Producto, Cliente y Pedido",
        "Biblioteca con Libro, Usuario y Préstamo",
      ],
    },
    {
      category: "Relaciones UML Específicas",
      items: [
        "Clase Estudiante que hereda de Persona (usar generalización)",
        "Clase Universidad que tiene agregación con Departamento",
        "Clase Pedido con composición fuerte de LineaPedido",
        "Interfaz Pagable que es implementada por Factura (realización)",
        "Clase Cliente que depende de ServicioValidacion",
      ],
    },
    {
      category: "Clases Especiales",
      items: [
        "Clase abstracta Empleado con método calcularSalario abstracto",
        "Interfaz Repositorio con estereotipo «repository»",
        "Clase Servicio con estereotipo «service» y método buscar",
        "Clase intermedia para relación muchos a muchos entre Estudiante y Curso",
      ],
    },
    {
      category: "Generación Incremental",
      items: [
        "Agrega clase Administrador que herede de Usuario",
        "Añade clase Dirección con composición a Cliente",
        "Crea interfaz Notificable implementada por Email y SMS",
        "Agrega relación de asociación entre Profesor y Curso",
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] max-w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Sparkles size={20} className="text-purple-500" />
          Generar Diagrama con IA
        </h3>

        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe el sistema que quieres diagramar...&#10;&#10;Ejemplos:&#10;• Sistema de gestión de colegio&#10;• Clase Estudiante que herede de Persona&#10;• Interfaz Repositorio con estereotipo «repository»&#10;• Agrega clase Dirección con composición a Cliente"
          className="w-full h-40 p-3 border rounded resize-none text-sm mb-3"
        />

        {/* Botón para ver ejemplos */}
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm mb-3"
        >
          <Info size={16} />
          {showExamples ? "Ocultar ejemplos" : "Ver ejemplos y guía UML 2.5"}
        </button>

        {/* Panel de ejemplos expandible */}
        {showExamples && (
          <div className="mb-4 p-4 bg-gray-50 rounded border max-h-64 overflow-y-auto">
            <h4 className="font-bold text-sm mb-3 text-gray-700">
              Ejemplos de Prompts UML 2.5
            </h4>

            {examples.map((section, idx) => (
              <div key={idx} className="mb-4">
                <h5 className="font-semibold text-xs text-purple-600 mb-2">
                  {section.category}
                </h5>
                <ul className="space-y-1">
                  {section.items.map((item, i) => (
                    <li key={i}>
                      <button
                        onClick={() => setQuery(item)}
                        className="text-xs text-left hover:text-blue-600 hover:underline w-full text-gray-700"
                      >
                        • {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="mt-4 p-3 bg-blue-50 rounded text-xs">
              <strong className="text-blue-800">💡 Tipos de Relaciones UML:</strong>
              <ul className="mt-2 space-y-1 text-gray-700">
                <li>
                  <strong>Asociación:</strong> Relación simple entre clases
                </li>
                <li>
                  <strong>Agregación:</strong> Todo-parte débil (◇→)
                </li>
                <li>
                  <strong>Composición:</strong> Todo-parte fuerte (◆→)
                </li>
                <li>
                  <strong>Herencia:</strong> "X hereda de Y" (△─)
                </li>
                <li>
                  <strong>Realización:</strong> "X implementa interfaz Y" (△··)
                </li>
                <li>
                  <strong>Dependencia:</strong> "X usa temporalmente Y" (··→)
                </li>
              </ul>
            </div>

            <div className="mt-3 p-3 bg-purple-50 rounded text-xs">
              <strong className="text-purple-800">🎯 Estereotipos Comunes:</strong>
              <ul className="mt-2 space-y-1 text-gray-700">
                <li>«entity» - Entidades de dominio</li>
                <li>«service» - Servicios de negocio</li>
                <li>«repository» - Acceso a datos</li>
                <li>«controller» - Controladores</li>
                <li>«interface» - Interfaces</li>
              </ul>
            </div>
          </div>
        )}

        {/* --- 🔽 Nueva sección: subir imagen UML --- */}
        <div className="border-t mt-4 pt-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            O sube una imagen UML 📸
          </h4>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="mb-2 text-sm"
          />
          <button
            onClick={handleAnalyzeImage}
            disabled={!file || isGenerating || isLoadingImage}
            className="flex items-center gap-2 bg-green-500 text-white p-2 rounded hover:bg-green-600 text-sm"
          >
            {isLoadingImage ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Analizando imagen...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Generar desde Imagen
              </>
            )}
          </button>
        </div>

        {/* --- Botones de acción (texto) --- */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onGenerate(query)}
            disabled={!query.trim() || isGenerating}
            className="flex-1 bg-purple-500 text-white p-2 rounded disabled:bg-gray-400 flex items-center justify-center gap-2 hover:bg-purple-600"
          >
            {isGenerating ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generar Diagrama
              </>
            )}
          </button>
          <button
            onClick={() => {
              onClose();
              setQuery("");
            }}
            className="px-4 py-2 border rounded hover:bg-gray-50"
            disabled={isGenerating || isLoadingImage}
          >
            Cancelar
          </button>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          <strong>💡 Tip:</strong> Sé específico sobre el tipo de relación que
          necesitas. Si ya tienes clases, puedes agregar nuevas sin perder las
          existentes.
        </div>
      </div>
    </div>
  );
};

export default AIPanel;

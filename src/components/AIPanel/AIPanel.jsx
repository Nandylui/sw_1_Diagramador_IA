import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

const AIPanel = ({ 
  isOpen, 
  onClose, 
  query, 
  setQuery, 
  onGenerate, 
  isGenerating 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Sparkles size={20} className="text-purple-500" />
          Generar Diagrama con IA
        </h3>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe el sistema que quieres diagramar:&#10;&#10;Ejemplos:&#10;• Sistema de gestión de colegio&#10;• Tienda online con productos y ventas&#10;• Biblioteca con préstamos de libros&#10;• Sistema de hospital&#10;• Red social básica&#10;• Sistema de reservas de hotel"
          className="w-full h-40 p-3 border rounded resize-none text-sm"
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onGenerate(query)}
            disabled={!query.trim() || isGenerating}
            className="flex-1 bg-purple-500 text-white p-2 rounded disabled:bg-gray-400 flex items-center justify-center gap-2"
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
              setQuery('');
            }}
            className="px-4 py-2 border rounded hover:bg-gray-50"
            disabled={isGenerating}
          >
            Cancelar
          </button>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          💡 <strong>Tip:</strong> Sé específico sobre el tipo de sistema. Menciona las entidades principales que quieres incluir.
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
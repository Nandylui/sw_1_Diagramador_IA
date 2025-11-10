// src/components/Toolbar/Toolbar.jsx
import React, { useState } from 'react';
import { Plus, Move, Link, FileText, Sparkles, X } from 'lucide-react';

const Toolbar = ({
  selectedTool,
  setSelectedTool,
  relationshipType,
  setRelationshipType,
  relationshipTypes,
  onShowAIPanel,
  onExportCode,
  onAddClass
}) => {
  const [showRelationshipMenu, setShowRelationshipMenu] = useState(false);

  // ✅ Símbolos UML precisos para el menú
  const RelationshipSymbol = ({ type }) => {
    switch (type) {
      case 'association':
        return (
          <svg width="80" height="30" viewBox="0 0 80 30">
            <line x1="10" y1="15" x2="60" y2="15" stroke="black" strokeWidth="2"/>
            <line x1="50" y1="10" x2="60" y2="15" stroke="black" strokeWidth="2"/>
            <line x1="50" y1="20" x2="60" y2="15" stroke="black" strokeWidth="2"/>
          </svg>
        );
      
      case 'aggregation':
        return (
          <svg width="80" height="30" viewBox="0 0 80 30">
            <line x1="35" y1="15" x2="70" y2="15" stroke="black" strokeWidth="2"/>
            <polygon 
              points="10,15 18,11 26,15 18,19" 
              stroke="black" 
              strokeWidth="2" 
              fill="white"
            />
          </svg>
        );
      
      case 'composition':
        return (
          <svg width="80" height="30" viewBox="0 0 80 30">
            <line x1="35" y1="15" x2="70" y2="15" stroke="black" strokeWidth="2"/>
            <polygon 
              points="10,15 18,11 26,15 18,19" 
              stroke="black" 
              strokeWidth="2" 
              fill="black"
            />
          </svg>
        );
      
      case 'generalization':
        return (
          <svg width="80" height="30" viewBox="0 0 80 30">
            <line x1="10" y1="15" x2="50" y2="15" stroke="black" strokeWidth="2"/>
            <polygon 
              points="60,15 50,10 50,20" 
              stroke="black" 
              strokeWidth="2" 
              fill="white"
            />
          </svg>
        );
      
      case 'realization':
        return (
          <svg width="80" height="30" viewBox="0 0 80 30">
            <line 
              x1="10" y1="15" x2="50" y2="15" 
              stroke="black" 
              strokeWidth="2"
              strokeDasharray="5,3"
            />
            <polygon 
              points="60,15 50,10 50,20" 
              stroke="black" 
              strokeWidth="2" 
              fill="white"
            />
          </svg>
        );
      
      case 'dependency':
        return (
          <svg width="80" height="30" viewBox="0 0 80 30">
            <line 
              x1="10" y1="15" x2="60" y2="15" 
              stroke="black" 
              strokeWidth="2"
              strokeDasharray="5,3"
            />
            <line x1="50" y1="10" x2="60" y2="15" stroke="black" strokeWidth="2"/>
            <line x1="50" y1="20" x2="60" y2="15" stroke="black" strokeWidth="2"/>
          </svg>
        );
      
      case 'oneToOne':
        return (
          <svg width="80" height="30" viewBox="0 0 80 30">
            <line x1="10" y1="15" x2="70" y2="15" stroke="black" strokeWidth="2"/>
            <text x="40" y="12" fontSize="11" textAnchor="middle" fontWeight="bold">1:1</text>
          </svg>
        );
      
      case 'oneToMany':
        return (
          <svg width="80" height="30" viewBox="0 0 80 30">
            <line x1="10" y1="15" x2="70" y2="15" stroke="black" strokeWidth="2"/>
            <text x="40" y="12" fontSize="11" textAnchor="middle" fontWeight="bold">1:*</text>
          </svg>
        );
      
      case 'manyToMany':
        return (
          <svg width="80" height="30" viewBox="0 0 80 30">
            <line x1="10" y1="15" x2="70" y2="15" stroke="black" strokeWidth="2"/>
            <text x="40" y="12" fontSize="11" textAnchor="middle" fontWeight="bold">*:*</text>
          </svg>
        );
      
      default:
        return null;
    }
  };

  const RelationshipOption = ({ type, data }) => {
    return (
      <button
        onClick={() => {
          setRelationshipType(type);
          setShowRelationshipMenu(false);
        }}
        className={`w-full p-3 text-left hover:bg-blue-50 flex items-center gap-3 border-b transition-colors ${
          relationshipType === type ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
        }`}
      >
        <div className="flex-shrink-0">
          <RelationshipSymbol type={type} />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-gray-800">{data.label}</div>
          <div className="text-xs text-gray-600 mt-1">{data.description}</div>
        </div>
        {relationshipType === type && (
          <div className="text-blue-500">✓</div>
        )}
      </button>
    );
  };

  return (
    <div className="bg-white shadow-md p-4 flex gap-4 items-center flex-wrap relative border-b-2 border-gray-200">
      {/* Herramienta: Mover */}
      <button
        onClick={() => setSelectedTool('move')}
        className={`p-2 rounded transition-colors ${
          selectedTool === 'move' 
            ? 'bg-blue-500 text-white shadow-md' 
            : 'bg-gray-200 hover:bg-gray-300'
        }`}
        title="Mover clases (arrastra las clases)"
      >
        <Move size={20} />
      </button>

      {/* Herramienta: Agregar Clase */}
      <button
        onClick={() => {
          setSelectedTool('class');
          if (typeof onAddClass === 'function') onAddClass();
        }}
        className={`p-2 rounded transition-colors ${
          selectedTool === 'class' 
            ? 'bg-blue-500 text-white shadow-md' 
            : 'bg-gray-200 hover:bg-gray-300'
        }`}
        title="Agregar nueva clase"
      >
        <Plus size={20} />
      </button>

      {/* Herramienta: Conectar */}
      <button
        onClick={() => {
          setSelectedTool('connect');
          setShowRelationshipMenu(!showRelationshipMenu);
        }}
        className={`p-2 rounded transition-colors ${
          selectedTool === 'connect' 
            ? 'bg-blue-500 text-white shadow-md' 
            : 'bg-gray-200 hover:bg-gray-300'
        }`}
        title="Conectar clases con relaciones UML"
      >
        <Link size={20} />
      </button>

      {/* ✅ Menú desplegable de relaciones UML - Mejorado */}
      {selectedTool === 'connect' && showRelationshipMenu && (
        <div className="absolute top-16 left-40 bg-white border-2 border-gray-300 rounded-lg shadow-2xl z-50 w-96 max-h-[500px] overflow-y-auto">
          {/* Header del menú */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 flex items-center justify-between sticky top-0">
            <div className="text-white font-bold text-sm flex items-center gap-2">
              <Link size={16} />
              Seleccionar Tipo de Relación UML
            </div>
            <button 
              onClick={() => setShowRelationshipMenu(false)}
              className="text-white hover:bg-blue-700 rounded p-1"
            >
              <X size={16} />
            </button>
          </div>
          
          {/* Opciones de relaciones */}
          {Object.entries(relationshipTypes).map(([key, data]) => (
            <RelationshipOption key={key} type={key} data={data} />
          ))}
          
          {/* Footer con tip */}
          <div className="bg-gray-50 p-3 text-xs text-gray-600 border-t">
            <strong>💡 Tip:</strong> Selecciona el tipo de relación, luego haz click en la clase origen y después en la clase destino.
          </div>
        </div>
      )}

      {/* Indicador visual de relación seleccionada */}
      {selectedTool === 'connect' && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded border border-blue-300">
          <div className="w-16">
            <RelationshipSymbol type={relationshipType} />
          </div>
          <span className="text-xs font-medium text-blue-800">
            {relationshipTypes[relationshipType]?.label || 'Relación'}
          </span>
        </div>
      )}

      <div className="flex-1"></div>

      {/* Botón IA */}
      <button
        onClick={onShowAIPanel}
        className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded flex items-center gap-2 hover:from-purple-600 hover:to-purple-700 shadow-md transition-all"
        title="Generar diagrama con Inteligencia Artificial"
      >
        <Sparkles size={20} />
        <span className="text-sm font-medium">Generar con IA</span>
      </button>

      {/* Botón Exportar */}
      <button 
        onClick={onExportCode} 
        className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded hover:from-orange-600 hover:to-orange-700 shadow-md transition-all flex items-center gap-2" 
        title="Exportar código Spring Boot"
      >
        <FileText size={20} />
        <span className="text-sm font-medium hidden sm:inline">Exportar</span>
      </button>

      {/* Botón de ayuda - Leyenda UML */}
      <button
        onClick={() => {
          const modal = document.createElement('div');
          modal.innerHTML = `
            <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;">
              <div style="background: white; padding: 30px; rounded: 10px; max-width: 600px; max-height: 80vh; overflow-y: auto; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #1e40af;">📚 Leyenda de Símbolos UML 2.5</h2>
                
                <div style="margin-bottom: 20px;">
                  <h3 style="font-weight: bold; margin-bottom: 10px; color: #4b5563;">Relaciones UML:</h3>
                  <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 15px; padding: 10px; background: #f3f4f6; border-radius: 6px;">
                      <strong>→ Asociación:</strong> Relación simple entre clases<br>
                      <small style="color: #6b7280;">Ej: Cliente → Pedido</small>
                    </li>
                    <li style="margin-bottom: 15px; padding: 10px; background: #f3f4f6; border-radius: 6px;">
                      <strong>◇→ Agregación:</strong> Todo-parte débil (la parte puede existir sin el todo)<br>
                      <small style="color: #6b7280;">Ej: Universidad ◇→ Departamento</small>
                    </li>
                    <li style="margin-bottom: 15px; padding: 10px; background: #f3f4f6; border-radius: 6px;">
                      <strong>◆→ Composición:</strong> Todo-parte fuerte (la parte NO existe sin el todo)<br>
                      <small style="color: #6b7280;">Ej: Pedido ◆→ LineaPedido</small>
                    </li>
                    <li style="margin-bottom: 15px; padding: 10px; background: #f3f4f6; border-radius: 6px;">
                      <strong>△─ Herencia:</strong> La clase hija hereda de la padre<br>
                      <small style="color: #6b7280;">Ej: Estudiante △─ Persona</small>
                    </li>
                    <li style="margin-bottom: 15px; padding: 10px; background: #f3f4f6; border-radius: 6px;">
                      <strong>△··· Realización:</strong> Implementación de interfaz<br>
                      <small style="color: #6b7280;">Ej: Clase △··· Interfaz</small>
                    </li>
                    <li style="margin-bottom: 15px; padding: 10px; background: #f3f4f6; border-radius: 6px;">
                      <strong>···→ Dependencia:</strong> Uso temporal<br>
                      <small style="color: #6b7280;">Ej: Controlador ···→ Servicio</small>
                    </li>
                  </ul>
                </div>
                
                <button onclick="this.parentElement.parentElement.remove()" style="width: 100%; padding: 12px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
                  Cerrar
                </button>
              </div>
            </div>
          `;
          document.body.appendChild(modal);
        }}
        className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-bold"
        title="Ver leyenda de símbolos UML"
      >
        ?
      </button>
    </div>
  );
};

export default Toolbar;

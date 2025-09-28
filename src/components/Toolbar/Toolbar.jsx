import React from 'react';
import { Plus, Move, Link, Save, FileText, Upload, Sparkles } from 'lucide-react';

const Toolbar = ({
  selectedTool,
  setSelectedTool,
  relationshipType,
  setRelationshipType,
  relationshipTypes,
  onShowAIPanel,
  onExportDiagram,
  onExportCode,
  onImportDiagram,
  onAddClass
}) => {
  return (
    <div className="bg-white shadow-md p-4 flex gap-4 items-center flex-wrap">
      <button
        onClick={() => setSelectedTool('move')}
        className={`p-2 rounded ${selectedTool === 'move' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        title="Mover"
      >
        <Move size={20} />
      </button>

      <button
        onClick={() => {
          setSelectedTool('class');
          if (typeof onAddClass === 'function') onAddClass();
        }}
        className={`p-2 rounded ${selectedTool === 'class' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        title="Agregar Clase"
      >
        <Plus size={20} />
      </button>

      <button
        onClick={() => setSelectedTool('connect')}
        className={`p-2 rounded ${selectedTool === 'connect' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        title="Conectar Clases"
      >
        <Link size={20} />
      </button>

      {selectedTool === 'connect' && (
        <select
          value={relationshipType}
          onChange={(e) => setRelationshipType(e.target.value)}
          className="p-2 border rounded bg-white"
        >
          {Object.entries(relationshipTypes).map(([key, type]) => (
            <option key={key} value={key}>{type.label}</option>
          ))}
        </select>
      )}

      <div className="flex-1"></div>

      <button
        onClick={onShowAIPanel}
        className="p-2 bg-purple-500 text-white rounded flex items-center gap-2"
        title="Generar con IA"
      >
        <Sparkles size={20} />
        IA
      </button>

      <div className="flex gap-2">
        <label className="p-2 bg-green-500 text-white rounded cursor-pointer" title="Importar">
          <Upload size={20} />
          <input type="file" accept=".json" onChange={onImportDiagram} className="hidden" />
        </label>
        <button onClick={onExportDiagram} className="p-2 bg-blue-500 text-white rounded" title="Exportar JSON">
          <Save size={20} />
        </button>
        <button onClick={onExportCode} className="p-2 bg-orange-500 text-white rounded" title="Exportar Código">
          <FileText size={20} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;

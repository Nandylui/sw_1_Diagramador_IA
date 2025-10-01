import React from 'react';

const PropertyPanel = ({
  selectedClass,
  classes,
  onUpdateClass,
  onAddField,
  onAddMethod,
  onRemoveField,
  onRemoveMethod,
  onRemoveClass
}) => {
  if (!selectedClass) return null;
  const cls = classes.find(c => c.id === selectedClass);
  if (!cls) return null;

  return (
    <div className="w-80 bg-white border-l border-gray-300 p-4 overflow-y-auto">
      <h3 className="font-bold mb-4">Propiedades de la Clase</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Nombre:</label>
        <input
          type="text"
          value={cls.name}
          onChange={(e) => onUpdateClass(cls.id, { name: e.target.value })}
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        onClick={() => onRemoveClass(cls.id)}
        className="w-full p-2 bg-red-600 text-white rounded hover:bg-red-800 mb-4"
      >
        Eliminar Clase
      </button>

      {/* Campos */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium">Campos:</h4>
          <button
            onClick={() => onAddField(cls.id)}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            + Agregar
          </button>
        </div>

        {cls.fields?.length > 0 ? (
          cls.fields.map((field, index) => (
            <div key={index} className="flex gap-2 mb-2 items-center">
              <span>{field.visibility} {field.name}: {field.type}</span>
              <button
                onClick={() => onRemoveField(cls.id, index)}
                className="p-1 bg-red-500 text-white rounded text-xs hover:bg-red-700"
              >
                X
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No hay campos</p>
        )}
      </div>

      {/* Métodos */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium">Métodos:</h4>
          <button
            onClick={() => onAddMethod(cls.id)}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            + Agregar
          </button>
        </div>

        {cls.methods?.length > 0 ? (
          cls.methods.map((method, index) => (
            <div key={index} className="flex gap-2 mb-2 items-center">
              <span>{method.visibility} {method.name}: {method.type}</span>
              <button
                onClick={() => onRemoveMethod(cls.id, index)}
                className="p-1 bg-red-500 text-white rounded text-xs hover:bg-red-700"
              >
                X
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No hay métodos</p>
        )}
      </div>
    </div>
  );
};

export default PropertyPanel;

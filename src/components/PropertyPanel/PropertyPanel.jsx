import React, { useState } from 'react';

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
  // Hooks siempre al inicio
  const [fieldToDelete, setFieldToDelete] = useState('');
  const [methodToDelete, setMethodToDelete] = useState('');

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

      <div className="mb-4">
        <button
          onClick={() => onRemoveClass(cls.id)}
          className="w-full p-2 bg-red-600 text-white rounded hover:bg-red-800"
        >
          Eliminar Clase
        </button>
      </div>

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

        {cls.fields && cls.fields.length > 0 && (
          <>
            {cls.fields.map((field, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <select
                  value={field.visibility}
                  onChange={(e) => {
                    const newFields = [...cls.fields];
                    newFields[index].visibility = e.target.value;
                    onUpdateClass(cls.id, { fields: newFields });
                  }}
                  className="w-12 p-1 border rounded text-sm"
                >
                  <option value="+">+</option>
                  <option value="-">-</option>
                  <option value="#">#</option>
                </select>

                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => {
                    const newFields = [...cls.fields];
                    newFields[index].name = e.target.value;
                    onUpdateClass(cls.id, { fields: newFields });
                  }}
                  className="flex-1 p-1 border rounded text-sm"
                  placeholder="Nombre"
                />

                <input
                  type="text"
                  value={field.type}
                  onChange={(e) => {
                    const newFields = [...cls.fields];
                    newFields[index].type = e.target.value;
                    onUpdateClass(cls.id, { fields: newFields });
                  }}
                  className="w-20 p-1 border rounded text-sm"
                  placeholder="Tipo"
                />
              </div>
            ))}

            <div className="flex gap-2 mt-2">
              <select
                value={fieldToDelete}
                onChange={(e) => setFieldToDelete(e.target.value)}
                className="flex-1 p-1 border rounded text-sm"
              >
                <option value="">Seleccionar campo...</option>
                {cls.fields.map((f, idx) => (
                  <option key={idx} value={idx}>{f.name}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (fieldToDelete !== '') {
                    onRemoveField(cls.id, parseInt(fieldToDelete));
                    setFieldToDelete('');
                  }
                }}
                className="p-1 bg-red-600 text-white rounded hover:bg-red-800 text-sm"
              >
                Eliminar
              </button>
            </div>
          </>
        )}
      </div>

      {/* Métodos */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium">Métodos:</h4>
          <button
            onClick={() => onAddMethod(cls.id)}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            + Agregar
          </button>
        </div>

        {cls.methods && cls.methods.length > 0 && (
          <>
            {cls.methods.map((method, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <select
                  value={method.visibility}
                  onChange={(e) => {
                    const newMethods = [...cls.methods];
                    newMethods[index].visibility = e.target.value;
                    onUpdateClass(cls.id, { methods: newMethods });
                  }}
                  className="w-12 p-1 border rounded text-sm"
                >
                  <option value="+">+</option>
                  <option value="-">-</option>
                  <option value="#">#</option>
                </select>

                <input
                  type="text"
                  value={method.name}
                  onChange={(e) => {
                    const newMethods = [...cls.methods];
                    newMethods[index].name = e.target.value;
                    onUpdateClass(cls.id, { methods: newMethods });
                  }}
                  className="flex-1 p-1 border rounded text-sm"
                  placeholder="Método()"
                />

                <input
                  type="text"
                  value={method.type}
                  onChange={(e) => {
                    const newMethods = [...cls.methods];
                    newMethods[index].type = e.target.value;
                    onUpdateClass(cls.id, { methods: newMethods });
                  }}
                  className="w-20 p-1 border rounded text-sm"
                  placeholder="Tipo"
                />
              </div>
            ))}

            <div className="flex gap-2 mt-2">
              <select
                value={methodToDelete}
                onChange={(e) => setMethodToDelete(e.target.value)}
                className="flex-1 p-1 border rounded text-sm"
              >
                <option value="">Seleccionar método...</option>
                {cls.methods.map((m, idx) => (
                  <option key={idx} value={idx}>{m.name}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (methodToDelete !== '') {
                    onRemoveMethod(cls.id, parseInt(methodToDelete));
                    setMethodToDelete('');
                  }
                }}
                className="p-1 bg-red-600 text-white rounded hover:bg-red-800 text-sm"
              >
                Eliminar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PropertyPanel;

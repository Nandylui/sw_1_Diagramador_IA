// src/components/PropertyPanel/PropertyPanel.jsx
import React, { useState } from 'react';
import { COMMON_STEREOTYPES, COMMON_DATA_TYPES, VISIBILITY_TYPES } from '../../utils/constants';

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
  const [editingField, setEditingField] = useState(null);
  const [editingMethod, setEditingMethod] = useState(null);

  if (!selectedClass) return null;
  const cls = classes.find(c => c.id === selectedClass);
  if (!cls) return null;

  // ✅ Actualizar campo específico
  const updateField = (index, updates) => {
    const updatedFields = cls.fields.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    );
    onUpdateClass(cls.id, { fields: updatedFields });
  };

  // ✅ Actualizar método específico
  const updateMethod = (index, updates) => {
    const updatedMethods = cls.methods.map((method, i) => 
      i === index ? { ...method, ...updates } : method
    );
    onUpdateClass(cls.id, { methods: updatedMethods });
  };

  // ✅ Agregar parámetro a método
  const addParameter = (methodIndex) => {
    const updatedMethods = cls.methods.map((method, i) => {
      if (i === methodIndex) {
        return {
          ...method,
          parameters: [
            ...(method.parameters || []),
            { name: 'param', type: 'String' }
          ]
        };
      }
      return method;
    });
    onUpdateClass(cls.id, { methods: updatedMethods });
  };

  // ✅ Eliminar parámetro de método
  const removeParameter = (methodIndex, paramIndex) => {
    const updatedMethods = cls.methods.map((method, i) => {
      if (i === methodIndex) {
        return {
          ...method,
          parameters: method.parameters.filter((_, pi) => pi !== paramIndex)
        };
      }
      return method;
    });
    onUpdateClass(cls.id, { methods: updatedMethods });
  };

  return (
    <div className="w-80 bg-white border-l border-gray-300 p-4 overflow-y-auto">
      <h3 className="font-bold mb-4 text-lg">Propiedades de la Clase</h3>

      {/* Nombre de la clase */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Nombre:</label>
        <input
          type="text"
          value={cls.name}
          onChange={(e) => onUpdateClass(cls.id, { name: e.target.value })}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* ✅ UML 2.5: Estereotipo */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Estereotipo:</label>
        <select
          value={cls.stereotype || ''}
          onChange={(e) => onUpdateClass(cls.id, { 
            stereotype: e.target.value || null 
          })}
          className="w-full p-2 border rounded"
        >
          <option value="">Sin estereotipo</option>
          {COMMON_STEREOTYPES.map(st => (
            <option key={st} value={st}>«{st}»</option>
          ))}
        </select>
      </div>

      {/* ✅ UML 2.5: Modificadores de clase */}
      <div className="mb-4 flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={cls.isAbstract || false}
            onChange={(e) => onUpdateClass(cls.id, { 
              isAbstract: e.target.checked 
            })}
          />
          <span className="text-sm">Abstracta</span>
        </label>
        
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={cls.isInterface || false}
            onChange={(e) => onUpdateClass(cls.id, { 
              isInterface: e.target.checked 
            })}
          />
          <span className="text-sm">Interfaz</span>
        </label>
      </div>

      {/* Botón eliminar clase */}
      <button
        onClick={() => onRemoveClass(cls.id)}
        className="w-full p-2 bg-red-600 text-white rounded hover:bg-red-800 mb-4"
      >
        Eliminar Clase
      </button>

      <hr className="my-4" />

      {/* ===== CAMPOS/ATRIBUTOS ===== */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium">Atributos:</h4>
          <button
            onClick={() => onAddField(cls.id)}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            + Agregar
          </button>
        </div>

        {cls.fields?.length > 0 ? (
          cls.fields.map((field, index) => (
            <div key={index} className="mb-3 p-2 border rounded bg-gray-50">
              {editingField === index ? (
                // Modo edición
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={field.visibility}
                      onChange={(e) => updateField(index, { visibility: e.target.value })}
                      className="w-16 p-1 border rounded text-sm"
                    >
                      {Object.entries(VISIBILITY_TYPES).map(([symbol, name]) => (
                        <option key={symbol} value={symbol}>
                          {symbol} ({name})
                        </option>
                      ))}
                    </select>
                    
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateField(index, { name: e.target.value })}
                      placeholder="nombre"
                      className="flex-1 p-1 border rounded text-sm"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <select
                      value={field.type}
                      onChange={(e) => updateField(index, { type: e.target.value })}
                      className="flex-1 p-1 border rounded text-sm"
                    >
                      {COMMON_DATA_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={field.multiplicity || ''}
                      onChange={(e) => updateField(index, { multiplicity: e.target.value || null })}
                      placeholder="Multiplicidad (ej: 0..1)"
                      className="flex-1 p-1 border rounded text-sm"
                    />
                    
                    <input
                      type="text"
                      value={field.defaultValue || ''}
                      onChange={(e) => updateField(index, { defaultValue: e.target.value || null })}
                      placeholder="Valor por defecto"
                      className="flex-1 p-1 border rounded text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingField(null)}
                      className="flex-1 p-1 bg-green-500 text-white rounded text-xs"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => onRemoveField(cls.id, index)}
                      className="p-1 bg-red-500 text-white rounded text-xs px-3"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                // Modo vista
                <div 
                  onClick={() => setEditingField(index)}
                  className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                >
                  <div className="text-sm font-mono">
                    {field.visibility} {field.name}: {field.type}
                    {field.multiplicity && ` [${field.multiplicity}]`}
                    {field.defaultValue && ` = ${field.defaultValue}`}
                  </div>
                  <div className="text-xs text-gray-500">Click para editar</div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No hay atributos</p>
        )}
      </div>

      <hr className="my-4" />

      {/* ===== MÉTODOS ===== */}
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
            <div key={index} className="mb-3 p-2 border rounded bg-gray-50">
              {editingMethod === index ? (
                // Modo edición
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={method.visibility}
                      onChange={(e) => updateMethod(index, { visibility: e.target.value })}
                      className="w-16 p-1 border rounded text-sm"
                    >
                      {Object.entries(VISIBILITY_TYPES).map(([symbol, name]) => (
                        <option key={symbol} value={symbol}>
                          {symbol} ({name})
                        </option>
                      ))}
                    </select>
                    
                    <input
                      type="text"
                      value={method.name}
                      onChange={(e) => updateMethod(index, { name: e.target.value })}
                      placeholder="nombre"
                      className="flex-1 p-1 border rounded text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={method.type}
                      onChange={(e) => updateMethod(index, { type: e.target.value })}
                      className="flex-1 p-1 border rounded text-sm"
                    >
                      {COMMON_DATA_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={method.isAbstract || false}
                      onChange={(e) => updateMethod(index, { isAbstract: e.target.checked })}
                    />
                    Método abstracto
                  </label>

                  {/* Parámetros */}
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium">Parámetros:</span>
                      <button
                        onClick={() => addParameter(index)}
                        className="text-xs text-blue-500"
                      >
                        + Param
                      </button>
                    </div>
                    
                    {method.parameters?.map((param, pIndex) => (
                      <div key={pIndex} className="flex gap-1 mb-1">
                        <input
                          type="text"
                          value={param.name}
                          onChange={(e) => {
                            const updated = cls.methods.map((m, i) => {
                              if (i === index) {
                                return {
                                  ...m,
                                  parameters: m.parameters.map((p, pi) =>
                                    pi === pIndex ? { ...p, name: e.target.value } : p
                                  )
                                };
                              }
                              return m;
                            });
                            onUpdateClass(cls.id, { methods: updated });
                          }}
                          placeholder="nombre"
                          className="flex-1 p-1 border rounded text-xs"
                        />
                        <input
                          type="text"
                          value={param.type}
                          onChange={(e) => {
                            const updated = cls.methods.map((m, i) => {
                              if (i === index) {
                                return {
                                  ...m,
                                  parameters: m.parameters.map((p, pi) =>
                                    pi === pIndex ? { ...p, type: e.target.value } : p
                                  )
                                };
                              }
                              return m;
                            });
                            onUpdateClass(cls.id, { methods: updated });
                          }}
                          placeholder="tipo"
                          className="flex-1 p-1 border rounded text-xs"
                        />
                        <button
                          onClick={() => removeParameter(index, pIndex)}
                          className="p-1 bg-red-400 text-white rounded text-xs px-2"
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingMethod(null)}
                      className="flex-1 p-1 bg-green-500 text-white rounded text-xs"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => onRemoveMethod(cls.id, index)}
                      className="p-1 bg-red-500 text-white rounded text-xs px-3"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                // Modo vista
                <div 
                  onClick={() => setEditingMethod(index)}
                  className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                >
                  <div className={`text-sm font-mono ${method.isAbstract ? 'italic' : ''}`}>
                    {method.visibility} {method.name}
                    {!method.name.includes('(') && '('}
                    {method.parameters?.map((p, i) => (
                      <span key={i}>
                        {i > 0 ? ', ' : ''}
                        {p.name}: {p.type}
                      </span>
                    ))}
                    {!method.name.includes(')') && ')'}
                    : {method.type}
                  </div>
                  <div className="text-xs text-gray-500">Click para editar</div>
                </div>
              )}
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

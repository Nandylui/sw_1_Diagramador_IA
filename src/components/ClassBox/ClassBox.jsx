import React from 'react';

const ClassBox = ({ 
  cls, 
  isConnecting, 
  onMouseDown, 
  onClick 
}) => {
  return (
    <div
      className={`absolute border-2 border-gray-800 cursor-pointer select-none ${
        cls.isIntermediate ? 'bg-orange-100' : 'bg-yellow-100'
      } ${isConnecting ? 'ring-4 ring-blue-500' : ''}`}
      style={{
        left: cls.x,
        top: cls.y,
        width: cls.width,
        minHeight: cls.height
      }}
      onMouseDown={(e) => onMouseDown(e, cls)}
      onClick={(e) => {
        e.stopPropagation();
        onClick(cls); // <-- enviar clase completa
      }}
    >
      {/* Nombre de la clase */}
      <div className={`p-2 text-center font-bold border-b border-gray-800 ${
        cls.isIntermediate ? 'bg-orange-200' : 'bg-yellow-200'
      }`}>
        {cls.name}
        {cls.isIntermediate && (
          <div className="text-xs text-gray-600">(Clase Intermedia)</div>
        )}
      </div>
      
      {/* Campos */}
      {cls.fields && cls.fields.length > 0 && (
        <div className="p-2 border-b border-gray-800">
          {cls.fields.map((field, index) => (
            <div key={index} className="text-sm">
              {field.visibility} {field.name}: {field.type}
            </div>
          ))}
        </div>
      )}
      
      {/* Métodos */}
      {cls.methods && cls.methods.length > 0 && (
        <div className="p-2">
          {cls.methods.map((method, index) => (
            <div key={index} className="text-sm">
              {method.visibility} {method.name}: {method.type}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassBox;

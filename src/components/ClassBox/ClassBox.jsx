// src/components/ClassBox/ClassBox.jsx
import React from 'react';

const ClassBox = ({ 
  cls, 
  isConnecting, 
  onMouseDown, 
  onClick 
}) => {
  // Helper para símbolos de visibilidad UML 2.5
  const getVisibilitySymbol = (visibility) => {
    const symbols = {
      '+': '+',  // public
      '-': '-',  // private
      '#': '#',  // protected
      '~': '~'   // package
    };
    return symbols[visibility] || '+';
  };

  // Determinar el color de fondo según el tipo de clase
  const getBackgroundColor = () => {
    if (cls.isInterface) return 'bg-blue-50';
    if (cls.isIntermediate) return 'bg-orange-100';
    return 'bg-yellow-100';
  };

  const getBorderColor = () => {
    if (cls.isInterface) return 'border-blue-800';
    return 'border-gray-800';
  };

  const getHeaderColor = () => {
    if (cls.isInterface) return 'bg-blue-100';
    if (cls.isIntermediate) return 'bg-orange-200';
    return 'bg-yellow-200';
  };

  return (
    <div
      className={`absolute border-2 cursor-pointer select-none ${
        cls.isAbstract ? 'border-dashed' : 'border-solid'
      } ${getBorderColor()} ${getBackgroundColor()} ${
        isConnecting ? 'ring-4 ring-blue-500' : ''
      }`}
      style={{
        left: cls.x,
        top: cls.y,
        width: cls.width,
        minHeight: cls.height
      }}
      onMouseDown={(e) => onMouseDown(e, cls)}
      onClick={(e) => {
        e.stopPropagation();
        onClick(cls);
      }}
    >
      {/* Estereotipo - UML 2.5 */}
      {cls.stereotype && (
        <div className="px-2 pt-1 text-center text-xs text-gray-600 italic">
          «{cls.stereotype}»
        </div>
      )}
      
      {/* Nombre de la clase */}
      <div className={`p-2 text-center font-bold border-b ${getBorderColor()} ${
        cls.isAbstract ? 'italic' : ''
      } ${getHeaderColor()}`}>
        {cls.name}
        {cls.isIntermediate && (
          <div className="text-xs text-gray-600">(Clase Intermedia)</div>
        )}
        {cls.isInterface && (
          <div className="text-xs text-gray-600">&lt;&lt;interface&gt;&gt;</div>
        )}
      </div>
      
      {/* Atributos/Campos - UML 2.5 */}
      {cls.fields && cls.fields.length > 0 && (
        <div className={`p-2 border-b ${getBorderColor()}`}>
          {cls.fields.map((field, index) => (
            <div key={index} className="text-sm font-mono">
              {getVisibilitySymbol(field.visibility)}{' '}
              {field.name}: {field.type}
              {field.multiplicity && ` [${field.multiplicity}]`}
              {field.defaultValue && ` = ${field.defaultValue}`}
            </div>
          ))}
        </div>
      )}
      
      {/* Métodos - UML 2.5 */}
      {cls.methods && cls.methods.length > 0 && (
        <div className="p-2">
          {cls.methods.map((method, index) => (
            <div key={index} className={`text-sm font-mono ${
              method.isAbstract ? 'italic' : ''
            }`}>
              {getVisibilitySymbol(method.visibility)}{' '}
              {method.name}
              {!method.name.includes('(') && '('}
              {method.parameters && method.parameters.length > 0
                ? method.parameters.map((p, i) => (
                    <span key={i}>
                      {i > 0 ? ', ' : ''}
                      {p.name}: {p.type}
                    </span>
                  ))
                : method.name.includes('(') ? '' : ''
              }
              {!method.name.includes(')') && ')'}
              : {method.type}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassBox;

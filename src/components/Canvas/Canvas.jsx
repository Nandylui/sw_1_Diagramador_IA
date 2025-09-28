import React from 'react';
import ClassBox from '../ClassBox';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';

const Canvas = ({
  canvasRef,
  classes,
  connections,
  connectingFrom,
  selectedTool,
  relationshipType,
  onCanvasClick,
  onClassClick,
  onClassMove,
  onCreateConnection,
  onSelectClass
}) => {
  const { startDrag, handleDrag, endDrag } = useDragAndDrop((id, pos) => {
    onClassMove(id, pos);
  });

  const handleClassClick = (cls) => {
    if (selectedTool === 'connect') {
      if (connectingFrom == null) {
        onClassClick(cls.id);
      } else if (connectingFrom !== cls.id) {
        onCreateConnection(connectingFrom, cls.id, relationshipType);
        onClassClick(null);
      }
    } else {
      if (onSelectClass) onSelectClass(cls.id); // <-- enviar ID para PropertyPanel
    }
  };

  return (
    <div
      ref={canvasRef}
      className="flex-1 relative bg-white cursor-crosshair overflow-hidden"
      onClick={onCanvasClick}
      onMouseMove={(e) => handleDrag(e, canvasRef)}
      onMouseUp={endDrag}
    >
      {/* Conexiones */}
      <svg className="absolute w-full h-full pointer-events-none">
        {connections.map((conn, index) => {
          const from = classes.find(c => c.id === conn.fromId);
          const to = classes.find(c => c.id === conn.toId);
          if (!from || !to) return null;

          const x1 = from.x + from.width / 2;
          const y1 = from.y + from.height / 2;
          const x2 = to.x + to.width / 2;
          const y2 = to.y + to.height / 2;

          return (
            <g key={index}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="black" strokeWidth={2} />
              <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 5} fontSize="12" fill="black" textAnchor="middle">
                {conn.type === 'oneToOne' ? '1:1' : conn.type === 'oneToMany' ? '1:*' : '*:*'}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Clases */}
      {classes.map(cls => (
        <ClassBox
          key={cls.id}
          cls={cls}
          isConnecting={connectingFrom === cls.id}
          onMouseDown={(e) => selectedTool === 'move' && startDrag(cls, e, canvasRef)}
          onClick={handleClassClick} // enviar la clase completa
        />
      ))}
    </div>
  );
};

export default Canvas;

// src/components/Canvas/Canvas.jsx
import React from "react";
import ClassBox from "../ClassBox";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";

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
    if (selectedTool === "connect") {
      if (connectingFrom == null) {
        onClassClick(cls.id);
        console.log("🎯 Clase origen seleccionada:", cls.name, "Tipo de relación:", relationshipType);
      } else if (connectingFrom !== cls.id) {
        console.log("🎯 Clase destino seleccionada:", cls.name);
        console.log("🔗 Creando conexión con tipo:", relationshipType);
        onCreateConnection(connectingFrom, cls.id, relationshipType);
        onClassClick(null);
      }
    } else {
      if (onSelectClass) onSelectClass(cls.id);
    }
  };

  // Función para obtener punto de borde entre centro y punto destino en rectángulo
  const getLineRectIntersection = (rect, targetX, targetY) => {
    const { x, y, width, height } = rect;
    const cx = x + width / 2;
    const cy = y + height / 2;

    const dx = targetX - cx;
    const dy = targetY - cy;

    const sides = [];

    if (dx !== 0) {
      // Intersección con lado izquierdo (x)
      let t1 = (x - cx) / dx;
      let y1 = cy + dy * t1;
      if (t1 > 0 && y1 >= y && y1 <= y + height) sides.push({ x: x, y: y1, t: t1 });

      // Intersección con lado derecho (x + width)
      let t2 = (x + width - cx) / dx;
      let y2 = cy + dy * t2;
      if (t2 > 0 && y2 >= y && y2 <= y + height) sides.push({ x: x + width, y: y2, t: t2 });
    }

    if (dy !== 0) {
      // Intersección con lado superior (y)
      let t3 = (y - cy) / dy;
      let x3 = cx + dx * t3;
      if (t3 > 0 && x3 >= x && x3 <= x + width) sides.push({ x: x3, y: y, t: t3 });

      // Intersección con lado inferior (y + height)
      let t4 = (y + height - cy) / dy;
      let x4 = cx + dx * t4;
      if (t4 > 0 && x4 >= x && x4 <= x + width) sides.push({ x: x4, y: y + height, t: t4 });
    }

    if (sides.length === 0) {
      return { x: cx, y: cy };
    }

    sides.sort((a, b) => a.t - b.t);
    return { x: sides[0].x, y: sides[0].y };
  };

  // ===============================================================
  // FUNCIÓN PRINCIPAL: Renderizado de relaciones UML
  // ===============================================================
  const renderConnection = (conn, index) => {
    const from = classes.find((c) => c.id === conn.fromId);
    const to = classes.find((c) => c.id === conn.toId);
    if (!from || !to) return null;

    // Calculamos puntos en bordes de cada clase (no centros)
    const start = getLineRectIntersection(from, to.x + to.width / 2, to.y + to.height / 2);
    const end = getLineRectIntersection(to, from.x + from.width / 2, from.y + from.height / 2);

    const type = (conn.type || "").trim().toLowerCase();
    // console.log("🎯 Renderizando conexión tipo:", type);

    switch (type) {
      case "association": return renderAssociation(start.x, start.y, end.x, end.y, conn, index);
      case "aggregation": return renderAggregation(start.x, start.y, end.x, end.y, conn, index);
      case "composition": return renderComposition(start.x, start.y, end.x, end.y, conn, index);
      case "generalization": return renderGeneralization(start.x, start.y, end.x, end.y, conn, index);
      case "realization": return renderRealization(start.x, start.y, end.x, end.y, conn, index);
      case "dependency": return renderDependency(start.x, start.y, end.x, end.y, conn, index);
      default: return renderAssociation(start.x, start.y, end.x, end.y, conn, index);
    }
  };

  // ===============================================================
  // FUNCIONES DE RENDERIZADO CON SIMBOLOGÍA UML 2.5
  // ===============================================================

  // Asociación (línea simple)
  const renderAssociation = (x1, y1, x2, y2, conn, index) => (
    <g key={`assoc-${index}`}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="black" strokeWidth="1.5" />
    </g>
  );

  // Agregación (rombo blanco)
  const renderAggregation = (x1, y1, x2, y2, conn, index) => {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const diamondLength = 14, diamondWidth = 8, offset = 12;

    const cx = x1 + Math.cos(angle) * offset;
    const cy = y1 + Math.sin(angle) * offset;

    const points = [
      [cx + Math.cos(angle) * diamondLength, cy + Math.sin(angle) * diamondLength],
      [cx + Math.cos(angle + Math.PI / 2) * diamondWidth, cy + Math.sin(angle + Math.PI / 2) * diamondWidth],
      [cx - Math.cos(angle) * diamondLength, cy - Math.sin(angle) * diamondLength],
      [cx - Math.cos(angle + Math.PI / 2) * diamondWidth, cy - Math.sin(angle + Math.PI / 2) * diamondWidth]
    ];

    return (
      <g key={`aggr-${index}`}>
        <line x1={points[0][0]} y1={points[0][1]} x2={x2} y2={y2} stroke="black" strokeWidth="1.5" />
        <polygon
          points={points.map(p => p.join(",")).join(" ")}
          stroke="black"
          fill="white"
          strokeWidth="1.5"
        />
      </g>
    );
  };

  // Composición (rombo negro)
  const renderComposition = (x1, y1, x2, y2, conn, index) => {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const diamondLength = 14, diamondWidth = 8, offset = 12;

    const cx = x1 + Math.cos(angle) * offset;
    const cy = y1 + Math.sin(angle) * offset;

    const points = [
      [cx + Math.cos(angle) * diamondLength, cy + Math.sin(angle) * diamondLength],
      [cx + Math.cos(angle + Math.PI / 2) * diamondWidth, cy + Math.sin(angle + Math.PI / 2) * diamondWidth],
      [cx - Math.cos(angle) * diamondLength, cy - Math.sin(angle) * diamondLength],
      [cx - Math.cos(angle + Math.PI / 2) * diamondWidth, cy - Math.sin(angle + Math.PI / 2) * diamondWidth]
    ];

    return (
      <g key={`comp-${index}`}>
        <line x1={points[0][0]} y1={points[0][1]} x2={x2} y2={y2} stroke="black" strokeWidth="1.5" />
        <polygon
          points={points.map(p => p.join(",")).join(" ")}
          stroke="black"
          fill="black"
          strokeWidth="1.5"
        />
      </g>
    );
  };

  // Herencia (triángulo blanco) - punta en borde
  const renderGeneralization = (x1, y1, x2, y2, conn, index) => {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowSize = 16;

    const baseX = x2 - Math.cos(angle) * arrowSize;
    const baseY = y2 - Math.sin(angle) * arrowSize;

    const base1X = baseX - Math.cos(angle - Math.PI / 6) * arrowSize;
    const base1Y = baseY - Math.sin(angle - Math.PI / 6) * arrowSize;
    const base2X = baseX - Math.cos(angle + Math.PI / 6) * arrowSize;
    const base2Y = baseY - Math.sin(angle + Math.PI / 6) * arrowSize;

    return (
      <g key={`gen-${index}`}>
        <line x1={x1} y1={y1} x2={baseX} y2={baseY} stroke="black" strokeWidth="1.5" />
        <polygon
          points={`${x2},${y2} ${base1X},${base1Y} ${base2X},${base2Y}`}
          stroke="black"
          fill="white"
          strokeWidth="1.5"
        />
      </g>
    );
  };

  // Realización (línea punteada + triángulo blanco) - punta en borde
  const renderRealization = (x1, y1, x2, y2, conn, index) => {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowSize = 16;

    const baseX = x2 - Math.cos(angle) * arrowSize;
    const baseY = y2 - Math.sin(angle) * arrowSize;

    const base1X = baseX - Math.cos(angle - Math.PI / 6) * arrowSize;
    const base1Y = baseY - Math.sin(angle - Math.PI / 6) * arrowSize;
    const base2X = baseX - Math.cos(angle + Math.PI / 6) * arrowSize;
    const base2Y = baseY - Math.sin(angle + Math.PI / 6) * arrowSize;

    return (
      <g key={`real-${index}`}>
        <line
          x1={x1} y1={y1}
          x2={baseX} y2={baseY}
          stroke="black"
          strokeWidth="1.5"
          strokeDasharray="6,4"
        />
        <polygon
          points={`${x2},${y2} ${base1X},${base1Y} ${base2X},${base2Y}`}
          stroke="black"
          fill="white"
          strokeWidth="1.5"
        />
      </g>
    );
  };

  // Dependencia (línea punteada + flecha abierta) - punta en borde
  const renderDependency = (x1, y1, x2, y2, conn, index) => {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowSize = 12;

    const baseX = x2 - Math.cos(angle) * arrowSize;
    const baseY = y2 - Math.sin(angle) * arrowSize;

    const arrow1X = baseX - Math.cos(angle - Math.PI / 7) * arrowSize;
    const arrow1Y = baseY - Math.sin(angle - Math.PI / 7) * arrowSize;
    const arrow2X = baseX - Math.cos(angle + Math.PI / 7) * arrowSize;
    const arrow2Y = baseY - Math.sin(angle + Math.PI / 7) * arrowSize;

    return (
      <g key={`dep-${index}`}>
        <line
          x1={x1} y1={y1}
          x2={baseX} y2={baseY}
          stroke="black"
          strokeWidth="1.5"
          strokeDasharray="6,4"
        />
        <line x1={arrow1X} y1={arrow1Y} x2={x2} y2={y2} stroke="black" strokeWidth="1.5" />
        <line x1={arrow2X} y1={arrow2Y} x2={x2} y2={y2} stroke="black" strokeWidth="1.5" />
      </g>
    );
  };

  // ===============================================================
  // RENDER PRINCIPAL
  // ===============================================================
  return (
    <div
      ref={canvasRef}
      className="flex-1 relative bg-white cursor-crosshair overflow-hidden"
      style={{
        backgroundImage: `
          linear-gradient(rgba(200, 200, 200, 0.2) 1px, transparent 1px),
          linear-gradient(90deg, rgba(200, 200, 200, 0.2) 1px, transparent 1px)
        `,
        backgroundSize: "20px 20px"
      }}
      onClick={onCanvasClick}
      onMouseMove={(e) => handleDrag(e, canvasRef)}
      onMouseUp={endDrag}
    >
      {/* 🧱 Clases primero */}
      {classes.map(cls => (
        <ClassBox
          key={cls.id}
          cls={cls}
          isConnecting={connectingFrom === cls.id}
          onMouseDown={(e) => selectedTool === "move" && startDrag(cls, e, canvasRef)}
          onClick={handleClassClick}
        />
      ))}

      {/* 🔗 Luego las conexiones (encima de las clases) */}
      <svg className="absolute w-full h-full pointer-events-none z-50">
        {connections.map((conn, index) => renderConnection(conn, index))}
      </svg>
    </div>
  );
};

export default Canvas;

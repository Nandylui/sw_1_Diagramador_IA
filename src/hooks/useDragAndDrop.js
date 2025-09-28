import { useState, useCallback, useEffect, useRef } from 'react';

export const useDragAndDrop = (onItemMove) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef({ isDragging: false });

  // Iniciar arrastre
  const startDrag = useCallback((item, event, canvasRef) => {
    if (!item || !event || !canvasRef?.current) return;

    event.preventDefault();
    
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = event.clientX || (event.touches && event.touches[0]?.clientX) || 0;
    const clientY = event.clientY || (event.touches && event.touches[0]?.clientY) || 0;
    
    // Calcular offset relativo al elemento
    const elementX = clientX - rect.left - item.x;
    const elementY = clientY - rect.top - item.y;
    
    setIsDragging(true);
    setDraggedItem(item);
    setDragStart({ x: clientX, y: clientY });
    setOffset({ x: elementX, y: elementY });
    
    // Actualizar ref para usar en event listeners
    dragRef.current.isDragging = true;
    
    // Cambiar cursor del documento
    document.body.style.cursor = 'grabbing';
  }, []);

  // Manejar movimiento durante el arrastre
  const handleDrag = useCallback((event, canvasRef) => {
    if (!isDragging || !draggedItem || !canvasRef?.current) return;

    event.preventDefault();
    
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = event.clientX || (event.touches && event.touches[0]?.clientX) || 0;
    const clientY = event.clientY || (event.touches && event.touches[0]?.clientY) || 0;
    
    // Calcular nueva posición
    const newX = clientX - rect.left - offset.x;
    const newY = clientY - rect.top - offset.y;
    
    // Aplicar límites del canvas
    const maxX = Math.max(0, canvasRef.current.clientWidth - draggedItem.width);
    const maxY = Math.max(0, canvasRef.current.clientHeight - draggedItem.height);
    
    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedY = Math.max(0, Math.min(newY, maxY));
    
    // Llamar callback si la posición cambió significativamente
    if (Math.abs(constrainedX - draggedItem.x) > 1 || Math.abs(constrainedY - draggedItem.y) > 1) {
      onItemMove && onItemMove(draggedItem.id, {
        x: constrainedX,
        y: constrainedY
      });
    }
  }, [isDragging, draggedItem, offset, onItemMove]);

  // Finalizar arrastre
  const endDrag = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    setDraggedItem(null);
    setDragStart({ x: 0, y: 0 });
    setOffset({ x: 0, y: 0 });
    
    dragRef.current.isDragging = false;
    
    // Restaurar cursor
    document.body.style.cursor = 'default';
  }, [isDragging]);

  // Event listeners globales
  useEffect(() => {
    const handleMouseMove = (event) => {
      if (dragRef.current.isDragging) {
        event.preventDefault();
      }
    };

    const handleMouseUp = () => {
      if (dragRef.current.isDragging) {
        endDrag();
      }
    };

    const handleTouchMove = (event) => {
      if (dragRef.current.isDragging) {
        event.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      if (dragRef.current.isDragging) {
        endDrag();
      }
    };

    // Event listeners para mouse
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    
    // Event listeners para touch (móvil)
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      
      // Asegurar que el cursor se restaure
      document.body.style.cursor = 'default';
    };
  }, [endDrag]);

  // Cleanup cuando el componente se desmonta
  useEffect(() => {
    return () => {
      document.body.style.cursor = 'default';
    };
  }, []);

  // Utilidad para verificar si un punto está dentro de un elemento
  const isPointInElement = useCallback((point, element) => {
    return point.x >= element.x &&
           point.x <= element.x + element.width &&
           point.y >= element.y &&
           point.y <= element.y + element.height;
  }, []);

  // Utilidad para detectar colisiones
  const detectCollision = useCallback((element1, element2, padding = 10) => {
    return !(
      element1.x + element1.width + padding < element2.x ||
      element2.x + element2.width + padding < element1.x ||
      element1.y + element1.height + padding < element2.y ||
      element2.y + element2.height + padding < element1.y
    );
  }, []);

  return {
    // Estado
    isDragging,
    draggedItem,
    
    // Métodos principales
    startDrag,
    handleDrag,
    endDrag,
    
    // Utilidades
    isPointInElement,
    detectCollision
  };
};
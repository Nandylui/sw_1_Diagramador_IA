// src/context/DiagramContext.js
import React, { createContext, useContext, useReducer } from 'react';

// Estado inicial
const initialState = {
  classes: [],
  connections: [],
  selectedClass: null,
  selectedConnection: null,
  selectedTool: 'move',
  history: [],
  currentHistoryIndex: -1,
  canUndo: false,
  canRedo: false
};

// Tipos de acciones
const ACTIONS = {
  SET_CLASSES: 'SET_CLASSES',
  ADD_CLASS: 'ADD_CLASS',
  UPDATE_CLASS: 'UPDATE_CLASS',
  REMOVE_CLASS: 'REMOVE_CLASS',
  SET_CONNECTIONS: 'SET_CONNECTIONS',
  ADD_CONNECTION: 'ADD_CONNECTION',
  REMOVE_CONNECTION: 'REMOVE_CONNECTION',
  SET_SELECTED_CLASS: 'SET_SELECTED_CLASS',
  SET_SELECTED_CONNECTION: 'SET_SELECTED_CONNECTION',
  SET_SELECTED_TOOL: 'SET_SELECTED_TOOL',
  LOAD_DIAGRAM: 'LOAD_DIAGRAM',
  CLEAR_DIAGRAM: 'CLEAR_DIAGRAM',
  UNDO: 'UNDO',
  REDO: 'REDO',
  SAVE_STATE: 'SAVE_STATE'
};

// Función para normalizar datos recibidos y evitar errores en el Canvas
const normalizeDiagramData = (data) => {
  if (!data) return { classes: [], connections: [] };

  // Normalizar clases, asignando ID si no tiene, y valores por defecto
  const classes = (data.classes || []).map((cls, index) => ({
    id: cls.id || `cls_${index}_${cls.name || "Clase"}`,
    name: cls.name || "Clase",
    x: cls.x || 100 + index * 50,
    y: cls.y || 100 + index * 30,
    fields: cls.fields || [],
    methods: cls.methods || [],
    stereotype: cls.stereotype || null,
    isAbstract: cls.isAbstract || false,
    isInterface: cls.isInterface || false
  }));

  // Normalizar conexiones, asignando id y adaptando campos
  const connections = (data.connections || []).map((conn, i) => ({
    id: conn.id || `conn_${i}`,
    from: conn.from || conn.fromId || "",
    to: conn.to || conn.toId || "",
    type: conn.type || "association"
  }));

  return { classes, connections };
};

// Reducer
const diagramReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_CLASSES:
      return {
        ...state,
        classes: action.payload
      };

    case ACTIONS.ADD_CLASS:
      return {
        ...state,
        classes: [...state.classes, action.payload]
      };

    case ACTIONS.UPDATE_CLASS:
      return {
        ...state,
        classes: state.classes.map(cls =>
          cls.id === action.payload.id
            ? { ...cls, ...action.payload.updates }
            : cls
        )
      };

    case ACTIONS.REMOVE_CLASS:
      return {
        ...state,
        classes: state.classes.filter(cls => cls.id !== action.payload),
        connections: state.connections.filter(conn =>
          conn.from !== action.payload && conn.to !== action.payload
        ),
        selectedClass: state.selectedClass === action.payload ? null : state.selectedClass
      };

    case ACTIONS.SET_CONNECTIONS:
      return {
        ...state,
        connections: action.payload
      };

    case ACTIONS.ADD_CONNECTION:
      return {
        ...state,
        connections: [...state.connections, action.payload]
      };

    case ACTIONS.REMOVE_CONNECTION:
      return {
        ...state,
        connections: state.connections.filter(conn => conn.id !== action.payload),
        selectedConnection: state.selectedConnection === action.payload ? null : state.selectedConnection
      };

    case ACTIONS.SET_SELECTED_CLASS:
      return {
        ...state,
        selectedClass: action.payload,
        selectedConnection: null
      };

    case ACTIONS.SET_SELECTED_CONNECTION:
      return {
        ...state,
        selectedConnection: action.payload,
        selectedClass: null
      };

    case ACTIONS.SET_SELECTED_TOOL:
      return {
        ...state,
        selectedTool: action.payload
      };

    case ACTIONS.LOAD_DIAGRAM:
      return {
        ...state,
        classes: action.payload.classes || [],
        connections: action.payload.connections || [],
        selectedClass: null,
        selectedConnection: null
      };

    case ACTIONS.CLEAR_DIAGRAM:
      return {
        ...state,
        classes: [],
        connections: [],
        selectedClass: null,
        selectedConnection: null
      };

    case ACTIONS.SAVE_STATE:
      const newHistory = state.history.slice(0, state.currentHistoryIndex + 1);
      const currentState = {
        classes: state.classes,
        connections: state.connections
      };
      
      return {
        ...state,
        history: [...newHistory, currentState],
        currentHistoryIndex: newHistory.length,
        canUndo: true,
        canRedo: false
      };

    case ACTIONS.UNDO:
      if (!state.canUndo || state.currentHistoryIndex <= 0) return state;
      
      const prevState = state.history[state.currentHistoryIndex - 1];
      return {
        ...state,
        classes: prevState.classes,
        connections: prevState.connections,
        currentHistoryIndex: state.currentHistoryIndex - 1,
        canUndo: state.currentHistoryIndex - 1 > 0,
        canRedo: true,
        selectedClass: null,
        selectedConnection: null
      };

    case ACTIONS.REDO:
      if (!state.canRedo || state.currentHistoryIndex >= state.history.length - 1) return state;
      
      const nextState = state.history[state.currentHistoryIndex + 1];
      return {
        ...state,
        classes: nextState.classes,
        connections: nextState.connections,
        currentHistoryIndex: state.currentHistoryIndex + 1,
        canUndo: true,
        canRedo: state.currentHistoryIndex + 1 < state.history.length - 1,
        selectedClass: null,
        selectedConnection: null
      };

    default:
      return state;
  }
};

// Context
const DiagramContext = createContext();

// Hook personalizado para usar el contexto
export const useDiagramContext = () => {
  const context = useContext(DiagramContext);
  if (!context) {
    throw new Error('useDiagramContext debe ser usado dentro de DiagramProvider');
  }
  return context;
};

// Provider
export const DiagramProvider = ({ children }) => {
  const [state, dispatch] = useReducer(diagramReducer, initialState);

  // Acciones
  const actions = {
    setClasses: (classes) => dispatch({ type: ACTIONS.SET_CLASSES, payload: classes }),
    addClass: (cls) => dispatch({ type: ACTIONS.ADD_CLASS, payload: cls }),
    updateClass: (id, updates) => dispatch({ type: ACTIONS.UPDATE_CLASS, payload: { id, updates } }),
    removeClass: (id) => dispatch({ type: ACTIONS.REMOVE_CLASS, payload: id }),
    setConnections: (connections) => dispatch({ type: ACTIONS.SET_CONNECTIONS, payload: connections }),
    addConnection: (connection) => dispatch({ type: ACTIONS.ADD_CONNECTION, payload: connection }),
    removeConnection: (id) => dispatch({ type: ACTIONS.REMOVE_CONNECTION, payload: id }),
    setSelectedClass: (id) => dispatch({ type: ACTIONS.SET_SELECTED_CLASS, payload: id }),
    setSelectedConnection: (id) => dispatch({ type: ACTIONS.SET_SELECTED_CONNECTION, payload: id }),
    setSelectedTool: (tool) => dispatch({ type: ACTIONS.SET_SELECTED_TOOL, payload: tool }),

    // Aquí normalizamos antes de cargar el diagrama
    loadDiagram: (diagram) => {
      const normalized = normalizeDiagramData(diagram);
      dispatch({ type: ACTIONS.LOAD_DIAGRAM, payload: normalized });
    },

    clearDiagram: () => dispatch({ type: ACTIONS.CLEAR_DIAGRAM }),
    undo: () => dispatch({ type: ACTIONS.UNDO }),
    redo: () => dispatch({ type: ACTIONS.REDO }),
    saveState: () => dispatch({ type: ACTIONS.SAVE_STATE })
  };

  const value = {
    ...state,
    ...actions
  };

  return (
    <DiagramContext.Provider value={value}>
      {children}
    </DiagramContext.Provider>
  );
};

export { ACTIONS };
export default DiagramContext;

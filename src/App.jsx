import React, { useState, useRef } from "react";
import Toolbar from "./components/Toolbar";
import Canvas from "./components/Canvas";
import PropertyPanel from "./components/PropertyPanel";
import AIPanel from "./components/AIPanel";
import { useAI } from "./components/ConnectionLine/ConnectionLine";
import { RELATIONSHIP_TYPES } from "./utils/constants";

const App = () => {
  const canvasRef = useRef(null);
  const [classes, setClasses] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedTool, setSelectedTool] = useState("move");
  const [relationshipType, setRelationshipType] = useState("oneToOne");
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiQuery, setAiQuery] = useState("");

  const { generateDiagram, isGenerating } = useAI();

  const generateDiagramWithAI = async () => {
    const result = await generateDiagram(aiQuery);
    if (result) {
      setClasses(result.classes);
      setConnections(result.connections);
    }
  };

  // Mover clase
  const onClassMove = (id, pos) => {
    setClasses(prev =>
      prev.map(cls =>
        cls.id === id ? { ...cls, x: pos.x, y: pos.y } : cls
      )
    );
  };

  // Agregar nueva clase
  const addNewClass = () => {
    const newClass = {
      id: Date.now(),
      name: `Clase ${classes.length + 1}`,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: 200,
      height: 120,
      fields: [],
      methods: [],
      isIntermediate: false
    };
    setClasses(prev => [...prev, newClass]);
  };

  // Eliminar clase
  const removeClass = (id) => {
    setClasses(prev => prev.filter(cls => cls.id !== id));
    setConnections(prev => prev.filter(conn => conn.fromId !== id && conn.toId !== id));
    if (selectedClass === id) setSelectedClass(null);
  };

  // Crear conexión
  const createConnection = (fromId, toId, type) => {
    if (fromId === toId) return;

    if (type === "manyToMany") {
      const interClass = {
        id: Date.now(),
        name: `Intermedia_${classes.length + 1}`,
        x: (classes.find(c => c.id === fromId).x + classes.find(c => c.id === toId).x) / 2,
        y: (classes.find(c => c.id === fromId).y + classes.find(c => c.id === toId).y) / 2,
        width: 180,
        height: 100,
        fields: [],
        methods: [],
        isIntermediate: true
      };
      setClasses(prev => [...prev, interClass]);
      setConnections(prev => [
        ...prev,
        { fromId, toId: interClass.id, type: "oneToMany" },
        { fromId: toId, toId: interClass.id, type: "oneToMany" }
      ]);
    } else {
      setConnections(prev => [...prev, { fromId, toId, type }]);
    }
  };

  // Editar clase
  const updateClass = (id, updatedData) => {
    setClasses(prev =>
      prev.map(cls => (cls.id === id ? { ...cls, ...updatedData } : cls))
    );
  };

  // Campos
  const addField = (id) => {
    setClasses(prev =>
      prev.map(cls =>
        cls.id === id
          ? { ...cls, fields: [...(cls.fields || []), { visibility: '+', name: 'nuevoAtributo', type: 'String' }] }
          : cls
      )
    );
  };

  const removeField = (id, index) => {
    setClasses(prev =>
      prev.map(cls =>
        cls.id === id
          ? { ...cls, fields: cls.fields.filter((_, i) => i !== index) }
          : cls
      )
    );
  };

  // Métodos
  const addMethod = (id) => {
    setClasses(prev =>
      prev.map(cls =>
        cls.id === id
          ? { ...cls, methods: [...(cls.methods || []), { visibility: '+', name: 'nuevoMetodo()', type: 'void' }] }
          : cls
      )
    );
  };

  const removeMethod = (id, index) => {
    setClasses(prev =>
      prev.map(cls =>
        cls.id === id
          ? { ...cls, methods: cls.methods.filter((_, i) => i !== index) }
          : cls
      )
    );
  };

  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col">
      <AIPanel
        isOpen={showAIPanel}
        onClose={() => setShowAIPanel(false)}
        query={aiQuery}
        setQuery={setAiQuery}
        onGenerate={generateDiagramWithAI}
        isGenerating={isGenerating}
      />

      <Toolbar
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        relationshipType={relationshipType}
        setRelationshipType={setRelationshipType}
        relationshipTypes={RELATIONSHIP_TYPES}
        onShowAIPanel={() => setShowAIPanel(true)}
        onExportDiagram={() => {}}
        onExportCode={() => {}}
        onImportDiagram={() => {}}
        onAddClass={addNewClass}
      />

      <div className="flex flex-1 overflow-hidden">
        <Canvas
          canvasRef={canvasRef}
          classes={classes}
          connections={connections}
          connectingFrom={connectingFrom}
          selectedTool={selectedTool}
          relationshipType={relationshipType}
          onCanvasClick={() => setConnectingFrom(null)}
          onClassClick={setConnectingFrom}
          onClassMove={onClassMove}
          onCreateConnection={createConnection}
          onSelectClass={setSelectedClass}
        />

        <PropertyPanel
          selectedClass={selectedClass}
          classes={classes}
          onUpdateClass={updateClass}
          onAddField={addField}
          onAddMethod={addMethod}
          onRemoveField={removeField}
          onRemoveMethod={removeMethod}
          onRemoveClass={removeClass} // <-- agregado
        />
      </div>
    </div>
  );
};

export default App;

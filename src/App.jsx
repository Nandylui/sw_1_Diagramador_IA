// src/App.jsx
import React, { useState, useRef } from "react";
import Toolbar from "./components/Toolbar";
import Canvas from "./components/Canvas";
import PropertyPanel from "./components/PropertyPanel/PropertyPanel";
import AIPanel from "./components/AIPanel";
import { useAI } from "./hooks/useAI";
import { RELATIONSHIP_TYPES } from "./utils/constants";
import { exportSpringBoot } from "./utils/exportSpringBoot";

// ✅ Importamos el provider del contexto
import { DiagramProvider } from "./context/DiagramContext";

const App = () => {
  const canvasRef = useRef(null);
  const [classes, setClasses] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedTool, setSelectedTool] = useState("move");
  const [relationshipType, setRelationshipType] = useState("association");
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiQuery, setAiQuery] = useState("");

  const { generateDiagram, isGenerating } = useAI();

  const generateDiagramWithAI = async () => {
    const contextPrompt = classes.length > 0 
      ? `CONTEXTO ACTUAL DEL DIAGRAMA:
${JSON.stringify({
  clases_existentes: classes.map(c => ({
    nombre: c.name,
    esAbstracta: c.isAbstract,
    esInterfaz: c.isInterface,
    estereotipo: c.stereotype,
    atributos: c.fields?.map(f => `${f.visibility} ${f.name}: ${f.type}`),
    metodos: c.methods?.map(m => `${m.visibility} ${m.name}(${m.parameters?.map(p => `${p.name}: ${p.type}`).join(', ')}): ${m.type}`)
  })),
  relaciones_existentes: connections.map(c => ({
    desde: classes.find(cl => cl.id === c.fromId)?.name,
    hasta: classes.find(cl => cl.id === c.toId)?.name,
    tipo: c.type,
    multiplicidad: c.label
  }))
}, null, 2)}

NUEVA SOLICITUD DEL USUARIO: ${aiQuery}

IMPORTANTE: 
- Genera SOLO las nuevas clases solicitadas
- NO regeneres las clases existentes
- Si necesitas relacionar con clases existentes, usa sus nombres exactos
- Mantén la coherencia con el diseño actual`
      : aiQuery;

    const result = await generateDiagram(contextPrompt);
    
    if (result) {
      const findAvailablePosition = (existingClasses, index) => {
        const gridSize = 250;
        const margin = 50;
        let x = margin + (index % 3) * gridSize;
        let y = margin + Math.floor(index / 3) * 200;
        let attempts = 0;
        while (attempts < 50) {
          const overlap = existingClasses.some(cls => 
            Math.abs(cls.x - x) < 200 && Math.abs(cls.y - y) < 150
          );
          if (!overlap) break;
          x += gridSize;
          if (x > window.innerWidth - 300) {
            x = margin;
            y += 200;
          }
          attempts++;
        }
        return { x, y };
      };

      const normalizedClasses = result.classes.map((cls, idx) => {
        const position = findAvailablePosition([...classes], idx);
        return {
          ...cls,
          id: cls.id || `class-${Date.now()}-${idx}`,
          x: cls.x || position.x,
          y: cls.y || position.y,
          width: cls.width || 200,
          height: cls.height || 120,
          isAbstract: cls.isAbstract || false,
          isInterface: cls.isInterface || false,
          stereotype: cls.stereotype || null,
          fields: (cls.fields || []).map(f => ({
            name: f.name || 'campo',
            type: f.type || 'String',
            visibility: f.visibility || '+',
            multiplicity: f.multiplicity || null,
            defaultValue: f.defaultValue || null
          })),
          methods: (cls.methods || []).map(m => ({
            name: m.name || 'metodo()',
            type: m.type || m.returnType || 'void',
            visibility: m.visibility || '+',
            isAbstract: m.isAbstract || false,
            parameters: m.parameters || []
          }))
        };
      });

      const normalizedConnections = (result.connections || []).map((conn, index) => {
        let fromId = conn.fromId;
        let toId = conn.toId;
        if (typeof fromId === 'string' && !fromId.startsWith('class-')) {
          const existingClass = classes.find(c => c.name === fromId);
          const newClass = normalizedClasses.find(c => c.name === fromId);
          fromId = existingClass?.id || newClass?.id || fromId;
        }
        if (typeof toId === 'string' && !toId.startsWith('class-')) {
          const existingClass = classes.find(c => c.name === toId);
          const newClass = normalizedClasses.find(c => c.name === toId);
          toId = existingClass?.id || newClass?.id || toId;
        }
        return {
          id: conn.id || `conn-${Date.now()}-${index}`,
          fromId,
          toId,
          type: conn.type || 'association',
          label: conn.label || conn.multiplicity || '',
          fromMultiplicity: conn.fromMultiplicity || '',
          toMultiplicity: conn.toMultiplicity || ''
        };
      });

      setClasses(prev => [...prev, ...normalizedClasses]);
      setConnections(prev => [...prev, ...normalizedConnections]);
      setShowAIPanel(false);
      setAiQuery("");
    }
  };

  const onExportCode = () => {
    if (!classes || classes.length === 0) {
      alert('No hay clases para exportar');
      return;
    }
    exportSpringBoot(classes);
  };

  const onClassMove = (id, pos) => {
    setClasses(prev => prev.map(cls => 
      cls.id === id ? { ...cls, x: pos.x, y: pos.y } : cls
    ));
  };

  const addNewClass = () => {
    const newClass = {
      id: Date.now(),
      name: `Clase${classes.length + 1}`,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: 200,
      height: 120,
      isAbstract: false,
      isInterface: false,
      stereotype: null,
      fields: [],
      methods: [],
      isIntermediate: false
    };
    setClasses(prev => [...prev, newClass]);
  };

  const removeClass = (id) => {
    setClasses(prev => prev.filter(cls => cls.id !== id));
    setConnections(prev => prev.filter(conn => 
      conn.fromId !== id && conn.toId !== id
    ));
    if (selectedClass === id) setSelectedClass(null);
  };

  const createConnection = (fromId, toId, type) => {
    if (fromId === toId) return;

    console.log('🔗 Creando conexión:', { fromId, toId, type });

    const connectionType = type || relationshipType || "association";

    if (connectionType === "manyToMany") {
      const fromClass = classes.find(c => c.id === fromId);
      const toClass = classes.find(c => c.id === toId);

      const interClass = {
        id: Date.now(),
        name: `${fromClass.name}_${toClass.name}`,
        x: (fromClass.x + toClass.x) / 2,
        y: (fromClass.y + toClass.y) / 2 - 100,
        width: 200,
        height: 100,
        fields: [
          { name: `${fromClass.name.toLowerCase()}Id`, type: 'int', visibility: '+' },
          { name: `${toClass.name.toLowerCase()}Id`, type: 'int', visibility: '+' }
        ],
        methods: [],
        isIntermediate: true
      };

      setClasses(prev => [...prev, interClass]);
      setConnections(prev => [
        ...prev,
        { id: Date.now(), fromId, toId: interClass.id, type: "oneToMany", label: "1:*" },
        { id: Date.now() + 1, fromId: toId, toId: interClass.id, type: "oneToMany", label: "1:*" }
      ]);
    } else {
      const newConnection = {
        id: Date.now(),
        fromId,
        toId,
        type: connectionType,
        label: getDefaultLabel(connectionType),
      };

      console.log('✅ Conexión creada:', newConnection);
      setConnections(prev => [...prev, newConnection]);
    }
  };

  const getDefaultLabel = (type) => {
    switch (type) {
      case 'oneToOne': return '1:1';
      case 'oneToMany': return '1:*';
      case 'manyToMany': return '*:*';
      default: return '';
    }
  };

  const updateClass = (id, updatedData) => {
    setClasses(prev => prev.map(cls => 
      cls.id === id ? { ...cls, ...updatedData } : cls
    ));
  };

  const addField = (id) => {
    setClasses(prev =>
      prev.map(cls =>
        cls.id === id
          ? { 
              ...cls, 
              fields: [...(cls.fields || []), { 
                visibility: '+', 
                name: 'nuevoAtributo', 
                type: 'String',
                multiplicity: null,
                defaultValue: null
              }]
            }
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

  const addMethod = (id) => {
    setClasses(prev =>
      prev.map(cls =>
        cls.id === id
          ? { 
              ...cls, 
              methods: [...(cls.methods || []), { 
                visibility: '+', 
                name: 'nuevoMetodo', 
                type: 'void',
                isAbstract: false,
                parameters: [] 
              }]
            }
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

  // ✅ Envolvemos toda la app en DiagramProvider
  return (
    <DiagramProvider>
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
          onExportCode={onExportCode}
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
            onRemoveClass={removeClass}
          />
        </div>
      </div>
    </DiagramProvider>
  );
};

export default App;

import React from 'react';
import { GraphCanvas } from './components/GraphCanvas';
import { NodePalette } from './components/NodePalette';
import { NodeConfigPanel } from './components/NodeConfigPanel';
import { StateSchemaEditor } from './components/StateSchemaEditor';
import { CodePreview } from './components/CodePreview';
import { FileOperations } from './components/FileOperations';
import { NodeType } from './types';
import { useEditorStore, selectGraphDocument } from './store/useEditorStore';

function App() {
  const [draggedNodeType, setDraggedNodeType] = React.useState<NodeType | null>(null);
  const [activePanel, setActivePanel] = React.useState<'node' | 'schema' | 'code'>('node');
  
  const graphDocument = useEditorStore(selectGraphDocument);

  const handleDragStart = (_event: React.DragEvent, nodeType: NodeType) => {
    setDraggedNodeType(nodeType);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <h1>LangGraph Visual Editor</h1>
            <p className="subtitle">Visual Editor for LangGraph Workflows</p>
          </div>
          <FileOperations />
        </div>
      </header>
      
      <main className="app-main">
        <aside className="app-sidebar">
          <NodePalette onDragStart={handleDragStart} draggedNodeType={draggedNodeType} />
        </aside>
        <div className="canvas-wrapper">
          <GraphCanvas draggedNodeType={draggedNodeType} onDraggedNodeTypeChange={setDraggedNodeType} />
        </div>
        <aside className="app-config-sidebar">
          <div className="config-panel-tabs">
            <button
              className={`tab-button ${activePanel === 'node' ? 'active' : ''}`}
              onClick={() => setActivePanel('node')}
              type="button"
            >
              Node Config
            </button>
            <button
              className={`tab-button ${activePanel === 'schema' ? 'active' : ''}`}
              onClick={() => setActivePanel('schema')}
              type="button"
            >
              State Schema
            </button>
            <button
              className={`tab-button ${activePanel === 'code' ? 'active' : ''}`}
              onClick={() => setActivePanel('code')}
              type="button"
            >
              Code Preview
            </button>
          </div>
          {activePanel === 'node' ? <NodeConfigPanel /> : activePanel === 'schema' ? <StateSchemaEditor /> : graphDocument ? <CodePreview document={graphDocument} /> : null}
        </aside>
      </main>
    </div>
  )
}

export default App
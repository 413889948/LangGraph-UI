import React from 'react';
import { GraphCanvas } from './components/GraphCanvas';
import { NodePalette } from './components/NodePalette';
import { NodeConfigPanel } from './components/NodeConfigPanel';
import { StateSchemaEditor } from './components/StateSchemaEditor';
import { CodePreview } from './components/CodePreview';
import { FileOperations } from './components/FileOperations';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { NodeType } from './types';
import { useEditorStore, selectGraphDocument } from './store/useEditorStore';
import { useTranslation } from './i18n';

function App() {
  const { t } = useTranslation();
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
            <h1>{t('app.title')}</h1>
            <p className="subtitle">{t('app.subtitle')}</p>
          </div>
          <div className="header-actions">
            <LanguageSwitcher />
            <FileOperations />
          </div>
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
              {t('app.tabs.nodeConfig')}
            </button>
            <button
              className={`tab-button ${activePanel === 'schema' ? 'active' : ''}`}
              onClick={() => setActivePanel('schema')}
              type="button"
            >
              {t('app.tabs.stateSchema')}
            </button>
            <button
              className={`tab-button ${activePanel === 'code' ? 'active' : ''}`}
              onClick={() => setActivePanel('code')}
              type="button"
            >
              {t('app.tabs.codePreview')}
            </button>
          </div>
          {activePanel === 'node' ? <NodeConfigPanel /> : activePanel === 'schema' ? <StateSchemaEditor /> : graphDocument ? <CodePreview document={graphDocument} /> : null}
        </aside>
      </main>
    </div>
  )
}

export default App
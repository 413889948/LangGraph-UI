import React from 'react';
import { useEditorStore } from '../store/useEditorStore';
import type { NodeType, FieldType } from '../types';
import { useTranslation } from '../i18n';

/**
 * NodeConfigPanel - Right sidebar panel for node configuration
 */
export const NodeConfigPanel: React.FC = () => {
  const { t } = useTranslation();
  const selectedNode = useEditorStore((state) => state.getSelectedNode());
  const updateNode = useEditorStore((state) => state.updateNode);

  // Empty state - no node selected
  if (!selectedNode) {
    return (
      <aside className="node-config-panel">
        <div className="node-config-panel-header">
          <h3>{t('node.config.title')}</h3>
        </div>
        <div className="node-config-panel-content">
          <div className="config-empty-state">
            <p className="empty-state-title">{t('node.emptyState.title')}</p>
            <p className="empty-state-description">
              {t('node.emptyState.description')}
            </p>
          </div>
        </div>
      </aside>
    );
  }

  // Handle name change
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    updateNode(selectedNode.id, {
      data: { ...selectedNode.data, name: newName, label: newName },
    });
  };

  // Handle type change
  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = event.target.value as NodeType;
    updateNode(selectedNode.id, { type: newType });
  };

  // Handle parameter name change
  const handleParameterNameChange = (index: number, newName: string) => {
    const newParameters = [...(selectedNode.data.parameters || [])];
    newParameters[index] = { ...newParameters[index], name: newName };
    updateNode(selectedNode.id, {
      data: { ...selectedNode.data, parameters: newParameters },
    });
  };

  // Handle parameter type change
  const handleParameterTypeChange = (index: number, newType: FieldType) => {
    const newParameters = [...(selectedNode.data.parameters || [])];
    newParameters[index] = { ...newParameters[index], type: newType };
    updateNode(selectedNode.id, {
      data: { ...selectedNode.data, parameters: newParameters },
    });
  };

  // Handle parameter default value change
  const handleParameterDefaultChange = (index: number, newValue: string) => {
    const newParameters = [...(selectedNode.data.parameters || [])];
    newParameters[index] = { ...newParameters[index], defaultValue: newValue };
    updateNode(selectedNode.id, {
      data: { ...selectedNode.data, parameters: newParameters },
    });
  };

  // Handle add parameter
  const handleAddParameter = () => {
    const newParameters = [
      ...(selectedNode.data.parameters || []),
      { name: '', type: 'string' as const },
    ];
    updateNode(selectedNode.id, {
      data: { ...selectedNode.data, parameters: newParameters },
    });
  };

  // Handle delete parameter
  const handleDeleteParameter = (index: number) => {
    const newParameters = selectedNode.data.parameters?.filter((_, i) => i !== index) || [];
    updateNode(selectedNode.id, {
      data: { ...selectedNode.data, parameters: newParameters },
    });
  };

  // Handle output parameter name change
  const handleOutputNameChange = (index: number, newName: string) => {
    const newOutputs = [...(selectedNode.data.outputs || [])];
    newOutputs[index] = { ...newOutputs[index], name: newName };
    updateNode(selectedNode.id, {
      data: { ...selectedNode.data, outputs: newOutputs },
    });
  };

  // Handle output parameter type change
  const handleOutputTypeChange = (index: number, newType: FieldType) => {
    const newOutputs = [...(selectedNode.data.outputs || [])];
    newOutputs[index] = { ...newOutputs[index], type: newType };
    updateNode(selectedNode.id, {
      data: { ...selectedNode.data, outputs: newOutputs },
    });
  };

  // Handle output parameter default value change
  const handleOutputDefaultChange = (index: number, newValue: string) => {
    const newOutputs = [...(selectedNode.data.outputs || [])];
    newOutputs[index] = { ...newOutputs[index], defaultValue: newValue };
    updateNode(selectedNode.id, {
      data: { ...selectedNode.data, outputs: newOutputs },
    });
  };

  // Handle add output parameter
  const handleAddOutput = () => {
    const newOutputs = [
      ...(selectedNode.data.outputs || []),
      { name: '', type: 'string' as const },
    ];
    updateNode(selectedNode.id, {
      data: { ...selectedNode.data, outputs: newOutputs },
    });
  };

  // Handle delete output parameter
  const handleDeleteOutput = (index: number) => {
    const newOutputs = selectedNode.data.outputs?.filter((_, i) => i !== index) || [];
    updateNode(selectedNode.id, {
      data: { ...selectedNode.data, outputs: newOutputs },
    });
  };

  // Helper function to find duplicate parameter names
  const findDuplicateNames = (names: string[]): Set<string> => {
    const duplicates = new Set<string>();
    const seen = new Set<string>();
    
    for (const name of names) {
      if (name.trim() === '') continue;
      if (seen.has(name)) {
        duplicates.add(name);
      } else {
        seen.add(name);
      }
    }
    
    return duplicates;
  };

  // Get duplicate names for input parameters
  const inputParamNames = selectedNode.data.parameters?.map(p => p.name) || [];
  const duplicateInputNames = findDuplicateNames(inputParamNames);

  // Get duplicate names for output parameters
  const outputParamNames = selectedNode.data.outputs?.map(o => o.name) || [];
  const duplicateOutputNames = findDuplicateNames(outputParamNames);

  // Node is selected - show configuration form
  return (
    <aside className="node-config-panel">
      <div className="node-config-panel-header">
        <h3>{t('node.config.title')}</h3>
      </div>
      <div className="node-config-panel-content">
        <div className="config-node-info">
          <div className="info-section">
            <h4>{t('node.config.basicInfo')}</h4>
            
            {/* Name Input */}
            <div className="form-group">
              <label htmlFor="node-name">{t('node.config.name')}</label>
              <input
                id="node-name"
                type="text"
                className="form-input"
                value={selectedNode.data.name || selectedNode.data.label || ''}
                onChange={handleNameChange}
                placeholder={t('node.config.name')}
              />
            </div>

            {/* Type Dropdown */}
            <div className="form-group">
              <label htmlFor="node-type">{t('node.config.type')}</label>
              <select
                id="node-type"
                className="form-select"
                value={selectedNode.type}
                onChange={handleTypeChange}
              >
                <option value="function">Function</option>
                <option value="tool">Tool</option>
                <option value="subgraph">Subgraph</option>
              </select>
            </div>
          </div>

          <div className="info-section">
            <h4>{t('node.config.nodeInfo')}</h4>
            <div className="info-row">
              <span className="info-label">{t('node.config.id')}:</span>
              <span className="info-value">{selectedNode.id}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{t('node.config.position')}:</span>
              <span className="info-value">
                ({Math.round(selectedNode.position.x)}, {Math.round(selectedNode.position.y)})
              </span>
            </div>
          </div>

          <div className="info-section">
            <h4>{t('node.config.inputParams')}</h4>
            <div className="parameters-list">
              {selectedNode.data.parameters && selectedNode.data.parameters.length > 0 ? (
                selectedNode.data.parameters.map((param, index) => (
                  <div key={index} className="parameter-item">
                    <div className="parameter-row">
                      <input
                        type="text"
                        className={`form-input parameter-name-input ${duplicateInputNames.has(param.name) && param.name.trim() !== '' ? 'input-error' : ''}`}
                        value={param.name}
                        onChange={(e) => handleParameterNameChange(index, e.target.value)}
                        placeholder={t('node.config.paramName')}
                      />
                      <button
                        type="button"
                        className="btn-icon btn-delete"
                        onClick={() => handleDeleteParameter(index)}
                        title={t('node.config.deleteParam')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                    <div className="parameter-row">
                      <select
                        className="form-select parameter-type-select"
                        value={param.type}
                        onChange={(e) => handleParameterTypeChange(index, e.target.value as FieldType)}
                      >
                        <option value="string">string</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                        <option value="float">float</option>
                        <option value="array">array</option>
                        <option value="object">object</option>
                      </select>
                      <input
                        type="text"
                        className="form-input parameter-default-input"
                        value={String(param.defaultValue ?? '')}
                        onChange={(e) => handleParameterDefaultChange(index, e.target.value)}
                        placeholder={t('node.config.defaultValue')}
                      />
                    </div>
                    {duplicateInputNames.has(param.name) && param.name.trim() !== '' && (
                      <div className="parameter-error-message">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        {t('node.config.duplicateParam', { name: param.name })}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="config-placeholder">{t('node.config.noInputParams')}</p>
              )}
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-add-parameter"
              onClick={handleAddParameter}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              {t('node.config.addParameter')}
            </button>
          </div>

          <div className="info-section">
            <h4>{t('node.config.outputParams')}</h4>
            <div className="parameters-list">
              {selectedNode.data.outputs && selectedNode.data.outputs.length > 0 ? (
                selectedNode.data.outputs.map((output, index) => (
                  <div key={index} className="parameter-item">
                    <div className="parameter-row">
                      <input
                        type="text"
                        className={`form-input parameter-name-input ${duplicateOutputNames.has(output.name) && output.name.trim() !== '' ? 'input-error' : ''}`}
                        value={output.name}
                        onChange={(e) => handleOutputNameChange(index, e.target.value)}
                        placeholder={t('node.config.outputName')}
                      />
                      <button
                        type="button"
                        className="btn-icon btn-delete"
                        onClick={() => handleDeleteOutput(index)}
                        title={t('node.config.deleteOutput')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                    <div className="parameter-row">
                      <select
                        className="form-select parameter-type-select"
                        value={output.type}
                        onChange={(e) => handleOutputTypeChange(index, e.target.value as FieldType)}
                      >
                        <option value="string">string</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                        <option value="float">float</option>
                        <option value="array">array</option>
                        <option value="object">object</option>
                      </select>
                      <input
                        type="text"
                        className="form-input parameter-default-input"
                        value={String(output.defaultValue ?? '')}
                        onChange={(e) => handleOutputDefaultChange(index, e.target.value)}
                        placeholder={t('node.config.defaultValue')}
                      />
                    </div>
                    {duplicateOutputNames.has(output.name) && output.name.trim() !== '' && (
                      <div className="parameter-error-message">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        {t('node.config.duplicateOutput', { name: output.name })}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="config-placeholder">{t('node.config.noOutputParams')}</p>
              )}
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-add-parameter"
              onClick={handleAddOutput}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              {t('node.config.addOutput')}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
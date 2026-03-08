import React from 'react';
import { useEditorStore, selectAllStateFields } from '../store/useEditorStore';
import type { StateField, BasicFieldType, ReducerType } from '../types';
import { useTranslation } from '../i18n';

export const StateSchemaEditor: React.FC = () => {
  const { t } = useTranslation();
  const stateFields = useEditorStore(selectAllStateFields);
  const addStateField = useEditorStore((state) => state.addStateField);
  const updateStateField = useEditorStore((state) => state.updateStateField);
  const removeStateField = useEditorStore((state) => state.removeStateField);

  // Get field count for display
  const fieldCount = stateFields?.length || 0;

  // Handle add new field
  const handleAddField = () => {
    const newField: StateField = {
      id: `field_${Date.now()}`,
      name: '',
      type: { baseType: 'string' },
      required: true,
    };
    addStateField(newField);
  };

  // Handle delete field with confirmation
  const handleDeleteField = (fieldId: string, fieldName: string) => {
    const displayName = fieldName || t('stateSchema.fields.name');
    if (window.confirm(`${t('stateSchema.fields.delete')} "${displayName}"?`)) {
      removeStateField(fieldId);
    }
  };

  // Handle field name change
  const handleNameChange = (fieldId: string, newName: string) => {
    updateStateField(fieldId, { id: fieldId, name: newName });
  };

  // Handle field type change
  const handleTypeChange = (fieldId: string, newType: BasicFieldType) => {
    updateStateField(fieldId, { id: fieldId, type: { baseType: newType } });
  };

  // Handle reducer change
  const handleReducerChange = (fieldId: string, newReducer: ReducerType) => {
    updateStateField(fieldId, { id: fieldId, reducer: newReducer });
  };

  // Handle default value change
  const handleDefaultValueChange = (fieldId: string, value: string) => {
    const field = stateFields.find(f => f.id === fieldId);
    if (!field) return;
    
    let parsedValue: string | number | boolean | null = value;
    
    const baseType = field.type.baseType;
    if (value.trim() === '') {
      parsedValue = null;
    } else if (baseType === 'number' || baseType === 'float') {
      const num = parseFloat(value);
      parsedValue = isNaN(num) ? value : num;
    } else if (baseType === 'boolean') {
      parsedValue = value.toLowerCase() === 'true';
    } else {
      try {
        parsedValue = JSON.parse(value);
      } catch {
        parsedValue = value;
      }
    }
    
    updateStateField(fieldId, { id: fieldId, defaultValue: parsedValue });
  };

  // Get default value display string
  const getDefaultValueDisplay = (field: StateField): string => {
    if (field.defaultValue === undefined || field.defaultValue === null) {
      return '';
    }
    if (typeof field.defaultValue === 'object') {
      return JSON.stringify(field.defaultValue);
    }
    return String(field.defaultValue);
  };

  // Find duplicate field names
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

  const fieldNames = stateFields.map(f => f.name);
  const duplicateNames = findDuplicateNames(fieldNames);

  return (
    <aside className="state-schema-editor">
      <div className="state-schema-editor-header">
        <h3>{t('stateSchema.editor.title')}</h3>
      </div>
      <div className="state-schema-editor-content">
        <div className="schema-info">
          <p className="schema-field-count">
            <span className="field-count-number">{fieldCount}</span>
            <span className="field-count-label">
              {t('stateSchema.editor.fieldCount', { count: fieldCount })}
            </span>
          </p>
          <p className="schema-description">
            {t('stateSchema.editor.description')}
          </p>
        </div>
        
        {fieldCount === 0 ? (
          <div className="schema-empty-state">
            <div className="empty-state-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="9" x2="15" y2="9"></line>
                <line x1="9" y1="13" x2="15" y2="13"></line>
                <line x1="9" y1="17" x2="11" y2="17"></line>
              </svg>
            </div>
            <p className="empty-state-title">{t('stateSchema.emptyState.title')}</p>
            <p className="empty-state-description">
              {t('stateSchema.emptyState.description')}
            </p>
          </div>
        ) : (
          <div className="schema-fields-list">
            <h4>{t('stateSchema.fields.title')}</h4>
            <div className="field-list-container">
              {stateFields.map((field) => {
                const hasDuplicate = duplicateNames.has(field.name) && field.name.trim() !== '';
                const hasEmptyName = !field.name.trim();
                const hasError = hasDuplicate || hasEmptyName;
                
                return (
                  <div key={field.id} className="field-item">
                    <div className="field-row">
                      <input
                        type="text"
                        className={`form-input field-name-input ${hasError ? 'input-error' : ''}`}
                        value={field.name}
                        onChange={(e) => handleNameChange(field.id, e.target.value)}
                        placeholder={t('stateSchema.fields.name')}
                      />
                      <label className="field-required-label">
                        <input
                          type="checkbox"
                          checked={field.required !== false}
                          onChange={(e) => updateStateField(field.id, { id: field.id, required: e.target.checked })}
                          title={t('stateSchema.fields.required')}
                        />
                        {t('stateSchema.fields.required')}
                      </label>
                      <button
                        type="button"
                        className="btn-icon btn-delete"
                        onClick={() => handleDeleteField(field.id, field.name)}
                        title={t('stateSchema.fields.delete')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                    <div className="field-row field-config-row">
                      <select
                        className="form-select field-type-select"
                        value={field.type.baseType}
                        onChange={(e) => handleTypeChange(field.id, e.target.value as BasicFieldType)}
                        title={t('stateSchema.fields.type')}
                      >
                        <option value="string">{t('stateSchema.types.string')}</option>
                        <option value="number">{t('stateSchema.types.int')}</option>
                        <option value="boolean">{t('stateSchema.types.bool')}</option>
                        <option value="float">{t('stateSchema.types.float')}</option>
                      </select>
                      <select
                        className="form-select field-reducer-select"
                        value={field.reducer || 'replace'}
                        onChange={(e) => handleReducerChange(field.id, e.target.value as ReducerType)}
                        title={t('stateSchema.fields.reducer')}
                      >
                        <option value="replace">{t('stateSchema.reducers.replace')}</option>
                        <option value="append">{t('stateSchema.reducers.append')}</option>
                        <option value="sum">{t('stateSchema.reducers.sum')}</option>
                        <option value="max">{t('stateSchema.reducers.max')}</option>
                        <option value="min">{t('stateSchema.reducers.min')}</option>
                      </select>
                    </div>
                    <div className="field-row">
                      <input
                        type="text"
                        className="form-input field-default-input"
                        value={getDefaultValueDisplay(field)}
                        onChange={(e) => handleDefaultValueChange(field.id, e.target.value)}
                        placeholder={t('stateSchema.fields.defaultValue')}
                      />
                    </div>
                    {hasError && (
                      <div className="field-error-message">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        {hasEmptyName ? t('stateSchema.fields.emptyName') : t('stateSchema.fields.duplicateName', { name: field.name })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        <div className="schema-actions">
          <button
            type="button"
            className="btn btn-primary btn-add-field"
            onClick={handleAddField}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {t('stateSchema.fields.addField')}
          </button>
        </div>
      </div>
    </aside>
  );
};
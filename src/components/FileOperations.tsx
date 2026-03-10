/**
 * FileOperations Component
 * 
 * Provides file operations for the LangGraph Visual Editor:
 * - Save project as JSON
 * - Load project from JSON
 * - Export generated Python code
 * - Create new project (reset canvas)
 */

import { useEditorStore, selectGraphDocument, selectIsDirty } from '../store/useEditorStore';
import { generateLangGraphCode } from '../utils/codeGenerator';
import { useTranslation } from '../i18n';

/**
 * FileOperations component with toolbar buttons
 */
export function FileOperations() {
  const { t } = useTranslation();
  const graphDocument = useEditorStore(selectGraphDocument);
  const isDirty = useEditorStore(selectIsDirty);
  const { resetGraphDocument, setGraphDocument, markClean, resetNodeNaming } = useEditorStore();

  /**
   * Save project as JSON file
   */
  const handleSaveProject = () => {
    if (!graphDocument) {
      alert(t('file.alerts.noProjectToSave'));
      return;
    }

    const documentToSave = {
      ...graphDocument,
      metadata: {
        ...graphDocument.metadata,
        updatedAt: new Date().toISOString(),
      },
    };

    const jsonString = JSON.stringify(documentToSave, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${graphDocument.metadata.name.replace(/[^a-z0-9]/gi, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    markClean();
  };

  /**
   * Load project from JSON file
   */
  const handleLoadProject = () => {
    if (isDirty) {
      const confirmed = window.confirm(t('file.confirm.unsavedChangesLoad'));
      if (!confirmed) {
        return;
      }
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonString = event.target?.result as string;
          const loadedDocument = JSON.parse(jsonString);
          
          if (!loadedDocument.version || !loadedDocument.metadata || !loadedDocument.nodes) {
            throw new Error(t('file.alerts.invalidFormat'));
          }

          setGraphDocument(loadedDocument);
          resetNodeNaming(loadedDocument);
        } catch (error) {
          alert(t('file.alerts.loadFailed', { error: error instanceof Error ? error.message : 'Unknown error' }));
        }
      };
      
      reader.onerror = () => {
        alert(t('file.alerts.fileReadFailed'));
      };
      
      reader.readAsText(file);
    };

    input.click();
  };

  /**
   * Export generated Python code as .py file
   */
  const handleExportCode = () => {
    if (!graphDocument) {
      alert(t('file.alerts.noProjectToExport'));
      return;
    }

    const pythonCode = generateLangGraphCode(graphDocument);
    const blob = new Blob([pythonCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${graphDocument.metadata.name.replace(/[^a-z0-9]/gi, '_')}.py`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /**
   * Create new project (reset canvas)
   */
  const handleNewProject = () => {
    if (isDirty) {
      const confirmed = window.confirm(t('file.confirm.unsavedChangesNew'));
      if (!confirmed) {
        return;
      }
    }

    resetGraphDocument();
  };

  return (
    <div className="file-operations">
      <button
        onClick={handleNewProject}
        className="file-button new-button"
        title={t('file.operations.newTitle')}
        type="button"
      >
        {t('file.operations.new')}
      </button>
      <button
        onClick={handleLoadProject}
        className="file-button load-button"
        title={t('file.operations.loadTitle')}
        type="button"
      >
        {t('file.operations.load')}
      </button>
      <button
        onClick={handleSaveProject}
        className="file-button save-button"
        title={t('file.operations.saveTitle')}
        disabled={!graphDocument}
        type="button"
      >
        {t('file.operations.save')} {isDirty && '*'}
      </button>
      <button
        onClick={handleExportCode}
        className="file-button export-button"
        title={t('file.operations.exportTitle')}
        disabled={!graphDocument}
        type="button"
      >
        {t('file.operations.exportCode')}
      </button>
    </div>
  );
}

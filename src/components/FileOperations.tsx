/**
 * FileOperations Component
 * 
 * Provides file operations for the LangGraph Visual Editor:
 * - Save project as JSON
 * - Load project from JSON
 * - Export generated Python code
 * - Create new project (reset canvas)
 * 
 * Task 7.1-7.5: Implement file operations
 */


import { useEditorStore, selectGraphDocument, selectIsDirty } from '../store/useEditorStore';
import { generateLangGraphCode } from '../utils/codeGenerator';

/**
 * FileOperations component with toolbar buttons
 */
export function FileOperations() {
  const graphDocument = useEditorStore(selectGraphDocument);
  const isDirty = useEditorStore(selectIsDirty);
  const { resetGraphDocument, setGraphDocument, markClean } = useEditorStore();

  /**
   * Task 7.1: Save project as JSON file
   * Uses browser download API to save the graph document
   */
  const handleSaveProject = () => {
    if (!graphDocument) {
      alert('No project to save');
      return;
    }

    // Update metadata before saving
    const documentToSave = {
      ...graphDocument,
      metadata: {
        ...graphDocument.metadata,
        updatedAt: new Date().toISOString(),
      },
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(documentToSave, null, 2);
    
    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${graphDocument.metadata.name.replace(/[^a-z0-9]/gi, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Mark as clean after save
    markClean();
  };

  /**
   * Task 7.2: Load project from JSON file
   * Uses browser file upload API to load a graph document
   */
  const handleLoadProject = () => {
    // Task 7.5: Check for unsaved changes
    if (isDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes. Loading a new project will discard them. Continue?'
      );
      if (!confirmed) {
        return;
      }
    }

    // Create file input
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
          
          // Validate basic structure
          if (!loadedDocument.version || !loadedDocument.metadata || !loadedDocument.nodes) {
            throw new Error('Invalid project file format');
          }

          // Load the document
          setGraphDocument(loadedDocument);
        } catch (error) {
          alert(`Failed to load project: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      };
      
      reader.onerror = () => {
        alert('Failed to read file');
      };
      
      reader.readAsText(file);
    };

    input.click();
  };

  /**
   * Task 7.3: Export generated Python code as .py file
   * Uses code generator and browser download API
   */
  const handleExportCode = () => {
    if (!graphDocument) {
      alert('No project to export');
      return;
    }

    // Generate Python code
    const pythonCode = generateLangGraphCode(graphDocument);
    
    // Create blob and download
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
   * Task 7.4: Create new project (reset canvas)
   * Resets graph document to default empty state
   */
  const handleNewProject = () => {
    // Task 7.5: Check for unsaved changes
    if (isDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes. Creating a new project will discard them. Continue?'
      );
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
        title="Create new project"
        type="button"
      >
        New
      </button>
      <button
        onClick={handleLoadProject}
        className="file-button load-button"
        title="Load project from JSON file"
        type="button"
      >
        Load
      </button>
      <button
        onClick={handleSaveProject}
        className="file-button save-button"
        title="Save project as JSON file"
        disabled={!graphDocument}
        type="button"
      >
        Save {isDirty && '*'}
      </button>
      <button
        onClick={handleExportCode}
        className="file-button export-button"
        title="Export Python code"
        disabled={!graphDocument}
        type="button"
      >
        Export Code
      </button>
    </div>
  );
}
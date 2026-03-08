import { useMemo } from 'react';
import { generateLangGraphCode, validatePythonSyntax } from '../utils/codeGenerator';
import { GraphDocument } from '../types';

interface CodePreviewProps {
  document: GraphDocument;
}

export function CodePreview({ document }: CodePreviewProps) {
  // Generate code from document
  const generatedCode = useMemo(() => {
    return generateLangGraphCode(document);
  }, [document]);

  // Validate syntax
  const validation = useMemo(() => {
    return validatePythonSyntax(generatedCode);
  }, [generatedCode]);

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      alert('Code copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy code');
    }
  };

  return (
    <div className="code-preview-container">
      <div className="code-preview-header">
        <h3>Generated Python Code</h3>
        <div className="code-preview-actions">
          <button
            className="copy-button"
            onClick={handleCopy}
            type="button"
          >
            📋 Copy Code
          </button>
        </div>
      </div>

      {/* Validation Status */}
      <div className={`validation-status ${validation.valid ? 'valid' : 'invalid'}`}>
        {validation.valid ? (
          <span className="status-indicator">✓</span>
        ) : (
          <span className="status-indicator">✗</span>
        )}
        <span className="status-text">
          {validation.valid
            ? 'Syntax validation passed'
            : `Syntax errors detected (${validation.errors.length})`}
        </span>
      </div>

      {/* Error Messages */}
      {!validation.valid && validation.errors.length > 0 && (
        <div className="validation-errors">
          <h4>Errors:</h4>
          <ul>
            {validation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Code Display */}
      <pre className="code-display">
        <code>{generatedCode}</code>
      </pre>

      {/* Info Footer */}
      <div className="code-preview-footer">
        <p className="code-info">
          {generatedCode.split('\n').length} lines • Python 3.9+
        </p>
      </div>
    </div>
  );
}

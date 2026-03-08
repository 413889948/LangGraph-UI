/**
 * NodePalette component - Draggable node type source
 * 
 * This component provides a palette of draggable node types
 * that can be dropped onto the React Flow canvas to create new nodes.
 */

import React from 'react';
import { NodeType } from '../types';
import { useTranslation } from '../i18n';

interface NodePaletteProps {
  onDragStart: (event: React.DragEvent, nodeType: NodeType) => void;
  draggedNodeType?: NodeType | null;
}

/**
 * Node type definitions for the palette
 */
const NODE_TYPES: Array<{
  type: NodeType;
  labelKey: string;
  descriptionKey: string;
  color: string;
}> = [
  {
    type: 'function',
    labelKey: 'node.palette.types.function.label',
    descriptionKey: 'node.palette.types.function.description',
    color: '#4f46e5',
  },
  {
    type: 'tool',
    labelKey: 'node.palette.types.tool.label',
    descriptionKey: 'node.palette.types.tool.description',
    color: '#059669',
  },
  {
    type: 'subgraph',
    labelKey: 'node.palette.types.subgraph.label',
    descriptionKey: 'node.palette.types.subgraph.description',
    color: '#dc2626',
  },
];

/**
 * NodePalette component
 */
export const NodePalette: React.FC<NodePaletteProps> = ({ onDragStart }) => {
  const { t } = useTranslation();

  return (
    <div className="node-palette">
      <div className="node-palette-header">
        <h3>{t('node.palette.title')}</h3>
      </div>
      <div className="node-palette-content">
        {NODE_TYPES.map((nodeType) => (
          <div
            key={nodeType.type}
            className="node-palette-item"
            draggable
            onDragStart={(event) => onDragStart(event, nodeType.type)}
            style={{
              borderLeft: `4px solid ${nodeType.color}`,
            }}
          >
            <div className="node-palette-item-label">{t(nodeType.labelKey)}</div>
            <div className="node-palette-item-description">
              {t(nodeType.descriptionKey)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NodePalette;
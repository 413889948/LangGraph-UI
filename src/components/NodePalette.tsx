/**
 * NodePalette component - Minimal draggable node type source for task 3.3
 * 
 * This component provides a lightweight palette of draggable node types
 * that can be dropped onto the React Flow canvas to create new nodes.
 * This is a TEMPORARY implementation for task 3.3 only.
 * The full sidebar/toolbar layout is scheduled for task 8.3.
 */

import React from 'react';
import { NodeType } from '../types';

interface NodePaletteProps {
  onDragStart: (event: React.DragEvent, nodeType: NodeType) => void;
  draggedNodeType?: NodeType | null;
}

/**
 * Node type definitions for the palette
 */
const NODE_TYPES: Array<{
  type: NodeType;
  label: string;
  description: string;
  color: string;
}> = [
  {
    type: 'function',
    label: 'Function',
    description: 'Regular Python function node',
    color: '#4f46e5',
  },
  {
    type: 'tool',
    label: 'Tool',
    description: 'LangChain Tool node',
    color: '#059669',
  },
  {
    type: 'subgraph',
    label: 'Subgraph',
    description: 'Nested graph structure',
    color: '#dc2626',
  },
];

/**
 * NodePalette component
 */
export const NodePalette: React.FC<NodePaletteProps> = ({ onDragStart }) => {
  return (
    <div className="node-palette">
      <div className="node-palette-header">
        <h3>Nodes</h3>
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
            <div className="node-palette-item-label">{nodeType.label}</div>
            <div className="node-palette-item-description">
              {nodeType.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NodePalette;

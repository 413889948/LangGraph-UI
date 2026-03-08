/**
 * GraphCanvas component - React Flow canvas for LangGraph Visual Editor
 */

import React from 'react';
import { ReactFlow, ReactFlowProvider, Controls, Background, useNodesState, useEdgesState, Node, Edge, getBezierPath, Handle, Position, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEditorStore, selectAllNodes, selectAllEdges } from '../store/useEditorStore';
import { GraphNode, GraphEdge, NodeType, NodeData } from '../types';
import { v4 as uuidv4 } from 'uuid';

const convertToReactFlowNode = (node: GraphNode): Node => ({
  id: node.id,
  type: node.type,
  position: node.position,
  data: { label: node.data.label || node.data.name },
});

const convertToReactFlowEdge = (edge: GraphEdge): Edge => ({
  id: edge.id,
  source: edge.source,
  target: edge.target,
  type: edge.type,
  label: edge.type === 'conditional' ? edge.condition : undefined,
  style: { stroke: edge.type === 'conditional' ? '#ff6b6b' : '#555', strokeWidth: 2 },
});

// Type-specific color configuration
const NODE_TYPE_COLORS: Record<NodeType, { border: string; accent: string }> = {
  function: { border: '#3b82f6', accent: '#3b82f6' }, // blue
  tool: { border: '#22c55e', accent: '#22c55e' }, // green
  subgraph: { border: '#a855f7', accent: '#a855f7' }, // purple
};

const DefaultNode: React.FC<any> = ({ data, type }) => {
  const nodeType = (type as NodeType) || 'function';
  const colors = NODE_TYPE_COLORS[nodeType];
  
  return (
    <div style={{ 
      border: `2px solid ${colors.border}`, 
      borderRadius: '4px', 
      minWidth: 150, 
      background: '#fff', 
      padding: '10px',
      position: 'relative',
      boxShadow: `0 1px 3px ${colors.border}33`,
    }}>
      <div style={{ 
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{ 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          background: colors.accent 
        }} />
        {data.label}
      </div>
      <Handle 
        type="source" 
        position={Position.Top} 
        id="source" 
        style={{ background: colors.accent, border: '2px solid #fff', width: 8, height: 8 }} 
      />
      <Handle 
        type="target" 
        position={Position.Bottom} 
        id="target" 
        style={{ background: colors.accent, border: '2px solid #fff', width: 8, height: 8 }} 
      />
    </div>
  );
};
const DefaultEdge: React.FC<any> = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, label }) => {
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  return (
    <>
      <path id={id} className="react-flow__edge-path" style={style} markerEnd={markerEnd} d={edgePath} />
      {label && (
        <foreignObject width={120} x={labelX - 60} y={labelY - 15} style={{ overflow: 'visible' }}>
          <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', background: '#fff', padding: '2px 6px', borderRadius: '3px', border: '1px solid #ddd' }}>{label}</div>
        </foreignObject>
      )}
    </>
  );
};

const createDefaultNodeData = (type: NodeType, name: string): NodeData => ({ type, name, label: name, parameters: [], outputs: [] });


interface GraphCanvasInnerProps {
  draggedNodeType: NodeType | null;
  onDraggedNodeTypeChange: (type: NodeType | null) => void;
}

const GraphCanvasInner: React.FC<GraphCanvasInnerProps> = ({ draggedNodeType, onDraggedNodeTypeChange }) => {
  const nodes = useEditorStore(selectAllNodes);
  const edges = useEditorStore(selectAllEdges);
  const resetGraphDocument = useEditorStore((state) => state.resetGraphDocument);
  const addNode = useEditorStore((state) => state.addNode);
  const updateNode = useEditorStore((state) => state.updateNode);
  const removeNode = useEditorStore((state) => state.removeNode);
  const selectNode = useEditorStore((state) => state.selectNode);
  const selectElement = useEditorStore((state) => state.selectElement);
  const clearSelection = useEditorStore((state) => state.clearSelection);
  const addEdge = useEditorStore((state) => state.addEdge);
  const removeEdge = useEditorStore((state) => state.removeEdge);
  const setViewport = useEditorStore((state) => state.setViewport);
  const { screenToFlowPosition } = useReactFlow();

  const rfNodes: Node[] = React.useMemo(() => nodes.map(convertToReactFlowNode), [nodes]);
  const rfEdges: Edge[] = React.useMemo(() => edges.map(convertToReactFlowEdge), [edges]);

  const nodeTypes = React.useMemo(() => ({ function: DefaultNode, tool: DefaultNode, subgraph: DefaultNode }), []);
  const edgeTypes = React.useMemo(() => ({ direct: DefaultEdge, conditional: DefaultEdge }), []);

  const [nodeList, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edgeList, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  React.useEffect(() => { setNodes(rfNodes); }, [rfNodes, setNodes]);
  React.useEffect(() => { setEdges(rfEdges); }, [rfEdges, setEdges]);
  React.useEffect(() => {
    const state = useEditorStore.getState();
    if (!state.graphDocument) resetGraphDocument();
  }, [resetGraphDocument]);

  const onDragOver = React.useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = React.useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!draggedNodeType) return;

    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const id = uuidv4();
    const name = `${draggedNodeType}_${id.slice(0, 8)}`;
    const newNode: GraphNode = { id, type: draggedNodeType, data: createDefaultNodeData(draggedNodeType, name), position };

    addNode(newNode);
    onDraggedNodeTypeChange(null);
  }, [draggedNodeType, screenToFlowPosition, addNode, onDraggedNodeTypeChange]);

  // Handle edge connection creation
  const onConnect = React.useCallback(
    (connection: { source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null }) => {
      // Validate connection - prevent self-connections
      if (connection.source === connection.target) {
        return;
      }

      const id = uuidv4();
      const newEdge: GraphEdge = {
        id,
        source: connection.source,
        target: connection.target,
        type: 'direct',
      };

      addEdge(newEdge);
    },
    [addEdge]
  );

  // Handle node drag stop - persist new position to store
  const onNodeDragStop = React.useCallback((_event: React.MouseEvent, node: Node) => {
    updateNode(node.id, { position: node.position });
  }, [updateNode]);

  // Handle node click - update selection state
  const onNodeClick = React.useCallback((_event: React.MouseEvent, node: Node) => {
    selectNode(node.id);
  }, [selectNode]);

  // Handle edge click - update selection state
  const onEdgeClick = React.useCallback((_event: React.MouseEvent, edge: Edge) => {
    selectElement(edge.id);
  }, [selectElement]);

  // Handle pane click - clear selection
  const onPaneClick = React.useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  // Handle viewport move end - sync to store
  const onMoveEnd = React.useCallback((_event: MouseEvent | TouchEvent | null, viewport: { x: number; y: number; zoom: number }) => {
    setViewport({ x: viewport.x, y: viewport.y, zoom: viewport.zoom });
  }, [setViewport]);


  // Handle node and edge deletion via keyboard
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const state = useEditorStore.getState();
        // Delete selected node if a node is selected
        if (state.selectedNodeId) {
          removeNode(state.selectedNodeId);
        }
        // Delete selected edge if an edge is selected (and no node is selected)
        else if (state.selectedElementId) {
          removeEdge(state.selectedElementId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [removeNode, removeEdge]);

  return (
    <div className="graph-canvas-container">
      <ReactFlow
        nodes={nodeList}
        edges={edgeList}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onMoveEnd={onMoveEnd}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
      >
        <Background color="#aaa" gap={15} />
        <Controls />
      </ReactFlow>
    </div>
  );
};

interface GraphCanvasProps {
  draggedNodeType: NodeType | null;
  onDraggedNodeTypeChange: (type: NodeType | null) => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({ draggedNodeType, onDraggedNodeTypeChange }) => (
  <ReactFlowProvider>
    <GraphCanvasInner draggedNodeType={draggedNodeType} onDraggedNodeTypeChange={onDraggedNodeTypeChange} />
  </ReactFlowProvider>
);

export default GraphCanvas;

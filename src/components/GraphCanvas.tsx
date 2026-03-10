/**
 * GraphCanvas component - React Flow canvas for LangGraph Visual Editor
 * 
 * Architecture: Controlled state pattern with xyflow best practices
 * - React Flow owns transient interaction state (drag, connect, pan, zoom)
 * - Zustand store remains document source of truth (persisted state)
 * - Guarded reconciliation prevents clobbering in-flight interactions
 */
import React from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  Node,
  Edge,
  Connection,
  getBezierPath,
  Handle,
  Position,
  useReactFlow,
  useNodesState,
  useEdgesState,
  addEdge as addReactFlowEdge,
  NodeChange,
  EdgeChange,
  OnMoveEnd,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEditorStore, selectAllNodes, selectAllEdges } from '../store/useEditorStore';
import { GraphNode, GraphEdge, NodeType, NodeData } from '../types';
import { v4 as uuidv4 } from 'uuid';

const GRAPH_STORAGE_KEY = 'langgraph-graph-document';

// Type-specific color configuration
const NODE_TYPE_COLORS: Record<NodeType, { border: string; accent: string }> = {
  function: { border: '#3b82f6', accent: '#3b82f6' }, // blue
  tool: { border: '#22c55e', accent: '#22c55e' }, // green
  subgraph: { border: '#a855f7', accent: '#a855f7' }, // purple
};

interface DefaultNodeProps {
  id: string;
  data: { label: string };
  type?: string;
  selected: boolean;
}

const DefaultNode: React.FC<DefaultNodeProps> = ({ data, type, selected }) => {
  const nodeType = (type as NodeType) || 'function';
  const colors = NODE_TYPE_COLORS[nodeType];
  
  const typeLabels: Record<NodeType, string> = {
    function: 'FUNC',
    tool: 'TOOL',
    subgraph: 'SUBGRAPH',
  };
  
  return (
    <div className="cyberflow-node" style={{ 
      position: 'relative',
      minWidth: 180,
      background: 'var(--bg-secondary)',
      border: `2px solid ${selected ? colors.accent : colors.border}`,
      borderRadius: '6px',
      overflow: 'visible',
      boxShadow: selected 
        ? `0 0 0 2px ${colors.accent}, 0 0 20px ${colors.accent}66, 0 8px 24px rgba(0, 0, 0, 0.5)` 
        : `0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 1px ${colors.border}44`,
      transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
    }}>
      {/* Scanline overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0, 0, 0, 0.03) 2px,
          rgba(0, 0, 0, 0.03) 4px
        )`,
        pointerEvents: 'none',
        zIndex: 1,
      }} />
      
      {/* Selected state glow border */}
      {selected && (
        <div style={{
          position: 'absolute',
          inset: -2,
          borderRadius: '8px',
          boxShadow: `0 0 20px ${colors.accent}, 0 0 40px ${colors.accent}44`,
          pointerEvents: 'none',
          zIndex: 0,
        }} />
      )}
      
      {/* Title bar */}
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 10px',
        background: `linear-gradient(135deg, ${colors.border}22 0%, ${colors.border}11 100%)`,
        borderBottom: `1px solid ${colors.border}44`,
        zIndex: 2,
        position: 'relative',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span style={{ 
            width: '10px', 
            height: '10px', 
            borderRadius: '50%', 
            background: colors.accent,
            boxShadow: `0 0 8px ${colors.accent}`,
          }} />
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: colors.accent,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}>
            {typeLabels[nodeType]}
          </span>
        </div>
        {/* Decorative corner accent */}
        <span style={{
          width: '16px',
          height: '16px',
          borderRight: `2px solid ${colors.accent}`,
          borderBottom: `2px solid ${colors.accent}`,
          opacity: 0.6,
          display: 'block',
        }} />
      </div>
      
      {/* Content area */}
      <div style={{
        padding: '12px 10px',
        zIndex: 2,
        position: 'relative',
      }}>
        <div style={{ 
          fontWeight: 600,
          fontSize: '14px',
          color: 'var(--text-primary)',
          letterSpacing: '0.3px',
          wordBreak: 'break-word',
        }}>
          {data.label}
        </div>
      </div>
      
      {/* Source handle (top) */}
      <Handle 
        type="source" 
        position={Position.Top} 
        id="source" 
        className="react-flow__handle-source"
        style={{ 
          width: '12px', 
          height: '12px',
          background: colors.accent,
          border: '2px solid var(--bg-secondary)',
          boxShadow: selected ? `0 0 12px ${colors.accent}` : 'none',
          zIndex: 10,
          pointerEvents: 'auto',
          cursor: 'crosshair',
        }}
      />
      
      {/* Target handle (bottom) */}
      <Handle 
        type="target" 
        position={Position.Bottom} 
        id="target" 
        className="react-flow__handle-target"
        style={{ 
          width: '12px', 
          height: '12px',
          background: colors.accent,
          border: '2px solid var(--bg-secondary)',
          boxShadow: selected ? `0 0 12px ${colors.accent}` : 'none',
          zIndex: 10,
          pointerEvents: 'auto',
          cursor: 'crosshair',
        }}
      />
    </div>
  );
};

interface DefaultEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  style?: React.CSSProperties;
  markerEnd?: string;
  label?: React.ReactNode;
}

const DefaultEdge: React.FC<DefaultEdgeProps> = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, label }) => {
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  
  return (
    <>
      {/* Base edge path */}
      <path 
        id={id} 
        className="react-flow__edge-path" 
        style={{
          ...style,
          strokeWidth: 2.5,
        }} 
        markerEnd={markerEnd} 
        d={edgePath} 
      />
      {/* Neon gradient overlay */}
      <path 
        d={edgePath}
        fill="none"
        stroke="url(#edge-gradient)"
        strokeWidth="1.5"
        style={{ opacity: 0.6 }}
      />
      {label && (
        <foreignObject width={120} x={labelX - 60} y={labelY - 15} style={{ overflow: 'visible' }}>
          <div style={{ 
            fontSize: '11px', 
            color: 'var(--text-secondary)', 
            textAlign: 'center', 
            background: 'var(--bg-tertiary)', 
            padding: '3px 8px', 
            borderRadius: '4px', 
            border: '1px solid var(--border-color)',
            fontWeight: 600,
            letterSpacing: '0.3px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          }}>{label}</div>
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
  // Store state - document source of truth
  const nodes = useEditorStore(selectAllNodes);
  const edges = useEditorStore(selectAllEdges);
  const addNode = useEditorStore((state) => state.addNode);
  const getNextNodeName = useEditorStore((state) => state.getNextNodeName);
  const updateNode = useEditorStore((state) => state.updateNode);
  const removeNode = useEditorStore((state) => state.removeNode);
  const selectNode = useEditorStore((state) => state.selectNode);
  const selectElement = useEditorStore((state) => state.selectElement);
  const clearSelection = useEditorStore((state) => state.clearSelection);
  const addGraphEdge = useEditorStore((state) => state.addEdge);
  const removeEdge = useEditorStore((state) => state.removeEdge);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const setViewport = useEditorStore((state) => state.setViewport);
  const { screenToFlowPosition } = useReactFlow();

  // Convert store nodes/edges to React Flow format
  const rfNodes: Node[] = React.useMemo(() => nodes.map((node: GraphNode): Node => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: { label: node.data.label || node.data.name },
  })), [nodes]);

  const rfEdges: Edge[] = React.useMemo(() => edges.map((edge: GraphEdge): Edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: edge.type,
    label: edge.type === 'conditional' ? edge.condition : undefined,
    style: { stroke: edge.type === 'conditional' ? '#ff6b6b' : '#555', strokeWidth: 2 },
  })), [edges]);

  // React Flow internal state - owns transient interaction state
  const [canvasNodes, setCanvasNodes, onCanvasNodesChange] = useNodesState<Node>([]);
  const [canvasEdges, setCanvasEdges, onCanvasEdgesChange] = useEdgesState<Edge>([]);
  const [isConnecting, setIsConnecting] = React.useState(false);

  // Custom node and edge types
  const nodeTypes = React.useMemo(() => ({
    function: DefaultNode,
    tool: DefaultNode,
    subgraph: DefaultNode,
  }), []);

  const edgeTypes = React.useMemo(() => ({
    direct: DefaultEdge,
    conditional: DefaultEdge,
  }), []);

  // Guarded reconciliation: sync store to canvas only when content actually changes
  React.useEffect(() => {
    setCanvasNodes((prevNodes) => {
      if (prevNodes.length !== rfNodes.length) {
        return rfNodes;
      }
      
      const hasChanges = prevNodes.some((prevNode, index) => {
        const nextNode = rfNodes[index];
        return (
          prevNode.id !== nextNode.id ||
          prevNode.type !== nextNode.type ||
          prevNode.position.x !== nextNode.position.x ||
          prevNode.position.y !== nextNode.position.y ||
          prevNode.data.label !== nextNode.data.label
        );
      });
      
      return hasChanges ? rfNodes : prevNodes;
    });
  }, [rfNodes, setCanvasNodes]);

  React.useEffect(() => {
    setCanvasEdges((prevEdges) => {
      if (isConnecting) {
        return prevEdges;
      }

      if (prevEdges.length !== rfEdges.length) {
        return rfEdges;
      }
      
      const hasChanges = prevEdges.some((prevEdge, index) => {
        const nextEdge = rfEdges[index];
        return (
          prevEdge.id !== nextEdge.id ||
          prevEdge.source !== nextEdge.source ||
          prevEdge.target !== nextEdge.target ||
          prevEdge.type !== nextEdge.type ||
          prevEdge.label !== nextEdge.label
        );
      });
      
      return hasChanges ? rfEdges : prevEdges;
    });
  }, [isConnecting, rfEdges, setCanvasEdges]);

  // Handle node changes (drag, remove, etc.)
  const onNodesChange = React.useCallback((changes: NodeChange[]) => {
    onCanvasNodesChange(changes);
  }, [onCanvasNodesChange]);

  // Handle edge changes (remove, etc.)
  const onEdgesChange = React.useCallback((changes: EdgeChange[]) => {
    onCanvasEdgesChange(changes);
  }, [onCanvasEdgesChange]);

  // Handle edge connection creation
  const onConnect = React.useCallback(
    (connection: Connection) => {
      const { source, target, sourceHandle = null, targetHandle = null } = connection;

      if (!source || !target) {
        return;
      }

      // Validate connection - prevent self-connections
      if (source === target) {
        return;
      }

      const id = uuidv4();

      // Optimistic update: add to canvas immediately with full connection metadata
      setCanvasEdges((prevEdges) => {
        const exists = prevEdges.some(
          (edge) =>
            edge.source === source &&
            edge.target === target &&
            (edge.sourceHandle ?? null) === sourceHandle &&
            (edge.targetHandle ?? null) === targetHandle &&
            edge.type === 'direct'
        );

        if (exists) {
          return prevEdges;
        }

        return addReactFlowEdge(
          {
            ...connection,
            id,
            type: 'direct',
            style: { stroke: '#555', strokeWidth: 2 },
          },
          prevEdges
        );
      });

      // Persist to store
      const existsInStore = edges.some(
        (edge) => edge.source === source && edge.target === target && edge.type === 'direct'
      );
      if (existsInStore) {
        return;
      }

      const newEdge: GraphEdge = {
        id,
        source,
        target,
        type: 'direct',
      };

      addGraphEdge(newEdge);
    },
    [addGraphEdge, edges, setCanvasEdges]
  );

  const onConnectStart = React.useCallback(() => {
    setIsConnecting(true);
  }, []);

  const onConnectEnd = React.useCallback(() => {
    setIsConnecting(false);
  }, []);

  // Handle drag over for drop zone
  const onDragOver = React.useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop - create new node
  const onDrop = React.useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!draggedNodeType) return;

    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const id = uuidv4();
    const name = getNextNodeName(draggedNodeType);
    const newNode: GraphNode = { 
      id, 
      type: draggedNodeType, 
      data: createDefaultNodeData(draggedNodeType, name), 
      position,
    };

    // Optimistic update: add to canvas immediately for visual feedback
    setCanvasNodes((prevNodes) => {
      if (prevNodes.some((node) => node.id === id)) {
        return prevNodes;
      }
      return [...prevNodes, {
        id: newNode.id,
        type: newNode.type,
        position: newNode.position,
        data: { label: newNode.data.label },
      }];
    });

    // Persist to store
    addNode(newNode);
    onDraggedNodeTypeChange(null);
  }, [draggedNodeType, screenToFlowPosition, addNode, getNextNodeName, onDraggedNodeTypeChange, setCanvasNodes]);

  // Handle node drag stop - persist new position to store
  const onNodeDragStop = React.useCallback((_event: React.MouseEvent, node: Node) => {
    updateNode(node.id, { position: node.position });
  }, [updateNode]);

  // Handle node click - update selection state
  const onNodeClick = React.useCallback((_: React.MouseEvent, node: Node) => {
    selectNode(node.id);
  }, [selectNode]);

  // Handle edge click - update selection state
  const onEdgeClick = React.useCallback((_: React.MouseEvent, edge: Edge) => {
    selectElement(edge.id);
  }, [selectElement]);

  // Handle pane click - clear selection
  const onPaneClick = React.useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  // Handle viewport move end - sync to store
  const onMoveEnd = React.useCallback<OnMoveEnd>((_, viewport) => {
    setViewport({ x: viewport.x, y: viewport.y, zoom: viewport.zoom });
  }, [setViewport]);

  // Handle node and edge deletion via keyboard
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const target = event.target as HTMLElement;
      const isInput = ['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable;

      if (isInput) {
        if (key === 'delete' || key === 'backspace') {
          return;
        }

        if ((event.ctrlKey || event.metaKey) && (key === 'z' || key === 'y')) {
          return;
        }
      }

      if ((event.ctrlKey || event.metaKey) && key === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if ((event.ctrlKey || event.metaKey) && key === 'y') {
        event.preventDefault();
        redo();
        return;
      }

      // Handle Ctrl+S / Cmd+S manual save shortcut
      if ((event.ctrlKey || event.metaKey) && key === 's') {
        event.preventDefault();
        const state = useEditorStore.getState();
        if (state.graphDocument) {
          try {
            localStorage.setItem(GRAPH_STORAGE_KEY, JSON.stringify(state.graphDocument));
            useEditorStore.getState().markClean();
          } catch (e) {
            // Save error silently - user will see dirty state indicator
          }
        }
        return;
      }

      if (key === 'delete' || key === 'backspace') {
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
  }, [removeNode, removeEdge, redo, undo]);

  return (
    <div className="graph-canvas-container">
      <ReactFlow
        nodes={canvasNodes}
        edges={canvasEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
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
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Controls />
        <Background color="var(--border-color)" gap={24} />
        {/* SVG gradient definition for neon edge effect */}
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <defs>
            <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--neon-blue)" />
              <stop offset="100%" stopColor="var(--border-color)" />
            </linearGradient>
          </defs>
        </svg>
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

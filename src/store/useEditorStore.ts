/**
 * Zustand store for LangGraph Visual Editor global state
 * 
 * This store manages the editor's core state including:
 * - Current graph document
 * - Selected node/element
 * - Viewport state
 * - Dirty flag for persistence tracking
 */

import { create } from 'zustand';
import { EdgeUpdate, GraphDocument, GraphEdge, ViewportState, GraphNode, StateField, StateFieldUpdate } from '../types';
/**
 * Editor state interface
 */
interface EditorState {
  // Core graph document
  graphDocument: GraphDocument | null;
  
  // Selection state
  selectedNodeId: string | null;
  selectedElementId: string | null; // Can be node or edge
  
  // Viewport state
  viewport: ViewportState;
  
  // Persistence tracking
  isDirty: boolean;
}

/**
 * Editor actions interface
 */
interface EditorActions {
  // Graph document operations
  setGraphDocument: (doc: GraphDocument) => void;
  resetGraphDocument: () => void;
  
  // Node CRUD operations
  addNode: (node: GraphNode) => void;
  updateNode: (nodeId: string, updates: Partial<GraphNode>) => void;
  removeNode: (nodeId: string) => void;
  getNodeById: (nodeId: string) => GraphNode | undefined;
  
  // Edge CRUD operations
  addEdge: (edge: GraphEdge) => void;
  updateEdge: (edgeId: string, updates: EdgeUpdate) => void;
  removeEdge: (edgeId: string) => void;
  getEdgeById: (edgeId: string) => GraphEdge | undefined;
  
  // State Schema field operations
  addStateField: (field: StateField) => void;
  updateStateField: (fieldId: string, updates: StateFieldUpdate) => void;
  removeStateField: (fieldId: string) => void;
  getStateFieldById: (fieldId: string) => StateField | undefined;
  
  // Selection operations
  selectNode: (nodeId: string | null) => void;
  selectElement: (elementId: string | null) => void;
  clearSelection: () => void;
  getSelectedNode: () => GraphNode | undefined;
  getSelectedEdge: () => GraphEdge | undefined;
  isSelectedNode: (nodeId: string) => boolean;
  isSelectedElement: (elementId: string) => boolean;
  
  // Viewport operations
  setViewport: (viewport: Partial<ViewportState>) => void;
  setViewportX: (x: number) => void;
  setViewportY: (y: number) => void;
  setViewportZoom: (zoom: number) => void;
  resetViewport: () => void;
  fitViewportToNodes: () => void;
  
  // Persistence operations
  markDirty: () => void;
  markClean: () => void;
}
/**
 * Initial viewport state
 */
const INITIAL_VIEWPORT: ViewportState = {
  x: 0,
  y: 0,
  zoom: 1,
};

/**
 * Create default graph document
 */
const createDefaultGraphDocument = (): GraphDocument => ({
  version: '1.0.0',
  metadata: {
    name: 'Untitled Project',
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    description: '',
  },
  nodes: [],
  edges: [],
  stateSchema: {
    fields: [],
  },
  viewport: { ...INITIAL_VIEWPORT },
});

/**
 * Editor Zustand store
 */
export const useEditorStore = create<EditorState & EditorActions>((set, get) => ({
  // Initial state
  graphDocument: null,
  selectedNodeId: null,
  selectedElementId: null,
  viewport: { ...INITIAL_VIEWPORT },
  isDirty: false,
  
  // Graph document operations
  setGraphDocument: (doc) => {
    set({ graphDocument: doc, isDirty: false });
  },
  
  resetGraphDocument: () => {
    set({ 
      graphDocument: createDefaultGraphDocument(),
      selectedNodeId: null,
      selectedElementId: null,
      viewport: { ...INITIAL_VIEWPORT },
      isDirty: false,
    });
  },
  // Node CRUD operations
  addNode: (node) => {
    set((state) => ({
      graphDocument: state.graphDocument ? {
        ...state.graphDocument,
        nodes: [...state.graphDocument.nodes, node],
      } : null,
    }));
    get().markDirty();
  },
  
  updateNode: (nodeId, updates) => {
    set((state) => ({
      graphDocument: state.graphDocument ? {
        ...state.graphDocument,
        nodes: state.graphDocument.nodes.map((n) =>
          n.id === nodeId ? { ...n, ...updates } : n
        ),
      } : null,
    }));
    get().markDirty();
  },
  
  removeNode: (nodeId) => {
    set((state) => {
      // Clear selection if the removed node was selected
      const shouldClearSelection = state.selectedNodeId === nodeId || state.selectedElementId === nodeId;
      
      return {
        graphDocument: state.graphDocument ? {
          ...state.graphDocument,
          nodes: state.graphDocument.nodes.filter((n) => n.id !== nodeId),
          // Also remove edges connected to this node
          edges: state.graphDocument.edges.filter(
            (e) => e.source !== nodeId && e.target !== nodeId
          ),
        } : null,
        selectedNodeId: shouldClearSelection ? null : state.selectedNodeId,
        selectedElementId: shouldClearSelection ? null : state.selectedElementId,
      };
    });
    get().markDirty();
  },
  
  getNodeById: (nodeId) => {
    const state = get();
    return state.graphDocument?.nodes.find((node) => node.id === nodeId);
  },
  
  // Edge CRUD operations
  addEdge: (edge) => {
    set((state) => ({
      graphDocument: state.graphDocument ? {
        ...state.graphDocument,
        edges: [...state.graphDocument.edges, edge],
      } : null,
    }));
    get().markDirty();
  },
  
  updateEdge: (edgeId, updates) => {
    set((state) => ({
      graphDocument: state.graphDocument ? {
        ...state.graphDocument,
        edges: state.graphDocument.edges.map((e) =>
          e.id === edgeId ? { ...e, ...updates } : e
        ),
      } : null,
    }));
    get().markDirty();
  },
  
  removeEdge: (edgeId) => {
    set((state) => {
      // Clear selection if the removed edge was selected
      const shouldClearSelection = state.selectedElementId === edgeId;
      
      return {
        graphDocument: state.graphDocument ? {
          ...state.graphDocument,
          edges: state.graphDocument.edges.filter((e) => e.id !== edgeId),
        } : null,
        selectedElementId: shouldClearSelection ? null : state.selectedElementId,
      };
    });
    get().markDirty();
  },
  
  getEdgeById: (edgeId) => {
    const state = get();
    return state.graphDocument?.edges.find((edge) => edge.id === edgeId);
  },
  
  // Selection operations
  selectNode: (nodeId) => {
    set({ 
      selectedNodeId: nodeId,
      selectedElementId: nodeId, // Also set as selected element for convenience
    });
  },
  
  selectElement: (elementId) => {
    set({ 
      selectedElementId: elementId,
      // Don't clear selectedNodeId if selecting an edge
      selectedNodeId: elementId && get().graphDocument?.nodes.some(n => n.id === elementId) 
        ? elementId 
        : null,
    });
  },
  
  clearSelection: () => {
    set({ 
      selectedNodeId: null,
      selectedElementId: null,
    });
  },
  
  getSelectedNode: () => {
    const state = get();
    if (!state.selectedNodeId || !state.graphDocument) return undefined;
    return state.graphDocument.nodes.find(n => n.id === state.selectedNodeId);
  },
  
  getSelectedEdge: () => {
    const state = get();
    if (!state.selectedElementId || !state.graphDocument) return undefined;
    return state.graphDocument.edges.find(e => e.id === state.selectedElementId);
  },
  
  isSelectedNode: (nodeId) => {
    const state = get();
    return state.selectedNodeId === nodeId;
  },
  
  isSelectedElement: (elementId) => {
    const state = get();
    return state.selectedElementId === elementId;
  },
  
  // Viewport operations
  setViewport: (viewport) => {
    set((state) => ({
      viewport: { ...state.viewport, ...viewport },
    }));
  },
  
  setViewportX: (x) => {
    set((state) => ({
      viewport: { ...state.viewport, x },
    }));
  },
  
  setViewportY: (y) => {
    set((state) => ({
      viewport: { ...state.viewport, y },
    }));
  },
  
  setViewportZoom: (zoom) => {
    set((state) => ({
      viewport: { ...state.viewport, zoom: Math.max(0.1, Math.min(5, zoom)) }, // Clamp zoom between 0.1 and 5
    }));
  },
  
  resetViewport: () => {
    set({ viewport: { ...INITIAL_VIEWPORT } });
  },
  
  fitViewportToNodes: () => {
    const state = get();
    if (!state.graphDocument || state.graphDocument.nodes.length === 0) return;
    
    // Calculate bounding box of all nodes
    const nodes = state.graphDocument.nodes;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    nodes.forEach(node => {
      const { x, y } = node.position;
      // Assuming default node size of 200x100 for calculation
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + 200);
      maxY = Math.max(maxY, y + 100);
    });
    
    // Calculate center and zoom to fit
    const padding = 50;
    const contentWidth = maxX - minX + padding * 2;
    const contentHeight = maxY - minY + padding * 2;
    const contentCenterX = minX + (maxX - minX) / 2;
    const contentCenterY = minY + (maxY - minY) / 2;
    
    // Assuming viewport size of 800x600 (typical canvas)
    const viewportWidth = 800;
    const viewportHeight = 600;
    const zoom = Math.min(viewportWidth / contentWidth, viewportHeight / contentHeight, 1);
    
    set({
      viewport: {
        x: -(contentCenterX * zoom - viewportWidth / 2),
        y: -(contentCenterY * zoom - viewportHeight / 2),
        zoom,
      },
    });
  },
  
  // Persistence operations
  markDirty: () => {
    set((state) => ({ 
      isDirty: true,
      graphDocument: state.graphDocument ? {
        ...state.graphDocument,
        metadata: {
          ...state.graphDocument.metadata,
          updatedAt: new Date().toISOString(),
        },
      } : null,
    }));
  },
  
  markClean: () => {
    set({ isDirty: false });
  },
  
  // State Schema field operations
  addStateField: (field) => {
    set((state) => ({
      graphDocument: state.graphDocument ? {
        ...state.graphDocument,
        stateSchema: {
          ...state.graphDocument.stateSchema,
          fields: [...state.graphDocument.stateSchema.fields, field],
        },
      } : null,
    }));
    get().markDirty();
  },

  updateStateField: (fieldId, updates) => {
    set((state) => ({
      graphDocument: state.graphDocument ? {
        ...state.graphDocument,
        stateSchema: {
          ...state.graphDocument.stateSchema,
          fields: state.graphDocument.stateSchema.fields.map((f) =>
            f.id === fieldId ? { ...f, ...updates } : f
          ),
        },
      } : null,
    }));
    get().markDirty();
  },

  removeStateField: (fieldId) => {
    set((state) => ({
      graphDocument: state.graphDocument ? {
        ...state.graphDocument,
        stateSchema: {
          ...state.graphDocument.stateSchema,
          fields: state.graphDocument.stateSchema.fields.filter((f) => f.id !== fieldId),
        },
      } : null,
    }));
    get().markDirty();
  },

  getStateFieldById: (fieldId) => {
    const state = get();
    return state.graphDocument?.stateSchema.fields.find((field) => field.id === fieldId);
  },
}));

/**
 * Selectors for common state access patterns
 * These can be used to avoid unnecessary re-renders
 */
export const selectGraphDocument = (state: EditorState) => state.graphDocument;
export const selectSelectedNodeId = (state: EditorState) => state.selectedNodeId;
export const selectSelectedElementId = (state: EditorState) => state.selectedElementId;
export const selectViewport = (state: EditorState) => state.viewport;
export const selectIsDirty = (state: EditorState) => state.isDirty;

/**
 * Selector to check if a node is selected
 */
export const selectIsNodeSelected = (nodeId: string) => (state: EditorState) => {
  return state.selectedNodeId === nodeId;
};

/**
 * Selector to check if an element is selected
 */
export const selectIsElementSelected = (elementId: string) => (state: EditorState) => {
  return state.selectedElementId === elementId;
};

/**
 * Selector to get the currently selected node
 */
export const selectSelectedNode = (state: EditorState) => {
  if (!state.selectedNodeId || !state.graphDocument) return null;
  return state.graphDocument.nodes.find(node => node.id === state.selectedNodeId) || null;
};

/**
 * Selector to get the currently selected edge
 */
export const selectSelectedEdge = (state: EditorState) => {
  if (!state.selectedElementId || !state.graphDocument) return null;
  return state.graphDocument.edges.find(edge => edge.id === state.selectedElementId) || null;
};

/**
 * Selector to get current viewport transform
 */
export const selectViewportTransform = (state: EditorState) => {
  return {
    x: state.viewport.x,
    y: state.viewport.y,
    zoom: state.viewport.zoom,
  };
};

/**
 * Selector to get a specific node by ID
 */
export const selectNodeById = (nodeId: string) => (state: EditorState) => {
  return state.graphDocument?.nodes.find(node => node.id === nodeId) || null;
};

/**
 * Selector to get all nodes
 */
export const selectAllNodes = (state: EditorState) => {
  return state.graphDocument?.nodes || [];
};

/**
 * Selector to get all edges
 */
export const selectAllEdges = (state: EditorState) => {
  return state.graphDocument?.edges || [];
};

/**
 * Selector to get a specific edge by ID
 */
export const selectEdgeById = (edgeId: string) => (state: EditorState) => {
  return state.graphDocument?.edges.find(edge => edge.id === edgeId) || null;
};

/**
 * Selector to get all state schema fields
 */
export const selectAllStateFields = (state: EditorState) => {
  return state.graphDocument?.stateSchema.fields || [];
};

/**
 * Selector to get a specific state field by ID
 */
export const selectStateFieldById = (fieldId: string) => (state: EditorState) => {
  return state.graphDocument?.stateSchema.fields.find(field => field.id === fieldId) || null;
};



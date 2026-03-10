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
import { EdgeUpdate, GraphDocument, GraphEdge, ViewportState, GraphNode, StateField, StateFieldUpdate, NodeType } from '../types';

// localStorage key for locale persistence
const LOCALE_STORAGE_KEY = 'langgraph-editor-locale';
const GRAPH_STORAGE_KEY = 'langgraph-graph-document';

let saveTimeoutId: ReturnType<typeof setTimeout> | null = null;
let quotaWarningShown = false;

const debouncedSave = (doc: GraphDocument) => {
  if (saveTimeoutId) {
    clearTimeout(saveTimeoutId);
  }

  saveTimeoutId = setTimeout(() => {
    try {
      localStorage.setItem(GRAPH_STORAGE_KEY, JSON.stringify(doc));
      useEditorStore.getState().markClean();
    } catch (e: any) {
      if (e.name === 'QuotaExceededError' && !quotaWarningShown) {
        quotaWarningShown = true;
        alert('存储空间已满，自动保存已禁用。请导出备份后清理浏览器存储。');
      }
    }
  }, 1000);
};

// Supported locales
export type Locale = 'zh' | 'en';

/**
 * Get stored locale or default to Chinese
 */
function getStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === 'zh' || stored === 'en') {
      return stored;
    }
  } catch {
    // localStorage not available
  }
  return 'zh'; // Default to Chinese
}

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

  // Undo/redo history
  history: {
    past: GraphDocument[];
    future: GraphDocument[];
  };

  // Semantic node naming counters
  nodeNamingCounters: {
    function: number;
    tool: number;
    subgraph: number;
  };
  
  // i18n state
  locale: Locale;
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

  // Undo/redo operations
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;

  // Semantic node naming operations
  getNextNodeName: (type: NodeType) => string;
  resetNodeNaming: (doc: GraphDocument) => void;
  
  // i18n operations
  setLocale: (locale: Locale) => void;
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

const getInitialGraphDocument = (): GraphDocument | null => {
  try {
    const storedDoc = localStorage.getItem(GRAPH_STORAGE_KEY);
    if (!storedDoc) {
      return null;
    }
    return JSON.parse(storedDoc) as GraphDocument;
  } catch {
    return null;
  }
};

const initialDoc = getInitialGraphDocument();
const MAX_HISTORY = 20;

const cloneGraphDocument = (doc: GraphDocument): GraphDocument => {
  return JSON.parse(JSON.stringify(doc)) as GraphDocument;
};

const addToHistory = (doc: GraphDocument) => {
  const state = useEditorStore.getState();
  const newPast = [...state.history.past, cloneGraphDocument(doc)].slice(-MAX_HISTORY);

  useEditorStore.setState({
    history: {
      past: newPast,
      future: [],
    },
  });
};

/**
 * Editor Zustand store
 */
export const useEditorStore = create<EditorState & EditorActions>((set, get) => ({
  // Initial state
  graphDocument: initialDoc,
  selectedNodeId: null,
  selectedElementId: null,
  viewport: { ...INITIAL_VIEWPORT },
  isDirty: false,
  history: {
    past: [],
    future: [],
  },
  nodeNamingCounters: {
    function: 0,
    tool: 0,
    subgraph: 0,
  },
  locale: getStoredLocale(),
  
  // Graph document operations
  setGraphDocument: (doc) => {
    set({ graphDocument: doc, isDirty: false });
    get().clearHistory();
  },
  
  resetGraphDocument: () => {
    set({ 
      graphDocument: createDefaultGraphDocument(),
      selectedNodeId: null,
      selectedElementId: null,
      viewport: { ...INITIAL_VIEWPORT },
      isDirty: false,
      nodeNamingCounters: {
        function: 0,
        tool: 0,
        subgraph: 0,
      },
    });
    get().clearHistory();
  },
  // Node CRUD operations
  addNode: (node) => {
    const state = get();
    if (state.graphDocument) {
      addToHistory(state.graphDocument);
    }
    set((state) => ({
      graphDocument: state.graphDocument ? {
        ...state.graphDocument,
        nodes: [...state.graphDocument.nodes, node],
      } : null,
    }));
    get().markDirty();
    const graphDocument = get().graphDocument;
    if (graphDocument) {
      debouncedSave(graphDocument);
    }
  },
  
  updateNode: (nodeId, updates) => {
    const state = get();
    if (state.graphDocument) {
      addToHistory(state.graphDocument);
    }
    set((state) => ({
      graphDocument: state.graphDocument ? {
        ...state.graphDocument,
        nodes: state.graphDocument.nodes.map((n) =>
          n.id === nodeId ? { ...n, ...updates } : n
        ),
      } : null,
    }));
    get().markDirty();
    const graphDocument = get().graphDocument;
    if (graphDocument) {
      debouncedSave(graphDocument);
    }
  },
  
  removeNode: (nodeId) => {
    const state = get();
    if (state.graphDocument) {
      addToHistory(state.graphDocument);
    }
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
    const graphDocument = get().graphDocument;
    if (graphDocument) {
      debouncedSave(graphDocument);
    }
  },
  
  getNodeById: (nodeId) => {
    const state = get();
    return state.graphDocument?.nodes.find((node) => node.id === nodeId);
  },
  
  // Edge CRUD operations
  addEdge: (edge) => {
    const state = get();
    if (state.graphDocument) {
      addToHistory(state.graphDocument);
    }
    set((state) => ({
      graphDocument: state.graphDocument ? {
        ...state.graphDocument,
        edges: [...state.graphDocument.edges, edge],
      } : null,
    }));
    get().markDirty();
    const graphDocument = get().graphDocument;
    if (graphDocument) {
      debouncedSave(graphDocument);
    }
  },
  
  updateEdge: (edgeId, updates) => {
    const state = get();
    if (state.graphDocument) {
      addToHistory(state.graphDocument);
    }
    set((state) => ({
      graphDocument: state.graphDocument ? {
        ...state.graphDocument,
        edges: state.graphDocument.edges.map((e) =>
          e.id === edgeId ? { ...e, ...updates } : e
        ),
      } : null,
    }));
    get().markDirty();
    const graphDocument = get().graphDocument;
    if (graphDocument) {
      debouncedSave(graphDocument);
    }
  },
  
  removeEdge: (edgeId) => {
    const state = get();
    if (state.graphDocument) {
      addToHistory(state.graphDocument);
    }
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
    const graphDocument = get().graphDocument;
    if (graphDocument) {
      debouncedSave(graphDocument);
    }
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

  undo: () => {
    const state = get();
    if (!state.graphDocument || state.history.past.length === 0) {
      return;
    }

    const previous = state.history.past[state.history.past.length - 1];
    const newPast = state.history.past.slice(0, -1);

    set({
      graphDocument: cloneGraphDocument(previous),
      history: {
        past: newPast,
        future: [cloneGraphDocument(state.graphDocument), ...state.history.future],
      },
      selectedNodeId: null,
      selectedElementId: null,
      isDirty: true,
    });
  },

  redo: () => {
    const state = get();
    if (!state.graphDocument || state.history.future.length === 0) {
      return;
    }

    const next = state.history.future[0];
    const newFuture = state.history.future.slice(1);

    addToHistory(state.graphDocument);

    set({
      graphDocument: cloneGraphDocument(next),
      history: {
        past: get().history.past,
        future: newFuture,
      },
      selectedNodeId: null,
      selectedElementId: null,
      isDirty: true,
    });
  },

  clearHistory: () => {
    set({
      history: {
        past: [],
        future: [],
      },
    });
  },

  getNextNodeName: (type) => {
    let nextName = '';
    const prefixByType: Record<NodeType, 'fun' | 'tool' | 'subgraph'> = {
      function: 'fun',
      tool: 'tool',
      subgraph: 'subgraph',
    };

    set((state) => {
      const nextCount = state.nodeNamingCounters[type] + 1;
      nextName = `${prefixByType[type]}_${nextCount}`;

      return {
        nodeNamingCounters: {
          ...state.nodeNamingCounters,
          [type]: nextCount,
        },
      };
    });

    return nextName;
  },

  resetNodeNaming: (doc) => {
    const counters: Record<NodeType, number> = { function: 0, tool: 0, subgraph: 0 };
    const prefixMap: Record<'fun' | 'tool' | 'subgraph', NodeType> = {
      fun: 'function',
      tool: 'tool',
      subgraph: 'subgraph',
    };

    doc.nodes.forEach((node) => {
      const match = node.data.name.match(/^(fun|tool|subgraph)_(\d+)$/);
      if (!match) {
        return;
      }

      const prefix = match[1] as 'fun' | 'tool' | 'subgraph';
      const matchedType = prefixMap[prefix];
      const nodeNumber = Number.parseInt(match[2], 10);
      counters[matchedType] = Math.max(counters[matchedType], nodeNumber);
    });

    set({ nodeNamingCounters: counters });
  },
  
  // State Schema field operations
  addStateField: (field) => {
    const state = get();
    if (state.graphDocument) {
      addToHistory(state.graphDocument);
    }
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
    const graphDocument = get().graphDocument;
    if (graphDocument) {
      debouncedSave(graphDocument);
    }
  },

  updateStateField: (fieldId, updates) => {
    const state = get();
    if (state.graphDocument) {
      addToHistory(state.graphDocument);
    }
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
    const graphDocument = get().graphDocument;
    if (graphDocument) {
      debouncedSave(graphDocument);
    }
  },

  removeStateField: (fieldId) => {
    const state = get();
    if (state.graphDocument) {
      addToHistory(state.graphDocument);
    }
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
    const graphDocument = get().graphDocument;
    if (graphDocument) {
      debouncedSave(graphDocument);
    }
  },

  getStateFieldById: (fieldId) => {
    const state = get();
    return state.graphDocument?.stateSchema.fields.find((field) => field.id === fieldId);
  },
  
  // i18n operations
  setLocale: (locale) => {
    set({ locale });
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // localStorage not available
    }
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
export const selectNodeNamingCounters = (state: EditorState) => state.nodeNamingCounters;
export const selectLocale = (state: EditorState) => state.locale;

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



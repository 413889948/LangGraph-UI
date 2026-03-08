/**
 * Core TypeScript type definitions for LangGraph Visual Editor
 * 
 * These types represent the internal JSON document model used as the
 * source of truth for the visual editor.
 */

// ============================================================================
// Node Types
// ============================================================================

/**
 * Available node types in LangGraph
 * - function: Regular Python function nodes
 * - tool: LangChain Tool nodes for tool calling
 * - subgraph: Subgraph nodes for nested graph structures (MVP placeholder)
 */
export type NodeType = 'function' | 'tool' | 'subgraph';

/**
 * Parameter definition for a node
 */
export interface NodeParameter {
  name: string;
  type: FieldType;
  defaultValue?: string | number | boolean | null;
}

/**
 * Node data structure representing a LangGraph node
 */
export interface NodeData {
  type: NodeType;
  name: string;
  label?: string; // Display label (defaults to name)
  parameters: NodeParameter[]; // Input parameters
  outputs: NodeParameter[]; // Output parameters
  // Runtime configuration (optional for MVP)
  timeout?: number;
  retries?: number;
}

/**
 * Position information for a node on the canvas
 */
export interface NodePosition {
  x: number;
  y: number;
}

/**
 * Complete node structure for the visual editor
 * Aligns with React Flow's node structure while maintaining LangGraph semantics
 */
export interface GraphNode {
  id: string;
  type: NodeType;
  data: NodeData;
  position: NodePosition;
}

// ============================================================================
// Edge Types
// ============================================================================

/**
 * Available edge types in LangGraph
 * - direct: Standard edge from add_edge()
 * - conditional: Conditional edge from add_conditional_edges()
 */
export type EdgeType = 'direct' | 'conditional';

/**
 * Edge data structure representing a LangGraph edge
 */
export interface GraphEdge {
  id: string;
  source: string; // Source node ID
  target: string; // Target node ID
  type: EdgeType;
  condition?: string; // Condition expression (required for conditional edges)
}

// ============================================================================
// State Schema Types
// ============================================================================

/**
 * Basic field types for state schema
 */
export type BasicFieldType = 'string' | 'number' | 'boolean' | 'float';

/**
 * Compound field types
 */
export type CompoundFieldType = 'array' | 'object';

/**
 * All available field types
 */
export type FieldType = BasicFieldType | CompoundFieldType;

/**
 * Predefined reducer functions for state field updates
 * - append: Array append (default for message lists)
 * - replace: Direct replacement
 * - sum: Numeric summation
 * - max: Take maximum value
 * - min: Take minimum value
 */
export type ReducerType = 'append' | 'replace' | 'sum' | 'max' | 'min';

/**
 * Type information for a field, supporting compound types
 */
export interface FieldTypeInfo {
  baseType: FieldType;
  // For compound types
  elementType?: FieldType; // For array types (e.g., List[str])
  keyType?: FieldType;     // For object types (e.g., Dict[str, int])
  innerType?: FieldType;   // For Optional types
}

/**
 * State field definition in the schema
 */
export interface StateField {
  id: string;
  name: string;
  type: FieldTypeInfo;
  reducer?: ReducerType;
  defaultValue?: string | number | boolean | null | object;
  required?: boolean; // Defaults to true
}

/**
 * Complete state schema definition
 */
export interface StateSchema {
  fields: StateField[];
}

// ============================================================================
// Graph Document (Project Model)
// ============================================================================

/**
 * Project metadata for persistence
 */
export interface ProjectMetadata {
  name: string;
  version: string; // Project format version
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  description?: string;
}

/**
 * Viewport state for canvas persistence
 */
export interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Complete graph document structure
 * This is the internal source of truth for the visual editor
 * and the format used for project persistence
 */
export interface GraphDocument {
  version: string; // Schema version for migration support
  metadata: ProjectMetadata;
  nodes: GraphNode[];
  edges: GraphEdge[];
  stateSchema: StateSchema;
  viewport?: ViewportState; // Optional: persist canvas view state
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Result type for validation operations
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Type for node configuration changes
 */
export interface NodeUpdate {
  id: string;
  data?: Partial<NodeData>;
  position?: Partial<NodePosition>;
}

/**
 * Type for edge configuration changes
 */
export interface EdgeUpdate {
  id: string;
  source?: string;
  target?: string;
  type?: EdgeType;
  condition?: string;
}

/**
 * Type for state field changes
 */
export interface StateFieldUpdate {
  id: string;
  name?: string;
  type?: FieldTypeInfo;
  reducer?: ReducerType;
  defaultValue?: string | number | boolean | null | object;
  required?: boolean;
}


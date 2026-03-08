/**
 * LangGraph Python Code Generator
 * 
 * Generates complete LangGraph Python code from graph document structure.
 * Outputs valid Python code that can be copied and executed.
 */

import { GraphDocument, StateField, GraphNode, GraphEdge } from '../types';

/**
 * Convert TypeScript field type to Python type annotation
 */
function fieldToPythonType(field: StateField): string {
  const { type } = field;
  const { baseType, elementType, keyType } = type;

  switch (baseType) {
    case 'string':
      return 'str';
    case 'number':
      return 'int';
    case 'float':
      return 'float';
    case 'boolean':
      return 'bool';
    case 'array':
      if (elementType) {
        const elemType = fieldToPythonType({ ...field, type: { baseType: elementType } as any });
        return `list[${elemType}]`;
      }
      return 'list';
    case 'object':
      if (keyType) {
        const valType = fieldToPythonType({ ...field, type: { baseType: keyType } as any });
        return `dict[str, ${valType}]`;
      }
      return 'dict';
    default:
      return 'any';
  }
}

/**
 * Generate TypedDict state schema definition
 * Task 6.2: Implement state definition code generation
 */
function generateStateSchema(fields: StateField[]): string {
  if (fields.length === 0) {
    return 'class GraphState(TypedDict, total=False):\n    pass\n';
  }

  let code = 'class GraphState(TypedDict, total=False):\n';
  
  for (const field of fields) {
    const pythonType = fieldToPythonType(field);
    const optional = !field.required ? ' | None' : '';
    const defaultVal = field.defaultValue !== undefined ? ` = ${JSON.stringify(field.defaultValue)}` : '';
    code += `    ${field.name}: ${pythonType}${optional}${defaultVal}\n`;
  }

  return code;
}

/**
 * Generate node function definition
 * Task 6.3: Implement node function definition generation
 */
function generateNodeFunction(node: GraphNode): string {
  const { name } = node.data;
  
  // Get input parameters from state schema fields
  const params = node.data.parameters.length > 0 
    ? node.data.parameters.map(p => `${p.name}: ${fieldToPythonType(p as any)}`).join(', ')
    : 'state: GraphState';

  // Simple function body - in real usage, users would customize this
  let body = '    # TODO: Implement node logic\n';
  body += '    return state\n';

  const funcName = name.replace(/[^a-zA-Z0-9_]/g, '_');
  
  let code = `def ${funcName}(${params}):\n`;
  code += body;
  code += '\n';

  return code;
}

/**
 * Generate all node function definitions
 */
function generateNodeFunctions(nodes: GraphNode[]): string {
  if (nodes.length === 0) {
    return '';
  }

  return nodes.map(node => generateNodeFunction(node)).join('\n');
}

/**
 * Generate node registration code
 * Task 6.4: Implement node registration code generation
 */
function generateNodeRegistrations(nodes: GraphNode[]): string {
  if (nodes.length === 0) {
    return '';
  }

  let code = '';
  for (const node of nodes) {
    const funcName = node.data.name.replace(/[^a-zA-Z0-9_]/g, '_');
    code += `graph.add_node("${node.data.name}", ${funcName})\n`;
  }

  return code;
}

/**
 * Generate add_edge code
 * Task 6.6: Implement add_edge code generation
 */
function generateAddEdge(edges: GraphEdge[]): string {
  const directEdges = edges.filter(e => e.type === 'direct');
  
  if (directEdges.length === 0) {
    return '';
  }

  let code = '';
  for (const edge of directEdges) {
    code += `graph.add_edge("${edge.source}", "${edge.target}")\n`;
  }

  return code;
}

/**
 * Generate add_conditional_edges code
 * Task 6.7: Implement add_conditional_edges code generation
 */
function generateAddConditionalEdges(edges: GraphEdge[]): string {
  const conditionalEdges = edges.filter(e => e.type === 'conditional');
  
  if (conditionalEdges.length === 0) {
    return '';
  }

  // Group conditional edges by source node
  const edgesBySource = new Map<string, GraphEdge[]>();
  for (const edge of conditionalEdges) {
    if (!edgesBySource.has(edge.source)) {
      edgesBySource.set(edge.source, []);
    }
    edgesBySource.get(edge.source)!.push(edge);
  }

  let code = '';
  for (const [source, sourceEdges] of edgesBySource) {
    const conditionName = sourceEdges[0].condition || 'route';
    const targets = sourceEdges.map(e => `"${e.target}"`).join(', ');
    code += `graph.add_conditional_edges("${source}", ${conditionName}, [${targets}])\n`;
  }

  return code;
}

/**
 * Generate graph building code
 * Task 6.5: Implement graph building code generation
 */
function generateGraphBuild(nodes: GraphNode[], edges: GraphEdge[]): string {
  let code = '# Build the graph\n';
  code += 'graph = StateGraph(GraphState)\n\n';
  
  // Add node registrations
  code += '# Register nodes\n';
  code += generateNodeRegistrations(nodes);
  if (nodes.length > 0) {
    code += '\n';
  }
  
  // Add edges
  code += '# Add edges\n';
  code += generateAddEdge(edges);
  code += generateAddConditionalEdges(edges);
  
  // Set entry point (first node or START node)
  const entryNode = nodes.find(n => n.data.name.toLowerCase() === 'start') || nodes[0];
  if (entryNode) {
    code += `\n# Set entry point\ngraph.set_entry_point("${entryNode.data.name}")\n`;
  }
  
  // Compile
  code += '\n# Compile the graph\n';
  code += 'app = graph.compile()\n';

  return code;
}

/**
 * Main code generation function
 * Task 6.1: Create CodeGenerator core module structure
 * 
 * Generates complete LangGraph Python code from graph document
 */
export function generateLangGraphCode(document: GraphDocument): string {
  const { stateSchema, nodes, edges } = document;

  let code = '';
  
  // Imports
  code += 'from langgraph.graph import StateGraph\n';
  code += 'from typing import TypedDict\n';
  code += '\n\n';

  // State schema
  code += '# State Schema\n';
  code += generateStateSchema(stateSchema.fields);
  code += '\n\n';

  // Node functions
  if (nodes.length > 0) {
    code += '# Node Functions\n';
    code += generateNodeFunctions(nodes);
    code += '\n';
  }

  // Graph building
  code += generateGraphBuild(nodes, edges);

  return code;
}

/**
 * Utility function to check if code can be generated
 */
export function canGenerateCode(document: GraphDocument | null): boolean {
  if (!document) return false;
  return true; // Can always generate at least a minimal graph
}

/**
 * Get estimated line count for generated code
 */
export function getEstimatedLineCount(document: GraphDocument): number {
  const { stateSchema, nodes, edges } = document;
  
  // Base imports and structure: ~10 lines
  let count = 10;
  
  // State schema: 2 lines + 1 per field
  count += 2 + stateSchema.fields.length;
  
  // Node functions: ~4 lines per node
  count += nodes.length * 4;
  
  // Graph building: ~3 lines + 1 per node + 1 per edge
  count += 3 + nodes.length + edges.length;
  
  return count;
}


/**
 * Validate basic Python syntax (parentheses, brackets, braces matching)
 * Task 6.9: Add basic syntax validation
 */
export function validatePythonSyntax(code: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const stack: string[] = [];
  const pairs: Record<string, string> = {
    ')': '(',
    ']': '[',
    '}': '{',
  };
  const openers = new Set(['(', '[', '{']);
  const closers = new Set([')', ']', '}']);

  // Track line numbers for better error messages
  let lineNumber = 1;
  const lines = code.split('\n');

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    lineNumber = lineIdx + 1;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      // Skip characters in strings (simple handling - doesn't handle escaped quotes)
      if (char === '"' || char === "'") {
        // Skip until closing quote
        i++;
        while (i < line.length && line[i] !== char) {
          if (line[i] === '\\') i++; // Skip escaped characters
          i++;
        }
        continue;
      }

      if (openers.has(char)) {
        stack.push(char);
      } else if (closers.has(char)) {
        const expectedOpener = pairs[char];
        const lastOpener = stack.pop();
        if (lastOpener !== expectedOpener) {
          if (lastOpener === undefined) {
            errors.push(`Line ${lineNumber}: Unexpected closing '${char}'`);
          } else {
            errors.push(`Line ${lineNumber}: Mismatched brackets - expected '${pairs[char]}' but found '${lastOpener}'`);
          }
        }
      }
    }
  }

  // Check for unclosed brackets
  if (stack.length > 0) {
    const unclosed = stack[stack.length - 1];
    const closer = unclosed === '(' ? ')' : unclosed === '[' ? ']' : '}';
    errors.push(`Unclosed '${unclosed}' - expected '${closer}'`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

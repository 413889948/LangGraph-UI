# 任务 3.2 修正记录

## 修正日期
2026-03-08

## 初始实现的问题

### 问题 1: DefaultEdge 组件路径渲染无效
**症状**: 自定义边组件渲染 `<path>` 元素时未计算有效的 `d` 路径属性

**原因**: 初始实现尝试手动编写 Bezier 曲线路径，但:
- 路径语法错误（缺少闭合括号）
- 未使用 React Flow 提供的路径计算工具

**修正**: 使用 React Flow 的 `getBezierPath` 工具函数计算正确的边路径:
```typescript
import { getBezierPath } from '@xyflow/react';

const [edgePath, labelX, labelY] = getBezierPath({
  sourceX, sourceY, sourcePosition,
  targetX, targetY, targetPosition,
});

// 在 path 元素中使用
<path d={edgePath} />
```

### 问题 2: 标签数据读取位置错误
**症状**: 条件边的标签未显示

**原因**: 
- `convertToReactFlowEdge` 将 `label` 存储在 Edge 对象的顶层属性
- `DefaultEdge` 组件尝试从 `data?.label` 读取标签

**修正**: 
- 在 `DefaultEdge` 组件的 props 中直接接收 `label` 参数
- React Flow 边组件接收的 `label` 是顶层属性，不是 `data` 的子属性

```typescript
const DefaultEdge: React.FC<any> = ({
  // ... other props
  label, // 直接接收 label，不是 data.label
}) => {
  // 使用 label 直接
  {label && <foreignObject>...</foreignObject>}
}
```

### 问题 3: React 导入丢失
**症状**: TypeScript 报错 "React refers to a UMD global"

**原因**: 编辑过程中意外删除了 `import React from 'react';`

**修正**: 恢复 React 导入语句

## 最终正确的实现

### 关键导入
```typescript
import React from 'react';
import { ReactFlow, Controls, Background, useNodesState, useEdgesState, Node, Edge, ReactFlowProvider, getBezierPath } from '@xyflow/react';
```

### DefaultEdge 组件
```typescript
const DefaultEdge: React.FC<any> = ({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  style = {}, markerEnd, label,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  return (
    <>
      <path id={id} className="react-flow__edge-path" 
            style={style} markerEnd={markerEnd} d={edgePath} />
      {label && (
        <foreignObject width={120} x={labelX - 60} y={labelY - 15}>
          <div>{label}</div>
        </foreignObject>
      )}
    </>
  );
};
```

## 验证
- ✅ `npm run build` 成功
- ✅ 无 TypeScript 错误
- ✅ 边路径使用 `getBezierPath` 正确计算
- ✅ 标签从正确的 props 位置读取

## 经验教训

1. **使用 React Flow 提供的工具函数**: `getBezierPath` 处理所有复杂的路径计算，避免手动实现 Bezier 曲线
2. **理解 React Flow 边组件的 props 结构**: `label` 是顶层属性，不是 `data` 的子属性
3. **编辑时小心导入语句**: 确保 React 导入在使用 JSX 时始终存在

## 第二次修正：添加 Handle 组件

### 问题 4: 自定义节点缺少 Handle 导致边无法锚定
**症状**: React Flow 警告 "missing source handle id 'null'"，边无法连接到节点

**原因**: 
- 自定义 `DefaultNode` 组件未包含 React Flow 的 `Handle` 组件
- React Flow 的边需要连接到节点上的有效 Handle 才能渲染
- 没有 Handle，边无法确定连接的锚点位置

**修正**: 在 `DefaultNode` 组件中添加 `Handle` 组件

```typescript
import { Handle, Position } from '@xyflow/react';

const DefaultNode: React.FC<any> = ({ data }) => {
  return (
    <div style={{ position: 'relative', ... }}>
      {/* Source handle (top) - for outgoing edges */}
      <Handle
        type="source"
        position={Position.Top}
        id="source"
        style={{ background: '#555', border: '2px solid #fff', width: 8, height: 8 }}
      />
      
      <div style={{ fontWeight: 'bold' }}>{data.label}</div>
      
      {/* Target handle (bottom) - for incoming edges */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="target"
        style={{ background: '#555', border: '2px solid #fff', width: 8, height: 8 }}
      />
    </div>
  );
};
```

### 设计决策

#### Handle 位置
- **Source (Top)**: 放在节点顶部，用于发出的边
- **Target (Bottom)**: 放在节点底部，用于接收的边
- 这种布局符合从上到下的流程图惯例

#### Handle 样式
- 保持最小化视觉：小圆点（8x8 像素）
- 灰色背景（`#555`）表示连接点
- 白色边框增强可见性
- 详细的视觉区分留给任务 3.8

### 验证
- ✅ `npm run build` 成功 (901ms)
- ✅ 无 TypeScript 错误
- ✅ 边可以正确连接到自定义节点
- ✅ React Flow 无警告

### 关键认识

**React Flow 自定义节点必须包含 Handle 组件才能支持边连接**，即使是在只读/渲染模式下。这是 React Flow 的核心架构要求：
- Handle 提供边连接的 DOM 锚点
- Handle 的 `id` 用于边的 `sourceHandle` 和 `targetHandle`
- 即使不实现手动连接创建（任务 3.5），Handle 也是渲染已有边所必需的

---

# 任务 3.3 修复：拖拽数据流中断

## 问题日期
2026-03-08

## 问题描述
初始实现中，拖拽创建节点的功能无法正常工作。从 NodePalette 拖拽节点类型到画布上释放后，没有创建新节点。

## 根本原因
组件间的数据流断裂：
1. `App.tsx` 传递给 `NodePalette` 一个空回调：`onDragStart={() => {}}`
2. `GraphCanvas.tsx` 在组件内部维护 `draggedNodeType` 状态
3. `NodePalette` 的 `onDragStart` 调用空函数，不设置任何状态
4. `GraphCanvas.onDrop` 检查 `draggedNodeType` 始终为 `null`，提前返回

## 修复方案
将 `draggedNodeType` 状态提升到 `App` 组件级别，通过 props 向下传递：

### App.tsx
```typescript
const [draggedNodeType, setDraggedNodeType] = React.useState<NodeType | null>(null);

const handleDragStart = (_event: React.DragEvent, nodeType: NodeType) => {
  setDraggedNodeType(nodeType);
};

// 传递给子组件
<NodePalette onDragStart={handleDragStart} draggedNodeType={draggedNodeType} />
<GraphCanvas draggedNodeType={draggedNodeType} onDraggedNodeTypeChange={setDraggedNodeType} />
```

### GraphCanvas.tsx
```typescript
interface GraphCanvasProps {
  draggedNodeType: NodeType | null;
  onDraggedNodeTypeChange: (type: NodeType | null) => void;
}

const GraphCanvasInner: React.FC<GraphCanvasInnerProps> = ({ draggedNodeType, onDraggedNodeTypeChange }) => {
  // onDrop 中使用传入的 draggedNodeType
  const onDrop = React.useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!draggedNodeType) return;
    
    // ... 创建节点 ...
    
    onDraggedNodeTypeChange(null); // 清除状态
  }, [draggedNodeType, /* ... */]);
};
```

## 修复后的数据流
1. 用户从 NodePalette 拖拽节点类型
2. `NodePalette.onDragStart` 触发 → 调用 `App.handleDragStart`
3. `App` 设置 `draggedNodeType` 状态
4. `draggedNodeType` 通过 props 传递给 `GraphCanvas`
5. 用户在画布上释放鼠标 → `GraphCanvas.onDrop` 触发
6. `onDrop` 检查 `draggedNodeType` 有值 → 创建节点
7. 调用 `onDraggedNodeTypeChange(null)` 清除状态

## 技术要点

### 状态提升模式
这是 React 中处理跨组件通信的标准模式：
- 状态保存在共同父组件（App）
- 通过 props 向下传递状态和状态更新函数
- 兄弟组件（NodePalette 和 GraphCanvas）通过父组件间接通信

### 为什么初始实现失败
初始实现尝试让 `GraphCanvas` 维护自己的 `draggedNodeType` 状态，但：
- `NodePalette` 在 `GraphCanvas` 外部（兄弟组件关系）
- `NodePalette` 无法直接访问 `GraphCanvas` 的状态
- 传递空回调 `={() => {}}` 导致拖拽事件被吞掉

## 验证
```bash
npm run build
# ✓ built in 962ms
```

## 教训
1. **拖拽状态需要可访问性**：拖拽开始和结束处理程序可能在不同组件中，状态必须提升到足够高的层级
2. **避免空回调**：即使是临时实现，也要确保回调函数正确连接
3. **数据流可视化**：在实现复杂交互前，先画出组件树和数据流方向

## 相关文件
- `src/App.tsx`: 状态提升位置
- `src/components/GraphCanvas.tsx`: 接收状态作为 props
- `src/components/NodePalette.tsx`: 触发拖拽开始

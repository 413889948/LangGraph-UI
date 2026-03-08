
# 任务 3.6：边的选择和删除操作

## 实现日期
2026-03-08

## 实现概述

任务 3.6 实现了边的核心交互功能：点击选择和键盘删除。复用节点选择/删除模式，保持节点和边删除逻辑的正确区分。

## 核心实现

### 1. 边点击选择

使用 `onEdgeClick` 事件处理器，在边被点击时更新 store 的选择状态：

```typescript
const onEdgeClick = React.useCallback((_event: React.MouseEvent, edge: Edge) => {
  selectElement(edge.id);
}, [selectElement]);
```

**关键点**：
- 使用 store 的 `selectElement` 方法（而非 `selectNode`）
- `selectElement` 会设置 `selectedElementId` 但不会错误地设置 `selectedNodeId`
- 为边选择提供统一的状态管理

### 2. 画布点击清除选择

复用已有的 `onPaneClick` 处理器：

```typescript
const onPaneClick = React.useCallback(() => {
  clearSelection();
}, [clearSelection]);
```

**行为**：
- 点击空白区域 → 清除所有选择状态（包括边和节点）
- 与节点选择行为保持一致

### 3. 键盘删除逻辑

更新键盘事件处理器，区分节点删除和边删除：

```typescript
React.useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      const state = useEditorStore.getState();
      // 优先删除选中的节点
      if (state.selectedNodeId) {
        removeNode(state.selectedNodeId);
      }
      // 如果没有节点选中但选中了边，则删除边
      else if (state.selectedElementId) {
        removeEdge(state.selectedElementId);
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [removeNode, removeEdge]);
```

**关键特性**：
- 使用 `selectedNodeId` 作为第一优先级（确保节点删除优先）
- 使用 `selectedElementId` 作为第二优先级（用于边删除）
- 正确复用 store 的 `removeEdge` 方法
- `removeEdge` 内部已处理选择状态清除

### 4. React Flow 集成

将所有事件处理器传递给 React Flow 组件：

```tsx
<ReactFlow
  nodes={nodeList}
  edges={edgeList}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onConnect={onConnect}
  onDrop={onDrop}
  onDragOver={onDragOver}
  onNodeDragStop={onNodeDragStop}
  onNodeClick={onNodeClick}
  onEdgeClick={onEdgeClick}
  onPaneClick={onPaneClick}
  fitView
  snapToGrid
  snapGrid={[15, 15]}
>
  <Background color="#aaa" gap={15} />
  <Controls />
</ReactFlow>
```

## 设计决策

### 最小化实现
- 仅实现边选择的核心逻辑（视觉高亮留给后续任务）
- 使用键盘快捷键删除（与节点删除保持一致）
- 无动画/过渡效果，符合 MVP 风格

### 状态管理
- 复用现有 store 方法：`selectElement`, `removeEdge`, `clearSelection`
- 不引入新的状态，保持数据流简单
- 通过 `selectedNodeId` 和 `selectedElementId` 区分节点和边选择

### 删除优先级
- 节点删除优先于边删除（通过 `selectedNodeId` 检查）
- 确保节点和边删除不会冲突
- 保持 3.4 的节点删除行为不受影响

### Store 方法复用
- `selectElement`: 设置 `selectedElementId`（可用于节点或边）
- `removeEdge`: 删除边并自动清除选择状态
- `clearSelection`: 清除所有选择状态

## 技术要点

### React Flow 事件处理器
- `onEdgeClick`: 边点击时触发，传递 edge 对象
- `onPaneClick`: 画布空白区域点击时触发
- 与 `onNodeClick` 保持相同的处理模式

### Zustand store 集成
```typescript
// 从 store 获取方法
const selectElement = useEditorStore((state) => state.selectElement);
const removeEdge = useEditorStore((state) => state.removeEdge);
const clearSelection = useEditorStore((state) => state.clearSelection);

// 读取最新状态（在 useEffect 中）
const state = useEditorStore.getState();
if (state.selectedNodeId) {
  removeNode(state.selectedNodeId);
} else if (state.selectedElementId) {
  removeEdge(state.selectedElementId);
}
```

### TypeScript 类型安全
```typescript
const onEdgeClick = React.useCallback((_event: React.MouseEvent, edge: Edge) => {
  selectElement(edge.id);
}, [selectElement]);
```

## 文件变更

### 修改的文件
- `src/components/GraphCanvas.tsx`: 添加边选择和删除逻辑
  - 导入 `selectElement` 和 `removeEdge` 方法
  - 添加 `onEdgeClick` 处理器
  - 更新键盘事件处理器支持边删除
  - 将 `onEdgeClick` 传递给 React Flow 组件

### 保持稳定的文件
- `src/store/useEditorStore.ts`: Store 方法已存在，无需修改
- `src/types/index.ts`: 类型定义无需修改
- `src/App.tsx`: 应用布局无需修改
- `src/index.css`: 样式文件无需修改

## 验证

```bash
npm run build
# ✓ built in 893ms
```

构建成功，无 TypeScript 错误。

## 用户交互流程

### 选择边
1. 用户点击边
2. `onEdgeClick` 触发
3. 调用 `selectElement(edge.id)`
4. Store 更新 `selectedElementId`
5. （后续可通过 CSS 实现高亮效果）

### 取消选择
1. 用户点击画布空白区域
2. `onPaneClick` 触发
3. 调用 `clearSelection()`
4. Store 清除所有选择状态

### 删除边
1. 用户点击边（边被选中，`selectedElementId` 被设置）
2. 用户按下 Delete 或 Backspace 键
3. 键盘事件处理器读取状态
4. 检查 `selectedNodeId` 为 null
5. 检查 `selectedElementId` 有值
6. 调用 `removeEdge(state.selectedElementId)\)
7. Store 删除边并清除选择状态

### 删除节点（保持 3.4 行为）
1. 用户点击节点（节点被选中）
2. 用户按下 Delete 或 Backspace 键
3. 键盘事件处理器检查 `selectedNodeId` 有值
4. 调用 `removeNode(state.selectedNodeId)\)
5. Store 删除节点并自动清理关联边

## 与现有功能的关系

### 保持 3.4 节点删除
- 节点删除逻辑不受影响
- `selectedNodeId` 优先级确保节点删除正确
- 节点删除时关联边的清理逻辑保持不变

### 保持 3.5 边创建
- `onConnect` 处理器不受影响
- 新创建的边可以通过点击选择
- 边创建流程保持独立

### Store 方法复用
- `selectElement`: 用于边选择
- `removeEdge`: 用于边删除
- `clearSelection`: 用于取消选择
- `getSelectedEdge`: 可用于获取选中的边（未在本任务中使用）

## 后续任务依赖

任务 3.6 的实现为以下任务奠定基础：
- **3.7**: 画布缩放、平移配置（独立功能，不受影响）
- **3.8**: 节点类型可视化区分（可以添加边的视觉样式）
- **6.6**: `add_edge` 代码生成（使用已创建的直接边）
- **6.7**: `add_conditional_edges` 代码生成（使用条件边）
- **9.2**: 边连接有效性验证（可以扩展验证逻辑）

## 已知限制

### 当前限制
- 无边高亮视觉反馈（需要 CSS 样式，可后续添加）
- 无删除确认对话框（直接删除）
- 无边多选支持（仅支持单选）
- 无撤销/重做功能
- 无右键菜单删除选项

### 未来改进
- 添加选中边的视觉样式（边框高亮、颜色变化等）
- 支持 Ctrl+Click 多选边
- 添加删除确认对话框
- 实现撤销/重做功能
- 添加右键菜单删除选项
- 添加工具栏删除按钮（作为键盘快捷键的补充）

## 经验教训

### 状态优先级
在键盘删除事件中，必须明确节点和边的删除优先级：
- 先检查 `selectedNodeId`（节点优先）
- 再检查 `selectedElementId`（用于边）
- 确保不会同时删除节点和边

### Store 方法选择
- 边选择使用 `selectElement` 而非 `selectNode`
- `selectElement` 可以正确处理节点和边的选择状态
- 避免直接操作 `selectedElementId` 导致状态不一致

### 事件监听器清理
使用 useEffect 添加全局事件监听器时：
- 必须在 cleanup 函数中移除监听器
- 否则会导致内存泄漏和重复触发
- 依赖项数组必须包含所有使用的方法

---



---

# 任务 4.2：节点基本信息编辑（名称、类型选择）

## 实现日期
2026-03-08

## 实现概述

任务 4.2 实现了节点配置面板中的基本信息编辑功能，允许用户修改节点名称和选择节点类型。这是节点配置功能的第一步，为后续的参数编辑功能奠定基础。

## 核心实现

### 1. 名称输入框



**关键点**：
- 使用受控组件，value 绑定到 selectedNode.data.name
- 降级到 data.label 或空字符串作为后备值
- onChange 触发时同时更新 name 和 label 字段

### 2. 类型下拉选择框



**关键点**：
- 三个选项对应 NodeType 联合类型的三个值
- 使用 TypeScript 类型断言确保类型安全
- 直接更新节点的 type 字段

### 3. 事件处理器

#### handleNameChange


#### handleTypeChange


### 4. CSS 样式



## 设计决策

### MVP 范围限制
- **仅基本信息**：只编辑名称和类型，不包含参数编辑
- **简单表单**：使用原生 HTML 表单元素，无自定义 UI 组件
- **即时更新**：onChange 立即触发更新，无保存按钮

### 数据同步
- **双向绑定**：表单值从 store 读取，修改后立即写回 store
- **深度更新**：使用展开运算符保持 data 对象的其他属性
- **类型安全**：使用 TypeScript 类型断言确保 NodeType 有效性

### 视觉设计
- **简洁风格**：与现有组件一致的配色和间距
- **焦点状态**：紫色高亮边框和阴影反馈
- **自定义下拉**：移除默认样式，添加自定义箭头图标

## 技术要点

### React 受控组件

- value 始终从 store 读取
- onChange 触发 store 更新
- React 自动重新渲染更新视图

### Zustand Store 集成

- 使用选择器获取 updateNode 方法
- 传递完整的更新对象
- Store 自动触发重新渲染

### TypeScript 类型安全

- 导入 NodeType 类型定义
- 使用类型断言确保值的有效性
- 编译器检查防止拼写错误

### 级联更新
名称修改时同时更新两个字段：

- **name**: 内部标识符
- **label**: 显示标签
- 保持两者一致避免混淆

## 文件变更

### 修改的文件
- : 
  - 添加 name input 表单控件
  - 添加 type select 下拉选择
  - 实现 handleNameChange 和 handleTypeChange 处理器
  - 导入 NodeType 类型
  - 获取 updateNode 方法
  
- : 
  - 添加 .form-group 样式
  - 添加 .form-input 样式
  - 添加 .form-select 样式（含自定义箭头）
  - 添加焦点和悬停状态
  
- : 
  - 标记任务 4.2 为完成

## 验证


> langgraph-visual-editor@0.0.0 build
> tsc && vite build

[36mvite v5.4.21 [32mbuilding for production...[36m[39m
transforming...
[32m✓[39m 221 modules transformed.
rendering chunks...
computing gzip size...
[2mdist/[22m[32mindex.html                 [39m[1m[2m  0.57 kB[22m[1m[22m[2m │ gzip:   0.39 kB[22m
[2mdist/[22m[35massets/index-DxHZK_dX.css  [39m[1m[2m 20.08 kB[22m[1m[22m[2m │ gzip:   3.83 kB[22m
[2mdist/[22m[36massets/index-D3838WF9.js   [39m[1m[2m337.08 kB[22m[1m[22m[2m │ gzip: 108.34 kB[22m
[32m✓ built in 978ms[39m

构建成功，无 TypeScript 错误。

## 用户交互流程

### 编辑节点名称
1. 用户点击节点（节点被选中）
2. 配置面板显示节点信息
3. 用户在 Name 输入框中键入新名称
4. onChange 触发 → 调用 updateNode
5. Store 更新，画布和配置面板同步刷新

### 更改节点类型
1. 用户点击 Type 下拉框
2. 选择新的节点类型（Function/Tool/Subgraph）
3. onChange 触发 → 调用 updateNode
4. Store 更新，画布上节点颜色立即改变（任务 3.8 的视觉区分）

## 与现有功能的关系

任务 4.2 的实现依赖于之前的工作：
- **3.8**: 节点类型视觉区分（类型改变后立即看到颜色变化）
- **3.4**: 节点选择功能（点击节点触发配置面板显示）
- **4.1**: NodeConfigPanel 框架（在占位符基础上添加表单）
- **2.2**: Store 的 updateNode 方法（用于持久化更改）

## 后续任务依赖

任务 4.2 的实现为以下任务奠定基础：
- **4.3**: 输入参数列表增删改（使用相同的表单模式）
- **4.4**: 输出参数列表增删改（复用表单样式）
- **4.5**: 参数属性编辑（扩展表单控件类型）
- **4.6**: 参数名称唯一性验证（添加验证逻辑）
- **4.7**: 配置面板与画布双向同步（验证同步机制）

## 已知限制

### 当前限制
- 无输入验证（允许空名称、特殊字符）
- 无名称唯一性检查（允许重名节点）
- 无撤销/重做功能
- 无表单提交确认（立即生效）

### 未来改进
- 添加名称有效性验证（非空、唯一性）
- 添加错误提示 UI
- 支持撤销/重做操作
- 添加配置更改的视觉反馈（如保存指示器）

## 经验教训

### 受控组件模式
React 表单控件必须是受控组件：
- value 始终从 store 读取
- onChange 触发 store 更新
- 避免使用未受控组件导致的同步问题

### 对象深度更新
更新嵌套对象时使用展开运算符：

- 保持浅层不可变性
- 保留其他未修改字段
- Zustand 正确检测到变化

### CSS 自定义下拉框
移除默认样式并添加自定义箭头：

- appearance: none 移除浏览器默认样式
- SVG 数据 URI 作为自定义箭头
- 保持跨浏览器一致性

### 类型断言的使用
对于 HTML select 元素：

- event.target.value 默认是 string
- 使用 as NodeType 断言确保类型匹配
- 编译器不再报错

---


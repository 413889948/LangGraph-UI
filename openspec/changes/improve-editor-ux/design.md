## 上下文

LangGraph 可视化编辑器是一个基于 React Flow 的节点式工作流编辑界面，用于构建 LangGraph 工作流。当前状态：

- **技术栈**：React 18 + TypeScript + Zustand 5 + React Flow 12
- **状态管理**：单一 Zustand store (`useEditorStore.ts`) 管理 graphDocument、选择状态、视口、isDirty 标记
- **保存机制**：`FileOperations.tsx` 使用 Blob + URL.createObjectURL 触发浏览器下载
- **节点命名**：`GraphCanvas.tsx:142` 使用 `${type}_${uuid.slice(0,8)}` 格式
- **键盘快捷键**：仅支持 Delete/Backspace 删除节点/边

**约束**：
- localStorage 限制 5-10MB
- 历史栈仅内存存储（避免存储膨胀）
- 命名计数器不持久化（从加载文档重建）
- 保持与现有 GraphDocument 格式向后兼容

## 目标 / 非目标

**目标：**
- 实现 localStorage 自动保存，编辑后 1 秒 debounce 保存，页面加载自动恢复
- 实现撤销/重做系统，支持 Ctrl+Z / Ctrl+Shift+Z，20 步历史，所有 mutation 类型
- 实现语义化节点命名，按类型递增计数（fun_1, tool_1, subgraph_1）
- 修改代码生成器使用节点名称而非 ID

**非目标：**
- 多项目管理（单项目模型）
- 多标签同步（MVP 不考虑）
- 手动重命名节点 UI（保持简单）
- 云端同步（纯本地存储）
- 撤销历史持久化（刷新后清空）
- 版本历史管理

## 决策

### 1. 使用手动 debounce 保存而非 Zustand persist 中间件

**决策：** 实现手动 debounce localStorage 保存，不使用 Zustand persist 中间件。

**理由：**
- 需要精细控制保存时机和错误处理
- 配额错误需要显示一次性警告
- debounce 逻辑需要与 markDirty() 触发器集成
- persist 中间件不支持自定义错误处理

**替代方案：**
- Zustand persist 中间件：实现简单但错误处理能力有限
- IndexedDB：适合大项目但增加复杂度

**实现：**
```typescript
// useEditorStore.ts
const debouncedSave = debounce((doc: GraphDocument) => {
  try {
    localStorage.setItem('langgraph-graph-document', JSON.stringify(doc));
    get().markClean();
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      showQuotaWarning(); // 每会话一次
    }
  }
}, 1000);

// 在所有 mutation 后调用
addNode: (node) => {
  // ... 更新状态
  get().markDirty();
  debouncedSave(get().graphDocument);
}
```

### 2. 历史栈使用 past/present/future 模式

**决策：** 采用 Redux undo/redo 模式，维护 past、present、future 三个数组。

**理由：**
- 经典模式，易于理解和实现
- 支持任意顺序的 undo/redo
- 内存可控（硬限制 20 步）

**数据结构：**
```typescript
interface HistoryState {
  past: GraphDocument[];      // 最大 20 条
  present: GraphDocument | null;
  future: GraphDocument[];    // 清空时机：新操作
}

// undo: past.pop() → future.push(present) → present = popped
// redo: future.pop() → past.push(present) → present = popped
// mutation: past.push(present) → future = [] → present = newDoc
```

**替代方案：**
- Action replay：更复杂，需要序列化每个 action
- Immutable.js：增加依赖，不必要

### 3. 命名计数器从加载文档重建

**决策：** 不持久化命名计数器，每次加载项目时从节点名称解析重建。

**理由：**
- 避免计数器与文档状态不同步
- 简化实现，无需额外存储
- 解析成本可忽略（遍历节点数组）

**实现：**
```typescript
const resetNodeNaming = (doc: GraphDocument) => {
  const counters = { function: 0, tool: 0, subgraph: 0 };
  const prefixMap = { fun: 'function', tool: 'tool', subgraph: 'subgraph' };
  
  doc.nodes.forEach(node => {
    const match = node.data.name.match(/^(fun|tool|subgraph)_(\d+)$/);
    if (match) {
      const type = prefixMap[match[1]];
      counters[type] = Math.max(counters[type], parseInt(match[2]));
    }
  });
  
  return counters;
};
```

### 4. 代码生成器添加 ID→Name 映射层

**决策：** 在代码生成时创建节点 ID 到名称的映射表，确保边和入口点使用语义名称。

**理由：**
- 保持节点 ID 为 UUID（不破坏现有唯一性）
- 仅影响代码生成输出
- 无需修改运行时数据结构

**实现：**
```typescript
// codeGenerator.ts
const generateLangGraphCode = (doc: GraphDocument) => {
  // 创建 ID→Name 映射
  const idToName = new Map<string, string>();
  doc.nodes.forEach(node => {
    idToName.set(node.id, node.data.name);
  });
  
  // 边连接使用名称
  doc.edges.forEach(edge => {
    code += `graph.add_edge("${idToName.get(edge.source)}", "${idToName.get(edge.target)}")\n`;
  });
};
```

### 5. 快捷键保护：检测输入框焦点

**决策：** 在键盘事件处理中检测 `event.target.tagName`，跳过 input/textarea/contentEditable。

**理由：**
- 防止快捷键误伤文本输入
- 保护 Delete/Backspace 在输入框中的正常行为
- 简单有效，无副作用

**实现：**
```typescript
const handleKeyDown = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement;
  const isInput = ['INPUT', 'TEXTAREA'].includes(target.tagName) || 
                  target.isContentEditable;
  
  if (isInput) return; // 放行给输入框
  
  // 处理快捷键...
};
```

## 风险 / 权衡

### localStorage 配额限制
- **风险**：复杂图形可能超过 5MB 限制
- **缓解**：
  1. 配额错误时显示警告（每会话一次）
  2. 不阻止编辑，isDirty 标记正常工作
  3. 建议用户导出备份

### 撤销历史丢失
- **风险**：页面刷新后历史栈清空
- **缓解**：
  1. 文档说明这是预期行为
  2. 自动保存防止数据丢失
  3. 未来可扩展历史持久化

### 连续拖拽生成多个历史步骤
- **风险**：用户快速拖拽节点 100 次，历史栈填满
- **缓解**：
  1. 硬限制 20 步，自动丢弃最旧
  2. 未来可添加拖拽防抖合并
  3. 当前行为符合用户心智模型

### 多标签页数据冲突
- **风险**：同一项目在多个标签页编辑，互相覆盖
- **缓解**：
  1. MVP 阶段不支持多标签同步
  2. 文档说明限制
  3. 未来可添加页面可见性检测

## 迁移计划

### 部署步骤

1. **Wave 1：语义化命名**（低风险）
   - 扩展 store 支持计数器
   - 修改节点创建逻辑
   - 修改代码生成器

2. **Wave 2：localStorage 自动保存**（中风险）
   - 实现 debounce 保存
   - 添加配额错误处理
   - 实现页面加载恢复

3. **Wave 3：撤销/重做**（高风险）
   - 重构 store 支持历史栈
   - 包装所有 mutation
   - 添加快捷键绑定

### 回滚策略

- 每个 Wave 独立提交，可单独回滚
- 语义命名向后兼容（旧 UUID 名称仍有效）
- 自动保存可禁用（删除 localStorage 键）
- 撤销/重做可移除快捷键监听

## 开放问题

1. **isDirty 精确语义**：自动保存成功后是否立即 clean？→ **已解决**：是，isDirty 仅表示"未成功保存"

2. **删除节点后计数器处理**：是否回收编号？→ **已解决**：不回收，避免命名冲突

3. **是否需要手动保存按钮**：保留还是移除？→ **待定**：建议保留作为"导出备份"功能
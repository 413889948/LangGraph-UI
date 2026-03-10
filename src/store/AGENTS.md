# Store 指南

LangGraph 可视化编辑器的 Zustand store 规范。

## 概述

`useEditorStore.ts`（842 行）是应用的**核心主干**。它具有最高的扇入：几乎每个 UI 组件都从这个文件导入选择器或动作。

## 核心职责

Store 拥有：

- **GraphDocument 唯一事实源** – 完整项目状态（节点、边、stateSchema、元数据）
- **选择状态** – 当前选中的节点/元素
- **视口状态** – 画布平移/缩放变换
- **Dirty 追踪** – 未保存更改标志 `isDirty`
- **Undo/redo 历史** – 过去/未来栈（最多 20 个状态）
- **节点命名计数器** – `fun_N`、`tool_N`、`subgraph_N` 的语义命名
- **区域设置与主题** – i18n 语言和 UI 主题（`dark` | `light`）

## 持久化

所有持久化状态都存储在 `localStorage` 中：

| 键 | 值 |
|-----|-------|
| `langgraph-graph-document` | 完整 `GraphDocument` JSON |
| `langgraph-editor-locale` | 区域代码（`zh` | `en`） |
| `langgraph-editor-theme` | 主题（`dark` | `light`） |

**防抖保存：** 更改会触发 `debouncedSave()`，延迟 1 秒。配额超出错误会显示一次性提示。

## 不变量

**不得违反以下规则：**

1. **GraphDocument 是唯一事实源** – 不要直接修改节点/边；始终使用 store 动作
2. **始终使用选择器** – 导出的选择器（例如 `selectSelectedNode`）防止不必要的重新渲染
3. **历史行为** – Undo/redo 清除选择并标记 dirty；`clearHistory()` 在文档加载/重置时调用
4. **选择器导出** – 保持选择器导出与 store 在同一文件中以便共存
5. **Dirty 标记** – 每个修改动作都调用 `markDirty()` 并触发防抖保存

## 类型定义

Schema 类型（`GraphDocument`、`GraphNode`、`GraphEdge`、`StateField` 等）位于 [`src/types/index.ts`](../types/)。不要在这里重复定义类型。

## 高扇入警告

**此处的改动会产生广泛影响。** 该 store 被以下模块导入：

- 所有画布组件（节点渲染、边连接）
- 所有侧边栏面板（节点配置、状态 schema、代码预览）
- 文件操作（保存、加载、导出）
- 头部控件（区域切换器、主题切换）

**修改之前：** 验证 LSP 诊断，测试所有主要流程，确保与现有选择器的向后兼容性。

## Selector 使用模式

```typescript
// 好：使用选择器优化性能
const selectedNode = useEditorStore(selectSelectedNode);
const locale = useEditorStore(selectLocale);

// 好：使用动作进行变更
const updateNode = useEditorStore((state) => state.updateNode);
updateNode(nodeId, { data: { name: 'New Name' } });
```

## 文件

- [`useEditorStore.ts`](./useEditorStore.ts) – Store 实现 + 选择器
- [`index.ts`](./index.ts) – 公共导出（重新导出关键选择器/动作）

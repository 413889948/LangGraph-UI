# 组件指南

LangGraph 可视化编辑器的 React 组件。遵循父级 [src/AGENTS.md](../AGENTS.md) 约定。

## 职责

- **纯 UI 渲染** - 无业务逻辑，委托给 store
- **Zustand 控制** - 仅使用 `useEditorStore` 选择器和 action
- **翻译驱动** - 所有用户可见文本通过 `useTranslation()`
- **类型安全 props** - 在组件文件中定义接口，从 `src/types/index.ts` 复用

## 导入模式

仅使用相对导入：

```typescript
import { useEditorStore, selectAllNodes } from '../store/useEditorStore';
import type { GraphNode, GraphEdge } from '../types';
import { useTranslation } from '../i18n';
import { generateLangGraphCode } from '../utils/codeGenerator';
```

## 组件热点

### GraphCanvas.tsx（高风险）

**624 行** - React Flow 画布封装，包含复杂状态协调。

**职责：** 画布渲染、节点/边 CRUD、键盘快捷键、防护协调。

**注意：**
- 双状态模式：React Flow 拥有瞬时状态，Zustand 拥有文档状态
- 不理解 `isConnecting` 防护前不要修改协调逻辑
- `GraphCanvas.tsx.backup` 是手动产物 - 不是活跃参考

### 其他组件

- **NodeConfigPanel.tsx（375 行）** - 节点配置表单，通过 `updateNode` action 更新
- **CodePreview.tsx（88 行）** - 生成代码显示，使用 `useMemo` 优化性能
- **FileOperations.tsx（174 行）** - 通过浏览器文件 API 保存/加载/导出

## 跨模块耦合

**Store：** 所有组件依赖 `useEditorStore`。读取用选择器，变更用 action。不要发明并行的组件状态。见 [src/store/AGENTS.md](../store/AGENTS.md)。

**i18n：** 所有 UI 组件使用 `useTranslation()`。见 [src/i18n/AGENTS.md](../i18n/AGENTS.md)。

**Utils：** CodePreview 和 FileOperations 依赖 `codeGenerator`。见 [src/utils/AGENTS.md](../utils/AGENTS.md)。

## 样式

- **仅全局 CSS** - 所有样式在 `src/index.css`（1433 行）
- **无 CSS 模块** - 无每组件样式
- **CSS 变量** - 使用 `--bg-secondary`、`--text-primary`、`--neon-blue`

## Editor 子目录

**`src/components/editor/` 当前为空。** 不要将其视为稳定子域。

## 反模式

| 避免 | 替代方案 |
|-------|---------|
| 文档数据用本地状态 | 使用 store 选择器 |
| 直接 DOM 操作 | 使用 React Flow APIs |
| 主题色用内联样式 | 使用 CSS 变量 |
| 将 `.backup` 文件作为参考 | 仅读取活跃 `.tsx` 文件 |

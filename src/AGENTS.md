# src/ – 应用源码

**所有权：** `src/` 下的所有应用代码。

## 入口链

```
index.html → src/main.tsx → src/App.tsx
```

- **src/main.tsx：** 渲染前从 `localStorage` 应用主题，然后挂载 React 应用
- **src/App.tsx：** 组合 UI 外壳，包含头部、侧边栏和标签页面板

## 核心域

| 域 | 描述 |
|--------|-------------|
| `src/components/` | React 组件（GraphCanvas、NodePalette、面板） |
| `src/store/` | Zustand 全局状态（图文档、选择、视口、i18n、主题） |
| `src/i18n/` | 国际化（中/英翻译） |
| `src/utils/` | 工具（Python 代码生成器） |
| `src/types/` | TypeScript 类型定义 |
| `src/index.css` | 全局主题令牌和应用级样式 |

## 样式

**src/index.css** 包含：
- CSS 变量主题系统（亮色/暗色/赛博朋克主题）
- 全局应用布局（`.app-container`、`.app-main`、`.app-header`）
- 组件样式（侧边栏、面板、按钮、表单）
- React Flow 定制
- 滚动条和选择样式

这是**全局样式面**，非组件作用域。

## 空目录

- `src/hooks/` – 存在但空；不要驱动新结构
- `src/components/editor/` – 存在但空；不要驱动新结构

## 详细指南

有关具体约定，参见：
- [组件](components/AGENTS.md) – React 模式、props 接口、渲染
- [状态管理](store/AGENTS.md) – Zustand 选择器、动作、持久化
- [国际化](i18n/AGENTS.md) – 翻译键、参数插值
- [工具](utils/AGENTS.md) – 代码生成器模式、验证

## 关键入口点

| 文件 | 用途 |
|------|---------|
| `src/main.tsx` | 主题初始化 + React 根 |
| `src/App.tsx` | UI 外壳组合 |
| `src/store/useEditorStore.ts` | 全局状态（842 行） |
| `src/utils/codeGenerator.ts` | Python 代码生成（334 行） |
| `src/i18n/index.ts` | 翻译（399 行） |
| `src/index.css` | 全局样式（1433 行） |

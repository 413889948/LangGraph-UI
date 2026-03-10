# Proposal: Cyberpunk Theme UI Optimization

## Why

LangGraph Visual Editor 的当前 UI 使用原始白色界面和硬编码颜色值，视觉上不够专业，缺乏现代科技感。用户界面布局原始，按钮样式单调，缺乏视觉层次和交互反馈，严重影响用户体验和专业形象。

**为什么是现在？** 用户明确要求优化项目样式，期望"现代科技感"风格，并愿意进行"精心设计"。这是提升产品竞争力和用户体验的关键时机。

## What Changes

### 新增功能
- **深色主题系统**：引入 CSS 变量驱动的深色/浅色主题切换功能
- **霓虹发光效果**：ReactFlow 节点和连接线的赛博朋克风格发光效果
- **动画连接线**：节点间连接线的流动光效动画
- **主题切换按钮**：允许用户在深色/浅色主题间切换

### 修改内容
- **侧边栏样式**：NodePalette 和 NodeConfigPanel 的深色主题适配
- **按钮样式**：FileOperations 按钮的霓虹发光效果
- **Header 样式**：半透明玻璃效果的标题栏
- **画布背景**：深色网格背景和渐变效果
- **表单控件**：深色主题下的输入框、下拉框样式
- **代码预览**：CodePreview 组件的深色代码高亮

### 破坏性变更
- **BREAKING** 删除所有硬编码颜色值，改用 CSS 变量
- **BREAKING** 重构 `GraphCanvas.tsx` 中的 inline styles 为 CSS 类名

## Capabilities

### New Capabilities

- `theme-system`: CSS 变量驱动的主题系统，支持深色/浅色主题切换，包含颜色、间距、圆角等设计 token
- `neon-nodes`: ReactFlow 节点的霓虹发光效果，支持 Function/Tool/Subgraph 三种节点类型的差异化颜色
- `animated-edges`: 节点连接线的流动光效动画，使用 CSS 动画实现
- `theme-toggle`: 主题切换 UI 组件，支持 localStorage 持久化

### Modified Capabilities

- `node-palette`: 左侧节点调色板的深色主题适配和霓虹发光效果
- `config-panel`: 右侧配置面板的深色主题适配和 Tab 激活状态发光
- `file-operations`: 文件操作按钮的霓虹发光效果和 SVG 图标
- `code-preview`: 代码预览组件的深色主题和语法高亮

## Impact

### 受影响的代码
- `src/index.css` - 主要样式文件（重写主题系统）
- `src/App.tsx` - 应用容器和主题状态管理
- `src/components/GraphCanvas.tsx` - ReactFlow 画布和节点样式
- `src/components/NodePalette.tsx` - 左侧调色板样式
- `src/components/NodeConfigPanel.tsx` - 右侧配置面板样式
- `src/components/StateSchemaEditor.tsx` - 状态 Schema 编辑器样式
- `src/components/CodePreview.tsx` - 代码预览样式
- `src/components/FileOperations.tsx` - 文件操作按钮样式
- `src/components/LanguageSwitcher.tsx` - 语言切换器样式
- `src/store/useEditorStore.ts` - 添加主题状态管理

### 新增文件
- `src/components/ThemeToggle.tsx` - 主题切换按钮组件

### 依赖项变更
- 无新增外部依赖
- 使用现有 React、Zustand、ReactFlow 依赖

### API 变更
- Zustand store 新增 `theme` 状态和 `setTheme` 方法
- 新增 `data-theme` 属性到 `<body>` 元素

### 性能影响
- 多层 box-shadow 发光效果可能在 50+ 节点时影响性能
- 建议在大量节点场景下进行性能测试

### 可访问性影响
- 所有文字/背景对比度将满足 WCAG AA 标准（> 4.5:1）
- 添加 `prefers-reduced-motion` 媒体查询支持
- 键盘焦点状态将使用霓虹蓝色高亮
- 节点类型将增加形状/图标区分（支持色盲用户）
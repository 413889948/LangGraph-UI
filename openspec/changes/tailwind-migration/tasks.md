## 1. Tailwind CSS 基础配置

- [x] 1.1 安装 Tailwind CSS v4 和 Vite 插件
  ```bash
  pnpm add -D @tailwindcss/vite tailwindcss
  ```

- [x] 1.2 配置 vite.config.ts 添加 Tailwind 插件
  ```typescript
  import tailwindcss from '@tailwindcss/vite'
  export default defineConfig({
    plugins: [react(), tailwindcss()],
  })
  ```

#VZ|- [x] 1.3 创建 tailwind.config.ts 配置暗色主题
  - 定义颜色：background (#12141a), panel (#1c1e26), border (#2a2d3d), accent (#3b82f6)
  - 扩展字体、间距、阴影等主题

- [x] 1.4 更新 src/index.css 使用 Tailwind 指令
  ```css
  @import "tailwindcss";
  
  /* 保留 React Flow 样式 */
  @import "@xyflow/react/dist/style.css";
  ```

- [x] 1.5 验证 Tailwind 配置生效
  - 运行 `pnpm dev` 无编译错误
  - 检查控制台无 Tailwind 警告

## 2. 布局结构重构

- [x] 2.1 创建 src/components/LeftSidebar.tsx 组件
  - 宽度 72px，深色背景 #1c1e26
  - 5 个导航项：编排、访问 API、日志与标注、监测（图标 + 文字）
  - 激活状态蓝色背景 #3b82f6/10

- [x] 2.2 创建 src/components/AppHeader.tsx 组件
  - 高度 56px (h-14)
  - 工作区面包屑导航
  - 功能按钮：预览、功能、发布（蓝色）
  - 自动保存状态文本

- [x] 2.3 重构 src/App.tsx 为四栏布局
  - 最左侧导航栏（72px）
  - 节点调色板（280px）
  - 画布容器（flex-1）
  - 配置面板（320px）
  - 顶部 Header（56px）

- [x] 2.4 更新所有组件的 Tailwind 类名
  - 使用 `bg-background`, `text-muted` 等自定义类
  - 确保间距、字体大小一致

## 3. 节点组件迁移

- [ ] 3.1 创建 src/components/CustomNodes.tsx
  - CustomNode 基础组件（暗色背景、边框、图标）
  - FunctionNode（indigo 图标背景）
  - ToolNode（emerald 图标背景）
  - SubgraphNode（rose 图标背景）
  - LLMNode（blue 图标背景）

- [ ] 3.2 实现节点状态指示器
  - 右上角绿色圆点（#10b981）
  - 发光阴影效果 (shadow: 0 0 8px rgba(16,185,129,0.6))

- [ ] 3.3 实现节点 Handle 连接点
  - 左侧 target handle（蓝色）
  - 右侧 source handle（蓝色）

- [ ] 3.4 更新 src/components/GraphCanvas.tsx
  - 导入 CustomNodes
  - 配置 nodeTypes 对象
  - 更新画布背景色和网格点颜色

- [ ] 3.5 验证节点渲染和连接
  - 拖拽创建节点显示新样式
  - 节点连接正常
  - 选中状态蓝色边框

## 4. 组件样式迁移

- [ ] 4.1 迁移 src/components/NodePalette.tsx
  - 暗色背景 #1c1e26
  - 节点卡片边框和圆角
  - hover 蓝色边框效果

- [ ] 4.2 迁移 src/components/NodeConfigPanel.tsx
  - 表单控件暗色主题
  - 输入框深色背景 #12141a
  - 焦点蓝色边框
  - 按钮 hover 效果

- [ ] 4.3 迁移 src/components/StateSchemaEditor.tsx
  - 字段列表暗色主题
  - 类型徽章背景色
  - 空状态提示样式

- [ ] 4.4 迁移 src/components/CodePreview.tsx
  - 代码背景 #1e1e1e
  - 代码字体颜色
  - 复制按钮样式

- [ ] 4.5 迁移 src/components/FileOperations.tsx
  - 按钮暗色背景
  - hover 颜色变化
  - 图标和文字对齐

## 5. 交互组件实现

- [ ] 5.1 创建 src/components/ContextMenu.tsx
  - 右键菜单位置计算
  - 菜单项：添加节点、测试运行、导出 DSL
  - 快捷键提示
  - 点击外部关闭

- [ ] 5.2 集成 ContextMenu 到 GraphCanvas
  - 监听画布右键事件
  - 阻止默认右键菜单
  - 显示/隐藏逻辑

- [ ] 5.3 创建 src/components/FloatingToolbar.tsx
  - 工具栏按钮（添加、选择、手型、方框、缩放等）
  - 固定在画布左上角
  - 激活状态高亮

- [ ] 5.4 集成 FloatingToolbar 到 GraphCanvas
  - 使用 React Flow Panel 组件
  - 工具功能实现

- [ ] 5.5 验证右键菜单和工具栏
  - 右键创建节点功能正常
  - 工具栏工具切换正常

## 6. 动画和视觉效果

- [ ] 6.1 添加所有交互元素的 transition
  - hover 过渡（background, border, transform）
  - focus 过渡

- [ ] 6.2 实现 Tab 切换淡入动画
  - opacity 0→1
  - transform translateY

- [ ] 6.3 实现菜单展开动画
  - height 或 transform 动画
  - 使用 CSS 或 Motion 库

- [ ] 6.4 实现节点创建动画
  - scale 0.9→1
  - opacity 0→1

- [ ] 6.5 验证动画性能
  - 快速切换无卡顿
  - Lighthouse 性能评分 ≥ 90

## 7. 清理和最终验证

- [ ] 7.1 备份并删除 src/index.css（原自定义 CSS）
  - 备份为 src/index.css.backup
  - 删除后无样式异常

- [ ] 7.2 运行 TypeScript 类型检查
  ```bash
  pnpm tsc --noEmit
  ```

- [ ] 7.3 运行完整功能测试
  - 创建节点
  - 连接节点
  - 配置节点
  - 编辑状态 Schema
  - 预览代码
  - 保存/加载项目

- [ ] 7.4 视觉回归测试
  - 截图所有页面状态
  - 对比模板项目风格

- [ ] 7.5 修复发现的样式问题
  - 颜色不一致
  - 间距问题
  - 响应式异常

- [ ] 7.6 运行构建验证
  ```bash
  pnpm build
  ```

- [ ] 7.7 运行 Lighthouse 测试
  - 性能 ≥ 90
  - 可访问性 ≥ 90
  - 最佳实践 ≥ 90

## 8. 文档和提交

- [ ] 8.1 更新 README.md（如需要）
  - 添加 Tailwind CSS 使用说明
  - 更新开发指南

- [ ] 8.2 提交所有更改
  ```bash
  git add .
  git commit -m "feat: 迁移到 Tailwind CSS 暗色主题"
  ```

- [ ] 8.3 创建 Pull Request
  - 标题：`feat: Tailwind CSS 暗色主题迁移`
  - 描述：包含变更摘要、截图、测试清单

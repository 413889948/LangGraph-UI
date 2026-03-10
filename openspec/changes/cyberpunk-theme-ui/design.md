# Design: Cyberpunk Theme UI Optimization

## 上下文

### 当前状态
LangGraph Visual Editor 是一个基于 React + TypeScript + Vite 的可视化编辑器，使用 React Flow 作为节点图库。当前 UI 存在以下问题：

1. **样式系统**：纯自定义 CSS（826 行 `index.css`），无 CSS 框架
2. **颜色系统**：硬编码颜色值（#333, #666, #e0e0e0 等），仅 3 个 CSS 变量
3. **主题支持**：无暗色模式，无主题切换
4. **响应式**：固定宽度侧边栏（280px/320px），无响应式设计

### 约束条件
- 不引入新的 CSS 框架（保持纯 CSS）
- 不使用外部图标库（使用内联 SVG）
- 不添加外部动画库（使用 CSS 动画）
- 必须支持 WCAG AA 可访问性标准

### 利益相关者
- **用户**：需要现代、专业的 UI 体验
- **开发者**：需要可维护的样式架构

## 目标 / 非目标

### 目标
- ✅ 建立基于 CSS 变量的主题系统
- ✅ 实现深色/浅色主题切换
- ✅ 创建赛博朋克风格的霓虹发光效果
- ✅ 确保可访问性合规（WCAG AA）
- ✅ 保持代码可维护性

### 非目标
- ❌ 引入 Tailwind CSS 或其他 CSS 框架
- ❌ 添加新的业务功能
- ❌ 修改数据逻辑或状态管理逻辑
- ❌ 创建响应式断点系统（仅基础支持）
- ❌ 添加性能降级模式

## 决策

### 决策 1: 主题系统架构

**选择**: CSS 自定义属性（CSS Variables）+ data-theme 属性

**理由**: 
- 无需额外依赖
- 原生浏览器支持
- 运行时可切换
- 易于维护

**替代方案**:
- CSS-in-JS（styled-components/emotion）→ 拒绝：增加包大小
- Tailwind CSS → 拒绝：需要重构现有代码
- CSS Modules → 拒绝：不支持动态主题切换

### 决策 2: 主题状态管理

**选择**: Zustand store + localStorage 持久化

**理由**:
- 项目已使用 Zustand
- 统一的状态管理模式
- localStorage 确保刷新后保持

**实现方式**:
```typescript
// store/useEditorStore.ts 新增
interface EditorStore {
  // ... existing state
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}
```

### 决策 3: 霓虹发光效果实现

**选择**: 多层 box-shadow + CSS transition

**理由**:
- 纯 CSS 实现，无需 JavaScript
- 性能优于 filter: drop-shadow
- 支持动态过渡效果

**实现方式**:
```css
.neon-node {
  border: 2px solid var(--neon-blue);
  box-shadow: 
    0 0 10px var(--neon-blue-glow),
    0 0 20px var(--neon-blue-glow-secondary),
    0 0 30px var(--neon-blue-glow-tertiary);
  transition: box-shadow 0.3s ease;
}

.neon-node:hover {
  box-shadow: 
    0 0 15px var(--neon-blue-glow),
    0 0 30px var(--neon-blue-glow-secondary),
    0 0 45px var(--neon-blue-glow-tertiary);
}
```

### 决策 4: 连接线动画

**选择**: SVG stroke-dasharray + stroke-dashoffset 动画

**理由**:
- React Flow 原生支持 SVG 边样式
- 纯 CSS 动画，性能优秀
- 流动效果自然

**实现方式**:
```css
.animated-edge {
  stroke-dasharray: 5, 5;
  animation: flowAnimation 1s linear infinite;
}

@keyframes flowAnimation {
  to {
    stroke-dashoffset: -10;
  }
}
```

### 决策 5: Inline Styles 迁移

**选择**: 重构为 CSS 类名

**理由**:
- CSS 变量无法覆盖 inline styles
- 主题切换需要 CSS 类名支持
- 代码可维护性更好

**影响范围**:
- `GraphCanvas.tsx` DefaultNode 组件（行 35-77）
- `GraphCanvas.tsx` DefaultEdge 组件（行 78-90）
- Handle 组件样式

### 决策 6: 颜色系统设计

**选择**: 分层颜色系统（背景 → 表面 → 文字 → 强调）

**颜色层级**:
```
背景层级:
- bg-base: #0F172A (主背景)
- bg-surface: #1E293B (卡片背景)
- bg-elevated: #334155 (悬浮层)

文字层级:
- text-primary: #F8FAFC (主要文字)
- text-secondary: #CBD5E1 (次要文字)
- text-muted: #94A3B8 (弱化文字)

霓虹强调色:
- neon-blue: #00D4FF (Function 节点)
- neon-green: #22C55E (Tool 节点)
- neon-purple: #A855F7 (Subgraph 节点)
```

## 风险 / 权衡

### 风险 1: 性能影响
**风险**: 多层 box-shadow 在大量节点时可能影响渲染性能

**缓解措施**:
- 限制 shadow 层数为 3 层
- 使用 GPU 加速属性（transform, opacity）
- 建议用户在低端设备上使用浅色主题

### 风险 2: 颜色对比度
**风险**: 霓虹色文字在深色背景上可能对比度不足

**缓解措施**:
- 所有文字使用高对比度颜色（text-primary: #F8FAFC）
- 霓虹色仅用于边框和发光效果，不用于文字
- 使用 Chrome DevTools Contrast Checker 验证

### 风险 3: Inline Styles 迁移遗漏
**风险**: 某些 inline styles 可能遗漏迁移

**缓解措施**:
- 使用 grep 搜索 `style={{` 确保完整性
- 代码审查时检查 inline styles 使用情况
- 测试时验证主题切换是否正确应用

### 风险 4: 浏览器兼容性
**风险**: backdrop-filter 在某些浏览器需要前缀

**缓解措施**:
- 添加 -webkit-backdrop-filter 前缀
- 测试 Chrome、Firefox、Safari 兼容性

## 迁移计划

### 阶段 1: 主题基础设施（Wave 1）
1. 创建 CSS 变量主题系统
2. 添加主题切换机制
3. 重构 GraphCanvas inline styles

### 阶段 2: 核心组件（Wave 2）
1. 实现霓虹发光节点
2. 实现流动光效连接线
3. 优化画布背景

### 阶段 3: 面板与按钮（Wave 3）
1. 优化侧边栏样式
2. 优化配置面板样式
3. 优化按钮样式
4. 优化 Header 样式

### 阶段 4: 验收与优化（Wave 4）
1. 可访问性验收
2. 最终视觉调整

### 回滚策略
- Git 提交按 Wave 分组，可独立回滚
- CSS 变量系统向后兼容
- 保留原有样式文件备份

## 开放问题

### 已解决
- ✅ 深色主题色调选择（深蓝灰 #0F172A）
- ✅ 霓虹效果强度（强烈发光）
- ✅ 主题切换范围（V1 包含）
- ✅ 连接线动画选择（流动光效）

### 待定
- ❓ 是否需要侧边栏折叠功能？（建议 V2）
- ❓ 是否需要主题亮度调节？（建议 V2）
- ❓ 是否需要打印样式优化？（建议 V2）

## 附录

### 文件修改清单
```
src/
├── index.css                    # 【重写】主题系统
├── App.tsx                      # 【修改】添加主题状态
├── store/useEditorStore.ts      # 【修改】添加主题状态管理
├── components/
│   ├── ThemeToggle.tsx          # 【新建】主题切换组件
│   ├── GraphCanvas.tsx          # 【修改】节点/边样式
│   ├── NodePalette.tsx          # 【修改】侧边栏样式
│   ├── NodeConfigPanel.tsx      # 【修改】配置面板样式
│   ├── StateSchemaEditor.tsx    # 【修改】Schema 编辑器样式
│   ├── CodePreview.tsx          # 【修改】代码预览样式
│   ├── FileOperations.tsx       # 【修改】按钮样式
│   └── LanguageSwitcher.tsx     # 【修改】下拉样式
```

### 验收标准
- Lighthouse Accessibility 得分 > 90
- 所有文字对比度 > 4.5:1
- 零 inline styles（除动态位置）
- CSS 文件 gzip 后 < 50KB
- 主题切换功能正常工作
# LangGraph 可视化编辑器

基于浏览器的可视化编辑器，通过拖拽界面创建 LangGraph 工作流。生成可用于生产的 Python 代码。

## 快速命令

```bash
npm run dev      # 启动开发服务器（Vite，端口 5173）
npm run build    # TypeScript 编译 + Vite 构建 → dist/
npm run preview  # 预览生产构建
```

## 技术栈

- **构建：** Vite 5.0+ 配 TypeScript 5.2+ 严格模式
- **框架：** React 18.2 + Zustand 5.0（状态） + React Flow 12.10（画布）
- **包管理器：** npm（存在 package-lock.json；README 提到 pnpm 但实际工具是 npm）

## 入口链

```
index.html → src/main.tsx → src/App.tsx
```

## 代码位置

- **src/** – 应用源代码（components、store、types、utils、i18n）
- **index.html** – HTML 入口模板
- **tsconfig.json** – TypeScript 严格配置
- **vite.config.ts** – Vite 构建配置

## 忽略 / 谨慎对待

- **镜像工具目录：** `.agent/`、`.claude/`、`.codebuddy/`、`.codex/`、`.continue/`、`.cursor/`、`.gemini/`、`.kiro/`、`.opencode/`、`.qoder/`、`.roo/`、`.trae/`、`.windsurf/` – AI 工具镜像；不要单独归档。
- **根目录产物：** `nul`、`D:CodeAi...` 路径样文件、`.log` 文件、`.png` 截图 – 意外产物；不要基于这些建模新工作。
- **dist/** – 构建输出；自动生成。
- **node_modules/** – 依赖。

## 无自动化测试 / CI

- 未配置测试运行器
- 无 `.github/workflows/` CI 流水线

## 子级 AGENTS.md 文件（详细规则）

根级指导保持精简。详细约定见：

- [src/AGENTS.md](src/AGENTS.md) – TypeScript 模式、src 结构、组件约定
- [src/components/AGENTS.md](src/components/AGENTS.md) – React 组件模式、prop 接口、渲染规则
- [src/store/AGENTS.md](src/store/AGENTS.md) – Zustand store 模式、选择器、actions
- [src/i18n/AGENTS.md](src/i18n/AGENTS.md) – 国际化结构、翻译键
- [src/utils/AGENTS.md](src/utils/AGENTS.md) – 工具函数模式、代码生成器规则
- [openspec/AGENTS.md](openspec/AGENTS.md) – OpenSpec 变更结构、specs 工作流
- [.sisyphus/AGENTS.md](.sisyphus/AGENTS.md) – 编排计划、notepads（仅追加）、agent 会话规则

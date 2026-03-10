## Root AGENTS.md Generation

**Date:** 2026-03-10
**Task:** Generate minimal root AGENTS.md following progressive disclosure

### Key Findings

1. **Package Manager Reality:** Despite README recommending pnpm, actual tooling is npm (package-lock.json present). Root AGENTS.md should reflect npm reality.

2. **Entry Chain:** index.html → src/main.tsx → src/App.tsx

3. **Core Files:**
   - src/store/useEditorStore.ts (842 lines) – Zustand state management
   - src/components/GraphCanvas.tsx – React Flow canvas wrapper
   - src/utils/codeGenerator.ts (334 lines) – Python code generation
   - src/i18n/index.ts (399 lines) – Internationalization
   - src/index.css (30994 lines) – Custom CSS styling

4. **Mirrored Tool Directories Found:** .agent/, .claude/, .codebuddy/, .codex/, .continue/, .cursor/, .gemini/, .kiro/, .opencode/, .qoder/, .roo/, .trae/, .windsurf/

5. **Accidental Root Artifacts:** nul file, path-like filenames (D:CodeAi...), .log files, .png screenshots

6. **No Testing/CI:** No test runner config, no .github/workflows/ pipeline

7. **Build Verified:** npm run build passes successfully (tsc + vite build → dist/)

### Progressive Disclosure Structure

Root AGENTS.md kept to 55 lines with links to child files:
- src/AGENTS.md
- src/components/AGENTS.md
- src/store/AGENTS.md
- src/i18n/AGENTS.md
- src/utils/AGENTS.md
- openspec/AGENTS.md
- .sisyphus/AGENTS.md

## Root AGENTS.md Already Implements Progressive Disclosure

**Date:** 2026-03-10

The root AGENTS.md was already refactored to follow progressive disclosure:

- **54 lines** - Well under the 60 line target
- **Links to 7 child files** - src/, components/, store/, i18n/, utils/, openspec/, .sisyphus/
- **No detailed rules** - Delegates conventions to child scopes
- **Accurate metadata** - Commands, tech stack, entry chain all verified

This confirms the previous session's work was complete and correct.

---


## src/AGENTS.md Created

**Date:** 2026-03-10
**Task:** Create parent guide for src/ application code

### File Structure

- **59 lines** – Concise telegraphic style
- **Entry chain documented:** index.html → src/main.tsx → src/App.tsx
- **Core surfaces listed:** components/, store/, i18n/, utils/, types/, index.css
- **Empty directories noted:** hooks/, components/editor/ (exist but should not drive structure)
- **Links to child files:** components/AGENTS.md, store/AGENTS.md, i18n/AGENTS.md, utils/AGENTS.md

### Key Coverage

1. **main.tsx:** Theme application from localStorage before render
2. **App.tsx:** UI shell composition with tabbed panels
3. **index.css:** Global theme tokens and app-wide styling (not component-scoped)
4. **Delegation pattern:** Defers detailed conventions to child AGENTS.md files

### Build Status

Build verification pending.

---

## src/utils/AGENTS.md Created

**Date:** 2026-03-10
**Task:** Create utility guide for code generation module

### File Structure

- **67 lines** – Concise telegraphic style
- **Export table** – Lists all 11 exported functions from codeGenerator.ts
- **Type boundary** – Documents dependency on src/types/index.ts
- **Consumers** – CodePreview.tsx and FileOperations.tsx
- **Rules section** – Pure logic, TODO stubs, lightweight validation, dependency boundary

### Key Coverage

1. **codeGenerator.ts** – Primary utility surface (334 lines)
2. **Pure function rule** – No React/store imports allowed
3. **TODO stubs intentional** – Generated Python requires manual completion
4. **Validation limits documented** – Bracket matching only, not real Python parser
5. **Low-dependency module** – Imports only from src/types

### Build Status

Build verification pending.

---

## src/utils/AGENTS.md Corrected

**Date:** 2026-03-10
**Task:** Fix factual inaccuracies about exports and consumers

### Corrections Made

1. **Exports section split** – Separated into "Exports" (4 exported functions) and "Internal Helpers" (8 private functions)
   - Exported: `generateLangGraphCode`, `validatePythonSyntax`, `canGenerateCode`, `getEstimatedLineCount`
   - Internal: `fieldToPythonType`, `generateStateSchema`, `generateNodeFunction`, etc.

2. **Consumers corrected** – Confirmed only `CodePreview.tsx` and `FileOperations.tsx` import from utils
   - Store does NOT import from codeGenerator
   - Removed speculative "may be imported by store" claim

3. **Dependency boundary clarified** – Utils imports only from `src/types`, never from store

### File Stats

- **71 lines** – Within 40-75 line target
- All claims now match actual code

---

## src/utils/AGENTS.md Duplicates Removed

**Date:** 2026-03-10
**Task:** Remove stale duplicate dependency bullets

### Correction

Removed duplicate lines under `### Dependency Boundary`:
- Stale: "May be imported by components and store" (incorrect)
- Kept: "Imported by `CodePreview.tsx` and `FileOperations.tsx`" (correct)

### File Stats

- **71 lines** – Clean, no duplicates



---

## src/AGENTS.md 中文化完成

**日期：** 2026-03-10
**任务：** 将 src/AGENTS.md 翻译为中文

### 变更内容

1. **标题和说明中文化** – 所有英文内容翻译为简洁中文
2. **保留原有结构** – 入口链、核心域表格、样式说明、空目录说明、子文件链接均保持不变
3. **关键结论保留**：
   - `src/index.css` 是全局样式面，非组件作用域
   - `src/hooks/` 与 `src/components/editor/` 存在但空，不应驱动新结构
   - 相对链接指向子 AGENTS.md 文件保持不变

### 文件统计

- **59 行** – 与原版行数一致
- 中文表达简洁、扫描友好

### 构建验证

构建验证待进行。

---

## src/utils/AGENTS.md 中文化完成

**日期：** 2026-03-10
**任务：** 将 src/utils/AGENTS.md 翻译为中文

### 变更内容

1. **标题和说明中文化** – 所有英文内容翻译为简洁中文
2. **保留原有结构** – 所有权说明、导出 API 表格、内部辅助函数列表、类型边界、消费者说明、规则部分均保持不变
3. **关键结论保留**：
   - 纯工具函数，无 React/store 依赖
   - 导出 4 个公开 API，8 个内部辅助函数
   - 仅被 CodePreview.tsx 和 FileOperations.tsx 消费
   - 轻量级验证仅检查括号匹配，不解析 Python 语法
   - 生成代码包含 TODO 存根，需手动完成

### 文件统计

- **72 行** – 与原版行数一致
- 中文表达简洁、扫描友好

### 构建验证

构建验证待进行。
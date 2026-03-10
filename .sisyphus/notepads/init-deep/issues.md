## Store Documentation Gotcha

**Date:** 2026-03-10

`useEditorStore.ts` is 842 lines with extremely high fan-in across the entire app. The newly created `src/store/AGENTS.md` documents key invariants:

- GraphDocument is the single source-of-truth
- All mutations must go through store actions (never direct mutation)
- Selectors prevent unnecessary re-renders
- Debounced save (1s) to localStorage with quota error handling
- Undo/redo clears selection and marks dirty
- Locale/theme persistence owned by store

**Risk:** Changes to store structure or selector signatures will ripple to:
- All canvas components (GraphCanvas, DefaultNode, DefaultEdge)
- All sidebar panels (NodeConfigPanel, StateSchemaEditor, CodePreview)
- FileOperations (save/load/export)
- Header controls (locale/theme toggles)

**Mitigation:** Always verify LSP diagnostics and manually test node CRUD, edge connections, undo/redo, and persistence after any store modifications.

---


## .sisyphus/AGENTS.md Created

**Date:** 2026-03-10
**Task:** Create workflow directory guide

### File Structure
- **44 lines** – Concise telegraphic style
- **Documents:** plans/, notepads/, drafts/, evidence/, logs, screenshots
- **Rules:** plans are read-only, notepads are append-only, artifacts are evidence not source
- **Hidden folder warning:** Alerts contributors not to ignore workflow state

### Key Coverage
1. **plans/ (READ-ONLY)** – Planning snapshots, never modify after creation
2. **notepads/ (APPEND-ONLY)** – Cumulative memory, always append never overwrite
3. **Artifacts** – Logs, screenshots are evidence/QA artifacts, not implementation files
4. **Collaboration warning** – Hidden directory contains critical workflow state

### Build Status
Build verification pending.



---

## Cache Cleanup Completed

**Date:** 2026-03-10
**Task:** Remove mirror directory __pycache__/ and root nul file

### Deleted Items
- `.agent/skills/ui-ux-pro-max/scripts/__pycache__/` (3 .pyc files)
- `.claude/skills/ui-ux-pro-max/scripts/__pycache__/` (3 .pyc files)
- `.codebuddy/skills/ui-ux-pro-max/scripts/__pycache__/`
- `.codex/skills/ui-ux-pro-max/scripts/__pycache__/`
- `.continue/skills/ui-ux-pro-max/scripts/__pycache__/`
- `.cursor/skills/ui-ux-pro-max/scripts/__pycache__/`
- `.gemini/skills/ui-ux-pro-max/scripts/__pycache__/`
- `.github/prompts/ui-ux-pro-max/scripts/__pycache__/`
- `.kiro/steering/ui-ux-pro-max/scripts/__pycache__/`
- `.opencode/skills/ui-ux-pro-max/scripts/__pycache__/`
- `.qoder/skills/ui-ux-pro-max/scripts/__pycache__/`
- `.roo/skills/ui-ux-pro-max/scripts/__pycache__/`
- `.trae/skills/ui-ux-pro-max/scripts/__pycache__/`
- `.windsurf/skills/ui-ux-pro-max/scripts/__pycache__/`
- `nul` (root directory stray file)

### Verification
- `git status --short` clean - no target paths remaining
- No AGENTS.md files touched
- No .sisyphus/notepads/ modifications
- No source code affected

---

## src/store/AGENTS.md 中文化完成

**日期：** 2026-03-10
**任务：** 将 store 文档改为中文

### 更改内容

- 全文中文化，保留所有技术术语（localStorage 键名、选择器名称、动作名称）
- 代码示例保持原样
- 事实与结构不变
- 高扇入警告和不变量规则语义完整保留

### 文件统计

- **74 行** – 与原版行数相当
- 所有技术引用（`useEditorStore.ts`、选择器、localStorage 键）保持英文


---

## .sisyphus/AGENTS.md 中文化完成

**日期：** 2026-03-10
**任务：** 将工作流目录指南改为中文

### 更改内容

- 全文中文化，保留所有目录名和文件路径原样
- 代码块结构保持原样
- 规则语义完整保留
- 隐藏文件夹警告和相关文件说明完整翻译

### 文件统计

- **44 行** – 与原版行数相当
- 所有技术路径（`plans/`、`notepads/`、`drafts/` 等）保持英文

### 关键规则保留

1. **plans/（只读）** – 计划快照，创建后禁止修改
2. **notepads/（仅追加）** – 累积记忆，始终追加禁止覆盖
3. **工件目录** – logs、screenshots 是证据/QA 工件，不是实现文件
4. **协作警告** – 隐藏目录包含关键工作流状态，不要忽略

### 构建状态

构建验证待执行。

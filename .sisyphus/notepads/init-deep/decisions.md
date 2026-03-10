## Root AGENTS.md Review Decision

**Date:** 2026-03-10
**Task:** Review and update root AGENTS.md for hierarchical knowledge base

### Decision: No Changes Required

The existing root AGENTS.md (54 lines) already follows progressive disclosure correctly:

1. **Minimal scope** - Contains only repo-wide essentials
2. **Accurate commands** - npm run dev/build/match package.json
3. **Correct tech stack** - Vite 5.0+, React 18.2, Zustand 5.0, React Flow 12.10
4. **Entry chain accurate** - index.html → src/main.tsx → src/App.tsx
5. **Proper child file links** - References all 7 planned child AGENTS.md files
6. **Mirrored directories listed** - Groups 13 AI tool mirrors as noise
7. **No testing/CI noted** - Accurately reflects repo reality
8. **Build verified** - npm run build passes successfully

### Rationale

The file was generated in a previous session and already implements the progressive disclosure pattern from agent-md-refactor skill. Root stays minimal (under 60 lines) and delegates details to child files. No updates needed.

---

## Root AGENTS.md Design Decisions

**Date:** 2026-03-10

### Decision 1: Minimal Root (<50-80 lines)

**Rationale:** Following agent-md-refactor progressive disclosure guidance. Root should contain only universal information applicable to every task.

**Trade-offs:** Detailed conventions deferred to child files.

### Decision 2: npm Reality Over README Recommendation

**Rationale:** package-lock.json present indicates actual tooling is npm, not pnpm. Documentation should reflect reality, not aspirations.

**Impact:** Avoids confusion for contributors following AGENTS.md.

### Decision 3: Group Mirrored Tool Directories

**Rationale:** 13 AI tool mirror directories (.agent/, .claude/, etc.) are noise. Single line warning prevents individual documentation.

**Pattern:** "Mirrored tool directories: [list] – These are AI tool mirrors; do not document individually."

### Decision 4: Explicit Anti-Pattern Warnings

**Rationale:** Root contains accidental artifacts (nul, path-like filenames, .log files). Explicit warning prevents modeling new work on these.

### Decision 5: No Testing/CI Transparency

**Rationale:** Honest disclosure that no test runner or CI pipeline exists. Prevents assumptions about nonexistent infrastructure.

### Decision 6: Child File Forward References

**Rationale:** Links to planned child AGENTS.md files establish structure without duplicating content. Enables incremental generation.

**Child Files:**
- src/AGENTS.md – TypeScript patterns, src structure
- src/components/AGENTS.md – React component patterns
- src/store/AGENTS.md – Zustand store patterns
- src/i18n/AGENTS.md – i18n structure
- src/utils/AGENTS.md – Code generator rules
- openspec/AGENTS.md – OpenSpec workflow
- .sisyphus/AGENTS.md – Orchestration rules


---


## Components AGENTS.md Creation


**Date:** 2026-03-10

**Task:** Generate src/components/AGENTS.md for React component conventions



### Created File


**Path:** `src/components/AGENTS.md` (140 lines)



**Coverage:**

- Component responsibilities and import patterns

- High-risk hotspot documentation (GraphCanvas.tsx - 624 lines)

- Cross-module coupling (store, i18n, utils)

- Styling conventions (global CSS only)

- Anti-pattern warnings (.backup files as artifacts)

- Empty editor/ subdirectory note



### Key Decisions



**1. GraphCanvas.tsx Warning:** Documented as highest-risk UI interaction hotspot with reconciliation complexity. Explicitly called out `.backup` file as non-authoritative.



**2. Store/I18n Delegation:** Components must use existing translation and store patterns instead of inventing parallel state. Delegates detailed rules to `src/store/AGENTS.md` and `src/i18n/AGENTS.md`.



**3. Import Patterns:** Enforced relative imports for store, types barrel for type imports, direct imports for utils.



**4. Anti-Pattern Table:** Added explicit guidance on avoiding local state for document data, direct DOM manipulation, and treating backup files as reference.




---


## Components AGENTS.md Correction


**Date:** 2026-03-10

**Task:** Fix inaccuracies and trim src/components/AGENTS.md



**File trimmed:** 139 lines → 68 lines (within 50-85 target)



**Fixed inaccuracies:**

1. Removed `@/i18n` alias import example - repo uses relative imports only

2. Fixed `src/index.css` line count: "30k+ lines" → "1433 lines" (verified)

3. Removed placeholder reconciliation code (`prevNodes.some(...)`)



**Preserved:** GraphCanvas.tsx high-risk warning, .backup artifact note, cross-module coupling, empty editor/ note, anti-patterns table.



**Verification:** `npm run build` passes successfully.



---

## openspec/AGENTS.md Creation

**Date:** 2026-03-10

**Task:** Create openspec/AGENTS.md to document OpenSpec change structure and spec workflow

### Created File

**Path:** `openspec/AGENTS.md` (86 lines)

**Coverage:**
- Directory structure explanation (changes/, specs/, config.yaml)
- Repeated change scaffold pattern (.openspec.yaml, proposal.md, design.md, tasks.md, specs/<capability>/spec.md)
- Specification format with Chinese headings (新增需求 / 修改需求) and 当/那么 scenario bullets
- Capability domain mapping to implementation areas (code-generation → codeGenerator.ts, etc.)
- Workflow principles (spec-first, task alignment, capability decomposition, traceability)
- Relationship to root AGENTS.md (delegation pattern)

### Key Decisions

**1. Minimal Scope (86 lines):** File focuses on structure and format, not code conventions. Defers to src/AGENTS.md for implementation details.

**2. Scaffold Emphasis:** Explicitly documents that openspec/changes/* uses repeated scaffold pattern to distinguish from real capability domains under specs/.

**3. Spec Format Documentation:** Captures observed requirement/scenario structure with Chinese headings and 当/那么 bullets from code-canvas-sync/specs/code-generation/spec.md.

**4. Capability Mapping:** Links spec capability directories to actual implementation areas (GraphCanvas.tsx, codeGenerator.ts, NodeConfigPanel.tsx, etc.) for traceability.

**Verification:** `npm run build` passes successfully.

---

## openspec/AGENTS.md Trim

**Date:** 2026-03-10

**Task:** Trim openspec/AGENTS.md from 85 lines to 74 lines

**Change:** Removed redundant example code block (lines 50-60) showing spec format. The scenario structure is already documented above it with the template format.

**Preserved:**
- Directory structure diagram
- Repeated scaffold table
- Spec format with Chinese headings (新增需求 / 修改需求) and 当/那么 bullets
- Capability mapping table
- Workflow principles (4 items)
- Relationship to root AGENTS.md

**Verification:** `npm run build` passes successfully.

---

## AGENTS.md 中文化

**日期：** 2026-03-10
**任务：** 将根文件 AGENTS.md 从英文改写为中文

### 决定：直接中文化

**原因：** 根 AGENTS.md 结构已经正确，遵循渐进披露原则。仅需翻译为中文，无需重构。

**范围：**
- 仅修改 AGENTS.md
- 追加记录到 decisions.md
- 保持所有链接、事实、结构不变

**改动内容：**
- 标题、说明、要点全部改为中文
- 保留技术元数据：Vite + React + TypeScript、npm、入口链
- 保留所有子文件链接路径
- 保留镜像工具目录、误产物、无测试/CI 等警示

**验证：** `npm run build` 构建通过

---

## src/components/AGENTS.md 中文化

**日期：** 2026-03-10
**任务：** 将组件指南文件翻译为中文

### 变更范围

- **文件：** `src/components/AGENTS.md`
- **行数：** 67 行（保持不变）
- **内容：** 职责、导入模式、组件热点、跨模块耦合、样式、Editor 子目录、反模式

### 保留内容

- 所有技术术语（React Flow、Zustand、CRUD、useMemo 等）
- 导入示例代码（相对路径不变）
- 文件名和行数引用（624 行、375 行、88 行、174 行、1433 行）
- GraphCanvas.tsx 高风险说明
- `.backup` 文件警示
- 空 `editor/` 子目录说明
- CSS 变量名称（`--bg-secondary`、`--text-primary`、`--neon-blue`）

### 翻译原则

- 仅翻译说明文字和注释
- 保留代码、路径、类型引用不变
- 使用简洁技术中文风格
- 不扩写、不新增内容

### 验证

构建验证待执行。


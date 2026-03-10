# 代码与画布双向同步

## TL;DR
> **Summary**: 为 LangGraph 可视化编辑器添加 Python 代码编辑功能，实现画布 ↔ 代码的双向同步
> **Deliverables**: Pyodide 录制器服务、可编辑代码面板、Store 批量导入 API、节点名唯一性约束
> **Effort**: Medium
> **Parallel**: YES - 3 waves
> **Critical Path**: PyodideService → CodeEditor → Store扩展 → 集成测试

## Context

### Original Request
用户希望将当前仅支持代码预览的 LangGraph 可视化编辑器，扩展为支持代码与画布双向同步：
- 画布拖拽 → 生成 Python 代码（现有功能）
- 编辑 Python 代码 → 更新画布（新增功能）

### Interview Summary
经过探索模式和 Oracle/Metis 审查，确定技术方案：
- **解析技术**: Pyodide + StateGraph 录制器（shim）
- **安全隔离**: 主线程执行（简化实现，需明确安全声明）
- **加载策略**: 启动时预加载 Pyodide
- **同步时机**: 手动触发（点击按钮）
- **编辑器**: textarea + 语法高亮（highlight.js）
- **入口契约**: 统一 `build_graph()` 函数格式
- **节点唯一性**: 强制节点名唯一约束
- **数据分层**: 结构层同步 + UI 层保留

### Metis Review (gaps addressed)
- ✅ 入口契约统一：修改 codeGenerator 输出 `build_graph()`
- ✅ 节点唯一性：添加强制唯一约束
- ✅ 冲突策略：手动同步，不自动覆盖
- ✅ 批量导入：新增 `updateFromCode()` 原子操作
- ✅ 安全声明：在 UI 中明确"仅支持受信任代码"

## Work Objectives

### Core Objective
实现代码编辑器与可视化画布的双向同步，用户可以：
1. 在画布上拖拽节点、连接边、配置参数 → 实时生成 Python 代码
2. 直接编辑 Python 代码 → 点击"应用到画布"按钮 → 更新画布
3. 错误代码显示错误信息，保留原画布状态

### Deliverables
1. **PyodideService** (`src/services/pyodideService.ts`)
   - Pyodide 加载管理
   - StateGraph 录制器（shim）
   - 代码解析和执行

2. **CodeEditor** (改造 `src/components/CodePreview.tsx`)
   - 可编辑 textarea + 语法高亮
   - "应用到画布"按钮
   - 错误显示区域

3. **Store 扩展** (`src/store/useEditorStore.ts`)
   - `updateFromCode(doc)` 批量导入
   - `codeEditorContent` 状态
   - `parseError` 状态

4. **节点名唯一性** (`src/components/NodeConfigPanel.tsx`)
   - 输入验证，禁止重名

5. **代码生成器更新** (`src/utils/codeGenerator.ts`)
   - 输出 `build_graph()` 函数格式

### Definition of Done (verifiable conditions)
- `npm run build` 退出码为 0
- `npm run dev` 启动无 TypeScript 错误
- 画布拖拽节点 → 代码包含 `build_graph()` 函数
- 编辑代码并点击"应用到画布" → 画布正确更新
- 语法错误代码 → 显示错误信息，画布不变
- 重名节点输入 → 显示错误提示，阻止保存

### Must Have
- StateGraph shim 录制器
- `build_graph()` 入口契约
- 节点名唯一性约束
- 批量导入原子操作
- 错误处理和显示

### Must NOT Have (guardrails)
- ❌ 自动实时同步（每次按键执行）
- ❌ 支持任意 Python 代码（仅限 LangGraph 核心子集）
- ❌ 保留用户函数体/注释（round-trip 格式化）
- ❌ Web Worker 隔离（简化实现）
- ❌ 动态构图支持（循环生成节点）

## Verification Strategy

### Test Decision
- **Framework**: 无现有测试框架，手动 QA + Playwright E2E（可选）
- **Policy**: 每个核心功能手动验证

### QA Policy
- Agent 执行场景验证
- 核心路径：code→canvas 成功、错误回滚、canvas→code 生成

## Execution Strategy

### Parallel Execution Waves

**Wave 1: 基础设施** (3 tasks, 可并行)
- 1. PyodideService 核心实现
- 2. codeGenerator 更新（build_graph 格式）
- 3. 节点名唯一性约束

**Wave 2: Store 和编辑器** (2 tasks, 依赖 Wave 1)
- 4. Store 扩展（updateFromCode, 批量导入）
- 5. CodeEditor 组件改造

**Wave 3: 集成和测试** (2 tasks, 依赖 Wave 2)
- 6. 集成和错误处理
- 7. 最终验证

### Dependency Matrix
```
1 ──┬── 4 ──┬── 6
    │       │
    └── 5 ──┴── 7
    
2 ────── 5 ────── 6
3 ──────────────── 7
```

### Agent Dispatch Summary
- Wave 1: 3 tasks → quick × 3
- Wave 2: 2 tasks → quick × 2
- Wave 3: 2 tasks → quick × 2

## TODOs

- [ ] 1. 创建 PyodideService 核心模块

  **What to do**:
  1. 创建 `src/services/pyodideService.ts`
  2. 实现 Pyodide 加载管理（启动时预加载）
  3. 实现 StateGraph 录制器（shim）
  4. 实现 `parseCode(code: string) → GraphDocument`

  **Must NOT do**:
  - 不要安装真实 LangGraph 依赖
  - 不要支持动态构图（循环生成节点）
  - 不要在 Worker 中执行（主线程执行）

  **Recommended Agent Profile**:
  - Category: `quick` — 单文件创建，逻辑清晰
  - Skills: 无需额外 skills

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 4, 5 | Blocked By: none

  **References**:
  - Pattern: `src/utils/codeGenerator.ts` — 现有代码生成器，理解 GraphDocument 结构
  - Type: `src/types/index.ts:GraphNode, GraphEdge, StateSchema` — 数据结构定义
  - Store: `src/store/useEditorStore.ts` — 理解 state 操作方式

  **Acceptance Criteria** (agent-executable only):
  - [ ] 文件 `src/services/pyodideService.ts` 存在
  - [ ] 导出 `initPyodide()` 函数
  - [ ] 导出 `parseCode(code: string)` 函数
  - [ ] 录制器支持: `StateGraph()`, `add_node()`, `add_edge()`, `add_conditional_edges()`, `set_entry_point()`, `compile()`

  **QA Scenarios** (MANDATORY):
  ```
  Scenario: Pyodide 加载成功
    Tool: interactive_bash
    Steps: 
      1. 启动 `npm run dev`
      2. 打开浏览器控制台
      3. 检查 Pyodide 加载日志
    Expected: 控制台显示 "Pyodide loaded successfully"
    Evidence: .sisyphus/evidence/task-1-pyodide-load.txt

  Scenario: 解析简单代码
    Tool: interactive_bash
    Steps:
      1. 在浏览器控制台执行 `window.testParse()`
      2. 传入最小 build_graph 代码
    Expected: 返回包含 nodes/edges 的对象
    Evidence: .sisyphus/evidence/task-1-parse-success.txt
  ```

  **Commit**: YES | Message: `feat(pyodide): add PyodideService with StateGraph shim` | Files: `src/services/pyodideService.ts`

---

- [ ] 2. 更新代码生成器输出格式

  **What to do**:
  1. 修改 `src/utils/codeGenerator.ts` 的 `generateLangGraphCode()`
  2. 将生成的代码包装在 `build_graph()` 函数中
  3. 确保生成代码可被录制器正确解析

  **Must NOT do**:
  - 不要改变现有的节点/边生成逻辑
  - 不要添加额外的不支持语法

  **Recommended Agent Profile**:
  - Category: `quick` — 修改现有函数，范围明确
  - Skills: 无需额外 skills

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 5, 6 | Blocked By: none

  **References**:
  - Pattern: `src/utils/codeGenerator.ts:206-238` — generateLangGraphCode 函数
  - Expected output:
    ```python
    def build_graph():
        # ... existing code ...
        return graph.compile()
    ```

  **Acceptance Criteria**:
  - [ ] 生成代码以 `def build_graph():` 开头
  - [ ] 生成代码以 `return app` 或 `return graph.compile()` 结尾
  - [ ] 现有测试/演示用例生成的代码格式正确

  **QA Scenarios**:
  ```
  Scenario: 代码生成格式正确
    Tool: interactive_bash
    Steps:
      1. 启动 `npm run dev`
      2. 在画布上添加一个节点
      3. 切换到代码预览标签
    Expected: 代码包含 `def build_graph():` 函数定义
    Evidence: .sisyphus/evidence/task-2-code-format.txt
  ```

  **Commit**: YES | Message: `feat(codegen): wrap generated code in build_graph function` | Files: `src/utils/codeGenerator.ts`

---

- [ ] 3. 添加节点名唯一性约束

  **What to do**:
  1. 修改 `src/components/NodeConfigPanel.tsx`
  2. 在节点名输入时检查唯一性
  3. 显示错误提示，阻止保存重名节点
  4. 更新 i18n 翻译文件

  **Must NOT do**:
  - 不要自动重命名节点
  - 不要改变节点的 id 生成逻辑

  **Recommended Agent Profile**:
  - Category: `quick` — 单组件修改
  - Skills: 无需额外 skills

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 7 | Blocked By: none

  **References**:
  - Pattern: `src/components/NodeConfigPanel.tsx` — 现有节点配置面板
  - Store: `src/store/useEditorStore.ts:selectSelectedNode` — 获取当前选中节点
  - i18n: `src/i18n/index.ts` — 添加错误提示翻译

  **Acceptance Criteria**:
  - [ ] 输入重名节点时显示错误提示
  - [ ] 重名节点无法保存
  - [ ] 错误提示包含中文和英文翻译

  **QA Scenarios**:
  ```
  Scenario: 重名节点阻止保存
    Tool: interactive_bash
    Steps:
      1. 创建节点 A，命名为 "test_node"
      2. 创建节点 B，尝试命名为 "test_node"
      3. 按 Enter 或点击保存
    Expected: 显示"节点名称已存在"错误，名称未更改
    Evidence: .sisyphus/evidence/task-3-unique-name.txt
  ```

  **Commit**: YES | Message: `feat(validate): add unique node name constraint` | Files: `src/components/NodeConfigPanel.tsx, src/i18n/locales/*.json`

---

- [ ] 4. 扩展 Store 支持批量导入

  **What to do**:
  1. 在 `src/store/useEditorStore.ts` 添加新状态:
     - `codeEditorContent: string`
     - `parseError: string | null`
  2. 添加新 action: `updateFromCode(doc: GraphDocument)`
  3. 实现原子操作：单次 history + 单次 save
  4. 实现位置合并：按节点名匹配保留位置

  **Must NOT do**:
  - 不要循环调用 addNode/addEdge
  - 不要清除 history（除非是全量替换）
  - 不要自动触发 code→canvas（手动触发）

  **Recommended Agent Profile**:
  - Category: `quick` — Store 扩展，模式清晰
  - Skills: 无需额外 skills

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 6 | Blocked By: 1

  **References**:
  - Pattern: `src/store/useEditorStore.ts:199-209` — addToHistory 模式
  - Pattern: `src/store/useEditorStore.ts:21-37` — debouncedSave 模式
  - Type: `src/types/index.ts:GraphDocument` — 文档结构

  **Acceptance Criteria**:
  - [ ] `updateFromCode(doc)` 存在且可调用
  - [ ] 调用 `updateFromCode` 只创建一个 history entry
  - [ ] 位置按节点名合并保留

  **QA Scenarios**:
  ```
  Scenario: 批量导入原子操作
    Tool: interactive_bash
    Steps:
      1. 在控制台调用 store.updateFromCode(newDoc)
      2. 检查 history.past.length
    Expected: history.past.length 只增加 1
    Evidence: .sisyphus/evidence/task-4-atomic-import.txt
  ```

  **Commit**: YES | Message: `feat(store): add updateFromCode for atomic import` | Files: `src/store/useEditorStore.ts`

---

- [ ] 5. 改造 CodePreview 为可编辑 CodeEditor

  **What to do**:
  1. 重命名 `src/components/CodePreview.tsx` → `src/components/CodeEditor.tsx`
  2. 将 `<pre><code>` 改为 `<textarea>`
  3. 添加语法高亮 overlay（使用 highlight.js）
  4. 添加"应用到画布"按钮
  5. 添加错误显示区域
  6. 添加安全声明提示
  7. 更新 App.tsx 引用

  **Must NOT do**:
  - 不要使用 Monaco Editor 或 CodeMirror（保持轻量）
  - 不要实时同步（手动触发）
  - 不要删除现有复制代码功能

  **Recommended Agent Profile**:
  - Category: `quick` — 组件改造，UI 为主
  - Skills: 无需额外 skills

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 6 | Blocked By: 1, 2

  **References**:
  - Pattern: `src/components/CodePreview.tsx` — 现有代码预览组件
  - App: `src/App.tsx:6,70` — 引用位置
  - CSS: `src/index.css` — 添加编辑器样式

  **Acceptance Criteria**:
  - [ ] 组件可编辑（textarea）
  - [ ] 语法高亮显示正确
  - [ ] "应用到画布"按钮存在
  - [ ] 错误区域可显示错误信息
  - [ ] 安全声明提示存在

  **QA Scenarios**:
  ```
  Scenario: 编辑器可编辑
    Tool: interactive_bash
    Steps:
      1. 启动 `npm run dev`
      2. 切换到代码标签
      3. 点击代码区域，尝试输入
    Expected: 可以输入和编辑代码
    Evidence: .sisyphus/evidence/task-5-editable.txt

  Scenario: 应用按钮存在
    Tool: interactive_bash
    Steps:
      1. 检查代码编辑器 UI
    Expected: 存在"应用到画布"按钮
    Evidence: .sisyphus/evidence/task-5-apply-btn.txt
  ```

  **Commit**: YES | Message: `refactor(ui): transform CodePreview to editable CodeEditor` | Files: `src/components/CodeEditor.tsx, src/App.tsx, src/index.css`

---

- [ ] 6. 实现代码到画布的同步逻辑

  **What to do**:
  1. 在 CodeEditor 中连接 PyodideService
  2. 实现"应用到画布"按钮点击处理:
     - 调用 `parseCode(code)`
     - 成功: 调用 `updateFromCode(doc)`
     - 失败: 显示错误，保留原画布
  3. 实现画布到代码的单向同步:
     - Store 变化时更新编辑器内容
     - 不自动执行反向同步

  **Must NOT do**:
  - 不要循环触发同步（防止 ping-pong）
  - 不要在失败时清空画布
  - 不要自动同步（必须手动触发）

  **Recommended Agent Profile**:
  - Category: `quick` — 集成逻辑，连接各模块
  - Skills: 无需额外 skills

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: 7 | Blocked By: 1, 4, 5

  **References**:
  - Service: `src/services/pyodideService.ts` — parseCode 函数
  - Store: `src/store/useEditorStore.ts` — updateFromCode
  - Component: `src/components/CodeEditor.tsx` — 编辑器组件

  **Acceptance Criteria**:
  - [ ] 点击"应用到画布"可解析代码
  - [ ] 解析成功更新画布
  - [ ] 解析失败显示错误信息
  - [ ] 解析失败保留原画布状态

  **QA Scenarios**:
  ```
  Scenario: 代码同步成功
    Tool: interactive_bash
    Steps:
      1. 在编辑器输入有效 build_graph 代码
      2. 点击"应用到画布"
      3. 检查画布节点
    Expected: 画布显示代码定义的节点
    Evidence: .sisyphus/evidence/task-6-sync-success.txt

  Scenario: 错误代码回滚
    Tool: interactive_bash
    Steps:
      1. 记录当前画布节点数量 N
      2. 输入语法错误代码
      3. 点击"应用到画布"
      4. 检查画布节点数量
    Expected: 节点数量仍为 N，显示错误信息
    Evidence: .sisyphus/evidence/task-6-error-rollback.txt
  ```

  **Commit**: YES | Message: `feat(sync): implement code-to-canvas synchronization` | Files: `src/components/CodeEditor.tsx`

---

- [ ] 7. 最终验证和文档

  **What to do**:
  1. 执行完整功能测试:
     - 画布 → 代码生成（build_graph 格式）
     - 代码 → 画布同步
     - 错误处理
     - 节点唯一性
  2. 验证 `npm run build` 成功
  3. 更新 README.md 添加新功能说明

  **Must NOT do**:
  - 不要添加未讨论的功能
  - 不要修改核心数据结构

  **Recommended Agent Profile**:
  - Category: `quick` — 验证和文档
  - Skills: 无需额外 skills

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: none | Blocked By: 3, 6

  **References**:
  - README: `README.md` — 项目文档

  **Acceptance Criteria**:
  - [ ] `npm run build` 退出码为 0
  - [ ] 画布拖拽生成 build_graph 格式代码
  - [ ] 编辑代码可同步到画布
  - [ ] 错误代码显示错误信息
  - [ ] 重名节点被阻止

  **QA Scenarios**:
  ```
  Scenario: 构建成功
    Tool: Bash
    Steps: `npm run build`
    Expected: 退出码 0，dist/ 目录存在
    Evidence: .sisyphus/evidence/task-7-build.txt

  Scenario: 端到端同步流程
    Tool: interactive_bash
    Steps:
      1. 创建 2 个节点，连接边
      2. 查看生成的代码
      3. 修改代码中的节点名
      4. 点击"应用到画布"
      5. 检查画布节点名是否更新
    Expected: 节点名正确更新
    Evidence: .sisyphus/evidence/task-7-e2e-sync.txt
  ```

  **Commit**: YES | Message: `docs: add code-canvas sync feature documentation` | Files: `README.md`

## Final Verification Wave

- [ ] F1. Plan Compliance Audit — oracle (验证实现符合规划)
- [ ] F2. Code Quality Review — unspecified-high (代码质量检查)
- [ ] F3. Real Manual QA — unspecified-high (手动功能验证)
- [ ] F4. Scope Fidelity Check — deep (范围一致性检查)

## Commit Strategy
- 每个 TODO 完成后单独提交
- 提交信息格式: `type(scope): description`
- 最终合并前检查所有提交

## Success Criteria
1. ✅ 用户可在画布拖拽节点，生成 build_graph 格式的 Python 代码
2. ✅ 用户可编辑 Python 代码，点击按钮同步到画布
3. ✅ 语法错误代码显示错误信息，保留原画布
4. ✅ 节点名唯一性约束生效
5. ✅ `npm run build` 构建成功
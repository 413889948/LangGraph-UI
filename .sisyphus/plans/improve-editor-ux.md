# LangGraph 可视化编辑器 UX 改进计划

## TL;DR
> **Summary**: 为 LangGraph 可视化编辑器实现三大 UX 改进：localStorage 自动保存（替代下载 JSON）、20 步撤销/重做功能、语义化节点命名（fun_1, tool_1, subgraph_1）
> **Deliverables**: 
> - localStorage 自动保存 + 加载 + 错误处理
> - Ctrl+Z / Ctrl+Shift+Z 撤销/重做系统（20 步历史）
> - 语义化递增节点命名系统
> **Effort**: Medium-Large (预计 8-12 个任务)
> **Parallel**: YES - 3 waves（命名→自动保存→撤销，按风险递增）
> **Critical Path**: 语义化命名 → localStorage 持久化 → Undo/Redo 历史管理

## Context

### Original Request
当前的保存功能是直接下载一个 json 文件，交互不友好，应该存储在对应前端缓存内，并且 ctrl+z 无法撤销操作，需要修复下，还有各个节点组件的名称设计的并不好，不要使用数字，uuid 这种进行对应的节点命名，应该有一个更规范的递增节点命名，例如:fun_1

### Interview Summary
通过探索发现：
- **保存**: `FileOperations.tsx:27-53` 使用 Blob + URL.createObjectURL 触发浏览器下载
- **撤销**: 仅实现 Delete/Backspace 删除 (`GraphCanvas.tsx:197-214`)，无 undo/redo 栈
- **命名**: `GraphCanvas.tsx:142` 使用 `${type}_${uuid.slice(0,8)}` 如 `function_a1b2c3d4`
- **架构**: Zustand store (`useEditorStore.ts`) 集中管理状态，已有 `isDirty` 标记

### Metis Review (gaps addressed)
Metis 识别出关键风险：
1. **localStorage 配额限制** (5-10MB) → 需要配额检测和降级处理
2. **撤销粒度定义** → 每次 mutation 算一步，连续拖拽需防抖
3. **多标签冲突** → 本 MVP 暂不处理，留作未来扩展
4. **命名碰撞** → 计数器不回收删除编号，避免冲突
5. **代码生成耦合** → 确保语义名称是有效 JS 标识符

## Work Objectives

### Core Objective
提升编辑器 UX 至现代 Web 应用标准：
- **自动保存**：防止数据丢失，减少手动操作
- **撤销/重做**：允许操作失误恢复，降低使用焦虑
- **语义命名**：提高导出代码可读性，便于识别节点

### Deliverables
1. localStorage 自动保存机制（debounce 1000ms）
2. 撤销/重做历史管理（20 步，深拷贝）
3. 语义化节点命名（fun_1, tool_1, subgraph_1）
4. 存储配额警告 UI
5. 撤销/重做快捷键绑定（Ctrl+Z / Ctrl+Shift+Z）

### Definition of Done (verifiable conditions with commands)
- [ ] 新创建节点名称为 `fun_1`, `tool_1`, `subgraph_1` 格式
- [ ] 导出的 Python 代码中函数名为语义化名称
- [ ] localStorage 满时显示警告但不阻止编辑
- [ ] 撤销/重做支持所有 mutation 类型（增删改节点/边/Schema）
- [ ] 连续快速编辑仅触发一次保存（防抖验证）
- [ ] 撤销 20 步后继续撤销不会崩溃（边界处理）
- [ ] **isDirty 语义**：仅表示"未成功保存到 localStorage"，自动保存成功后立即 clean
### Must Have
- ✅ 所有变更向后兼容现有 GraphDocument 格式
- ✅ 撤销/重做支持所有 mutation 类型（增删改节点/边/Schema）
- ✅ 语义命名与代码生成器兼容
- ✅ 错误处理不阻塞用户操作

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- ❌ 不提供多项目管理（单项目模型）
- ❌ 不支持多标签同步（MVP 不考虑）
- ❌ 不允许手动重命名节点（保持简单）
- ❌ 不实现云端同步（纯本地存储）
- ❌ 不支持撤销历史持久化（刷新后清空）

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- **Test decision**: tests-after（实现后补充测试）+ 手动 QA 验证
- **QA policy**: 每个任务包含 Playwright 场景测试 + 错误边界测试
- **Evidence**: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy

### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

#### Wave 1: 语义化命名（基础变更，独立无依赖）
- 任务 1: 扩展 store 支持节点命名计数器
- 任务 2: 修改节点创建逻辑使用计数器
- 任务 3: 加载项目时重建计数器
- 任务 4: 验证导出代码兼容性

#### Wave 2: localStorage 自动保存（中等风险，依赖 Wave1 命名）
- 任务 5: 添加 localStorage 持久化中间件
- 任务 6: 实现自动保存触发逻辑（debounce）
- 任务 7: 存储配额错误处理
- 任务 8: 页面加载时恢复数据

#### Wave 3: 撤销/重做（高风险，需知悉前两者）
- 任务 9: 扩展 store 支持历史栈（past/present/future）
- 任务 10: 包装所有 mutation 支持历史记录
- 任务 11: 实现撤销/重做快捷键
- 任务 12: 选择状态恢复逻辑

#### Wave 4: 最终验证
- 任务 F1-F4: 四轮并行验证（合规/质量/QA/范围）

### Dependency Matrix (full, all tasks)
```
Task 1 → Task 2 → Task 3 → Task 4
                     ↓
Task 5 → Task 6 → Task 7 → Task 8
                     ↓
Task 9 → Task 10 → Task 11 → Task 12
                     ↓
                  F1, F2, F3, F4
```

### Agent Dispatch Summary (wave → task count → categories)
- Wave 1: 4 tasks → quick (语义命名，简单直接)
- Wave 2: 4 tasks → unspecified-high (localStorage，需错误处理)
- Wave 3: 4 tasks → unspecified-high (undo/redo，复杂状态管理)
- Wave 4: 4 tasks → oracle/deep (验证审计)

## TODOs

- [ ] 1. 扩展 store 支持节点命名计数器

  **What to do**: 
  1. 在 `useEditorStore.ts` 中添加 `nodeNaming` 状态
  2. 定义接口 `{ counters: { function: number, tool: number, subgraph: number } }`
  3. 初始化 counters 为 0
  4. 添加动作 `resetNodeNaming(doc: GraphDocument)` 从现有节点计算最大编号
  5. 添加动作 `getNextNodeName(type: NodeType): string` 返回语义名称并递增计数器

  **Must NOT do**: 
  - 不修改现有节点 ID 生成逻辑（仍用 UUID）
  - 不提供手动重命名功能
  - 不回收删除节点的编号

  **Recommended Agent Profile**:
  - Category: `quick` — 简单状态扩展
  - Skills: [] — 基础 Zustand 操作
  - Omitted: [`artistry`] — 无需复杂逻辑

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [Task 2, 3] | Blocked By: []

  **References**:
  - Pattern: `src/store/useEditorStore.ts:38-105` — 参考现有 state/actions 定义
  - API/Type: `src/types/index.ts:18` — NodeType 类型定义
  - Existing: `src/store/useEditorStore.ts:15-33` — 参考 locale 持久化模式

  **Acceptance Criteria**:
  - [ ] 初始化 store 时 counters 为 `{ function: 0, tool: 0, subgraph: 0 }`
  - [ ] `getNextNodeName('function')` 返回 `fun_1` 并设置 `function: 1`
  - [ ] `resetNodeNaming` 遍历节点找出最大编号，如 `fun_5` → `function: 5`

  **QA Scenarios**:
  ```
  Scenario: 连续创建 3 个 function 节点
    Tool: interactive_bash
    Steps: 
      1. pnpm dev 启动应用
      2. 拖拽 3 个 function 节点到画布
      3. 检查节点名称依次为 fun_1, fun_2, fun_3
    Expected: 名称符合语义化递增模式
    Evidence: .sisyphus/evidence/task-1-naming-sequential.png

  Scenario: 加载已有项目后创建新节点
    Tool: interactive_bash
    Steps:
      1. 加载包含 fun_5 的项目
      2. 创建新 function 节点
      3. 检查名称为 fun_6
    Expected: 计数器正确重建
    Evidence: .sisyphus/evidence/task-1-naming-rebuild.png
  ```

  **Commit**: YES | Message: `feat(store): add node naming counters for semantic naming` | Files: `src/store/useEditorStore.ts`

---

- [ ] 2. 修改节点创建逻辑使用语义化名称

  **What to do**:
  1. 在 `GraphCanvas.tsx:136-147` 的 `onDrop` 回调中
  2. 替换 `const name = \`${draggedNodeType}_${id.slice(0, 8)}\`` 
  3. 改为调用 `getNextNodeName(draggedNodeType)`
  4. 保持 ID 仍用 `uuidv4()` 生成

  **Must NOT do**:
  - 不修改节点 ID 生成（仍需 UUID 唯一性）
  - 不修改边命名逻辑（Scope 外）
  - 不添加命名自定义选项

  **Recommended Agent Profile**:
  - Category: `quick` — 单文件单行修改
  - Skills: [] — 基础 TypeScript
  - Omitted: [`librarian`] — 无需外部知识

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [Task 4] | Blocked By: [Task 1]

  **References**:
  - Target: `src/components/GraphCanvas.tsx:142` — 当前命名逻辑
  - API: `useEditorStore.getState().getNextNodeName()` — 从 Task 1 获取
  - Test: 验证 `src/utils/codeGenerator.ts:80,111` 能处理语义名称

  **Acceptance Criteria**:
  - [ ] 新创建的 function 节点名为 `fun_1`, `fun_2`...
  - [ ] 新创建的 tool 节点名为 `tool_1`, `tool_2`...
  - [ ] 新创建的 subgraph 节点名为 `subgraph_1`, `subgraph_2`...
  - [ ] 节点 ID 仍为 UUID 格式（`uuidv4()`）

  **QA Scenarios**:
  ```
  Scenario: 创建不同类型节点
    Tool: interactive_bash
    Steps:
      1. 拖拽 function 节点 → fun_1
      2. 拖拽 tool 节点 → tool_1
      3. 拖拽 subgraph 节点 → subgraph_1
      4. 再拖拽 function 节点 → fun_2
    Expected: 各类型独立计数，互不干扰
    Evidence: .sisyphus/evidence/task-2-mixed-types.png
  ```

  **Commit**: YES | Message: `feat(canvas): use semantic naming for new nodes` | Files: `src/components/GraphCanvas.tsx`

---

- [ ] 3. 加载项目时重建命名计数器

  **What to do**:
  1. 在 `FileOperations.tsx:78-84` 的 `handleLoadProject` 中
  2. 解析 JSON 后调用 `resetNodeNaming(loadedDocument)`
  3. 遍历所有节点找出每种类型的最大编号
  4. 更新 store 中的 counters

  **Must NOT do**:
  - 不修改现有节点的名称（保持原样）
  - 不验证名称格式（允许旧 UUID 名称存在）
  - 不清除 counters（刷新后重建）

  **Recommended Agent Profile**:
  - Category: `quick` — 简单遍历 + 状态更新
  - Skills: [] — 基础数组操作
  - Omitted: [`deep`] — 逻辑简单

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [] | Blocked By: [Task 1]

  **References**:
  - Target: `src/components/FileOperations.tsx:78-84` — 加载逻辑
  - Pattern: `src/store/useEditorStore.ts:388-398` — 参考状态更新模式
  - Type: `src/types/index.ts:175` — GraphDocument.nodes 数组

  **Acceptance Criteria**:
  - [ ] 加载包含 `fun_5` 的项目后，下一个 function 节点为 `fun_6`
  - [ ] 加载空项目后，所有 counters 重置为 0
  - [ ] 加载混合命名（UUID + 语义）项目后，正确计算最大值

  **QA Scenarios**:
  ```
  Scenario: 加载旧项目（UUID 命名）
    Tool: interactive_bash
    Steps:
      1. 创建包含 3 个 function 节点的旧项目（UUID 命名）
      2. 导出并重新加载
      3. 创建新 function 节点
    Expected: 新节点名为 fun_1（旧 UUID 不计入）
    Evidence: .sisyphus/evidence/task-3-legacy-uuid.png

  Scenario: 加载新项目（语义命名）
    Tool: interactive_bash
    Steps:
      1. 创建包含 fun_1, fun_2, fun_3 的项目
      2. 导出并重新加载
      3. 创建新 function 节点
    Expected: 新节点名为 fun_4
    Evidence: .sisyphus/evidence/task-3-semantic-rebuild.png
  ```

  **Commit**: YES | Message: `feat(file-ops): rebuild naming counters on project load` | Files: `src/components/FileOperations.tsx`

---

- [ ] 4. 验证代码生成器兼容性

  **What to do**:
  1. 检查 `src/utils/codeGenerator.ts` 中使用节点名称的地方
  2. 验证语义名称 (`fun_1`) 生成的 Python 代码有效
  3. 如需，添加名称验证/清理逻辑

  **Must NOT do**:
  - 不修改代码生成器模板（除非验证失败）
  - 不添加新的代码生成选项
  - 不支持自定义命名模式

  **Recommended Agent Profile**:
  - Category: `quick` — 验证性任务
  - Skills: [] — 基础 Python 语法知识
  - Omitted: [`librarian`] — 无需外部文档

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: [] | Blocked By: [Task 2]

  **References**:
  - Target: `src/utils/codeGenerator.ts:80,111,112,188,190` — 使用节点名称的位置
  - Validation: Python 标识符规则 `/^[a-zA-Z_][a-zA-Z0-9_]*$/`

  **Acceptance Criteria**:
  - [ ] `fun_1`, `tool_1`, `subgraph_1` 是有效的 Python 函数名
  - [ ] 生成的代码中函数定义语法正确
  - [ ] 无特殊字符或保留字冲突

  **QA Scenarios**:
  ```
  Scenario: 生成 Python 代码验证
    Tool: interactive_bash
    Steps:
      1. 创建 fun_1, tool_1, subgraph_1 各一个
      2. 切换到代码预览标签页
      3. 检查生成的 Python 函数名
      4. 复制代码并运行 `python -m py_compile generated.py`
    Expected: 无语法错误，函数名有效
    Evidence: .sisyphus/evidence/task-4-codegen-valid.py
  ```

  **Commit**: NO (验证任务，除非发现问题需修复)

---

- [ ] 4b. 添加代码生成器 ID→Name 映射（Momus 关键修复）

  **What to do**:
  1. 在 `codeGenerator.ts` 中创建节点 ID 到名称的映射表
  2. 修改 `add_edge` 生成逻辑，使用节点名称而非 ID
  3. 修改 `set_entry_point` 使用节点名称
  4. 确保所有生成的 Python 代码使用语义化名称

  **Must NOT do**:
  - ❌ 不修改现有节点 ID 存储方式（仍为 UUID）
  - ❌ 不修改节点数据结构
  - ❌ 不影响运行时逻辑（仅代码生成）

  **Recommended Agent Profile**:
  - Category: `quick` — 简单映射逻辑
  - Skills: [] — 基础 Python 代码生成
  - Omitted: [`deep`] — 逻辑直接

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: [] | Blocked By: [Task 2]

  **References**:
  - Target: `src/utils/codeGenerator.ts:131` — 当前使用 ID 生成边
  - Target: `src/utils/codeGenerator.ts:188,190` — 入口点设置
  - Pattern: `src/utils/codeGenerator.ts:112` — 参考节点注册逻辑

  **Acceptance Criteria**:
  - [ ] 生成的边连接使用节点名称（如 `graph.add_edge("fun_1", "tool_1")`）
  - [ ] 生成的入口点使用节点名称（如 `graph.set_entry_point("fun_1")`）
  - [ ] 无 UUID 出现在生成的 Python 代码中
  - [ ] 代码可执行且逻辑正确

  **QA Scenarios**:
  ```
  Scenario: 验证生成代码无 UUID
    Tool: interactive_bash
    Steps:
      1. 创建 fun_1 → tool_1 连接
      2. 导出 Python 代码
      3. 检查代码中是否有 UUID 字符串
    Expected: 所有引用使用语义化名称
    Evidence: .sisyphus/evidence/task-4b-no-uuid.png

  Scenario: 运行生成的代码
    Tool: interactive_bash
    Steps:
      1. 创建包含 3 个节点的图
      2. 导出 Python 代码
      3. 运行 `python generated.py`
    Expected: 无运行时错误
    Evidence: .sisyphus/evidence/task-4b-runs.png
  ```

  **Commit**: YES | Message: `fix(codegen): use node names instead of IDs in generated edges` | Files: `src/utils/codeGenerator.ts`

---

- [ ] 5. 实现手动 debounce 自动保存（替换 persist 中间件）

- [ ] 5. 添加 localStorage 持久化中间件

  **What to do**:
  1. 在 `useEditorStore.ts` 中集成 Zustand 的 `persist` 中间件
  2. 配置存储键名 `langgraph-graph-document`
  3. 使用 `partialize` 仅持久化 `graphDocument` 和 `viewport`
  4. 排除 `selectedNode`, `selectedEdge`, `isDirty`（UI 状态）
  5. 添加版本号用于未来迁移

  **Must NOT do**:
  - ❌ 不使用 Zustand persist 中间件（改用手动 debounce 保存，便于错误处理）
  - ❌ 不持久化选择状态（ephemeral UI state）
  - ❌ 不持久化 isDirty（应从加载状态推断）

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — 需理解 localStorage 异步写入和错误处理
  - Skills: [] — 基础异步编程
  - Omitted: [`quick`] — 涉及配置和错误处理

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: [Task 6, 7, 8] | Blocked By: []

  **References**:
  - Pattern: `src/store/useEditorStore.ts:370-380` — markDirty 实现
  - Pattern: `src/store/useEditorStore.ts:15-33` — 参考现有 locale localStorage 逻辑
  - Type: `src/types/index.ts:173` — GraphDocument.version 字段

  **Acceptance Criteria**:
  - [ ] graphDocument 保存到 localStorage `langgraph-graph-document`
  - [ ] selectedNodeId, selectedElementId 不保存
  - [ ] isDirty 不保存
  - [ ] viewport 可选保存（用于恢复视图状态）
  - [ ] 存储结构包含 `version: "1.0.0"` 字段

  **QA Scenarios**:
  ```
  Scenario: 页面刷新后恢复图形
    Tool: interactive_bash
    Steps:
      1. 创建包含 3 个节点的图形
      2. 刷新页面
      3. 检查画布是否恢复原状
    Expected: 所有节点和连接恢复
    Evidence: .sisyphus/evidence/task-5-reload-recovery.png

  Scenario: 选择状态不持久化
    Tool: interactive_bash
    Steps:
      1. 选中一个节点
      2. 刷新页面
      3. 检查是否仍有节点被选中
    Expected: 选择状态已清空
    Evidence: .sisyphus/evidence/task-5-selection-cleared.png
  ```

  **Commit**: YES | Message: `feat(store): implement manual debounced auto-save with error handling` | Files: `src/store/useEditorStore.ts`

---

- [ ] 6. 实现自动保存触发逻辑（debounce）

  **What to do**:
  1. 在所有调用 `markDirty()` 的 action 中
  2. 触发 debounce 1000ms 的保存函数
  3. 使用 `lodash.debounce` 或自定义 debounce 实现
  4. 保存到 localStorage

  **Must NOT do**:
  - 不每次变更都立即保存（性能问题）
  - 不阻塞用户操作等待保存完成
  - 不显示"正在保存"状态（静默保存）

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — 需处理异步和防抖
  - Skills: [] — 基础异步编程
  - Omitted: [`librarian`] — 无需外部库（自定义 debounce）

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: [] | Blocked By: [Task 5]

  **References**:
  - Pattern: `src/store/useEditorStore.ts:370-380` — markDirty 实现
  - Existing: 所有调用 `get().markDirty()` 的位置（约 10 处）

  **Acceptance Criteria**:
  - [ ] 编辑后 1 秒自动保存到 localStorage
  - [ ] 连续编辑只触发最后一次保存（防抖生效）
  - [ ] 保存不阻塞 UI（异步）
  - [ ] 控制台无错误日志

  **QA Scenarios**:
  ```
  Scenario: 快速连续编辑触发防抖
    Tool: interactive_bash
    Steps:
      1. 快速创建 5 个节点（1 秒内完成）
      2. 打开浏览器 DevTools → Application → localStorage
      3. 检查保存次数
    Expected: 仅触发 1 次保存（防抖生效）
    Evidence: .sisyphus/evidence/task-6-debounce.png

  Scenario: 编辑后等待自动保存
    Tool: interactive_bash
    Steps:
      1. 创建一个节点
      2. 等待 2 秒
      3. 刷新页面
    Expected: 节点已保存并恢复
    Evidence: .sisyphus/evidence/task-6-autosave.png
  ```

  **Commit**: YES | Message: `feat(store): add debounced auto-save on dirty state changes` | Files: `src/store/useEditorStore.ts`

---

- [ ] 7. 存储配额错误处理

  **What to do**:
  1. 在保存逻辑中添加 try-catch
  2. 捕获 `QuotaExceededError`
  3. 显示警告但不阻止编辑
  4. 设置 `isDirty` 但不保存到 localStorage
  5. 可选：提供"清理存储"按钮

  **Must NOT do**:
  - 不因保存失败而回滚变更
  - 不频繁弹出警告（每会话最多一次）
  - 不自动删除旧数据（用户授权前）

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — 需处理边界情况
  - Skills: [] — 错误处理经验
  - Omitted: [`quick`] — 涉及 UI 反馈

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: [] | Blocked By: [Task 5]

  **References**:
  - Pattern: `src/components/FileOperations.tsx:85-87` — 参考现有错误处理
  - Browser API: `localStorage.setItem()` 抛出 `QuotaExceededError`

  **Acceptance Criteria**:
  - [ ] localStorage 满时不崩溃
  - [ ] 显示警告 "存储空间已满，自动保存已禁用"
  - [ ] 用户可继续编辑（isDirty 标记正常）
  - [ ] 警告每会话仅显示一次

  **QA Scenarios**:
  ```
  Scenario: 模拟存储配额耗尽
    Tool: interactive_bash
    Steps:
      1. 使用 DevTools 填满 localStorage（或 Mock 抛出 QuotaExceededError）
      2. 创建新节点
      3. 检查是否显示警告
    Expected: 警告显示但不阻止编辑
    Evidence: .sisyphus/evidence/task-7-quota-warning.png

  Scenario: 存储满后刷新页面
    Tool: interactive_bash
    Steps:
      1. 触发配额错误
      2. 刷新页面
      3. 检查警告是否重复显示
    Expected: 警告不再显示（每会话一次）
    Evidence: .sisyphus/evidence/task-7-single-warning.png
  ```

  **Commit**: YES | Message: `feat(store): add storage quota error handling with user warning` | Files: `src/store/useEditorStore.ts, src/components/App.tsx`

---

- [ ] 8. 页面加载时恢复数据

  **What to do**:
  1. 在 `useEditorStore` 初始化时
  2. 从 localStorage 读取 `langgraph-graph-document`
  3. 如果存在，调用 `setGraphDocument(loadedDoc)`
  4. 调用 `resetNodeNaming(loadedDoc)` 重建计数器
  5. 处理版本迁移（如需要）

  **Must NOT do**:
  - 不覆盖用户明确保存的文件（区分自动保存和手动加载）
  - 不恢复选择状态
  - 不恢复 isDirty（应从 loadedDoc 推断为 clean）

  **Recommended Agent Profile**:
  - Category: `quick` — 简单的初始化逻辑
  - Skills: [] — 基础状态管理
  - Omitted: [`deep`] — 逻辑直接

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: [] | Blocked By: [Task 5, Task 3]

  **References**:
  - Pattern: `src/store/useEditorStore.ts:25-33` — 参考 locale 恢复逻辑
  - Existing: `createDefaultGraphDocument()` — 默认初始化

  **Acceptance Criteria**:
  - [ ] 页面加载自动恢复上次编辑的图形
  - [ ] 命名计数器正确重建
  - [ ] 无 localStorage 数据时使用默认空项目
  - [ ] 版本不匹配时显示警告并使用空项目

  **QA Scenarios**:
  ```
  Scenario: 冷启动恢复
    Tool: interactive_bash
    Steps:
      1. 创建图形并等待自动保存
      2. 完全关闭浏览器
      3. 重新打开应用
    Expected: 图形完整恢复
    Evidence: .sisyphus/evidence/task-8-cold-start.png

  Scenario: 版本不兼容处理
    Tool: interactive_bash
    Steps:
      1. Mock localStorage 中 version: "99.0.0" 的数据
      2. 刷新页面
      3. 检查是否使用空项目或迁移
    Expected: 显示警告并加载空项目
    Evidence: .sisyphus/evidence/task-8-version-mismatch.png
  ```

  **Commit**: YES | Message: `feat(store): restore graph document from localStorage on initialization` | Files: `src/store/useEditorStore.ts`

---

- [ ] 9. 扩展 store 支持历史栈（past/present/future）

  **What to do**:
  1. 重构 `useEditorStore` 使用分离的 history state:
     ```typescript
     interface HistoryState {
       past: GraphDocument[];  // max 20
       present: GraphDocument | null;
       future: GraphDocument[];
     }
     ```
  2. 添加 `undo()`, `redo()` 动作
  3. 添加 `addToHistory(doc: GraphDocument)` 内部函数
  4. 限制 past 数组最大长度为 20

  **Must NOT do**:
  - ❌ 不持久化历史栈到 localStorage（内存即可）
  - ❌ 不支持部分撤销（原子性操作）
  - ❌ 不暴露历史栈给组件（封装为内部状态）
  - ❌ 不在 `setGraphDocument/resetGraphDocument` 后清空历史栈（添加清理逻辑）

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — 复杂状态重构
  - Skills: [] — 时间旅行调试模式经验
  - Omitted: [`quick`] — 影响全局状态管理

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: [Task 10, 11, 12] | Blocked By: []

  **References**:
  - Pattern: Redux undo/redo 模式（不可变状态 + 历史栈）
  - Existing: `src/store/useEditorStore.ts:38-105` — 当前 state 结构

  **Acceptance Criteria**:
  - [ ] past 数组最多保存 20 个历史状态
  - [ ] 新操作时 future 数组清空
  - [ ] 超过 20 步时 oldest 状态被丢弃
  - [ ] present 为 null 时（新项目）undo 无效果
  - [ ] `setGraphDocument` / `resetGraphDocument` 后清空历史栈（避免跨项目污染）

  **QA Scenarios**:
  ```
  Scenario: 撤销到初始状态
    Tool: interactive_bash
    Steps:
      1. 创建空项目
      2. 创建 5 个节点
      3. 连续按 Ctrl+Z 5 次
    Expected: 回到空画布状态
    Evidence: .sisyphus/evidence/task-9-undo-to-empty.png

  Scenario: 超过 20 步历史
    Tool: interactive_bash
    Steps:
      1. 创建 25 个节点
      2. 连续按 Ctrl+Z 25 次
      3. 检查最早 5 个节点是否仍可撤销
    Expected: 仅最近 20 步可撤销
    Evidence: .sisyphus/evidence/task-9-history-limit.png
  ```

  **Commit**: YES | Message: `feat(store): implement history management for undo/redo` | Files: `src/store/useEditorStore.ts`

---

- [ ] 10. 包装所有 mutation 支持历史记录

  **What to do**:
  1. 修改所有调用 `markDirty()` 的 action:
     - addNode, updateNode, removeNode
     - addEdge, updateEdge, removeEdge
     - addStateField, updateStateField, removeStateField
  2. 在变更前调用 `addToHistory(currentDoc)`
  3. 在变更后更新 `present`
  4. 清空 `future` 数组

  **Must NOT do**:
  - 不修改 mutation 的业务逻辑（仅包装历史管理）
  - 不对 viewport 变更记录历史（UI 操作）
  - 不对选择状态变更记录历史

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — 需修改多处代码
  - Skills: [] — 批量重构经验
  - Omitted: [`quick`] — 影响面广

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: [] | Blocked By: [Task 9]

  **References**:
  - Target: 所有 `get().markDirty()` 调用位置（约 10 处）
  - Pattern: `src/store/useEditorStore.ts:163-204` — 参考现有 mutation 实现

  **Acceptance Criteria**:
  - [ ] 每次 mutation 后 past 数组增加一个状态
  - [ ] future 数组在 mutation 后清空
  - [ ] 深拷贝文档状态（避免引用共享）
  - [ ] 性能测试：创建 50 个节点无明显卡顿

  **QA Scenarios**:
  ```
  Scenario: 撤销节点创建
    Tool: interactive_bash
    Steps:
      1. 创建 3 个节点
      2. 按 Ctrl+Z
    Expected: 最近创建的节点消失
    Evidence: .sisyphus/evidence/task-10-undo-create.png

  Scenario: 撤销节点删除
    Tool: interactive_bash
    Steps:
      1. 创建节点
      2. 删除节点
      3. 按 Ctrl+Z
    Expected: 节点恢复
    Evidence: .sisyphus/evidence/task-10-undo-delete.png

  Scenario: 撤销后执行新操作
    Tool: interactive_bash
    Steps:
      1. 创建 3 个节点
      2. 按 Ctrl+Z 撤销最后一个
      3. 创建新节点
      4. 按 Ctrl+Z
    Expected: 不能重做到被新操作覆盖的状态
    Evidence: .sisyphus/evidence/task-10-undo-new-op.png
  ```

  **Commit**: YES | Message: `feat(store): wrap all mutations with history tracking` | Files: `src/store/useEditorStore.ts`

---

- [ ] 11. 实现撤销/重做快捷键

  **What to do**:
  1. 在 `GraphCanvas.tsx:197-214` 的键盘监听器中
  2. 添加 `Ctrl+Z` → 调用 `undo()`
  3. 添加 `Ctrl+Shift+Z` 或 `Ctrl+Y` → 调用 `redo()`
  4. 处理 macOS 的 `Cmd` 键（`event.metaKey`）
  5. 阻止默认浏览器行为（`event.preventDefault()`）

  **Must NOT do**:
  - ❌ 不修改现有 Delete/Backspace 逻辑
  - ❌ 不在表单输入时触发快捷键
  - ❌ 不支持自定义快捷键配置
  - ❌ 不在 input/textarea/contentEditable 元素中拦截快捷键

  **Recommended Agent Profile**:
  - Category: `quick` — 简单事件处理
  - Skills: [] — 基础键盘事件
  - Omitted: [`deep`] — 逻辑简单

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: [] | Blocked By: [Task 10]

  **References**:
  - Target: `src/components/GraphCanvas.tsx:197-214` — 现有键盘监听
  - Pattern: 检查 `event.ctrlKey || event.metaKey`

  **Acceptance Criteria**:
  - [ ] Ctrl+Z 撤销上一步操作
  - [ ] Ctrl+Shift+Z 重做
  - [ ] Ctrl+Y 重做（Windows 标准）
  - [ ] Cmd+Z / Cmd+Shift+Z 在 macOS 工作
  - [ ] 输入框聚焦时不触发快捷键（检测 `event.target.tagName`）
  - [ ] Delete/Backspace 在输入框中不删除节点（保护文本输入）

  **QA Scenarios**:
  ```
  Scenario: 基本撤销功能
    Tool: interactive_bash
    Steps:
      1. 创建节点
      2. 按 Ctrl+Z
    Expected: 节点消失
    Evidence: .sisyphus/evidence/task-11-undo-basic.png

  Scenario: 基本重做功能
    Tool: interactive_bash
    Steps:
      1. 创建节点
      2. 按 Ctrl+Z
      3. 按 Ctrl+Shift+Z
    Expected: 节点恢复
    Evidence: .sisyphus/evidence/task-11-redo-basic.png

  Scenario: macOS 快捷键
    Tool: interactive_bash
    Steps:
      1. 在 macOS 上创建节点
      2. 按 Cmd+Z
    Expected: 节点消失
    Evidence: .sisyphus/evidence/task-11-macos-undo.png

  Scenario: 输入框中不触发
    Tool: interactive_bash
    Steps:
      1. 聚焦节点名称输入框
      2. 按 Ctrl+Z
    Expected: 输入框内容撤销（浏览器默认行为），不是图形撤销
    Evidence: .sisyphus/evidence/task-11-input-undo.png
  ```

  **Commit**: YES | Message: `feat(canvas): add Ctrl+Z/Ctrl+Shift+Z keyboard shortcuts for undo/redo` | Files: `src/components/GraphCanvas.tsx`

---

- [ ] 12. 选择状态恢复逻辑

  **What to do**:
  1. 在 `undo()` 和 `redo()` 中
  2. 检查撤销/重做后当前选中的节点/边是否存在
  3. 如果不存在（被删除了），清除选择状态
  4. 如果存在，保持选择（可选：高亮显示）

  **Must NOT do**:
  - 不尝试恢复已删除节点的选择（会导致错误）
  - 不自动选择其他节点
  - 不显示"已撤销选择"提示

  **Recommended Agent Profile**:
  - Category: `quick` — 防御性检查
  - Skills: [] — 基础条件逻辑
  - Omitted: [`deep`] — 简单验证

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: [] | Blocked By: [Task 9]

  **References**:
  - Pattern: `src/store/useEditorStore.ts:186-203` — 参考删除节点时清除选择的逻辑
  - Type: `src/types/index.ts:175-176` — GraphDocument.nodes/edges 数组

  **Acceptance Criteria**:
  - [ ] 撤销节点创建后，选择状态清空
  - [ ] 撤销节点删除后，选择状态仍清空（不自动选中恢复的节点）
  - [ ] 撤销边连接后，选择状态清空
  - [ ] 无控制台错误（Cannot read property of undefined）

  **QA Scenarios**:
  ```
  Scenario: 撤销选中的节点
    Tool: interactive_bash
    Steps:
      1. 创建节点并选中
      2. 按 Ctrl+Z
    Expected: 节点消失，无选中状态
    Evidence: .sisyphus/evidence/task-12-undo-selected.png

  Scenario: 撤销删除选中节点
    Tool: interactive_bash
    Steps:
      1. 创建节点
      2. 选中并删除
      3. 按 Ctrl+Z
    Expected: 节点恢复，无选中状态
    Evidence: .sisyphus/evidence/task-12-undo-deleted-selected.png
  ```

  **Commit**: YES | Message: `feat(store): clear selection if undone node/edge no longer exists` | Files: `src/store/useEditorStore.ts`

---

## Final Verification Wave (4 parallel agents, ALL must APPROVE)

- [ ] F1. Plan Compliance Audit — oracle
  - 验证所有 TODO 是否实现
  - 检查是否遵守 Must NOT Have 约束
  - 确认 Metis 提出的 guardrails 已落实

- [ ] F2. Code Quality Review — unspecified-high
  - 代码风格一致性检查
  - TypeScript 类型完整性
  - 无 `any` 类型逃逸
  - 错误处理完备性

- [ ] F3. Real Manual QA — unspecified-high (+ playwright if UI)
  - 自动保存场景测试
  - 撤销/重做全流程测试
  - 语义命名验证
  - 边界情况测试（存储满、历史记录限制）

- [ ] F4. Scope Fidelity Check — deep
  - 确认未引入 Scope 外功能
  - 验证无过度设计
  - 检查技术债务（TODO 注释、临时方案）

## Commit Strategy

**原子提交原则**: 每个任务独立提交，便于回滚和 Code Review

```
Wave 1: 语义化命名
- feat(store): add node naming counters for semantic naming
- feat(canvas): use semantic naming for new nodes
- feat(file-ops): rebuild naming counters on project load

Wave 2: localStorage 自动保存
- feat(store): integrate Zustand persist middleware for auto-save
- feat(store): add debounced auto-save on dirty state changes
- feat(store): add storage quota error handling with user warning
- feat(store): restore graph document from localStorage on initialization

Wave 3: 撤销/重做
- feat(store): implement history management for undo/redo
- feat(store): wrap all mutations with history tracking
- feat(canvas): add Ctrl+Z/Ctrl+Shift+Z keyboard shortcuts for undo/redo
- feat(store): clear selection if undone node/edge no longer exists
```

## Success Criteria

### Functional
- ✅ 页面加载后 2 秒内恢复上次编辑的图形
- ✅ 编辑后 1 秒自动保存，无 UI 卡顿
- ✅ Ctrl+Z / Ctrl+Shift+Z 响应时间 < 100ms
- ✅ 新节点名称 100% 符合语义化模式
- ✅ 导出的 Python 代码可执行（无语法错误）

### Non-Functional
- ✅ localStorage 使用量 < 4MB（预留安全边际）
- ✅ 50 个节点的图形，撤销操作无感知延迟
- ✅ 无内存泄漏（Chrome DevTools Heap Snapshot 验证）
- ✅ TypeScript 编译 0 错误 0 警告

### UX Metrics
- ✅ 用户无需手动保存（自动保存覆盖率 100%）
- ✅ 误操作后可恢复（撤销成功率 100%）
- ✅ 导出代码可读性提升（语义名称 vs UUID）

---

## Appendix: Key Technical Decisions

### 1. Zustand Persist vs. Custom localStorage Wrapper
**Decision**: Use Zustand `persist` middleware
**Rationale**: Built-in, well-tested, handles serialization automatically
**Tradeoff**: Less control over write timing (mitigated by debounce)

### 2. Undo Granularity
**Decision**: One mutation = one undo step
**Rationale**: Predictable, matches user mental model
**Edge Case**: Continuous drag → will generate many steps (acceptable for MVP)

### 3. Naming Counter Persistence
**Decision**: Rebuild counters from loaded document, don't persist counters
**Rationale**: Simpler, avoids counter/document desync
**Tradeoff**: Loading large documents requires iteration (negligible cost)

### 4. History Stack Storage
**Decision**: In-memory only, cleared on refresh
**Rationale**: Avoids localStorage bloat, simpler implementation
**Tradeoff**: User loses undo history on refresh (acceptable for MVP)

---

## Risk Mitigation Summary

| Risk | Mitigation | Owner |
|------|------------|-------|
| localStorage quota exceeded | Try-catch + warning toast, graceful degradation | Task 7 |
| Undo/redo memory leak | Hard cap at 20 steps, shallow cloning banned | Task 9, 10 |
| Semantic naming breaks codegen | Validate generated Python with py_compile | Task 4 |
| Multi-tab data loss | Document as limitation, future enhancement | Out of scope |
| Performance degradation on large graphs | Benchmark with 50+ nodes, optimize if needed | Wave 3 testing |

---

**Plan Version**: 1.0.0
**Created**: 2026-03-09
**Last Updated**: 2026-03-09
**Next Review**: After Wave 1 completion

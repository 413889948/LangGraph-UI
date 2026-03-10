# LangGraph Visual Editor 功能完善综合路线图

## TL;DR
> **Summary**: 与LangGraph官方功能对齐的综合实施计划，分三阶段完成条件边、START/END节点、归约器、Command、Send等核心功能。
> **Deliverables**: 完整的条件边UI配置、可视化START/END节点、归约器代码生成、Command/Send支持、子图展开编辑。
> **Effort**: Large (预计3-4个开发周期)
> **Parallel**: YES - 部分Phase 1任务可并行
> **Critical Path**: START/END节点 → 条件边完整实现 → Command/Send支持

## Context

### Original Request
用户希望了解当前系统各节点的作用，以及与LangGraph官方功能对比后缺失的特性。经过全面扫描，需要创建一份综合实施路线图。

### Interview Summary
- 当前系统：3种节点类型(function/tool/subgraph)、2种边类型(direct/conditional半成品)
- 核心缺失：START/END节点、条件边UI配置、Command/Send支持、归约器生成不完整
- 发现实现问题：GraphNode.type与NodeData.type双写不一致、subgraph颜色不一致

### Research Findings
1. **LangGraph官方功能清单**：StateGraph、START/END、条件边、Command、Send、多状态模式、检查点等
2. **当前代码分析**：
   - `src/types/index.ts`: 类型定义完整
   - `src/components/GraphCanvas.tsx`: 边创建只支持direct
   - `src/utils/codeGenerator.ts`: 条件边生成占位代码

---

## Work Objectives

### Core Objective
使LangGraph Visual Editor与官方LangGraph功能对齐，提供完整的可视化编辑能力。

### Deliverables
1. **Phase 1**: 条件边完整实现、START/END节点可视化、归约器代码生成完善、双写问题修复
2. **Phase 2**: Command支持、Send(Map-Reduce)、子图展开编辑、工具节点配置
3. **Phase 3**: 多状态模式、配置系统、检查点UI

### Definition of Done
- [ ] 所有功能有对应的UI入口
- [ ] 代码生成符合LangGraph官方规范
- [ ] 通过Playwright E2E测试验证
- [ ] 更新README文档说明新功能

### Must Have
- 条件边完整UI配置
- START/END节点可视化
- 归约器Annotated语法生成

### Must NOT Have
- 不修改现有数据模型的向后兼容性
- 不引入破坏性API变更
- 不依赖外部服务

---

## Verification Strategy

- **Test decision**: tests-after + Playwright E2E
- **QA policy**: 每个任务包含agent-executed测试场景
- **Evidence**: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

---

## Execution Strategy

### Parallel Execution Waves

**Wave 1 (可并行)**:
- 任务1.2: START/END节点可视化
- 任务1.4: 修复双写不一致问题
- 任务1.3: 归约器代码生成完善

**Wave 2 (依赖Wave 1)**:
- 任务1.1: 条件边完整实现

**Wave 3 (Phase 2开始)**:
- 任务2.1: Command支持
- 任务2.4: 工具节点配置

**Wave 4**:
- 任务2.2: Send (Map-Reduce)
- 任务2.3: 子图展开编辑

---

## Dependency Matrix

| 任务 | 依赖 |
|------|------|
| 1.1 条件边 | 1.2 START/END, 1.4 双写修复 |
| 2.1 Command | 1.3 归约器 |
| 2.2 Send | 1.1 条件边 |
| 2.3 子图展开 | 1.2 START/END |

---


## TODOs

---

### Phase 1: 基础完整性

- [ ] 1.1 条件边完整实现

  **What to do**: 实现条件边的完整UI配置、代码生成和校验逻辑
  
  **Must NOT do**: 不破坏现有direct边的功能

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: 涉及UI组件开发
  - Skills: [`frontend-ui-ux`] — 需要设计边配置面板

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: 2.2 | Blocked By: 1.2, 1.4

  **References**:
  - Pattern: `src/components/NodeConfigPanel.tsx` — 节点配置面板模式
  - Type: `src/types/index.ts:GraphEdge` — 边数据结构
  - Generator: `src/utils/codeGenerator.ts:generateAddConditionalEdges` — 现有生成逻辑
  - External: `https://langgraph.com.cn/concepts/low_level.1.html#conditional-edges` — 官方条件边文档

  **Acceptance Criteria**:
  - [ ] 选中边后显示边配置面板
  - [ ] 可切换边类型(direct/conditional)
  - [ ] conditional边可编辑路由函数名称
  - [ ] 可配置分支映射(path_map)
  - [ ] 代码生成输出正确的`add_conditional_edges()`

  **QA Scenarios**:
  ```
  Scenario: 创建条件边
    Tool: Playwright
    Steps: 
      1. 拖拽两个function节点到画布
      2. 连接节点创建direct边
      3. 选中边，在配置面板切换为conditional
      4. 输入路由函数名"route_by_score"
      5. 添加分支映射: "high"→node_b
    Expected: 边变为红色，显示条件标签
    Evidence: .sisyphus/evidence/task-1-1-conditional-edge.png
  ```

  **Commit**: YES | Message: `feat(edges): add conditional edge configuration UI` | Files: [src/components/EdgeConfigPanel.tsx, src/components/GraphCanvas.tsx, src/utils/codeGenerator.ts]

---

- [ ] 1.2 START/END 节点可视化

  **What to do**: 添加START和END特殊节点类型，提供可视化入口/出口点
  
  **Must NOT do**: 不影响现有节点的入口点推断逻辑

  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: UI组件开发
  - Skills: [`frontend-ui-ux`] — 需要设计特殊节点样式

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 1.1, 2.3 | Blocked By: none

  **References**:
  - Pattern: `src/components/GraphCanvas.tsx:DefaultNode` — 节点渲染模式
  - Type: `src/types/index.ts:NodeType` — 需扩展
  - External: `https://langgraph.com.cn/concepts/low_level.1.html#start-node` — 官方START/END文档

  **Acceptance Criteria**:
  - [ ] NodePalette显示START(绿色圆形)和END(红色方形)
  - [ ] START节点只有source handle
  - [ ] END节点只有target handle
  - [ ] 代码生成使用`from langgraph.graph import START, END`

  **QA Scenarios**:
  ```
  Scenario: 添加START节点
    Tool: Playwright
    Steps:
      1. 从调色板拖拽START节点到画布
      2. 验证节点样式为绿色圆形
      3. 验证只有顶部source handle
    Expected: START节点正确渲染
    Evidence: .sisyphus/evidence/task-1-2-start-node.png
  ```

  **Commit**: YES | Message: `feat(nodes): add START and END node types` | Files: [src/types/index.ts, src/components/NodePalette.tsx, src/components/GraphCanvas.tsx, src/utils/codeGenerator.ts]

---

- [ ] 1.3 归约器代码生成完善

  **What to do**: 完善状态字段的归约器代码生成，输出Annotated语法
  
  **Must NOT do**: 不改变现有StateField类型定义

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: 纯代码生成逻辑修改
  - Skills: [] — 无特殊技能需求

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 2.1 | Blocked By: none

  **References**:
  - Pattern: `src/utils/codeGenerator.ts:generateStateSchema` — 现有生成逻辑
  - Type: `src/types/index.ts:ReducerType` — 归约器类型
  - External: `https://langgraph.com.cn/concepts/low_level.1.html#reducers` — 官方归约器文档

  **Acceptance Criteria**:
  - [ ] append归约器生成`Annotated[list[str], add]`
  - [ ] 支持operator.add等内置归约器
  - [ ] 无归约器字段保持原样

  **QA Scenarios**:
  ```
  Scenario: append归约器生成
    Tool: Bash
    Steps:
      1. 添加状态字段: name="messages", type=array, reducer=append
      2. 查看代码预览
    Expected: 生成`messages: Annotated[list[str], add]`
    Evidence: .sisyphus/evidence/task-1-3-reducer-code.txt
  ```

  **Commit**: YES | Message: `feat(codegen): add Annotated reducer syntax` | Files: [src/utils/codeGenerator.ts]

---

- [ ] 1.4 修复双写不一致问题

  **What to do**: 修复GraphNode.type与NodeData.type不同步的问题
  
  **Must NOT do**: 不引入破坏性API变更

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: 单文件修复
  - Skills: [] — 无特殊技能需求

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 1.1 | Blocked By: none

  **References**:
  - Pattern: `src/components/NodeConfigPanel.tsx:handleTypeChange` — 问题代码位置

  **Acceptance Criteria**:
  - [ ] 切换节点类型时同步更新GraphNode.type和NodeData.type
  - [ ] 现有项目加载后数据一致

  **QA Scenarios**:
  ```
  Scenario: 类型切换同步
    Tool: Playwright
    Steps:
      1. 创建function节点
      2. 在配置面板切换为tool类型
      3. 保存项目
      4. 重新加载项目
    Expected: 节点类型为tool，数据一致
    Evidence: .sisyphus/evidence/task-1-4-type-sync.json
  ```

  **Commit**: YES | Message: `fix(nodes): sync GraphNode.type with NodeData.type` | Files: [src/components/NodeConfigPanel.tsx]

---

### Phase 2: 功能增强

- [ ] 2.1 Command 支持

  **What to do**: 支持节点返回Command对象，同时更新状态和路由
  
  **Must NOT do**: 不破坏现有节点返回值处理

  **Recommended Agent Profile**:
  - Category: `deep` — Reason: 需要深入理解LangGraph Command语义
  - Skills: [] — 无特殊技能需求

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: none | Blocked By: 1.3

  **References**:
  - External: `https://langgraph.com.cn/concepts/low_level.1.html#command` — 官方Command文档

  **Acceptance Criteria**:
  - [ ] 节点配置面板添加"返回Command"选项
  - [ ] 代码生成包含正确的类型注解

  **Commit**: YES | Message: `feat(nodes): add Command return type support` | Files: [src/types/index.ts, src/components/NodeConfigPanel.tsx, src/utils/codeGenerator.ts]

---

- [ ] 2.2 Send (Map-Reduce)

  **What to do**: 支持Send对象用于Map-Reduce模式
  
  **Recommended Agent Profile**:
  - Category: `deep` — Reason: 需要理解Map-Reduce模式

  **Parallelization**: Can Parallel: YES | Wave 4 | Blocks: none | Blocked By: 1.1

  **References**:
  - External: `https://langgraph.com.cn/concepts/low_level.1.html#send` — 官方Send文档

  **Acceptance Criteria**:
  - [ ] 添加"并行节点"类型
  - [ ] 生成正确的Send代码

  **Commit**: YES | Message: `feat(nodes): add Send support for map-reduce` | Files: [src/types/index.ts, src/components/GraphCanvas.tsx, src/utils/codeGenerator.ts]

---

- [ ] 2.3 子图展开编辑

  **What to do**: 双击subgraph节点进入子图编辑模式
  
  **Recommended Agent Profile**:
  - Category: `visual-engineering` — Reason: 复杂UI交互
  - Skills: [`frontend-ui-ux`]

  **Parallelization**: Can Parallel: YES | Wave 4 | Blocks: none | Blocked By: 1.2

  **Acceptance Criteria**:
  - [ ] 双击subgraph进入子图编辑
  - [ ] 面包屑导航返回父图

  **Commit**: YES | Message: `feat(subgraph): add expand/edit mode` | Files: [src/components/GraphCanvas.tsx, src/store/useEditorStore.ts]

---

- [ ] 2.4 工具节点配置

  **What to do**: tool节点可绑定工具、配置入参映射
  
  **Recommended Agent Profile**:
  - Category: `visual-engineering`

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: none | Blocked By: none

  **Acceptance Criteria**:
  - [ ] tool节点配置面板显示工具绑定选项
  - [ ] 可配置入参映射

  **Commit**: YES | Message: `feat(tool-node): add tool binding configuration` | Files: [src/components/NodeConfigPanel.tsx, src/types/index.ts]

---

### Phase 3: 高级特性

- [ ] 3.1 多状态模式

  **What to do**: 支持InputState/OutputState/PrivateState
  
  **Parallelization**: Can Parallel: NO | Blocked By: Phase 2完成

  **Commit**: YES | Message: `feat(state): add multiple state schemas` | Files: [src/types/index.ts, src/components/StateSchemaEditor.tsx, src/utils/codeGenerator.ts]

---

- [ ] 3.2 配置系统

  **What to do**: 支持config_schema运行时配置
  
  **Parallelization**: Can Parallel: YES | Blocked By: Phase 2完成

  **Commit**: YES | Message: `feat(config): add runtime configuration schema` | Files: [src/types/index.ts, src/components/, src/utils/codeGenerator.ts]

---

- [ ] 3.3 检查点配置UI

  **What to do**: checkpointer选择与配置
  
  **Parallelization**: Can Parallel: YES | Blocked By: Phase 2完成

  **Commit**: YES | Message: `feat(checkpoint): add checkpointer configuration UI` | Files: [src/components/]

---


## Final Verification Wave (4 parallel agents, ALL must APPROVE)
- [ ] F1. Plan Compliance Audit — oracle
- [ ] F2. Code Quality Review — unspecified-high
- [ ] F3. Real Manual QA — unspecified-high (+ playwright if UI)
- [ ] F4. Scope Fidelity Check — deep

---

## Commit Strategy
每个Phase完成后创建独立commit:
- `feat(phase1): add conditional edges and START/END nodes`
- `feat(phase2): add Command and Send support`
- `feat(phase3): add advanced features`

## Success Criteria
1. 条件边可通过UI完整配置并生成正确代码
2. START/END节点可视化且代码生成正确
3. 归约器生成Annotated语法
4. 所有E2E测试通过
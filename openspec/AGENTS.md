# OpenSpec 变更工作流

OpenSpec 目录管理结构化变更，通过提案、设计、任务和规格说明驱动开发。

## 目录结构

```
openspec/
├── config.yaml          # 全局配置（schema: spec-driven）
├── changes/             # 变更工作目录
│   └── <change-name>/
│       ├── .openspec.yaml
│       ├── proposal.md  # 变更提案（为什么、做什么、影响）
│       ├── design.md    # 设计方案
│       ├── tasks.md     # 任务清单（带复选框）
│       └── specs/       # 能力规格说明
│           └── <capability>/
│               └── spec.md
└── specs/               # 可复用规格模块（未来扩展）
```

## 变更脚手架（重复结构）

每个变更目录 `openspec/changes/<change-name>/` 使用固定脚手架：

| 文件 | 用途 |
|------|------|
| `.openspec.yaml` | 变更元数据配置 |
| `proposal.md` | 变更理由、功能列表、影响范围 |
| `design.md` | 技术设计方案 |
| `tasks.md` | 可执行任务清单（带复选框） |
| `specs/<capability>/spec.md` | 按能力拆分的详细规格 |

## 规格说明格式

规格文件 `spec.md` 使用中文 headings 和场景 bullets：

**需求分类 headings：**
- `## 新增需求` – 新增功能
- `## 修改需求` – 修改现有功能

**场景结构：**
```markdown
#### 场景：[场景名称]
- **当** [触发条件]
- **那么** [预期结果 1]
- **那么** [预期结果 2]
```

## 能力域映射

`specs/<capability>/` 目录对应实际实现区域：

| 能力域 | 实现区域 |
|--------|----------|
| `code-generation` | `src/utils/codeGenerator.ts` |
| `graph-visualization` | `src/components/GraphCanvas.tsx` |
| `node-configuration` | `src/components/NodeConfigPanel.tsx` |
| `state-schema-editor` | `src/components/StateSchemaEditor.tsx` |
| `project-persistence` | `src/store/useEditorStore.ts` + FileOperations |

## 工作流原则

1. **规格先行** – 在 `specs/` 中定义需求，再实现
2. **任务对齐** – `tasks.md` 任务应覆盖所有规格需求
3. **能力拆分** – 按功能域拆分 `specs/` 子目录，避免单文件过大
4. **可追溯性** – 实现代码应能追溯到具体规格场景

## 与根 AGENTS.md 关系

- 根 `AGENTS.md` 指向本文件作为 OpenSpec 工作流入口
- 本文件专注变更结构和规格格式，不涉及具体代码约定
- 代码约定见 `src/AGENTS.md` 及子目录文件

## 上下文

当前开发者构建 LangGraph 应用时只能手写代码定义图结构，缺少可视化工具。这导致学习曲线陡峭、调试困难、协作效率低。

LangGraph 核心概念包括：
- `StateGraph`：图的基础结构，通过状态 schema 定义
- 节点：通过 `add_node()` 注册的函数
- 边：`add_edge()` 定义的直连边或 `add_conditional_edges()` 定义的条件路由
- 状态 schema：使用 `TypedDict` 或 `BaseModel` 定义，支持 reducer 函数处理状态更新

技术约束：
- 前端为 React + TypeScript 技术栈
- 需要支持节点拖拽、连接、配置等基础交互
- 最终导出为可执行的 LangGraph Python 代码
- 项目文件以 JSON 格式持久化

## 目标 / 非目标

**目标：**
- 提供基于 React Flow 的可视化画布，支持节点拖拽创建、边手动连接、画布缩放平移
- 实现节点配置面板，可编辑节点类型、名称、参数等属性
- 提供状态 Schema 编辑器，支持字段添加删除、类型选择、reducer 配置
- 从可视化图生成标准 LangGraph Python 代码，包括 StateGraph 定义、节点注册、边连接逻辑
- 支持项目文件保存与加载，以 JSON 格式存储图结构和配置

**非目标：**
- 运行时调试功能（如断点、单步执行、状态监视）
- 自定义 reducer 函数的可视化编辑（仅支持选择预定义 reducer）
- 复杂循环结构的自动检测与优化
- 多人实时协作编辑
- 与 LangSmith 等外部调试工具的集成
- 任意 Python 代码的解析与反向生成

## 决策

### 1. 选择 React Flow 作为画布库

**决策：** 采用 React Flow 作为节点编辑器的核心库。

**理由：**
- 轻量级且专为 React 设计，与现有技术栈无缝集成
- 提供基础的节点拖拽、连接、缩放平移功能
- 社区活跃，文档完善，扩展性强
- 相比 GoJS、JointJS 等重型库，学习曲线更平缓，打包体积更小

**替代方案：**
- GoJS：功能强大但商业授权复杂，学习曲线陡峭
- JointJS：功能全面但体积庞大，对于 MVP 场景过度设计
- 自研画布：开发成本高，交互细节处理复杂

### 2. 采用 JSON 作为编辑器内部数据模型

**决策：** 编辑器内部使用 JSON 文档表示图结构，而非直接解析 Python 代码。

**理由：**
- JSON 结构简单清晰，易于序列化和持久化
- 避免 Python 代码解析的复杂性（AST 解析、缩进处理、依赖跟踪）
- 代码生成单向流动，降低实现复杂度
- 项目文件版本管理友好

**数据结构设计：**
```typescript
interface GraphDocument {
  nodes: Node[];
  edges: Edge[];
  stateSchema: StateSchema;
  metadata: Metadata;
}

interface Node {
  id: string;
  type: 'function' | 'tool' | 'subgraph';
  name: string;
  parameters: Record<string, any>;
  position: { x: number; y: number };
}

interface Edge {
  id: string;
  source: string;
  target: string;
  type: 'direct' | 'conditional';
  condition?: string; // 条件表达式，仅 conditional 类型需要
}

interface StateSchema {
  fields: StateField[];
}

interface StateField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  reducer?: 'append' | 'replace' | 'sum' | 'max' | 'min';
}
```

**替代方案：**
- 直接解析 Python 代码：实现复杂，维护成本高，不支持双向同步
- 使用 LangGraph 官方序列化格式：目前官方未提供标准序列化方案

### 3. 节点类型限定为三种基础类型

**决策：** MVP 阶段仅支持 `function`、`tool`、`subgraph` 三种节点类型。

**理由：**
- 覆盖 LangGraph 最常见的使用场景
- 降低配置面板的复杂度
- 便于后续扩展（如 `task`、`router` 等类型）

**节点类型定义：**
- `function`：普通 Python 函数节点，可配置函数名和参数
- `tool`：LangChain Tool 节点，用于工具调用
- `subgraph`：子图节点，支持嵌套图结构（MVP 阶段仅占位，暂不实现嵌套编辑）

### 4. 边类型分为直连边和条件边

**决策：** 支持 `direct` 和 `conditional` 两种边类型。

**理由：**
- 对应 LangGraph 的 `add_edge()` 和 `add_conditional_edges()`
- 条件边通过简单的条件表达式字段表示，避免复杂的可视化条件编辑器
- 满足基础条件路由需求，保持实现简洁

**条件表达式格式：**
- 使用简单字符串表示，如 `"messages.length > 0"`
- 代码生成时直接插入到条件函数中
- 不提供可视化条件构建器，降低复杂度

### 5. 状态 Schema 编辑器采用表单式界面

**决策：** 使用表单列表形式编辑状态字段，而非可视化流程图。

**理由：**
- 状态 schema 本质是结构化数据，表单更适合编辑
- 支持字段类型选择、reducer 下拉选择
- 实现简单，用户理解成本低

**Reducer 选项：**
- `append`：数组追加（默认用于消息列表）
- `replace`：直接替换
- `sum`：数值累加
- `max`：取最大值
- `min`：取最小值

### 6. 代码生成采用模板填充方式

**决策：** 使用预定义代码模板，根据 JSON 数据填充生成 Python 代码。

**理由：**
- 实现简单，生成的代码结构一致
- 易于维护和扩展
- 避免复杂的代码 AST 操作

**生成代码结构：**
```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, List

# 状态定义
class State(TypedDict):
    messages: List[str]
    # 其他字段...

# 节点函数定义（占位，用户需手动实现）
def node_name(state):
    # 用户实现逻辑
    return state

# 构建图
graph = StateGraph(State)
graph.add_node("node_name", node_name)
graph.add_edge("start", "node_name")
# 条件边示例
# graph.add_conditional_edges("node", condition_func, {True: "next_node", False: END})

graph.compile()
```

**替代方案：**
- 使用 AST 生成：实现复杂，对于 MVP 不必要
- 提供完整函数实现：超出编辑器范围，属于代码生成 AI 的范畴

## 风险 / 权衡

### 1. 双向同步缺失

**风险：** 编辑器不支持从 Python 代码反向生成可视化图，用户一旦手写代码后无法在编辑器中继续修改。

**影响：** 可能限制编辑器的实用性，用户需要在编辑器和代码编辑器之间切换。

**缓解措施：**
- 在文档中明确说明单向生成的限制
- 未来版本可探索基于 AST 的反向解析
- 提供清晰的导出提示，告知用户导出后应基于生成代码继续开发

### 2. 条件表达式验证不足

**风险：** 条件表达式为纯字符串，无法在编辑器中验证语法正确性。

**影响：** 可能生成无效的 Python 代码，用户在运行时才能发现错误。

**缓解措施：**
- 在代码生成时添加基础语法检查（如括号匹配）
- 提供条件表达式示例和文档
- 未来可集成简单的 Python 语法验证库（如 Pyodide）

### 3. 复杂图结构的可读性

**风险：** 当节点数量较多时，可视化图可能变得混乱，难以阅读和编辑。

**影响：** 大型工作流的编辑体验不佳。

**缓解措施：**
- 实现基础的自动布局功能（如层级布局）
- 提供节点分组/折叠功能（后续版本）
- 在文档中建议将复杂图拆分为多个子图

### 4. React Flow 功能限制

**风险：** React Flow 的某些高级功能（如自定义边类型、复杂节点嵌套）实现成本较高。

**影响：** 可能限制编辑器的表达能力。

**缓解措施：**
- MVP 阶段聚焦基础功能，避免过度定制
- 评估 React Flow Pro 版本的必要性
- 如有必要，逐步替换为更强大的画布库

### 5. 状态 Schema 与节点配置的耦合

**风险：** 状态字段的变更可能影响多个节点的输入输出定义，编辑器中未实现这种依赖跟踪。

**影响：** 用户修改状态 schema 后，可能导致节点配置不一致。

**缓解措施：**
- 在文档中说明状态 schema 变更的影响
- 未来版本可实现简单的依赖检测和提示
- 导出代码前提供一致性检查

## Open Questions

1. **子图嵌套的实现时机：** 是否在 MVP 阶段支持 subgraph 节点的实际嵌套编辑，还是仅作为占位符？建议 MVP 仅占位，后续版本实现。

2. **代码生成的可扩展性：** 是否需要支持自定义代码模板，让用户定义自己的代码生成格式？MVP 暂不支持，根据用户反馈决定。

3. **项目文件格式的版本管理：** 如何设计 JSON 项目文件的版本字段，以便未来格式升级时能够迁移？需要在首个版本中加入 `version` 字段。

4. **节点验证规则：** 是否需要在编辑器中验证节点配置的合法性（如必填字段、类型检查）？MVP 阶段仅做基础验证，复杂验证留给代码生成阶段。

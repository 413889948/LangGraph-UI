## 修改需求

### 需求:代码输出 build_graph 格式
系统生成的 Python 代码必须包装在 `build_graph()` 函数中。

#### 场景:生成代码包含入口函数
- **当** 系统生成 Python 代码
- **那么** 代码以 `def build_graph():` 开头
- **那么** 代码以 `return app` 或 `return graph.compile()` 结尾

#### 场景:函数体包含完整图定义
- **当** 画布上有多个节点和边
- **那么** 生成的 `build_graph()` 函数体包含：
  - import 语句
  - State TypedDict 定义
  - 节点函数定义
  - 图构建代码（add_node, add_edge 等）

## 新增需求

### 需求:入口契约一致性
系统生成的代码必须能被 PyodideService 正确解析。

#### 场景:生成代码可解析
- **当** 系统生成代码后用户点击"应用到画布"
- **那么** 代码能被正确解析并还原相同的图结构

### 需求:代码生成格式示例
系统生成的代码必须遵循以下格式：

```python
from langgraph.graph import StateGraph
from typing import TypedDict

class GraphState(TypedDict, total=False):
    # 状态字段
    pass

def node_function(state: GraphState):
    # TODO: Implement node logic
    return state

def build_graph():
    graph = StateGraph(GraphState)
    graph.add_node("node_name", node_function)
    # ... 其他节点和边
    graph.set_entry_point("entry_node")
    return graph.compile()
```

#### 场景:格式验证
- **当** 系统生成代码
- **那么** 代码符合上述格式结构
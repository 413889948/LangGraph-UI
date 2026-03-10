## 新增需求

### 需求:Pyodide 加载管理
系统必须在应用启动时预加载 Pyodide 运行时环境。

#### 场景:启动预加载
- **当** 应用启动
- **那么** 系统在后台开始加载 Pyodide

#### 场景:加载完成
- **当** Pyodide 加载完成
- **那么** 系统标记服务就绪
- **那么** "应用到画布"按钮变为可用状态

#### 场景:加载失败
- **当** Pyodide 加载失败（网络问题等）
- **那么** 系统显示重试按钮
- **那么** 代码编辑器降级为只读模式

### 需求:StateGraph 录制器实现
系统必须提供 StateGraph 录制器（shim），记录 API 调用而非执行真实的 LangGraph 操作。

#### 场景:录制器初始化
- **当** Pyodide 加载完成
- **那么** 注入 `StateGraph`、`START`、`END` 等模拟对象

#### 场景:录制 add_node 调用
- **当** 用户代码执行 `graph.add_node("node_name", function)`
- **那么** 录制器记录节点名称和类型

#### 场景:录制 add_edge 调用
- **当** 用户代码执行 `graph.add_edge("from", "to")`
- **那么** 录制器记录源节点和目标节点

#### 场景:录制 add_conditional_edges 调用
- **当** 用户代码执行 `graph.add_conditional_edges(source, router, mapping)`
- **那么** 录制器记录条件边信息

#### 场景:录制 set_entry_point 调用
- **当** 用户代码执行 `graph.set_entry_point("node_name")`
- **那么** 录制器记录入口点节点

### 需求:代码解析入口契约
系统必须要求用户代码提供 `build_graph()` 函数作为解析入口。

#### 场景:有效入口函数
- **当** 用户代码包含 `def build_graph():` 且返回 StateGraph 对象
- **那么** 系统调用该函数并获取录制的图结构

#### 场景:缺少入口函数
- **当** 用户代码不包含 `build_graph()` 函数
- **那么** 系统返回错误"请定义 build_graph() 函数"

### 需求:解析结果转换
系统必须将录制器记录的结构转换为 GraphDocument 格式。

#### 场景:转换节点
- **当** 录制器记录了节点
- **那么** 每个节点转换为 `GraphNode` 对象，包含 id、type、data、position

#### 场景:转换边
- **当** 录制器记录了边
- **那么** 每条边转换为 `GraphEdge` 对象，包含 id、source、target、type

#### 场景:转换状态 Schema
- **当** 用户代码定义了 TypedDict State
- **那么** 系统解析字段定义并转换为 `StateSchema` 对象

### 需求:支持的 API 子集
系统必须明确支持以下 LangGraph API：

#### 场景:支持的核心 API
- **当** 用户代码使用以下 API
- **那么** 系统正确解析：
  - `StateGraph(state_class)` - 创建图实例
  - `.add_node(name, function)` - 添加节点
  - `.add_edge(from, to)` - 添加直接边
  - `.add_conditional_edges(source, router, mapping)` - 添加条件边
  - `.set_entry_point(node)` - 设置入口点
  - `.compile()` - 编译图
  - `START`, `END` - 常量

#### 场景:不支持的 API
- **当** 用户代码使用不在支持列表中的 API
- **那么** 系统返回"不支持的 API: xxx"错误

### 需求:错误信息结构化
系统必须返回结构化的错误信息，包含行号和描述。

#### 场景:错误包含行号
- **当** 解析过程中发生错误
- **那么** 返回的错误信息包含文件名、行号、列号、错误描述
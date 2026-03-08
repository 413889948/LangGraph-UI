# LangGraph 可视化编辑器

一个基于浏览器的可视化编辑器，用于创建 LangGraph 工作流。通过拖拽式界面设计 AI 代理图，配置状态 Schema，并即时生成可用于生产的 Python 代码。

## 功能特性

- **可视化图形编辑器** – 拖拽式界面构建 LangGraph 工作流
- **三种节点类型** – Function、Tool 和 Subgraph 节点，颜色区分
- **节点/边 CRUD** – 轻松创建、编辑和删除节点及连接
- **节点配置面板** – 为每个节点定义输入/输出参数
- **状态 Schema 编辑器** – 管理全局状态字段，支持类型安全和Reducer 函数
- **Python 代码生成** – 从可视化设计生成完整的 LangGraph Python 代码
- **代码预览与验证** – 实时语法验证生成的代码
- **项目持久化** – 以 JSON 格式保存/加载项目
- **代码导出** – 将生成的 Python 代码导出为 `.py` 文件
- **键盘快捷键** – 使用 Delete/Backspace 键删除节点或边
- **未保存提醒** – 防止意外数据丢失
- **标签页 UI** – 节点配置、状态 Schema、代码预览的有序面板

## 技术栈

- **语言** – TypeScript 5.2+
- **框架** – React 18.2+
- **构建工具** – Vite 5.0+
- **可视化画布** – React Flow (@xyflow/react) 12.10+
- **状态管理** – Zustand 5.0+
- **工具库** – UUID 13.0+
- **样式** – 自定义 CSS（无框架）

## 环境要求

开始之前，请确保已安装以下软件：

- **Node.js** 18 或更高版本
- **pnpm**（推荐）或 **npm** 9+
- 现代 Web 浏览器（Chrome、Firefox、Edge 或 Safari）

可选但推荐：

- **VS Code** 搭配 ESLint 和 Prettier 扩展
- **Python 3.9+**（用于测试生成的 LangGraph 代码）

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/your-username/langgraph-visual-editor.git
cd langgraph-visual-editor
```

### 2. 安装依赖

使用 pnpm（推荐）：

```bash
pnpm install
```

或使用 npm：

```bash
npm install
```

### 3. 启动开发服务器

```bash
pnpm dev
```

或：

```bash
npm run dev
```

应用将在 `http://localhost:5173`（或下一个可用端口）打开。

### 4. 生产环境构建

```bash
pnpm build
```

或：

```bash
npm run build
```

构建输出将位于 `dist/` 目录。

### 5. 预览生产构建

```bash
pnpm preview
```

或：

```bash
npm run preview
```

## 架构说明

### 目录结构

```
langgraph-visual-editor/
├── src/
│   ├── components/          # React 组件
│   │   ├── GraphCanvas.tsx  # React Flow 画布封装
│   │   ├── NodePalette.tsx  # 拖拽节点源
│   │   ├── NodeConfigPanel.tsx  # 节点配置编辑器
│   │   ├── StateSchemaEditor.tsx  # 状态 Schema 管理器
│   │   ├── CodePreview.tsx  # 生成代码显示
│   │   └── FileOperations.tsx  # 保存/加载/导出功能
│   ├── store/
│   │   ├── useEditorStore.ts  # Zustand 状态管理
│   │   └── index.ts         # Store 导出
│   ├── types/
│   │   └── index.ts         # TypeScript 类型定义
│   ├── utils/
│   │   └── codeGenerator.ts # Python 代码生成逻辑
│   ├── App.tsx              # 主应用组件
│   └── main.tsx             # 应用入口
├── index.html               # HTML 模板
├── package.json             # 项目依赖
├── tsconfig.json            # TypeScript 配置
└── vite.config.ts           # Vite 构建配置
```

### 状态管理

应用使用 **Zustand** 进行全局状态管理。`useEditorStore` 管理：

- **图文档** – 完整的项目状态，包括节点、边和状态 Schema
- **选择状态** – 当前选中的节点或边
- **视口状态** – 画布平移和缩放级别
- **Dirty 标记** – 跟踪未保存的更改

核心 Store 操作：

```typescript
// 节点操作
addNode(node: GraphNode)
updateNode(nodeId: string, updates: Partial<GraphNode>)
removeNode(nodeId: string)
selectNode(nodeId: string | null)

// 边操作
addEdge(edge: GraphEdge)
removeEdge(edgeId: string)

// 状态 Schema 操作
addStateField(field: StateField)
updateStateField(fieldId: string, updates: StateFieldUpdate)
removeStateField(fieldId: string)

// 文件操作
setGraphDocument(doc: GraphDocument)
resetGraphDocument()
markDirty()
markClean()
```

### 数据流

```
用户操作 → React 组件 → Zustand Store → React Flow 画布
                                       ↓
                                代码生成器
                                       ↓
                                Python 代码输出
```

### 组件层级

```
App
├── AppHeader
│   └── FileOperations (新建、加载、保存、导出代码)
├── AppSidebar (左侧)
│   └── NodePalette (Function、Tool、Subgraph)
├── CanvasWrapper
│   └── GraphCanvas (React Flow)
│       ├── DefaultNode (自定义节点渲染器)
│       ├── DefaultEdge (自定义边渲染器)
│       ├── Controls (缩放/适配控制)
│       └── Background (网格背景)
└── AppConfigSidebar (右侧)
    ├── Tab 导航 (节点配置、状态 Schema、代码预览)
    ├── NodeConfigPanel (选中节点时显示)
    ├── StateSchemaEditor (状态字段管理器)
    └── CodePreview (生成的 Python 代码)
```

### 类型系统

核心类型定义在 `src/types/index.ts` 中：

**节点类型：**
- `function` – 普通 Python 函数节点
- `tool` – LangChain Tool 节点，用于工具调用
- `subgraph` – Subgraph 节点，用于嵌套图结构

**边类型：**
- `direct` – 来自 `add_edge()` 的标准边
- `conditional` – 来自 `add_conditional_edges()` 的条件边

**状态字段类型：**
- 基础类型：`string`、`number`、`boolean`、`float`
- 复合类型：`array`、`object`

**Reducer 类型：**
- `append` – 数组追加（默认用于消息列表）
- `replace` – 直接替换
- `sum` – 数值求和
- `max` – 取最大值
- `min` – 取最小值

### 代码生成流程

`codeGenerator.ts` 工具将可视化图转换为 Python 代码：

1. **状态 Schema 生成** – 创建 `TypedDict` 类定义
2. **节点函数生成** – 生成 Python 函数存根
3. **图构建** – 创建 `StateGraph` 实例并注册节点
4. **边注册** – 添加 `add_edge()` 和 `add_conditional_edges()` 调用
5. **入口点设置** – 设置图入口点
6. **编译** – 调用 `graph.compile()`

输出示例：

```python
from langgraph.graph import StateGraph
from typing import TypedDict

class GraphState(TypedDict, total=False):
    messages: list[str]
    iteration: int

def research_agent(state: GraphState):
    # TODO: Implement node logic
    return state

def tool_caller(state: GraphState):
    # TODO: Implement node logic
    return state

# Build the graph
graph = StateGraph(GraphState)
graph.add_node("research_agent", research_agent)
graph.add_node("tool_caller", tool_caller)
graph.add_edge("research_agent", "tool_caller")
graph.set_entry_point("research_agent")
app = graph.compile()
```

## 使用指南

### 创建你的第一个图

1. **开始新项目**
   - 点击标题栏中的"新建"，从空白画布开始

2. **添加节点**
   - 从左侧调色板拖拽节点到画布
   - 选择 Function、Tool 或 Subgraph 类型
   - 拖拽节点调整位置

3. **连接节点**
   - 从节点的输出句柄（顶部）拖拽到另一个节点的输入句柄（底部）
   - 边会自动创建
   - 选中边后按 Delete 键删除

4. **配置节点**
   - 点击节点选中它
   - 使用右侧边栏编辑：
     - 节点名称
     - 节点类型
     - 输入参数（名称、类型、默认值）
     - 输出参数

5. **定义状态 Schema**
   - 切换到"状态 Schema"标签页
   - 点击"添加字段"创建状态字段
   - 配置字段属性：
     - 名称（必填）
     - 类型（string、number、boolean、float）
     - Reducer 函数（replace、append、sum、max、min）
     - 默认值

6. **预览生成的代码**
   - 切换到"代码预览"标签页
   - 查看实时 Python 代码生成
   - 语法验证自动运行
   - 点击"复制代码"复制到剪贴板

7. **保存项目**
   - 点击"保存"下载为 JSON 文件
   - 文件包含所有节点、边和状态 Schema
   - 未保存的更改会用星号 (*) 标记

8. **加载现有项目**
   - 点击"加载"并选择 JSON 文件
   - 画布恢复之前的工作
   - 如有需要会显示未保存更改警告

9. **导出 Python 代码**
   - 点击"导出代码"下载为 `.py` 文件
   - 在 LangGraph 项目中使用导出的文件

### 键盘快捷键

| 按键 | 操作 |
|-----|------|
| `Delete` / `Backspace` | 删除选中的节点或边 |

### 节点类型

**Function 节点（蓝色）**
- 代表工作流中的 Python 函数
- 用于自定义逻辑、数据处理或 API 调用
- 示例：`research_agent`、`summarize`、`classify`

**Tool 节点（绿色）**
- 代表 LangChain Tool 节点
- 用于工具调用和外部集成
- 示例：`search_tool`、`calculator`、`database_query`

**Subgraph 节点（紫色）**
- 代表嵌套图结构（MVP 占位符）
- 用于模块化、可重用的工作流组件
- 未来功能：展开 subgraph 详情

### 边类型

**直接边**
- 标准工作流连接
- 通过节点间拖拽创建
- 代表顺序执行

**条件边**
- 基于条件的分支逻辑
- 未来功能：配置条件表达式
- 生成为 `add_conditional_edges()` 调用

### 状态 Schema 最佳实践

1. **定义所有状态字段** – 节点间传递的每个变量都应在 Schema 中
2. **使用合适的 Reducer** – 消息列表用 `append`，计数器用 `sum`
3. **设置默认值** – 提供合理的默认值避免未定义错误
4. **保持精简** – 仅包含必要的状态以降低复杂度

聊天机器人状态 Schema 示例：

```typescript
fields: [
  { name: "messages", type: { baseType: "array" }, reducer: "append" },
  { name: "user_input", type: { baseType: "string" } },
  { name: "iteration", type: { baseType: "number" }, default: 0 },
]
```

生成的 Python：

```python
class GraphState(TypedDict, total=False):
    messages: list
    user_input: str
    iteration: int = 0
```

## 开发指南

### 项目脚本

| 命令 | 描述 |
|---------|----------|
| `pnpm dev` | 启动带热重载的开发服务器 |
| `pnpm build` | 生产环境构建 |
| `pnpm preview` | 本地预览生产构建 |
| `pnpm lint` | 运行 ESLint（如已配置） |

### TypeScript 配置

项目使用严格的 TypeScript 设置：

- `strict: true` – 启用所有严格类型检查选项
- `noUnusedLocals: true` – 未使用的局部变量报错
- `noUnusedParameters: true` – 未使用的参数报错
- `noFallthroughCasesInSwitch: true` – switch 中的 fallthrough 情况报错

### 添加新组件

1. 在 `src/components/` 中创建组件文件
2. 定义 TypeScript props 接口
3. 使用正确的类型实现组件
4. 在父组件中导入和使用

示例：

```typescript
import React from 'react';

interface MyComponentProps {
  title: string;
  count?: number;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, count = 0 }) => {
  return <div>{title}: {count}</div>;
};
```

### 添加新节点类型

1. 更新 `src/types/index.ts` 中的 `NodeType` 类型：
   ```typescript
   export type NodeType = 'function' | 'tool' | 'subgraph' | 'newType';
   ```

2. 在 `src/components/GraphCanvas.tsx` 中添加颜色配置：
   ```typescript
   const NODE_TYPE_COLORS: Record<NodeType, { border: string; accent: string }> = {
     // ... 现有类型
     newType: { border: '#ff0000', accent: '#ff0000' },
   };
   ```

3. 更新 `src/components/NodePalette.tsx` 中的节点调色板

4. 如有需要，更新 `src/utils/codeGenerator.ts` 中的代码生成器

### 状态管理模式

**使用选择器优化性能：**

```typescript
import { useEditorStore, selectSelectedNode } from '../store/useEditorStore';

const MyComponent = () => {
  const selectedNode = useEditorStore(selectSelectedNode);
  // 组件仅在 selectedNode 变化时重新渲染
};
```

**使用动作更新状态：**

```typescript
const updateNode = useEditorStore((state) => state.updateNode);

const handleUpdate = () => {
  updateNode(nodeId, { data: { name: 'New Name' } });
  // Store 自动标记为 dirty
};
```

### 样式指南

项目使用自定义 CSS，无框架。遵循以下约定：

1. 使用 BEM 命命名：`.component-name__element--modifier`
2. 为颜色和间距定义 CSS 变量
3. 保持组件响应式
4. 使用 flexbox 和 grid 进行布局

示例：

```css
.node-config-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.node-config-panel__header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.node-config-panel__content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
```

## 部署方案

### 静态托管（推荐）

应用构建为静态 bundle，可部署到任何地方：

**Vercel：**

1. 连接 GitHub 仓库
2. 构建命令：`pnpm build`
3. 输出目录：`dist`
4. 推送时自动部署

**Netlify：**

1. 连接 GitHub 仓库
2. 构建命令：`pnpm build`
3. 发布目录：`dist`
4. 如有需要配置 SPA 路由

**GitHub Pages：**

1. 安装 `gh-pages`：
   ```bash
   pnpm add -D gh-pages
   ```

2. 添加到 `package.json`：
   ```json
   {
     "scripts": {
       "deploy": "pnpm build && gh-pages -d dist"
     }
   }
   ```

3. 部署：
   ```bash
   pnpm deploy
   ```

### Docker 部署

创建 `Dockerfile`：

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

创建 `nginx.conf`：

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

构建并运行：

```bash
docker build -t langgraph-visual-editor .
docker run -p 8080:80 langgraph-visual-editor
```

### 自托管

1. 构建项目：
   ```bash
   pnpm build
   ```

2. 使用任何静态文件服务器提供 `dist/` 目录：
   ```bash
   pnpm install -g serve
   serve -s dist -p 3000
   ```

3. 配置 Web 服务器（Apache、Nginx 等）提供服务

## 常见问题

### 构建问题

**错误："Module not found"**

解决方案：
```bash
# 清除 node_modules 并重新安装
rm -rf node_modules
pnpm install
```

**错误："TypeScript compilation failed"**

解决方案：
```bash
# 检查 TypeScript 错误
pnpm tsc --noEmit

# 构建前修复所有类型错误
```

### 开发服务器问题

**端口已被占用**

解决方案：Vite 会自动使用下一个可用端口（5174、5175 等）。检查终端输出获取实际 URL。

**热重载不工作**

解决方案：
1. 检查编辑器是否保存了文件
2. 尝试重启开发服务器
3. 清除 Vite 缓存：
   ```bash
   rm -rf node_modules/.vite
   pnpm dev
   ```

### 画布问题

**节点无法拖拽**

解决方案：
1. 检查浏览器控制台是否有错误
2. 确保 React Flow 正确导入
3. 验证节点数据结构符合预期格式

**边无法连接**

解决方案：
1. 确保从正确的句柄拖拽（输出 → 输入）
2. 检查源节点和目标节点不同（禁用自连接）
3. 验证边类型配置

### 代码生成问题

**生成的代码有语法错误**

解决方案：
1. 检查代码预览面板中的验证错误
2. 确保所有节点名称是有效的 Python 标识符
3. 验证状态 Schema 字段名称有效

**代码在 LangGraph 中无法运行**

解决方案：
1. 生成的代码提供起始结构
2. 需要实现实际的节点逻辑（标记为 `# TODO`）
3. 安装所需依赖：
   ```bash
   pip install langgraph langchain
   ```

### 浏览器兼容性

**应用在旧浏览器中不工作**

应用需要现代浏览器特性：

- ES2020 支持
- Web Components（用于 React Flow）
- Fetch API

支持的浏览器：

- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

### 性能问题

**节点过多时画布缓慢**

解决方案：
1. 限制节点数量约 50 个以获得最佳性能
2. 使用 subgraph 组织复杂工作流
3. 考虑拆分为多个项目

**内存使用过高**

解决方案：
1. 关闭未使用的浏览器标签页
2. 清除浏览器缓存
3. 重启开发服务器

## 贡献指南

### 开始

1. Fork 仓库
2. 创建功能分支：
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. 进行更改
4. 彻底测试
5. 提交 Pull Request

### 代码风格

- 所有新代码使用 TypeScript
- 遵循现有组件模式
- 编写有意义的提交信息
- 为复杂逻辑添加注释

### Pull Request 指南

1. **描述更改** – 这个 PR 做了什么？
2. **解释原因** – 解决了什么问题？
3. **包含测试** – 如何测试的？
4. **添加截图** – UI 更改需提供前后对比

## 许可证

MIT 许可证 – 详情见 LICENSE 文件。

## 致谢

- [LangGraph](https://github.com/langchain-ai/langgraph) – 本编辑器针对的图库
- [React Flow](https://reactflow.dev/) – 强大的基于节点的 UI 库
- [Vite](https://vitejs.dev/) – 极速构建工具
- [Zustand](https://github.com/pmndrs/zustand) – 极简状态管理

## 支持

如有问题、疑问或功能请求：

- 在 GitHub 上提交 Issue
- 查看现有文档
- 阅读上面的故障排除部分

## 更新日志

### Version 0.0.0 (初始发布)

- 带拖拽节点创建的可视化画布
- 三种节点类型：Function、Tool、Subgraph
- 节点/边 CRUD 操作
- 带参数的节点配置面板
- 带字段管理的状态 Schema 编辑器
- LangGraph Python 代码生成
- 带语法验证的代码预览
- JSON 格式保存/加载项目
- 导出 Python 代码
- 键盘快捷键
- 未保存更改跟踪
- 标签页 UI 组织

---

**为 LangChain 社区用心构建 ❤️**

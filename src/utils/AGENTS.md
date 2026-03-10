# src/utils/ – 工具函数

**所有权：** 纯工具函数，无 React 或 store 依赖。

## 当前表面

**codeGenerator.ts**（334 行） – Python LangGraph 代码生成。

## 导出 API

| 函数 | 用途 |
|------|------|
| `generateLangGraphCode(document)` | 主入口 – 生成完整 Python 代码 |
| `validatePythonSyntax(code)` | 轻量级括号/字符串匹配验证 |
| `canGenerateCode(document)` | 前置检查 |
| `getEstimatedLineCount(document)` | 行数估算 |

## 内部辅助函数

`generateLangGraphCode` 使用的私有函数：
- `fieldToPythonType(field)` – TypeScript 到 Python 类型转换
- `generateStateSchema(fields)` – TypedDict 类定义
- `generateNodeFunction(node)` – 单个节点函数存根
- `generateNodeFunctions(nodes)` – 所有节点函数
- `generateNodeRegistrations(nodes)` – `add_node()` 调用
- `generateAddEdge(edges, idToName)` – `add_edge()` 调用
- `generateAddConditionalEdges(edges, idToName)` – `add_conditional_edges()` 调用
- `generateGraphBuild(nodes, edges, idToName)` – 图组装代码

## 类型边界

从 `src/types/index.ts` 导入：
- `GraphDocument`、`GraphNode`、`GraphEdge`
- `StateField`、`FieldTypeInfo`、`ReducerType`
- `ValidationResult`

## 消费者

- **CodePreview.tsx** – 显示并验证生成的代码
- **FileOperations.tsx** – 导出 `.py` 文件

## 规则

### 纯逻辑
- 无 React 导入
- 无 store 导入
- 无副作用（仅纯函数）

### 生成代码包含 TODO
- 节点函数体包含 `# TODO: Implement node logic`
- 故意留空供用户自定义
- 不保证可执行 Python（需手动完成）

### 轻量级验证
- `validatePythonSyntax()` 仅检查括号/字符串匹配
- 不解析 Python 语法
- 不验证 LangGraph API 正确性
- 不检查缩进或 Python 关键字

### 依赖边界
- 仅从 `src/types` 导入
- 被 `CodePreview.tsx` 和 `FileOperations.tsx` 导入
- 从不低于 components 或 store 导入

## 构建

```bash
npm run build  # TypeScript 编译 + Vite 打包
```

无测试运行器配置。

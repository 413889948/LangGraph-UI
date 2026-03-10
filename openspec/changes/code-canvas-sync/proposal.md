## 为什么

当前 LangGraph 可视化编辑器仅支持单向的代码预览功能：用户在画布上拖拽节点后，可以查看生成的 Python 代码，但无法反向编辑代码来更新画布。这限制了高级用户通过直接编写代码来快速构建工作流的能力，也使得代码调试和迭代变得不便。

## 变更内容

### 新增功能
- **代码编辑器**: 将现有的只读代码预览面板改造为可编辑的代码编辑器
- **代码解析服务**: 基于 Pyodide 实现 Python 代码解析，使用 StateGraph 录制器（shim）提取图结构
- **双向同步**: 实现代码与画布的双向同步，用户可以通过编辑代码来更新可视化图
- **节点名唯一性约束**: 强制节点名称唯一，确保代码解析时节点匹配的可靠性

### 修改功能
- **代码生成器**: 更新输出格式，将生成的代码包装在 `build_graph()` 函数中，与代码解析的入口契约保持一致

## 功能 (Capabilities)

### 新增功能
- `code-editor`: 可编辑的 Python 代码编辑器，支持语法高亮、手动同步到画布、错误显示
- `pyodide-service`: Pyodide 加载管理和 StateGraph 录制器，提供代码解析能力
- `node-uniqueness`: 节点名称唯一性验证，阻止重名节点保存

### 修改功能
- `code-generation`: 代码生成器输出格式变更，统一使用 `build_graph()` 入口契约

## 影响

### 代码文件
- **新增**: `src/services/pyodideService.ts` - Pyodide 服务模块
- **重命名**: `src/components/CodePreview.tsx` → `src/components/CodeEditor.tsx` - 可编辑代码面板
- **修改**: `src/store/useEditorStore.ts` - 新增 `updateFromCode`, `codeEditorContent`, `parseError`
- **修改**: `src/utils/codeGenerator.ts` - 输出 `build_graph()` 格式
- **修改**: `src/components/NodeConfigPanel.tsx` - 添加节点名唯一性验证
- **修改**: `src/App.tsx` - 更新组件引用
- **修改**: `src/i18n/index.ts` - 添加新翻译键
- **修改**: `src/index.css` - 添加编辑器样式

### 依赖项
- **新增**: `pyodide` - Python 运行时（通过 CDN 加载）
- **新增**: `highlight.js` - 代码语法高亮

### API 变更
- **Store Actions**: 新增 `updateFromCode(doc: GraphDocument)`, `setCodeEditorContent(code: string)`
- **Store State**: 新增 `codeEditorContent: string`, `parseError: string | null`

### 约束
- 代码解析仅支持 LangGraph 核心子集 API
- 用户代码必须提供 `build_graph()` 函数
- 主线程执行（需在 UI 中明确安全声明）
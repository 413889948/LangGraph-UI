## 1. 基础设施

- [ ] 1.1 创建 PyodideService 核心模块 (`src/services/pyodideService.ts`)
  - 实现 Pyodide 加载管理（启动时预加载）
  - 实现 StateGraph 录制器（shim）
  - 实现 `parseCode(code: string) → GraphDocument`
  - 录制器支持: `StateGraph()`, `add_node()`, `add_edge()`, `add_conditional_edges()`, `set_entry_point()`, `compile()`

- [ ] 1.2 更新代码生成器输出格式 (`src/utils/codeGenerator.ts`)
  - 将生成的代码包装在 `build_graph()` 函数中
  - 确保生成代码以 `return app` 或 `return graph.compile()` 结尾
  - 保持现有节点/边生成逻辑不变

- [ ] 1.3 添加节点名唯一性约束 (`src/components/NodeConfigPanel.tsx`)
  - 在节点名输入时检查唯一性
  - 显示错误提示，阻止保存重名节点
  - 更新 i18n 翻译文件 (`src/i18n/index.ts`)
  - 处理空名称和特殊字符

## 2. Store 扩展

- [ ] 2.1 扩展 Store 支持批量导入 (`src/store/useEditorStore.ts`)
  - 添加新状态: `codeEditorContent: string`, `parseError: string | null`
  - 添加新 action: `updateFromCode(doc: GraphDocument)`
  - 实现原子操作：单次 history + 单次 save
  - 实现位置合并：按节点名匹配保留位置

## 3. 代码编辑器改造

- [ ] 3.1 改造 CodePreview 为可编辑 CodeEditor
  - 重命名 `src/components/CodePreview.tsx` → `src/components/CodeEditor.tsx`
  - 将 `<pre><code>` 改为 `<textarea>`
  - 添加语法高亮 overlay（使用 highlight.js）
  - 添加"应用到画布"按钮
  - 添加错误显示区域
  - 添加安全声明提示
  - 保留现有复制代码功能

- [ ] 3.2 更新 App.tsx 引用
  - 更新组件导入路径
  - 更新组件使用方式

## 4. 同步逻辑集成

- [ ] 4.1 实现代码到画布的同步逻辑 (`src/components/CodeEditor.tsx`)
  - 连接 PyodideService
  - 实现"应用到画布"按钮点击处理
  - 解析成功: 调用 `updateFromCode(doc)`
  - 解析失败: 显示错误，保留原画布

- [ ] 4.2 实现画布到代码的单向同步
  - Store 变化时更新编辑器内容
  - 不自动执行反向同步

## 5. 样式和 i18n

- [ ] 5.1 添加编辑器样式 (`src/index.css`)
  - textarea 样式
  - 语法高亮 overlay 样式
  - 错误提示样式
  - 按钮样式

- [ ] 5.2 更新翻译 (`src/i18n/index.ts`)
  - 添加代码编辑器相关翻译键
  - 添加错误提示翻译
  - 添加按钮文本翻译

## 6. 验证和文档

- [ ] 6.1 执行功能测试
  - 验证画布 → 代码生成（build_graph 格式）
  - 验证代码 → 画布同步
  - 验证错误处理
  - 验证节点唯一性

- [ ] 6.2 验证构建成功
  - 运行 `npm run build` 确保退出码为 0
  - 确保 TypeScript 无错误

- [ ] 6.3 更新文档 (`README.md`)
  - 添加代码编辑功能说明
  - 添加支持的 API 子集说明
  - 添加安全声明
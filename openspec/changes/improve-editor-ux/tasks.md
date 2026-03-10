# 实施任务清单

## 1. 语义化命名

- [x] 1.1 扩展 useEditorStore 支持节点命名计数器状态
- [x] 1.2 添加 getNextNodeName(type) 动作返回语义名称并递增计数器
- [x] 1.3 添加 resetNodeNaming(doc) 动作从现有节点重建计数器
- [x] 1.4 修改 GraphCanvas.tsx onDrop 使用计数器生成名称
- [x] 1.5 修改 FileOperations.tsx handleLoadProject 调用 resetNodeNaming
- [x] 1.6 验证代码生成器兼容语义名称

## 2. 代码生成器改进

- [x] 2.1 在 codeGenerator.ts 创建节点 ID 到名称映射表
- [x] 2.2 修改边连接生成使用节点名称而非 ID
- [x] 2.3 修改入口点设置使用节点名称
- [x] 2.4 验证导出代码无 UUID 字符串
## 3. localStorage 自动保存

- [x] 3.1 添加 debounce 保存函数到 useEditorStore
- [x] 3.2 在所有 mutation 操作后触发 debouncedSave
- [x] 3.3 实现配额错误捕获和警告显示
- [x] 3.4 实现页面加载时从 localStorage 恢复数据
- [x] 3.5 确保存储结构包含版本字段

## 4. isDirty 状态管理

- [x] 4.1 定义 isDirty 语义：仅表示"未成功保存"
- [x] 4.2 自动保存成功后调用 markClean
- [x] 4.3 自动保存失败后保持 isDirty 为 true

## 5. 撤销/重做历史栈

- [x] 5.1 扩展 useEditorStore 支持 past/present/future 状态
- [x] 5.2 添加 undo() 动作：past → future
- [x] 5.3 添加 redo() 动作：future → past
- [x] 5.4 添加 addToHistory() 内部函数
- [x] 5.5 限制 past 数组最大 20 条

## 6. Mutation 历史包装

- [x] 6.1 包装 addNode/updateNode/removeNode 支持历史记录
- [x] 6.2 包装 addEdge/updateEdge/removeEdge 支持历史记录
- [x] 6.3 包装 addStateField/updateStateField/removeStateField 支持历史记录
- [x] 6.4 确保每次 mutation 清空 future 数组
- [x] 6.5 验证深拷贝状态无引用共享

## 7. 撤销/重做快捷键

- [x] 7.1 在 GraphCanvas.tsx 添加 Ctrl+Z 快捷键绑定
- [x] 7.2 添加 Ctrl+Shift+Z / Ctrl+Y 快捷键绑定
- [x] 7.3 支持 macOS Cmd 键修饰
- [x] 7.4 添加输入框焦点检测跳过快捷键
- [x] 7.5 修复 Delete/Backspace 在输入框中误删节点问题

## 8. 选择状态恢复

- [x] 8.1 撤销节点创建时清除选择状态
- [x] 8.2 撤销节点删除时不自动选中恢复的节点
- [x] 8.3 确保无引用已删除节点/边

## 9. 历史栈清理

- [x] 9.1 setGraphDocument 后清空历史栈
- [x] 9.2 resetGraphDocument 后清空历史栈
- [x] 9.3 加载项目后清空历史栈

## 10. 验证与测试

- [x] 10.1 测试语义命名连续创建和类型独立计数
- [x] 10.2 测试删除节点后计数器不回收
- [x] 10.3 测试自动保存 debounce 和页面恢复
- [x] 10.4 测试存储配额错误处理
- [x] 10.5 测试撤销/重做所有 mutation 类型
- [x] 10.6 测试快捷键输入保护
- [x] 10.7 测试历史记录 20 步限制
- [x] 10.8 验证导出 Python 代码无 UUID

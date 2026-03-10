## i18n Locale Type Duplication

**Date:** 2026-03-10

**Problem:** `Locale` type defined in two places:
- `src/i18n/index.ts` - line 13
- `src/store/useEditorStore.ts` - line 41

**Risk:** Type drift if one is updated without the other.

**Mitigation:** Both must stay in sync. Consider centralizing to single source of truth in future.

---

## i18n AGENTS.md Corrections

**Date:** 2026-03-10

**Corrections made:**
1. Changed import examples from `@/i18n` (non-existent alias) to `../i18n` (relative path)
2. Changed "at build time" to "at module initialization" for translation flattening description
3. Trimmed file from 93 to 89 lines

**Root cause:** Initial version used incorrect path alias and inaccurate timing description.

---

## src/i18n/AGENTS.md 中文化完成

**日期：** 2026-03-10
**任务：** 将 src/i18n/AGENTS.md 翻译为中文

### 更改内容

1. **全文中文化** – 所有英文说明翻译为简洁中文
2. **保留原有结构** – 概述、Locale 所有权、翻译资源、用法、功能、缺失 Key 行为、非组件用法、新增翻译流程均保持不变
3. **技术标识保留**：
   - 代码块保持原样（TypeScript 示例、key 示例）
   - `console.warn`、`zh`/`en` 等技术术语保持英文
   - localStorage 键名 `langgraph-editor-locale` 保持原样
4. **关键语义保留**：
   - "模块初始化时扁平化"的准确描述
   - Locale 类型在两个文件中定义的耦合说明
   - zh/en 对齐规则
   - 缺失 key 的 fallback 行为

### 文件统计

- **88 行** – 与原版行数一致
- 中文表达简洁、扫描友好

### 构建验证

构建验证待进行。

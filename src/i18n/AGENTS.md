# i18n 指南

LangGraph 可视化编辑器的国际化模块。

## 概述

自定义 i18n 实现（无外部库），使用 Zustand store 管理 locale 状态。

## Locale 所有权

- **支持的 locale：** `zh`（中文）、`en`（英文）
- **状态源：** `useEditorStore(selectLocale)` - locale 由 Zustand store 管理
- **持久化：** Locale 存储在 localStorage 中，键名为 `langgraph-editor-locale`
- **类型耦合：** `Locale` 类型在 `src/i18n/index.ts` 和 `src/store/useEditorStore.ts` 中均有定义 - 保持同步

## 翻译资源

**位置：** `src/i18n/index.ts` - `zh` 和 `en` 对象

**结构：** 模块初始化时将嵌套对象扁平化为点号表示法的 key：
```typescript
{
  app: {
    title: '...',
    tabs: { nodeConfig: '...' }
  }
}
// 扁平化为：'app.title', 'app.tabs.nodeConfig'
```

**对齐规则：** zh/en 资源必须具有相同的 key 结构。添加新 key 时需同时为两个 locale 添加翻译。

## 用法

```typescript
import { useTranslation } from '../i18n';

const Component = () => {
  const { t, locale } = useTranslation();
  return <h1>{t('app.title')}</h1>;
};
```

## 功能

### Parameter Interpolation

替换 `{key}` 占位符：
```typescript
t('stateSchema.editor.fieldCount', { count: 5 })
// '{count} 个字段' → '5 个字段'
```

### 复数形式

使用 `{count, plural, one {} other {}}` 语法的基础复数形式：
```typescript
t('codePreview.footer.lines', { count: 1 })  // '1 line'
t('codePreview.footer.lines', { count: 5 })  // '5 lines'
```

## 缺失 Key 的行为

缺失翻译会触发：
1. `console.warn()` 输出 key 和 locale
2. Fallback 到翻译 key 本身

```typescript
t('non.existent.key')
// Console: 'Missing translation for key: "non.existent.key" in locale "zh"'
// Returns: 'non.existent.key'
```

## 非组件用法

非 React 代码使用 `getTranslation` 辅助函数：
```typescript
import { getTranslation } from '../i18n';

const text = getTranslation('app.title', 'zh');
```

## 新增翻译

1. 在 `src/i18n/index.ts` 中为 `zh` 和 `en` 对象同时添加 key
2. 保持嵌套结构（初始化时自动扁平化）
3. 动态值使用插值
4. 测试两个 locale 是否有缺失 key

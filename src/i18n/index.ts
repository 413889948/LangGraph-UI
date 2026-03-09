/**
 * i18n - Internationalization module for LangGraph Visual Editor
 * 
 * Provides translation functionality using Zustand store for locale state.
 * Supports simple parameter interpolation for {key} placeholders.
 */

import { useEditorStore, selectLocale } from '../store/useEditorStore';

/**
 * Supported locales
 */
export type Locale = 'zh' | 'en';

/**
 * Translation resource type
 */
type TranslationResource = {
  [key: string]: string | TranslationResource;
};

/**
 * Translation messages for Chinese (zh)
 */
const zh: TranslationResource = {
  app: {
    title: 'LangGraph 可视化编辑器',
    subtitle: '通过拖拽式界面创建 LangGraph 工作流',
    tabs: {
      nodeConfig: '节点配置',
      stateSchema: '状态 Schema',
      codePreview: '代码预览',
    },
  },
  node: {
    palette: {
      title: '节点',
      types: {
        function: {
          label: '函数',
          description: '普通 Python 函数节点',
        },
        tool: {
          label: '工具',
          description: 'LangChain Tool 节点',
        },
        subgraph: {
          label: '子图',
          description: '嵌套图结构节点',
        },
      },
    },
    config: {
      title: '节点配置',
      basicInfo: '基本信息',
      nodeInfo: '节点信息',
      name: '名称',
      type: '类型',
      id: 'ID',
      position: '位置',
      inputParams: '输入参数',
      outputParams: '输出参数',
      paramName: '参数名',
      outputName: '输出名',
      defaultValue: '默认值',
      deleteParam: '删除参数',
      deleteOutput: '删除输出',
      duplicateParam: '重复的参数名：{name}',
      duplicateOutput: '重复的输出名：{name}',
      noInputParams: '无输入参数',
      noOutputParams: '无输出参数',
      addParameter: '添加参数',
      addOutput: '添加输出',
    },
    emptyState: {
      title: '未选择节点',
      description: '点击画布中的节点以配置其属性',
    },
  },
  stateSchema: {
    editor: {
      title: '状态 Schema 编辑器',
      fieldCount: '{count} 个字段',
      description: '定义图工作流的全局状态结构',
    },
    emptyState: {
      title: '无状态字段',
      description: '点击"添加字段"创建状态 Schema',
    },
    fields: {
      title: '状态字段',
      name: '字段名',
      type: '类型',
      reducer: 'Reducer',
      required: '必填',
      defaultValue: '默认值',
      delete: '删除字段',
      addField: '添加字段',
      emptyName: '字段名不能为空',
      duplicateName: '重复的字段名：{name}',
    },
    types: {
      string: '字符串',
      int: '整数',
      bool: '布尔',
      float: '浮点数',
    },
    reducers: {
      replace: '替换',
      append: '追加',
      sum: '求和',
      max: '最大值',
      min: '最小值',
    },
  },
  codePreview: {
    title: '生成的 Python 代码',
    copyCode: '复制代码',
    copied: '代码已复制到剪贴板',
    copyFailed: '复制失败，请手动复制',
    validation: {
      passed: '语法验证通过',
      errors: '{count} 个错误',
      errorsTitle: '语法错误',
    },
    footer: {
      lines: '{count} 行代码',
    },
  },
  file: {
    operations: {
      new: '新建',
      load: '加载',
      save: '保存',
      exportCode: '导出代码',
      newTitle: '创建新项目',
      loadTitle: '从 JSON 文件加载项目',
      saveTitle: '保存项目为 JSON 文件',
      exportTitle: '导出 Python 代码文件',
    },
    confirm: {
      unsavedChangesLoad: '当前项目有未保存的更改，确定要加载其他项目吗？',
      unsavedChangesNew: '当前项目有未保存的更改，确定要创建新项目吗？',
    },
    alerts: {
      noProjectToSave: '没有可保存的项目',
      noProjectToExport: '没有可导出的项目',
      invalidFormat: '文件格式无效，请确保是有效的 LangGraph 项目文件',
      loadFailed: '加载文件失败：{error}',
      fileReadFailed: '读取文件失败',
    },
  },
};

/**
 * Translation messages for English (en)
 */
const en: TranslationResource = {
  app: {
    title: 'LangGraph Visual Editor',
    subtitle: 'Create LangGraph workflows with a drag-and-drop interface',
    tabs: {
      nodeConfig: 'Node Config',
      stateSchema: 'State Schema',
      codePreview: 'Code Preview',
    },
  },
  node: {
    palette: {
      title: 'Nodes',
      types: {
        function: {
          label: 'Function',
          description: 'Regular Python function node',
        },
        tool: {
          label: 'Tool',
          description: 'LangChain Tool node',
        },
        subgraph: {
          label: 'Subgraph',
          description: 'Nested graph structure node',
        },
      },
    },
    config: {
      title: 'Node Configuration',
      basicInfo: 'Basic Info',
      nodeInfo: 'Node Info',
      name: 'Name',
      type: 'Type',
      id: 'ID',
      position: 'Position',
      inputParams: 'Input Parameters',
      outputParams: 'Output Parameters',
      paramName: 'Parameter name',
      outputName: 'Output name',
      defaultValue: 'Default value',
      deleteParam: 'Delete parameter',
      deleteOutput: 'Delete output',
      duplicateParam: 'Duplicate parameter name: {name}',
      duplicateOutput: 'Duplicate output name: {name}',
      noInputParams: 'No input parameters',
      noOutputParams: 'No output parameters',
      addParameter: 'Add parameter',
      addOutput: 'Add output',
    },
    emptyState: {
      title: 'No node selected',
      description: 'Click a node in the canvas to configure its properties',
    },
  },
  stateSchema: {
    editor: {
      title: 'State Schema Editor',
      fieldCount: '{count} field{count, plural, one {} other {s}}',
      description: 'Define the global state structure for the graph workflow',
    },
    emptyState: {
      title: 'No state fields',
      description: 'Click "Add Field" to create a state schema',
    },
    fields: {
      title: 'State Fields',
      name: 'Field name',
      type: 'Type',
      reducer: 'Reducer',
      required: 'Required',
      defaultValue: 'Default value',
      delete: 'Delete field',
      addField: 'Add field',
      emptyName: 'Field name cannot be empty',
      duplicateName: 'Duplicate field name: {name}',
    },
    types: {
      string: 'String',
      int: 'Integer',
      bool: 'Boolean',
      float: 'Float',
    },
    reducers: {
      replace: 'Replace',
      append: 'Append',
      sum: 'Sum',
      max: 'Max',
      min: 'Min',
    },
  },
  codePreview: {
    title: 'Generated Python Code',
    copyCode: 'Copy Code',
    copied: 'Code copied to clipboard',
    copyFailed: 'Failed to copy, please copy manually',
    validation: {
      passed: 'Syntax validation passed',
      errors: '{count} error{count, plural, one {} other {s}}',
      errorsTitle: 'Syntax Errors',
    },
    footer: {
      lines: '{count} line{count, plural, one {} other {s}}',
    },
  },
  file: {
    operations: {
      new: 'New',
      load: 'Load',
      save: 'Save',
      exportCode: 'Export Code',
      newTitle: 'Create new project',
      loadTitle: 'Load project from JSON file',
      saveTitle: 'Save project as JSON file',
      exportTitle: 'Export Python code file',
    },
    confirm: {
      unsavedChangesLoad: 'You have unsaved changes. Are you sure you want to load another project?',
      unsavedChangesNew: 'You have unsaved changes. Are you sure you want to create a new project?',
    },
    alerts: {
      noProjectToSave: 'No project to save',
      noProjectToExport: 'No project to export',
      invalidFormat: 'Invalid file format. Please ensure it is a valid LangGraph project file.',
      loadFailed: 'Failed to load file: {error}',
      fileReadFailed: 'Failed to read file',
    },
  },
};

/**
 * Translation resources (kept for reference, using flattened versions)
 * const resources: Record<Locale, TranslationResource> = { zh, en };
 */

/**
 * Flatten a nested translation object into dot-notation keys
 */
function flattenTranslations(obj: TranslationResource, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      result[fullKey] = value;
    } else {
      Object.assign(result, flattenTranslations(value, fullKey));
    }
  }
  
  return result;
}

/**
 * Pre-flatten translations for both locales
 */
const zhTranslations = flattenTranslations(zh);
const enTranslations = flattenTranslations(en);

/**
 * Get translations for a locale
 */
function getTranslations(locale: Locale): Record<string, string> {
  return locale === 'zh' ? zhTranslations : enTranslations;
}

/**
 * Simple parameter interpolation
 * Replaces {key} placeholders with provided values
 * Supports basic pluralization with {count, plural, one {} other {s}}
 */
function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  
  let result = text;
  
  // Handle pluralization first
  const pluralRegex = /\{(\w+),\s*plural,\s*one\s*\{([^}]*)\}\s*other\s*\{([^}]*)\}\}/g;
  result = result.replace(pluralRegex, (match, key, oneForm, otherForm) => {
    const value = params[key];
    if (value === undefined) return match;
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
    return numValue === 1 ? oneForm : otherForm;
  });
  
  // Handle simple parameter replacement
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  
  return result;
}

/**
 * Translation function type
 */
type TranslateFunction = (key: string, params?: Record<string, string | number>) => string;

/**
 * useTranslation hook
 * Returns a translation function and current locale
 */
export function useTranslation(): { t: TranslateFunction; locale: Locale } {
  const locale = useEditorStore(selectLocale);
  
  const translations = getTranslations(locale);
  
  const t: TranslateFunction = (key, params) => {
    let text = translations[key];
    
    // Fallback to key if translation not found
    if (!text) {
      console.warn(`Missing translation for key: "${key}" in locale "${locale}"`);
      text = key;
    }
    
    // Apply parameter interpolation if params provided
    if (params) {
      text = interpolate(text, params);
    }
    
    return text;
  };
  
  return { t, locale };
}

/**
 * Helper function to get translation without hook (for non-React code)
 */
export function getTranslation(key: string, locale: Locale = 'zh', params?: Record<string, string | number>): string {
  const translations = getTranslations(locale);
  let text = translations[key] || key;
  
  if (params) {
    text = interpolate(text, params);
  }
  
  return text;
}

export type { TranslateFunction };

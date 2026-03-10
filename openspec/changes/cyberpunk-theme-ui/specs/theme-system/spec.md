# Theme System Specification

## ADDED Requirements

### 需求:CSS 变量主题系统必须支持深色和浅色主题

系统必须使用 CSS 自定义属性（CSS Variables）定义主题颜色，支持深色主题（`dark`）和浅色主题（`light`）之间的切换。

#### 场景:深色主题变量定义
- **当** 用户使用深色主题
- **那么** 系统必须应用以下 CSS 变量：
  - `--bg-base`: #0F172A
  - `--bg-surface`: #1E293B
  - `--bg-elevated`: #334155
  - `--text-primary`: #F8FAFC
  - `--text-secondary`: #CBD5E1

#### 场景:浅色主题变量定义
- **当** 用户使用浅色主题
- **那么** 系统必须应用以下 CSS 变量：
  - `--bg-base`: #FFFFFF
  - `--bg-surface`: #F8FAFC
  - `--bg-elevated`: #F1F5F9
  - `--text-primary`: #0F172A
  - `--text-secondary`: #475569

### 需求:主题系统必须支持 prefers-reduced-motion

系统必须尊重用户的 `prefers-reduced-motion` 媒体查询设置，减少或禁用动画效果。

#### 场景:用户偏好减少动画
- **当** 用户系统设置 `prefers-reduced-motion: reduce`
- **那么** 系统必须减少或禁用霓虹发光动画效果

### 需求:主题颜色对比度必须满足 WCAG AA 标准

所有文字和背景颜色组合必须满足 WCAG AA 对比度标准（正常文字至少 4.5:1）。

#### 场景:深色主题文字对比度验证
- **当** 使用 Chrome DevTools Accessibility 面板检查
- **那么** 所有文字元素的对比度必须大于 4.5:1

### 需求:主题系统必须使用分层颜色架构

系统必须按照背景层级、文字层级、强调色层级定义颜色变量。

#### 场景:背景层级定义
- **当** 开发者需要添加新的背景颜色
- **那么** 必须使用 `--bg-*` 前缀命名（如 `--bg-base`, `--bg-surface`）

#### 场景:霓虹强调色定义
- **当** 开发者需要添加霓虹发光效果
- **那么** 必须使用 `--neon-*` 前缀命名（如 `--neon-blue`, `--neon-green`）
# MiniDiary

> **在流动的光影里安放日程，在撕开的卡片中寻找答案。**

MiniDiary 是一个基于 **React Native + Expo** 的现代跨端日历 / 记录应用，强调「轻量记录 + 日程管理 + 视觉体验」的统一。

## ① 产品功能介绍

- **日历与日程管理**
  - 月历 / 日历列表（`app/(tabs)/calendar.tsx`）
  - 日程新增、展示、编辑（UI 组件集中在 `components/schedule/`）
- **今日卡片（Tear-Off）与每日问答**
  - 今日页入口（`app/(tabs)/index.tsx`，UI 组件集中在 `components/today/`）
  - 内置题库（`assets/data/questions.json`），用于每日灵感/自省记录
- **系统日历联动（可选）**
  - 读取系统日历数据（`src/hooks/useSystemCalendar.ts`）
- **导出与分享**
  - iCalendar / ICS 导出（`src/utils/icsGenerator.ts`、`src/services/exportService.ts`）
- **提醒通知**
  - 本地通知提醒（`src/services/notificationService.ts`）
- **个人页 / 我的**
  - 应用入口与个人相关功能聚合（`app/(tabs)/mine.tsx`）

## ② 程序概要设计

### 模块划分

- **路由与页面层（UI Screen）**：`app/`
  - 使用 Expo Router 组织页面与 Tab 导航
- **可复用组件层（UI Components）**：`components/`
  - `components/schedule/`：日程列表项、底部弹层、分段控制器等
  - `components/today/`：今日页头部、撕页卡片等
- **业务与基础能力层（Domain / Service / Store / Utils）**：`src/`
  - `src/store/`：Zustand 状态（如日程、日志等领域状态）
  - `src/services/`：导出、通知、题库等业务服务
  - `src/hooks/`：系统能力适配（系统日历等）
  - `src/utils/`：纯函数与生成器（如 ICS 生成）
  - `src/types/`：领域模型与类型定义
  - `src/constants/`：常量（如 iCal 相关）

### 核心数据流（简述）

- **页面触发**：用户在页面操作（新增日程/切换日期/导出等）
- **状态更新**：通过 `src/store/*` 更新领域状态（单向流，UI 订阅状态变化）
- **副作用执行**：通过 `src/services/*` 调用系统能力或执行导出/通知调度
- **展示渲染**：`components/*` 根据状态与 props 渲染，并提供动画与交互体验

## ③ 软件架构图

![Uploading image.png…]()


## ④ 技术亮点及其实现原理

- **Glassmorphism 视觉（Skia）**
  - **实现要点**：使用 Skia 在 RN 中进行高性能自定义绘制，将模糊、渐变、遮罩等效果放在 GPU 管线中完成。
  - **原理简述**：相较传统 View 树叠加，Skia 以「画布 + 图元」方式渲染，减少层级与过度绘制，在复杂视觉（玻璃拟态、卡片叠层）下更稳帧。
- **自然手势与过渡（Reanimated）**
  - **实现要点**：手势驱动 shared values，在 UI 线程侧完成动画计算与插值。
  - **原理简述**：动画从 JS 线程搬到 UI 线程后，避免 JS 卡顿导致的掉帧；配合弹簧/阻尼模型实现更接近真实物理的交互反馈。
- **极简状态流（Zustand）**
  - **实现要点**：将日程/日志等领域状态集中在 store 中，页面与组件只订阅自己需要的切片（slice）。
  - **原理简述**：通过选择器订阅减少无关重渲染；状态变更路径清晰（Action → Store → UI），更利于维护与扩展。
- **标准化导出（iCalendar / ICS）**
  - **实现要点**：在 `src/utils/icsGenerator.ts` 中将领域事件模型映射为 iCalendar 规范文本；由 `src/services/exportService.ts` 负责落地到分享/导出流程。
  - **原理简述**：用标准格式（RFC 5545）保证跨平台日历导入兼容，且导出逻辑与 UI 解耦，便于测试与复用。

## 技术栈（当前项目）

- **React Native + Expo**  
  - 一套基于 React Native 的开发工具链和运行环境，屏蔽原生配置复杂度，让应用更快开发、调试与发布（iOS/Android）。
- **Skia 图形引擎**：用于渲染玻璃拟态（Glassmorphism）UI
- **Reanimated**：实现自然、流畅的手势与动画交互
- **Zustand**：构建极简状态流（支持本地持久化与视图同步）


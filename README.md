# MiniDiary

> **在流动的光影里安放日程，在撕开的卡片中寻找答案。**

MiniDiary 是一个基于 **React Native + Expo** 的现代跨端日历 / 记录应用，强调「轻量记录 + 日程管理 + 视觉体验」的统一。

## ① 功能介绍

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

## ③ 软件架构图
<img width="1060" height="300" alt="arcitecture" src="https://github.com/user-attachments/assets/583a0401-a453-4979-b14f-471edf17c96d" />

## 技术栈（当前项目）

- **React Native + Expo**  
  - 一套基于 React Native 的开发工具链和运行环境，屏蔽原生配置复杂度，让应用更快开发、调试与发布（iOS/Android）。
- **Skia 图形引擎**：用于渲染玻璃拟态（Glassmorphism）UI
- **Reanimated**：实现自然、流畅的手势与动画交互
- **Zustand**：构建极简状态流（支持本地持久化与视图同步）


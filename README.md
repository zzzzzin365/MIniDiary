# MiniDiary

> **在流动的光影里安放日程，在撕开的卡片中寻找答案。**

MiniDiary 是一个基于 **React Native + Expo** 的现代跨端日历 / 记录应用。

## 技术栈

- **React Native + Expo**  
  支持ios+android；
“Expo ：一套基于 React Native 的开发工具链和运行环境，用来屏蔽原生配置复杂度，让 RN 应用能快速开发、调试和发布。”

- **Skia 图形引擎**  
  用于渲染玻璃拟态（Glassmorphism）UI

- **Reanimated**  
  结合物理引擎实现自然、流畅的手势与动画交互

## 架构设计

- **Zustand 状态管理**  
  构建极简状态流，实现：
  - 日历视图与日程数据的实时同步  
  - 本地持久化存储  
  - 逻辑清晰，不他妈绕弯子

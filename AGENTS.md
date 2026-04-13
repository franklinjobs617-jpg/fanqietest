# 项目上下文

## 技术栈

- **核心**: Vite 7, TypeScript, Express
- **UI**: Tailwind CSS

## 目录结构

```
├── scripts/            # 构建与启动脚本
│   ├── build.sh        # 构建脚本
│   ├── dev.sh          # 开发环境启动脚本
│   ├── prepare.sh      # 预处理脚本
│   └── start.sh        # 生产环境启动脚本
├── server/             # 服务端逻辑
│   ├── routes/         # API 路由
│   ├── server.ts       # Express 服务入口
│   └── vite.ts         # Vite 中间件集成
├── src/                # 前端源码
│   ├── index.css       # 全局样式
│   ├── index.ts        # 客户端入口
│   └── main.ts         # 主逻辑
├── index.html          # 入口 HTML
├── package.json        # 项目依赖管理
├── tsconfig.json       # TypeScript 配置
└── vite.config.ts      # Vite 配置
```

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。
**常用命令**：
- 安装依赖：`pnpm add <package>`
- 安装开发依赖：`pnpm add -D <package>`
- 安装所有依赖：`pnpm install`
- 移除依赖：`pnpm remove <package>`

## 开发规范

- 使用 Tailwind CSS 进行样式开发

## 项目功能说明

### 番茄时钟应用

一个专注工作、定时休息的番茄时钟小助手。

#### 核心功能
- **工作计时器**: 25 分钟专注工作时段
- **休息计时器**: 5 分钟休息时段
- **浏览器通知**: 计时结束时自动弹出通知提醒
- **Top3 事项管理**: 每天最多添加 3 项重点事项，支持标记完成

#### 文件结构
```
src/
├── index.css       # 全局样式（Tailwind CSS）
├── index.ts        # 客户端入口
├── main.ts        # 主逻辑（UI渲染、事件处理）
└── pomodoro.ts    # 核心逻辑类（PomodoroTimer、TodoManager）
```

#### 主要类
- `PomodoroTimer`: 番茄时钟计时器，管理开始/暂停/重置/跳过
- `TodoManager`: 待办事项管理器，支持添加/删除/标记完成
- `formatTime`: 时间格式化工具（秒转 MM:SS）
- `showNotification`: 浏览器通知工具

#### 使用说明
1. 点击"开始"按钮启动计时
2. 计时结束时浏览器会弹出通知提醒
3. 休息模式下点击"跳过"可提前进入下一轮工作
4. 在右侧面板添加每日 Top3 重点事项
5. 事项数据自动保存到 localStorage

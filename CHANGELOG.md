# Changelog

## v0.2.0 - 2026-05-28

QL 第二阶段发布版本。

### Added

- 添加 Web App Manifest
- 添加 PWA 应用图标
- 添加生产环境 Service Worker 注册
- 添加应用壳缓存和同源静态资源运行时缓存
- 添加基础离线访问支持
- 添加浏览器安装提示按钮
- 更新 README、package 元信息和版本说明

### Notes

- Service Worker 仅在生产构建中注册，开发环境不启用缓存
- 当前 PWA 支持聚焦网页版安装与基础离线访问，不涉及 Electron、Tauri、Capacitor、exe 或 apk

## v0.1.0 - 2026-05-28

QL 第一阶段发布版本。

### Added

- 初始化 React 18 + TypeScript + Vite 项目
- 配置 Tailwind CSS v3、PostCSS 与 Autoprefixer
- 实现本地 TXT 文件导入
- 支持 UTF-8 与 GB18030 编码选择
- 实现 TXT 清理、章节识别和全文兜底解析
- 实现书架首页、空状态、书籍卡片和删除确认
- 使用 IndexedDB 保存书籍元数据、阅读进度和章节正文
- 使用 localStorage 保存阅读设置
- 实现阅读页、上一章、下一章、返回书架
- 实现章节目录抽屉和当前章节高亮
- 实现底部阅读设置面板
- 支持字号、行高、内容宽度、字体和主题切换
- 支持 light、dark、green、paper 四种阅读主题
- 支持滚动位置节流保存与刷新恢复
- 添加 README 项目说明

### Notes

- 当前版本只做网页版
- 不包含后端、登录、PWA、Electron、Tauri、Capacitor、exe 或 apk
- 小说文件只保存在浏览器本地，不会上传

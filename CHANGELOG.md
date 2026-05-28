# Changelog

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

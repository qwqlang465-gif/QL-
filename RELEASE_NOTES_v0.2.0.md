# QL v0.2.0

QL 第二阶段发布版本。

这个版本在第一阶段的本地 TXT 小说阅读能力之上，加入 PWA 支持，让 QL 可以作为可安装的网页应用使用，并在生产构建中提供基础离线访问能力。

仓库地址：https://github.com/qwqlang465-gif/QL-

## Highlights

- 添加 Web App Manifest
- 添加 192x192、512x512 PNG 图标和 SVG 图标
- 添加生产环境 Service Worker 注册
- 缓存应用壳、manifest 和图标资源
- 为同源静态资源添加运行时缓存
- 导航请求失败时回退到本地缓存的 `index.html`
- 首页在浏览器允许安装时显示“安装 QL”按钮
- package 版本升级到 `0.2.0`

## Notes

- Service Worker 只在生产环境注册，开发环境不会启用缓存
- 当前版本仍然是 React + Vite 网页版
- 不包含 Electron、Tauri、Capacitor、exe 或 apk
- 小说文件仍然只保存在浏览器本地，不会上传

## Install

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
npm run preview
```

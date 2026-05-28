# QL v0.4.0

QL 第四阶段发布版本。

这个版本在 Web / PWA / EPUB 支持基础上，加入 Electron 桌面端封装和 Windows exe 安装包打包能力。桌面端复用现有 React + Vite 前端，不新增后端服务，也不改变本地优先的数据模型。

仓库地址：https://github.com/qwqlang465-gif/QL-

## Highlights

- 添加 Electron 主进程
- 添加 preload 脚本
- 添加 Windows 应用图标资源
- 添加 electron-builder 配置
- 支持构建 Windows x64 NSIS 安装包
- 新增 `npm run desktop:start`
- 新增 `npm run desktop:pack`
- 新增 `npm run desktop:dist`
- Electron `file://` 环境自动切换 HashRouter
- Electron 本地文件环境跳过 Service Worker 注册

## Notes

- 桌面端仍然不需要登录、不需要后端、不上传小说文件
- 桌面端数据保存在 Electron Chromium 的 IndexedDB 和 localStorage 中
- 当前已验证 Windows x64 unpacked exe 构建
- 当前构建未做代码签名
- Windows 安装包构建依赖 electron-builder 官方 NSIS 工具下载

## Install

```bash
npm install
npm run desktop:start
```

构建 Windows unpacked exe：

```bash
npm run desktop:pack
```

构建 Windows 安装包：

```bash
npm run desktop:dist
```

# QL v0.5.0

QL 第五阶段发布版本。

这个版本在 Electron 桌面端基础上加入 Tauri v2 工程配置。Tauri 版本继续复用同一套 React + Vite 前端代码，不引入后端，也不改变本地优先的数据存储方式。

## Highlights

- 添加 `src-tauri` 工程目录
- 添加 Tauri v2 `tauri.conf.json`
- 添加 Rust `main.rs` / `lib.rs`
- 添加 `Cargo.toml` 和 `build.rs`
- 添加 Tauri v2 默认 capability 配置
- 添加 Tauri 图标资源
- 新增 `npm run tauri:dev`
- 新增 `npm run tauri:build`
- 前端在 Tauri 本地壳环境下自动使用 HashRouter
- Service Worker 仅在 HTTP/HTTPS 环境注册

## Verification

- `npm run build` 已通过
- 本机未安装 `rustc` / `cargo`，因此 `npm run tauri:build` 当前无法完成原生构建
- 安装 Rust 工具链后可继续执行 `npm run tauri:build`

## Notes

- Tauri 桌面端仍然不需要登录、不需要后端、不上传小说文件
- 小说正文和阅读进度仍保存到本地 IndexedDB
- 当前版本是 Tauri 工程接入阶段，原生包构建依赖本机 Rust 环境

## Install

```bash
npm install
npm run tauri:dev
```

构建 Tauri 桌面应用：

```bash
npm run tauri:build
```

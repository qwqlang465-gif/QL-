# QL v0.7.1

QL 第七阶段补丁版本。

这个版本修复 Windows unpacked exe 启动后白屏的问题。原因是 Vite 默认生成 `/assets/...` 绝对资源路径，而 Electron 使用 `file://` 打开本地 HTML 时无法加载这些资源。

## Fixed

- 修复 Electron 桌面端白屏
- Vite 生产构建改为相对资源路径
- manifest 和图标链接改为相对路径
- Electron 主窗口改为立即显示
- Electron 主进程增加加载失败和渲染进程退出日志
- PWA 缓存版本更新到 v0.7.1
- Android 原生版本号同步到 0.7.1

## Verification

- `npm run build` 已通过
- `npm run desktop:pack` 已通过
- `release/win-unpacked/QL.exe` 已重新启动验证
- 已通过 Electron 调试协议确认 `#root` 渲染出书架内容

## Notes

- 本版本重点是桌面端白屏修复
- Web 阅读器功能与 v0.7.0 保持一致
- 当前版本附带 Web 构建包和 Windows unpacked 桌面端压缩包

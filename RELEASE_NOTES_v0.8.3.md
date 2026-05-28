# QL v0.8.3

QL Windows exe 发布 workflow 修复版本。

`v0.8.2` 已经验证 Android APK job 可以在 GitHub Actions 中成功构建。本版本继续修复 Windows exe job，让 Release 自动发布 Windows exe zip 和 Android APK。

## Fixed

- Windows exe workflow 改为使用 npm 已安装的 Electron dist 组装 portable `QL.exe`
- GitHub Release 中的 Windows 产物不再依赖 CI 运行 electron-builder
- 本地 `desktop:pack` 继续使用 electron-builder 和已安装的 Electron dist
- Android 原生版本号同步到 0.8.3

## Verification

- `npm run build` 已通过
- `npm run cap:sync` 已通过
- `npm run desktop:pack` 已通过
- Android APK 已在 `v0.8.2` 的 GitHub Actions 中构建成功

## Notes

- 当前发布目标只保留 Windows exe 和 Android APK
- release APK 暂时使用 debug 签名兜底，适合自己手机安装体验

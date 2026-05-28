# QL v0.8.4

QL Windows exe workflow 兜底修复版本。

Android APK job 已经在 GitHub Actions 中验证成功。本版本继续修复 Windows exe job：如果 npm 安装后 Electron 可执行文件没有出现在 `node_modules/electron/dist`，workflow 会自动下载 Electron win32-x64 zip，再组装 portable `QL.exe`。

## Fixed

- Windows exe workflow 增加 Electron zip 下载兜底
- Windows portable 组装步骤增加错误 annotation
- Android 原生版本号同步到 0.8.4

## Verification

- `npm run build` 已通过
- `npm run cap:sync` 已通过
- `npm run desktop:pack` 已通过
- Android APK 已在 GitHub Actions 中构建成功

## Notes

- 当前发布目标只保留 Windows exe 和 Android APK
- release APK 暂时使用 debug 签名兜底，适合自己手机安装体验

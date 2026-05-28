# QL v0.8.0

QL Android APK 自动构建版本。

这个版本把发布目标收窄到 Windows exe 和 Android APK，并加入 GitHub Actions 自动构建 APK。以后推送 `v*` 标签时，仓库会自动构建 Android debug / release APK，并上传到对应 Release。

## Added

- 新增 `.github/workflows/build-apk.yml`
- 自动安装 Node.js 20、JDK 21 和 Android SDK platform 36
- 自动执行 `npm ci`
- 自动执行 Web 构建
- 自动执行 Capacitor Android 同步
- 自动构建 Android debug APK
- 自动构建 Android release APK
- 自动上传 APK 到 workflow artifact
- tag 发布时自动上传 APK 到 GitHub Release

## Changed

- Android release 构建使用 debug 签名兜底，适合个人手机安装测试
- Android APK 输出文件名改为 `QL-${version}-${variant}.apk`
- README 改为聚焦 Windows exe 和 Android APK
- Android 原生版本号同步到 0.8.0
- 移除 Tauri 脚本、依赖和工程目录
- 移除 PWA manifest / service worker 入口，发布路线只保留 exe + APK

## Verification

- `npm run build` 已通过
- `npm run desktop:pack` 已通过
- 本机缺少 JDK 21 / Android SDK，APK 原生构建由 GitHub Actions 执行

## Notes

- 当前 APK 面向个人安装测试
- 正式分发前建议换成自己的 Android keystore 签名
- 阅读器仍然本地读取 TXT，不上传文件，不需要后端

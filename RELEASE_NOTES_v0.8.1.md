# QL v0.8.1

QL Android APK workflow 修复版本。

这个版本继续保持主线只面向 Windows exe 和 Android APK，并修复 `v0.8.0` 首次 GitHub Actions 构建中 Capacitor 同步步骤失败的问题。

## Fixed

- GitHub Actions APK 构建改用 `npx cap copy android`
- 避免 CI 中 `cap sync` 额外更新 Android 工程导致构建中断
- Android 原生版本号同步到 0.8.1

## Verification

- `npm run build` 已通过
- `npm run cap:sync` 已通过
- `npm run desktop:pack` 已通过
- 本机缺少 JDK 21 / Android SDK，APK 原生构建由 GitHub Actions 执行

## Notes

- 当前 APK 面向个人安装测试
- release APK 暂时使用 debug 签名兜底，适合自己手机安装体验
- 正式分发前建议换成自己的 Android keystore 签名

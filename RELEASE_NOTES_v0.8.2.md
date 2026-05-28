# QL v0.8.2

QL exe + APK 发布 workflow 修复版本。

这个版本把发布链路收敛成两个产物：Windows exe 和 Android APK。推送 `v*` 标签后，GitHub Actions 会分别构建 Windows unpacked exe zip、Android debug / release APK，并统一上传到对应 GitHub Release。

## Added

- 新增 Windows exe 自动构建 job
- GitHub Release 自动上传 Windows unpacked exe zip
- GitHub Release 自动上传 Android debug / release APK
- 将 Capacitor 需要的空 Cordova 插件模块纳入仓库，减少 CI 临时生成步骤

## Fixed

- APK workflow 不再依赖 `cap copy` / `cap sync`
- CI 直接复制 Vite `dist` 到 Android WebView assets
- CI 直接写入 `capacitor.config.json`、`capacitor.plugins.json` 和基础 `config.xml`
- Android 原生版本号同步到 0.8.2

## Verification

- `npm run build` 已通过
- `npx cap copy android` 已通过
- `npm run cap:sync` 已通过
- `npm run desktop:pack` 已通过
- APK 原生构建由 GitHub Actions 执行

## Notes

- 当前 APK 面向个人安装测试
- release APK 暂时使用 debug 签名兜底，适合自己手机安装体验
- 正式分发前建议换成自己的 Android keystore 签名

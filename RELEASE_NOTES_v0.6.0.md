# QL v0.6.0

QL 第六阶段发布版本。

这个版本开始接入 Android APK 方向：新增 Capacitor Android 工程，让 QL 可以复用现有 React + Vite 阅读器代码进入 Android 原生构建流程。当前阶段重点是工程接入、脚本补齐和本地壳兼容。

## Highlights

- 新增 `android/` Capacitor Android 工程
- 新增 `capacitor.config.ts`
- 新增 `@capacitor/core`、`@capacitor/android`、`@capacitor/cli`
- 新增 `npm run cap:sync`
- 新增 `npm run android:open`
- 新增 `npm run android:build`
- Android 原生版本号同步到 `0.6.0`
- Android 图标和启动图使用 QL 自有图标资源
- Android Manifest 移除默认网络权限
- 前端在 Capacitor Android 本地壳中自动使用 HashRouter
- Service Worker 跳过 Capacitor Android 本地壳环境
- PWA 缓存版本更新到 v0.6.0

## Verification

- `npm run build` 已通过
- `npm run cap:sync` 已通过
- `npm run android:build` 已执行，但当前在下载 Gradle 官方发行包时超时；本机同时缺少 Android SDK，且 Java 版本为 8，暂时无法完成 APK 原生构建

## Environment Notes

要继续生成 APK，需要本机安装并配置：

- JDK 21
- Android Studio 或 Android SDK
- `ANDROID_HOME` 或 `ANDROID_SDK_ROOT`
- 可正常下载 Gradle 官方发行包的网络环境

## Notes

- Android 端仍然不需要登录、不需要后端、不上传小说文件
- 小说正文和阅读进度仍保存在本地 IndexedDB
- 阅读设置仍保存在 localStorage
- 当前版本是 Android 工程接入阶段，不附带 APK 安装包

## Install

```bash
npm install
npm run cap:sync
```

打开 Android Studio：

```bash
npm run android:open
```

构建 debug APK：

```bash
npm run android:build
```

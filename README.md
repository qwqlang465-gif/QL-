# QL

![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38bdf8?logo=tailwindcss&logoColor=white)

QL 是一个本地优先的 TXT / EPUB 小说阅读器。它面向个人阅读场景：导入本地小说，在浏览器或桌面壳中安静阅读，并把书架、章节和进度保存在本机。

项目的重点是阅读体验，而不是账号、同步或内容平台。QL 不需要登录、不需要后端，也不会上传小说文件。

## 当前状态

当前版本：`v0.7.1`

| 目标 | 状态 | 说明 |
| --- | --- | --- |
| React + Vite 网页版 | 已完成 | 支持 TXT / EPUB 导入、书架、阅读页、目录、设置、书签、搜索、备份和本地持久化 |
| PWA | 已完成 | 支持 manifest、图标、安装提示和基础离线访问 |
| Electron 桌面端 | 已接入 | 已验证 Windows unpacked exe，可运行 `npm run desktop:pack` |
| Tauri 桌面端 | 已接入工程 | 配置和脚本已完成；本机需要 Rust 工具链后才能原生构建 |
| Android APK | 已接入工程 | 已加入 Capacitor Android 工程和 debug / release 脚本；本机需补齐 JDK 21 与 Android SDK 后才能原生构建 |

## 功能

- 导入 `.txt` 和 `.epub` 小说
- TXT 支持 UTF-8 与 GB18030 编码选择
- EPUB 使用 JSZip 在浏览器本地解析
- 支持 EPUB3 nav 和 EPUB2 NCX 目录标题提取
- 自动解析 TXT 章节，无章节时作为全文阅读
- 书架展示、删除、上次阅读章节和阅读时间
- 阅读页支持上一章、下一章、章节目录跳转
- 阅读页支持整本书搜索和结果跳转
- 阅读页支持添加、查看、跳转和删除书签
- 支持字号、行高、内容宽度、字体和主题切换
- 支持 light、dark、green、paper 四种阅读主题
- 保存并恢复章节、滚动位置和阅读百分比
- 支持导出 / 导入 QL 本地备份
- 支持 PWA 安装和基础离线访问
- 支持 Electron / Tauri 桌面端工程
- 支持 Capacitor Android 工程

## 隐私与存储

QL 的数据只保存在本机浏览器、桌面壳或 Android WebView 对应的本地存储中。

- IndexedDB 保存书籍元数据、阅读进度和章节正文
- IndexedDB 保存每本书的书签
- localStorage 保存阅读设置
- 小说正文不会写入 localStorage
- 不上传文件
- 不收集阅读记录
- 不需要账号或后端服务

使用的存储键：

- `ql_book_metas`
- `ql_book_chapters_${bookId}`
- `ql_book_bookmarks_${bookId}`
- `ql_reader_settings`

清空浏览器站点数据、Electron 应用数据、Tauri WebView 数据或 Android 应用数据后，书籍和阅读进度也会被清除。

## 技术栈

- React 18
- TypeScript
- Vite
- Tailwind CSS v3
- Zustand
- React Router
- IndexedDB / localStorage
- idb-keyval
- JSZip
- Web App Manifest / Service Worker
- Electron / electron-builder
- Tauri v2
- Capacitor Android

## 安装

环境要求：

- Node.js 18 或更高版本
- npm

Android 工程构建 APK 还需要：

- JDK 21
- Android Studio 或 Android SDK
- 已配置 `ANDROID_HOME` 或 `ANDROID_SDK_ROOT`

```bash
npm install
```

## 网页版运行

开发：

```bash
npm run dev
```

构建：

```bash
npm run build
```

预览构建产物：

```bash
npm run preview
```

## Electron 桌面端

本地启动：

```bash
npm run desktop:start
```

生成 Windows unpacked exe：

```bash
npm run desktop:pack
```

产物位置：

```text
release/win-unpacked/QL.exe
```

生成 Windows NSIS 安装包：

```bash
npm run desktop:dist
```

说明：安装包构建依赖 electron-builder 下载 NSIS 工具，网络不稳定时可能失败。当前已验证的是 `desktop:pack` 生成的 Windows unpacked exe。

## Tauri 桌面端

Tauri 需要先安装 Rust 工具链和对应系统构建依赖。

开发：

```bash
npm run tauri:dev
```

构建：

```bash
npm run tauri:build
```

当前仓库已包含 Tauri v2 工程配置，但本机未安装 Rust 时无法完成原生构建。

## Android APK

Android 端使用 Capacitor 复用同一份 React + Vite 前端构建产物。

同步 Android 工程：

```bash
npm run cap:sync
```

使用 Android Studio 打开工程：

```bash
npm run android:open
```

构建 debug APK：

```bash
npm run android:debug
```

`npm run android:build` 是 `android:debug` 的别名。

构建 release APK：

```bash
npm run android:release
```

当前仓库已包含 `android/` 工程和 Gradle Wrapper。Capacitor 8 生成的 Android 工程使用 Java 21 编译级别，本机需要安装 JDK 21、Android SDK，并配置 `ANDROID_HOME` 或 `ANDROID_SDK_ROOT` 后才能完成 APK 原生构建；当前机器还会在下载 Gradle 官方发行包时超时，需要网络环境稳定后继续。

## 使用

1. 打开 QL。
2. 导入 TXT 时选择编码，默认 UTF-8，也可以选择 GB18030。
3. 点击“导入 TXT / EPUB”，选择本地小说文件。
4. 导入完成后在书架中打开书籍。
5. 在阅读页使用目录、搜索、书签、上一章、下一章和阅读设置。
6. 在书架页可以导出 QL 备份，也可以导入备份恢复书架、章节、进度、书签和设置。

## 浏览器支持

推荐使用较新的浏览器：

- Chrome
- Edge
- Safari
- Firefox

GB18030 解码依赖浏览器 `TextDecoder` 支持。如果浏览器不支持，QL 会提示切换编码或更换浏览器。

## 项目结构

```text
src/
  components/
  hooks/
  pages/
  store/
  styles/
  types/
  utils/
electron/
  main.cjs
  preload.cjs
src-tauri/
  Cargo.toml
  tauri.conf.json
  capabilities/
  icons/
  src/
android/
  app/
  gradle/
capacitor.config.ts
public/
  icons/
  manifest.webmanifest
  sw.js
```

## 已验证

- `npm run build`
- `npm run cap:sync`
- `npm run desktop:pack`
- `npm run tauri:build` 已执行，当前环境缺少 `cargo`，原生构建未完成
- `npm run android:debug` 已执行，当前在下载 Gradle 官方发行包时超时；本机同时缺少 Android SDK 且 Java 版本过低，APK 原生构建未完成

## 路线图

v0.7.0 已完成当前规划中的主要应用功能。后续可选优化：

- 安装 Android 构建环境后生成并签名 APK / AAB
- 更完整的 EPUB 图片与脚注渲染
- 更大书库下的全文索引性能优化
- 可选的数据同步方案

## FAQ

### 小说文件会上传吗？

不会。QL 没有后端上传逻辑，TXT / EPUB 都在本地读取和解析。

### 为什么正文不用 localStorage 保存？

localStorage 容量较小，并且同步读写大文本容易卡顿。QL 使用 IndexedDB 保存章节正文，只用 localStorage 保存阅读设置。

### TXT 乱码怎么办？

删除这本书，换 UTF-8 或 GB18030 重新导入。老 TXT 文件常见编码就是这两类。

### EPUB 支持到什么程度？

当前版本提取 EPUB 文本内容、目录标题，并会利用图片 alt/title 作为文本兜底；不渲染 EPUB 内嵌 CSS、图片、音视频或复杂脚注交互。

### 换浏览器后书还在吗？

不在。QL 是本地优先应用，不做云同步。

## License

当前项目未指定开源许可证。默认保留所有权利。

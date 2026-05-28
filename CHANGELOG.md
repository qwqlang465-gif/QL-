# Changelog

## v0.8.4 - 2026-05-29

QL Windows exe workflow 兜底修复版本。

### Fixed

- Windows exe workflow 在 npm 安装后找不到 `electron.exe` 时，会自动下载 Electron win32-x64 zip 作为兜底
- Windows portable 组装步骤增加错误 annotation，失败时能在 GitHub Actions 页面看到具体原因
- Android 原生版本号更新为 `0.8.4`

### Notes

- Android APK job 已在 GitHub Actions 中验证成功
- 本版本继续发布 Windows exe zip 和 Android APK

## v0.8.3 - 2026-05-29

QL Windows exe 发布 workflow 修复版本。

### Fixed

- Windows exe workflow 改为使用 npm 已安装的 Electron dist 组装 portable `QL.exe`
- GitHub Release 中的 Windows 产物不再依赖 CI 运行 electron-builder
- 本地 `desktop:pack` 继续使用 electron-builder 和已安装的 Electron dist，减少重复下载
- Android 原生版本号更新为 `0.8.3`

### Notes

- `v0.8.2` 的 Android APK job 已在 GitHub Actions 成功
- 本版本继续让 Release 自动发布 Windows exe zip 和 Android APK

## v0.8.2 - 2026-05-29

QL exe + APK 发布 workflow 修复版本。

### Added

- GitHub Actions 新增 Windows exe 构建 job
- tag 发布时同时上传 Windows unpacked exe zip 和 Android APK 到 GitHub Release
- 将 Capacitor 需要的空 Cordova 插件模块纳入仓库，避免 CI 依赖临时生成目录

### Fixed

- APK workflow 不再依赖 `cap copy` / `cap sync`，改为直接准备 Android WebView assets 和 Capacitor 配置文件
- Android 原生版本号更新为 `0.8.2`

### Notes

- 本机已验证 `npm run build`、`npx cap copy android`、`npm run cap:sync` 和 `npm run desktop:pack`
- APK 原生构建继续由 GitHub Actions 的 JDK 21 / Android SDK 环境执行

## v0.8.1 - 2026-05-29

QL Android APK workflow 修复版本。

### Fixed

- GitHub Actions APK 构建改用 `npx cap copy android` 复制 Web 产物，避免 CI 中 `cap sync` 额外更新步骤失败
- Android 原生版本号更新为 `0.8.1`

### Notes

- 本机仍缺少 JDK 21 / Android SDK，APK 原生构建继续交给 GitHub Actions 执行
- `npm run build`、`npm run cap:sync` 和 `npm run desktop:pack` 已在本机验证

## v0.8.0 - 2026-05-29

QL Android APK 自动构建版本。

### Added

- 添加 GitHub Actions workflow：`Build Android APK`
- 推送 `v*` 标签时自动构建 Android debug / release APK
- APK 构建产物会保存为 workflow artifact
- tag 发布时自动把 APK 上传到 GitHub Release
- Android release 构建使用 debug 签名兜底，方便个人手机直接安装测试
- Android APK 输出文件名改为 `QL-${version}-${variant}.apk`

### Changed

- README 调整为当前主线：Windows exe + Android APK
- Android 原生版本号更新为 `0.8.0`
- 移除 Tauri 脚本、依赖和工程目录，发布路线收敛到 Electron + Capacitor
- 移除 PWA manifest / service worker 入口，避免无关缓存影响 exe / APK 调试

### Notes

- 本机仍缺少 JDK 21 / Android SDK，APK 原生构建交给 GitHub Actions 执行
- `npm run build` 和 `npm run desktop:pack` 已在本机验证

## v0.7.2 - 2026-05-29

QL TXT 阅读稳定性补丁版本。

### Added

- TXT 导入默认改为自动识别编码
- 自动识别 UTF-8 BOM、UTF-16LE BOM、UTF-16BE BOM
- 自动通过空字节分布识别无 BOM 的 UTF-16LE / UTF-16BE
- 自动识别严格 UTF-8，失败后回退 GB18030
- TXT 编码手动选项增加 UTF-16LE 和 UTF-16BE

### Fixed

- 修复 GB18030 老 TXT 用默认 UTF-8 导入后容易乱码入库的问题
- 手动选错编码时会阻止明显乱码正文保存进 IndexedDB
- 章节识别支持 `第 1 章`、全角数字、正文/作品相关前缀、`【001】`、`1、标题` 等常见 TXT 标题格式
- 清理 TXT 中的空字符，避免 UTF-16 误读后影响章节解析

### Notes

- 已经乱码的旧书需要删除后重新导入，因为旧正文已经按错误编码保存
- `npm run build` 已通过验证

## v0.7.1 - 2026-05-29

QL 第七阶段补丁版本。

### Fixed

- 修复 Electron 桌面端 unpacked exe 打开后白屏的问题
- Vite 生产构建改为相对资源路径，确保 `file://` 环境可以正确加载 JS 和 CSS
- 首页 manifest 和图标链接改为相对路径，提升桌面壳兼容性
- Electron 主窗口改为立即显示，并记录加载失败和渲染进程退出日志，避免白屏问题静默发生

### Notes

- `npm run build` 已通过验证
- `npm run desktop:pack` 已通过验证
- 修复后的 `release/win-unpacked/QL.exe` 已通过 Electron 调试协议确认页面内容完成渲染

## v0.7.0 - 2026-05-29

QL 第七阶段发布版本。

### Added

- 添加阅读页整本书搜索面板
- 添加搜索结果跳转和正文高亮
- 添加书签面板
- 添加当前阅读位置书签添加、跳转和删除
- 添加书签 IndexedDB 独立存储 `ql_book_bookmarks_${bookId}`
- 添加阅读百分比保存与书架展示
- 添加 QL 本地备份导出
- 添加 QL 本地备份导入，支持恢复书架、章节、阅读进度、书签和阅读设置
- 添加 `android:debug` debug APK 构建脚本
- 添加 `android:release` release APK 构建脚本
- 添加 EPUB 图片 alt/title 文本兜底提取

### Changed

- `android:build` 改为 debug 构建别名
- Android 原生版本号更新为 `0.7.0`
- Capacitor 本地壳路由检测补充 `capacitor:` 协议
- EPUB spine 解析跳过 `linear="no"` 和 nav 目录页，减少目录页被当正文章节
- PWA 缓存版本更新到 v0.7.0
- README 更新为 v0.7 功能完整性说明

### Notes

- `npm run build` 已通过验证
- `npm run cap:sync` 已通过验证
- `npm run android:debug` 已执行，当前在 Gradle 官方发行包下载阶段超时
- Android 原生 APK 构建仍依赖本机 JDK 21、Android SDK 和稳定 Gradle 下载环境
- v0.7.0 完成当前规划中的主要应用功能，后续重点转向原生构建环境和体验打磨

## v0.6.0 - 2026-05-29

QL 第六阶段发布版本。

### Added

- 添加 Capacitor Android 工程目录 `android`
- 添加 `capacitor.config.ts`，配置 Android 本地壳 hostname
- 添加 Capacitor 依赖 `@capacitor/core`、`@capacitor/android` 和 `@capacitor/cli`
- 添加 `cap:sync` 工程同步脚本
- 添加 `android:open` Android Studio 打开脚本
- 添加 `android:build` debug APK 构建脚本
- Android 原生版本号更新为 `0.6.0`
- Android 图标和启动图复用 QL 自有图标资源
- 前端在 Capacitor Android 本地壳环境下自动使用 HashRouter
- Service Worker 跳过 Capacitor / Android 本地壳环境
- 更新 README、版本说明和 PWA 缓存版本

### Changed

- Android Manifest 移除默认网络权限，保持本地阅读器定位
- Web App Manifest 描述同步更新为 TXT / EPUB 阅读器

### Notes

- `npm run build` 已通过验证
- `npm run cap:sync` 已通过验证
- `npm run android:build` 当前在下载 Gradle 官方发行包时超时；本机同时缺少 Android SDK，且 Java 版本为 8
- Capacitor 8 生成的 Android 工程使用 Java 21 编译级别，原生构建需要 JDK 21、Android SDK 和稳定网络后继续验证
- 本阶段是 Android 工程接入版本，不附带 APK 安装包

## v0.5.0 - 2026-05-29

QL 第五阶段发布版本。

### Added

- 添加 Tauri v2 工程目录 `src-tauri`
- 添加 Tauri Rust 入口、构建脚本和配置文件
- 添加 Tauri v2 默认 capability 配置
- 添加 Tauri 桌面端图标资源
- 添加 `tauri:dev` 开发脚本
- 添加 `tauri:build` 打包脚本
- 前端在 Tauri 本地壳环境下自动使用 HashRouter
- Service Worker 仅在 HTTP/HTTPS 环境注册，避免桌面壳环境误注册
- 更新 README、版本说明和 package 元信息

### Notes

- 当前机器未安装 Rust 工具链，Tauri 原生构建需要安装 Rust 后继续验证
- Web 构建已通过验证
- Electron unpacked exe 构建已在 v0.4.0 验证通过

## v0.4.0 - 2026-05-29

QL 第四阶段发布版本。

### Added

- 添加 Electron 桌面端入口
- 添加 Electron preload 脚本
- 添加 electron-builder Windows NSIS 打包配置
- 添加 Windows 应用图标资源
- 添加 `desktop:start` 本地桌面启动脚本
- 添加 `desktop:pack` Windows unpacked exe 构建脚本
- 添加 `desktop:dist` Windows exe 安装包构建脚本
- 在 `file://` 桌面环境下自动使用 HashRouter
- 在 Electron 本地文件环境下跳过 Service Worker 注册
- 更新 README、版本说明和 package 元信息

### Notes

- Electron 桌面端复用同一份 React + Vite 前端构建产物
- 当前已验证 Windows x64 unpacked exe 构建
- 当前构建未做代码签名
- NSIS 安装包构建依赖 electron-builder 官方 NSIS 工具下载
- 书籍和阅读设置仍保存在 Electron Chromium 的本地 IndexedDB / localStorage

## v0.3.0 - 2026-05-28

QL 第三阶段发布版本。

### Added

- 添加 EPUB 文件导入支持
- 使用 JSZip 在浏览器本地读取 EPUB 压缩包
- 解析 `META-INF/container.xml` 和 OPF package 文件
- 按 OPF spine 顺序生成阅读章节
- 支持 EPUB3 nav 和 EPUB2 NCX 目录标题提取
- 书架显示 TXT / EPUB 文件格式
- 导入按钮支持 `.txt` 和 `.epub`
- EPUB 章节正文继续保存到 IndexedDB
- 更新 README、版本说明和 PWA 缓存版本

### Notes

- EPUB 解析在浏览器本地完成，不上传文件
- 当前版本提取 EPUB 文本正文，不渲染 EPUB 内嵌样式、图片或脚注交互

## v0.2.0 - 2026-05-28

QL 第二阶段发布版本。

### Added

- 添加 Web App Manifest
- 添加 PWA 应用图标
- 添加生产环境 Service Worker 注册
- 添加应用壳缓存和同源静态资源运行时缓存
- 添加基础离线访问支持
- 添加浏览器安装提示按钮
- 更新 README、package 元信息和版本说明

### Notes

- Service Worker 仅在生产构建中注册，开发环境不启用缓存
- 当前 PWA 支持聚焦网页版安装与基础离线访问，不涉及 Electron、Tauri、Capacitor、exe 或 apk

## v0.1.0 - 2026-05-28

QL 第一阶段发布版本。

### Added

- 初始化 React 18 + TypeScript + Vite 项目
- 配置 Tailwind CSS v3、PostCSS 与 Autoprefixer
- 实现本地 TXT 文件导入
- 支持 UTF-8 与 GB18030 编码选择
- 实现 TXT 清理、章节识别和全文兜底解析
- 实现书架首页、空状态、书籍卡片和删除确认
- 使用 IndexedDB 保存书籍元数据、阅读进度和章节正文
- 使用 localStorage 保存阅读设置
- 实现阅读页、上一章、下一章、返回书架
- 实现章节目录抽屉和当前章节高亮
- 实现底部阅读设置面板
- 支持字号、行高、内容宽度、字体和主题切换
- 支持 light、dark、green、paper 四种阅读主题
- 支持滚动位置节流保存与刷新恢复
- 添加 README 项目说明

### Notes

- 当前版本只做网页版
- 不包含后端、登录、PWA、Electron、Tauri、Capacitor、exe 或 apk
- 小说文件只保存在浏览器本地，不会上传

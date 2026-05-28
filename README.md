# QL

![Version](https://img.shields.io/badge/version-v0.9.0-ef6a4d)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Android-2f2f2f)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38bdf8?logo=tailwindcss&logoColor=white)

QL 是一个本地小说阅读器。

它主要用来读本地 TXT 小说，也支持基础 EPUB 文本导入。没有登录，没有后端，不上传文件。书架、章节、进度和设置都保存在本机。

当前重点是两个版本：

| 平台 | 文件 | 说明 |
| --- | --- | --- |
| Android | `QL-v0.9.0-release.apk` | 手机阅读主力版本 |
| Windows | `QL-v0.9.0-win-unpacked.zip` | 解压后运行 `QL.exe` |

下载位置：[Releases](../../releases/latest)

## 功能

- 导入本地 TXT / EPUB 小说
- TXT 自动识别编码，支持 UTF-8、GB18030、UTF-16
- 自动识别章节，识别不到时按全文阅读
- 书架、目录、搜索、书签、阅读进度
- 阅读进度和滚动位置自动保存
- 手机端左右点击翻页、横向滑动翻页
- 支持音量键翻页
- 支持日间 / 夜间切换
- 支持字号、字重、字距、行距、段距
- 支持两端对齐、底部对齐
- 支持覆盖、滑动、仿真、滚动、无动画翻页
- 支持屏幕常亮、隐藏状态栏、隐藏导航栏、扩展到刘海
- 支持本地备份导入 / 导出

## 使用

手机端：

1. 下载 `QL-v0.9.0-release.apk`
2. 安装并打开 QL
3. 导入 TXT / EPUB
4. 开始阅读

电脑端：

1. 下载 `QL-v0.9.0-win-unpacked.zip`
2. 解压
3. 打开 `QL.exe`
4. 导入小说阅读

## 隐私

QL 是本地优先应用。

- 小说文件不会上传
- 不需要账号
- 不需要服务器
- 不收集阅读记录
- 小说正文保存在 IndexedDB
- 阅读设置保存在 localStorage

主要本地存储键：

```text
ql_book_metas
ql_book_chapters_${bookId}
ql_book_bookmarks_${bookId}
ql_reader_settings
```

清空应用数据后，书架和阅读进度也会被清空。

## 本地运行

环境要求：

- Node.js 18+
- npm

```bash
npm install
npm run dev
```

构建网页版：

```bash
npm run build
```

## 打包

Windows exe：

```bash
npm run desktop:pack
```

输出位置：

```text
release/win-unpacked/QL.exe
```

Android 同步：

```bash
npm run cap:sync
```

Android 本地构建还需要：

- JDK 21
- Android SDK / Android Studio
- `ANDROID_HOME` 或 `ANDROID_SDK_ROOT`

```bash
npm run android:debug
npm run android:release
```

正式 Release 由 GitHub Actions 自动构建 APK 和 Windows zip。

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
- Electron
- Capacitor Android

## 项目结构

```text
src/
  components/
  pages/
  store/
  styles/
  types/
  utils/
electron/
android/
.github/workflows/
```

## 常见问题

### TXT 打开后乱码怎么办？

删除这本书，重新导入。优先使用自动识别编码，也可以手动选择 GB18030 或 UTF-16。

已经乱码入库的正文不能自动修复，因为正文第一次导入时已经按错误编码保存到本地了。

### 为什么不用 localStorage 存正文？

localStorage 容量小，而且大文本同步读写容易卡顿。QL 使用 IndexedDB 保存章节正文，只用 localStorage 保存阅读设置。

### EPUB 支持完整吗？

目前只做基础文本提取和目录识别，不渲染 EPUB 内嵌样式、图片、音视频或复杂脚注。

## License

当前项目未指定开源许可证，默认保留所有权利。

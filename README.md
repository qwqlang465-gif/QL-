# QL

![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38bdf8?logo=tailwindcss&logoColor=white)

QL 是一个极简、美观、私密的本地 TXT / EPUB 小说阅读器。它只运行在浏览器里，不需要登录、不需要后端、不上传文件，适合把本地小说安静地放在自己的浏览器中阅读。

当前阶段：React + Vite 网页版 + Electron 桌面端打包。

仓库地址：[github.com/qwqlang465-gif/QL-](https://github.com/qwqlang465-gif/QL-)

## Overview

QL 的目标不是做一个复杂的在线阅读平台，而是做一个干净、舒服、移动端友好的本地阅读器。你可以把 TXT 或 EPUB 小说导入浏览器，QL 会在本地解析章节、保存书架、记录阅读进度，并提供类似移动端小说阅读 App 的沉浸式阅读体验。

适合：

- 本地 TXT / EPUB 小说阅读
- 私人浏览器书架
- 长时间中文小说阅读
- 不想登录、不想联网、不想上传文件的阅读场景

## Features

- 本地导入 `.txt` 和 `.epub` 小说
- 支持 UTF-8 与 GB18030 编码选择
- 使用浏览器 File API 与 TextDecoder 解码文本
- 使用 JSZip 在浏览器本地解析 EPUB
- 支持 EPUB3 nav 和 EPUB2 NCX 目录提取
- 自动解析章节，无章节时作为全文阅读
- 书架展示、阅读进度保存、书籍删除
- 阅读页支持上一章、下一章、章节目录跳转
- 支持字号、行高、内容宽度、字体和主题设置
- 支持 light、dark、green、paper 四种阅读主题
- 保存并恢复章节与滚动位置
- 支持 PWA 安装与基础离线访问
- 支持 Electron Windows exe 安装包打包
- 移动端优先的小说阅读 App 风格界面
- 不包含后端、账号系统、联网同步、Tauri 或移动端打包

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS v3
- Zustand
- React Router
- IndexedDB
- localStorage
- idb-keyval
- JSZip
- Electron
- electron-builder
- Web App Manifest
- Service Worker

## Privacy

QL 是本地优先的阅读器。

- 不需要账号
- 不需要联网
- 不上传小说文件
- 不收集阅读记录
- 不使用后端服务器
- 不把小说正文写入 localStorage

如果你清空浏览器站点数据，书籍、章节正文、阅读进度和阅读设置也会被清除。

## Local Storage

QL 的数据只保存在当前浏览器本地。

- IndexedDB 保存书籍元数据、阅读进度和章节正文
- localStorage 保存阅读设置
- 小说正文不会写入 localStorage
- 文件不会上传到任何服务器

IndexedDB 键：

- `ql_book_metas`：书架元数据与阅读进度
- `ql_book_chapters_${bookId}`：单本书章节正文

localStorage 键：

- `ql_reader_settings`：阅读设置

## 安装与运行

环境要求：

- Node.js 18 或更高版本
- npm

```bash
npm install
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

桌面端本地启动：

```bash
npm run desktop:start
```

Windows unpacked exe：

```bash
npm run desktop:pack
```

Windows exe 安装包：

```bash
npm run desktop:dist
```

说明：`desktop:pack` 会生成 `release/win-unpacked/QL.exe`。`desktop:dist` 会进一步生成未签名的 NSIS 安装包，首次运行可能需要从 electron-builder 官方发布源下载 NSIS 工具。

## Usage

1. 打开首页书架。
2. 导入 TXT 时选择文本编码，默认 UTF-8，也可以选择 GB18030。
3. 点击“导入 TXT / EPUB”并选择本地 `.txt` 或 `.epub` 文件。
4. 导入成功后点击书籍进入阅读页。
5. 在阅读页使用目录、上一章、下一章和阅读设置。

## Browser Support

推荐使用最新版桌面或移动端浏览器：

- Chrome
- Edge
- Safari
- Firefox

GB18030 解码依赖浏览器 `TextDecoder` 支持。如果当前浏览器不支持，QL 会显示友好错误提示，可以改用 UTF-8 文件或换用支持该编码的浏览器。

## Project Structure

```text
src/
  main.tsx
  App.tsx
  styles/
    index.css
  types/
    book.ts
  store/
    useLibraryStore.ts
    useReaderSettingsStore.ts
  utils/
    parseTxt.ts
    storage.ts
    file.ts
    format.ts
    throttle.ts
  components/
    Layout.tsx
    BookShelf.tsx
    BookCard.tsx
    EmptyState.tsx
    ImportButton.tsx
    Reader.tsx
    ReaderHeader.tsx
    ReaderBottomBar.tsx
    ChapterSidebar.tsx
    ReaderSettingsPanel.tsx
    IconButton.tsx
  pages/
    ShelfPage.tsx
    ReaderPage.tsx
electron/
  main.cjs
  preload.cjs
electron-builder.config.cjs
```

## Release

当前发布版本：`v0.4.0`

这是第四阶段版本，在 EPUB 支持基础上加入 Electron 桌面端封装和 Windows exe 安装包打包能力。

详细版本记录见 [CHANGELOG.md](./CHANGELOG.md) 和 [RELEASE_NOTES_v0.4.0.md](./RELEASE_NOTES_v0.4.0.md)。

## FAQ

### 小说文件会上传吗？

不会。QL 不包含后端，也不会上传文件。TXT / EPUB 文件会在浏览器本地读取和解析。

### 为什么不用 localStorage 保存小说正文？

localStorage 容量较小，并且同步读写大文本容易卡顿。QL 使用 IndexedDB 保存章节正文，localStorage 只保存阅读设置。

### 导入后乱码怎么办？

删除这本书，然后换一个编码重新导入。常见中文 TXT 可能是 UTF-8 或 GB18030。EPUB 通常自带 XHTML 内容，不需要手动选择编码。

### 换浏览器后书还在吗？

不在。QL 的数据保存在当前浏览器本地，不做云同步。

## Roadmap

- Tauri 打包桌面应用
- Capacitor 打包 apk
- 更完善的阅读进度同步
- 书签功能
- 搜索功能

## Maintainer

- [qwqlang465-gif](https://github.com/qwqlang465-gif)

## License

当前项目未指定开源许可证。默认保留所有权利。

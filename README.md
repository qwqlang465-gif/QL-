# QL

![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38bdf8?logo=tailwindcss&logoColor=white)

QL 是一个本地优先的 TXT / EPUB 小说阅读器。它面向个人阅读场景：导入本地小说，在浏览器或桌面壳中安静阅读，并把书架、章节和进度保存在本机。

项目的重点是阅读体验，而不是账号、同步或内容平台。QL 不需要登录、不需要后端，也不会上传小说文件。

## 当前状态

当前版本：`v0.5.0`

| 目标 | 状态 | 说明 |
| --- | --- | --- |
| React + Vite 网页版 | 已完成 | 支持 TXT / EPUB 导入、书架、阅读页、目录、设置和本地持久化 |
| PWA | 已完成 | 支持 manifest、图标、安装提示和基础离线访问 |
| Electron 桌面端 | 已接入 | 已验证 Windows unpacked exe，可运行 `npm run desktop:pack` |
| Tauri 桌面端 | 已接入工程 | 配置和脚本已完成；本机需要 Rust 工具链后才能原生构建 |
| 移动端 APK | 未开始 | 计划使用 Capacitor |

## 功能

- 导入 `.txt` 和 `.epub` 小说
- TXT 支持 UTF-8 与 GB18030 编码选择
- EPUB 使用 JSZip 在浏览器本地解析
- 支持 EPUB3 nav 和 EPUB2 NCX 目录标题提取
- 自动解析 TXT 章节，无章节时作为全文阅读
- 书架展示、删除、上次阅读章节和阅读时间
- 阅读页支持上一章、下一章、章节目录跳转
- 支持字号、行高、内容宽度、字体和主题切换
- 支持 light、dark、green、paper 四种阅读主题
- 保存并恢复章节和滚动位置
- 支持 PWA 安装和基础离线访问
- 支持 Electron / Tauri 桌面端工程

## 隐私与存储

QL 的数据只保存在本机浏览器或桌面壳对应的本地存储中。

- IndexedDB 保存书籍元数据、阅读进度和章节正文
- localStorage 保存阅读设置
- 小说正文不会写入 localStorage
- 不上传文件
- 不收集阅读记录
- 不需要账号或后端服务

使用的存储键：

- `ql_book_metas`
- `ql_book_chapters_${bookId}`
- `ql_reader_settings`

清空浏览器站点数据、Electron 应用数据或 Tauri WebView 数据后，书籍和阅读进度也会被清除。

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

## 安装

环境要求：

- Node.js 18 或更高版本
- npm

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

## 使用

1. 打开 QL。
2. 导入 TXT 时选择编码，默认 UTF-8，也可以选择 GB18030。
3. 点击“导入 TXT / EPUB”，选择本地小说文件。
4. 导入完成后在书架中打开书籍。
5. 在阅读页使用目录、上一章、下一章和阅读设置。

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
public/
  icons/
  manifest.webmanifest
  sw.js
```

## 已验证

- `npm run build`
- `npm run desktop:pack`
- `npm run tauri:build` 已执行，当前环境缺少 `cargo`，原生构建未完成

## 路线图

- Capacitor 打包 APK
- 书签功能
- 搜索功能
- 更细的阅读进度和位置管理
- 更完整的 EPUB 内容支持
- 可选的数据导出和导入

## FAQ

### 小说文件会上传吗？

不会。QL 没有后端上传逻辑，TXT / EPUB 都在本地读取和解析。

### 为什么正文不用 localStorage 保存？

localStorage 容量较小，并且同步读写大文本容易卡顿。QL 使用 IndexedDB 保存章节正文，只用 localStorage 保存阅读设置。

### TXT 乱码怎么办？

删除这本书，换 UTF-8 或 GB18030 重新导入。老 TXT 文件常见编码就是这两类。

### EPUB 支持到什么程度？

当前版本提取 EPUB 文本内容和目录标题，不渲染 EPUB 内嵌 CSS、图片、音视频或复杂脚注交互。

### 换浏览器后书还在吗？

不在。QL 是本地优先应用，不做云同步。

## License

当前项目未指定开源许可证。默认保留所有权利。

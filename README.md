# QL

QL 是一个极简、美观、私密的本地 TXT 小说阅读器。它只运行在浏览器里，不需要登录、不需要后端、不上传文件，适合把本地小说安静地放在自己的浏览器中阅读。

当前阶段：React + Vite 网页版。

## 项目特点

- 本地导入 `.txt` 小说
- 支持 UTF-8 与 GB18030 编码选择
- 使用浏览器 File API 与 TextDecoder 解码文本
- 自动解析章节，无章节时作为全文阅读
- 书架展示、阅读进度保存、书籍删除
- 阅读页支持上一章、下一章、章节目录跳转
- 支持字号、行高、内容宽度、字体和主题设置
- 支持 light、dark、green、paper 四种阅读主题
- 保存并恢复章节与滚动位置
- 移动端优先的小说阅读 App 风格界面
- 不包含后端、账号系统、联网同步、PWA、Electron 或移动端打包

## 技术栈

- React 18
- TypeScript
- Vite
- Tailwind CSS v3
- Zustand
- React Router
- IndexedDB
- localStorage
- idb-keyval

## 本地存储

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

## 使用方式

1. 打开首页书架。
2. 选择 TXT 编码，默认 UTF-8，也可以选择 GB18030。
3. 点击“导入 TXT 小说”并选择本地 `.txt` 文件。
4. 导入成功后点击书籍进入阅读页。
5. 在阅读页使用目录、上一章、下一章和阅读设置。

## 项目结构

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
```

## 当前版本

当前发布版本：`v0.1.0`

这是第一阶段版本，重点完成本地 TXT 小说阅读、书架管理、章节解析、阅读设置和本地持久化。

## 后续计划

- PWA 支持
- EPUB 支持
- Electron 打包 exe
- Tauri 打包桌面应用
- Capacitor 打包 apk
- 更完善的阅读进度同步
- 书签功能
- 搜索功能

## License

当前项目未指定开源许可证。默认保留所有权利。

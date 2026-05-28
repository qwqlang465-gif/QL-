# QL

QL 是一个极简、美观、私密的本地 TXT 小说阅读器。

当前阶段：React + Vite 网页版。

## 功能

- 本地导入 `.txt` 小说
- 支持 UTF-8 与 GB18030 编码选择
- 自动解析章节，无章节时作为全文阅读
- 书架、删除、阅读进度保存
- 阅读页上一章、下一章、章节目录跳转
- 字号、行高、内容宽度、字体和主题设置
- 滚动位置保存与恢复
- 移动端优先的小说阅读 App 风格界面

## 本地存储

- IndexedDB 保存书籍元数据、阅读进度和章节正文
- localStorage 保存阅读设置
- 小说文件不会上传，不需要登录，不需要后端

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

## 后续计划

- PWA 支持
- EPUB 支持
- Electron 打包 exe
- Tauri 打包桌面应用
- Capacitor 打包 apk
- 更完善的阅读进度同步
- 书签功能
- 搜索功能

# QL v0.1.0

QL 第一阶段发布版本。

这是一个本地 TXT 小说阅读器网页版，重点完成私密、本地、舒适的阅读体验。项目只运行在浏览器中，不需要登录、不需要后端、不上传文件。

## Highlights

- 本地导入 `.txt` 小说
- 支持 UTF-8 与 GB18030 编码选择
- 使用浏览器 File API 与 TextDecoder 解码文本
- 自动解析章节，无章节时作为全文阅读
- 书架首页与移动端小说阅读 App 风格 UI
- 阅读页支持上一章、下一章、章节目录跳转
- 支持字号、行高、内容宽度、字体和主题设置
- 支持 light、dark、green、paper 四种主题
- IndexedDB 保存书籍元数据、阅读进度和章节正文
- localStorage 保存阅读设置
- 支持章节与滚动位置保存恢复

## Storage

- `ql_book_metas`：书籍元数据和阅读进度
- `ql_book_chapters_${bookId}`：单本书章节正文
- `ql_reader_settings`：阅读设置

## Notes

- 当前版本只做 React + Vite 网页版
- 不包含后端、登录、PWA、Electron、Tauri、Capacitor、exe 或 apk
- 小说文件只保存在浏览器本地，不会上传
- GB18030 解码依赖浏览器 TextDecoder 支持

## Install

```bash
npm install
npm run dev
```

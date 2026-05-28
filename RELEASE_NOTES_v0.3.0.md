# QL v0.3.0

QL 第三阶段发布版本。

这个版本在 TXT 阅读和 PWA 支持基础上，加入 EPUB 导入能力。EPUB 文件会在浏览器本地解包和解析，章节正文继续保存到 IndexedDB，不上传文件、不需要后端。

仓库地址：https://github.com/qwqlang465-gif/QL-

## Highlights

- 支持导入 `.epub` 文件
- 使用 JSZip 在浏览器本地读取 EPUB 压缩包
- 解析 `META-INF/container.xml`
- 解析 OPF manifest 和 spine
- 支持 EPUB3 nav 目录标题
- 支持 EPUB2 NCX 目录标题
- 按 spine 顺序生成阅读章节
- 书架增加 TXT / EPUB 格式展示
- 导入按钮更新为 TXT / EPUB
- PWA 缓存版本升级到 `ql-pwa-v0.3.0`

## Notes

- 当前版本提取 EPUB 文本内容，不渲染 EPUB 内嵌 CSS、图片、音视频或复杂脚注交互
- EPUB 解析失败时会显示友好错误提示
- EPUB 正文和阅读进度仍然保存在浏览器 IndexedDB

## Install

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
npm run preview
```

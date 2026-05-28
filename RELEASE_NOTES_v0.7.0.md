# QL v0.7.0

QL 第七阶段发布版本。

这个版本把当前路线图里的主要应用功能收束到一起：阅读搜索、书签、阅读百分比、备份导入导出、EPUB 文本解析增强，以及 Android debug / release 构建脚本。

## Highlights

- 新增整本书搜索
- 新增搜索结果跳转
- 新增正文搜索高亮
- 新增书签面板
- 新增添加当前阅读位置书签
- 新增书签跳转和删除
- 新增阅读百分比保存
- 书架新增阅读百分比展示
- 新增 QL 备份导出
- 新增 QL 备份导入
- 备份包含书架、章节正文、阅读进度、书签和阅读设置
- 新增 `npm run android:debug`
- 新增 `npm run android:release`
- EPUB 解析增强：跳过 nav 目录页，并提取图片 alt/title 作为文本兜底

## Verification

- `npm run build` 已通过
- `npm run cap:sync` 已通过
- `npm run android:debug` 已执行，当前在 Gradle 官方发行包下载阶段超时
- Android APK 原生构建仍需要 JDK 21、Android SDK 和可正常下载 Gradle 官方发行包的网络环境

## Notes

- 小说文件仍然只保存在本机 IndexedDB
- 书签保存到 IndexedDB，不写入 localStorage
- 阅读设置仍保存到 localStorage
- 备份文件由用户手动导出，不会自动上传
- 当前版本不附带 APK 安装包

## Install

```bash
npm install
npm run dev
```

同步 Android 工程：

```bash
npm run cap:sync
```

构建 Android debug 包：

```bash
npm run android:debug
```

构建 Android release 包：

```bash
npm run android:release
```

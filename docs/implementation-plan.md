# GitHub 个人博客主页并行开发完成方案 v2

## 1. 当前状态

- 根目录已初始化为 `git` 仓库。
- `Astro` 工程已落地到当前仓库根目录，依赖已安装。
- `Tailwind CSS` 与字体依赖已经加入 `package.json`，但仍需接入正式页面体系。
- 已存在 GitHub Pages workflow，但当前仍错误引用了历史子目录 `mechanical-mercury/`。
- `posts / projects / site` 三类内容集合样例已加入，但页面仍主要依赖 Astro 默认 `blog` 模板结构。
- 首页、关于页、博客页、文章详情、README 仍处于默认模板或半改状态。
- 当前 Windows 路径含 `&`，`npm.cmd` 调用会受影响，本地构建需规避该路径解析问题。

## 2. 主干收口目标

- 统一内容模型，只保留 `site / posts / projects`，淘汰默认 `blog` 集合。
- 统一正式路由：
  - `/`
  - `/about`
  - `/projects`
  - `/posts`
  - `/posts/[slug]`
  - `/rss.xml`
  - `/404`
- 建立统一布局层：
  - `MainLayout`
  - `PostLayout`
- 将 `Tailwind CSS` 正式接入 `astro.config.mjs` 和全局样式体系。
- 修正 GitHub Pages workflow 为仓库根目录构建。
- 修正 README 与真实目录结构一致。

## 3. 并行线程划分

### Thread A：站点框架与设计系统

职责：
- 全局视觉系统：色板、字体、按钮、卡片、标签、分区标题、文章排版
- 完成 `Header`、`Footer`、`BaseHead`、`MainLayout`、`PostLayout`
- 采用研究员极简风格，移除 Astro 默认样式体系

写入边界：
- `src/styles/*`
- `src/components/*`
- `src/layouts/*`
- `astro.config.mjs`

### Thread B：首页与关于页

职责：
- 实现首页的 Hero、Focus Areas、Featured Projects、Latest Writing、Skill Matrix、Contact 引导
- 实现关于页并读取 `site/home.md`
- 页面只消费 `site / projects / posts` 数据，不硬编码业务内容

写入边界：
- `src/pages/index.astro`
- `src/pages/about.astro`

### Thread C：内容模型与内容样例

职责：
- 定义正式 `src/content.config.ts`
- 扩展 `site/home.md`
- 扩展 `projects` / `posts` 字段
- 清理默认 `src/content/blog/*`
- 补 2-3 篇首发文章样例和 2-3 个项目条目样例

写入边界：
- `src/content.config.ts`
- `src/content/site/*`
- `src/content/posts/*`
- `src/content/projects/*`

### Thread D：文章/项目路由与部署

职责：
- 实现 `/projects`
- 实现 `/posts`
- 实现 `/posts/[slug]`
- 修正 `rss.xml.js`
- 新增 `404`
- 修正 workflow
- 修正 README

写入边界：
- `src/pages/projects/*`
- `src/pages/posts/*`
- `src/pages/rss.xml.js`
- `src/pages/404.astro`
- `.github/workflows/*`
- `README.md`

## 4. 合并顺序

1. Thread C
2. Thread A
3. Thread B
4. Thread D
5. Integration / Polish

原因：
- 内容 schema 先稳定
- 设计系统次之
- 页面和路由在 schema + 设计系统稳定后再合并
- 最后统一做模板残留清理与联调

## 5. 验收清单

- 首页、关于、项目列表、文章列表、文章详情、404、RSS 全部可访问
- 首页展示真实 `site / projects / posts` 数据
- 不再使用默认 `blog` 集合
- GitHub Pages workflow 指向根目录构建
- README 与仓库结构一致
- 视觉风格统一为研究员极简
- 桌面端与移动端布局稳定
- 每轮改动记录进 `docs/progress-log.md`


# 内容同步说明

## 1. Obsidian 文章同步

当前仓库已经提交了本地同步脚本：

- `tools/sync-posts.mjs`
- `tools/lib/obsidian-sync.mjs`

执行方式：

```powershell
npm run sync:posts
```

配置来源：

- `content-sync.config.json`
- 环境变量 `OBSIDIAN_CONTENT_DIR`（优先级更高）

同步约定：

- 仅同步 `publish: true` 的笔记。
- 文章目标目录默认是 `src/content/posts/`。
- 附件目标目录是 `public/obsidian-assets/<slug>/`。
- 公开文章至少需要这些 frontmatter：
  - `title`
  - `description`
  - `date`
  - `tags`
  - `publish`
- 推荐补充这些字段，便于长期维护：
  - `updatedDate`
  - `slug`
  - `draft`
  - `featured`
- 同步时应额外完成两件事：
  - 把 `[[Wiki Link]]` 规范化为站内 `/posts/<slug>/` 链接。
  - 把 Obsidian 附件引用复制到 `public/obsidian-assets/` 并改写为公开 URL。

当前分支里已经有契约测试：

- `tests/obsidian-sync.test.mjs`
- 推荐写作模板：
  - `docs/templates/obsidian-post-template.md`
- 同步脚本会在输出目录维护 `.obsidian-sync-manifest.json`，只清理自己上一次生成的文章，不会删除你手写维护的文章文件。

## 2. GitHub 项目同步

仓库新增了定时 workflow：

- `.github/workflows/sync-github-projects.yml`
- 本地脚本：`tools/sync-projects.mjs`
- 同步核心：`tools/lib/github-project-sync.mjs`

触发方式：

- 每天 `02:17 UTC` 自动执行一次。
- 也可以在 GitHub Actions 页面手动运行。
- 本地可直接执行：

```powershell
npm run sync:projects
```

同步输入有两层：

1. `src/data/project-curation.json` 中的白名单与人工覆盖字段
2. GitHub API 返回的仓库事实字段

当前这条同步链不会回写 `src/content/projects/*.md`，而是预生成：

- `src/data/generated/projects.generated.json`

页面消费策略是：

- `/projects` 与首页精选优先读生成数据
- 现有 `src/content/projects/*.md` 仍作为手写项目内容兜底
- 如果生成数据和手写项目指向同一仓库，页面优先显示生成数据卡片

白名单项示例：

```json
[
  {
    "repo": "dkxSec/dkxSec.github.io",
    "category": "tooling",
    "status": "active",
    "featured": true,
    "summaryOverride": "基于 Astro 构建的研究型个人站点，用于承载文章、项目与长期技术积累。",
    "sortOrder": 100
  }
]
```

也可以直接复制模板：

- `docs/templates/project-curation-entry.template.json`

字段合并策略：

- `title`：优先 `titleOverride`，否则用 GitHub 仓库名。
- `summary`：优先 `summaryOverride`，否则用 GitHub `description`。
- `publishedDate`：默认用仓库 `created_at`。
- `updatedDate`：用仓库 `updated_at`。
- `status`、`category`、`featured`：固定来自白名单配置；仓库 archived 时强制置为 `archived`。
- `stack`：合并 GitHub `language`、`topics` 与可选人工 `stack` 补充。
- `repoUrl`：用 GitHub 仓库主页。
- `liveUrl`：优先 `liveUrlOverride`，否则用 GitHub `homepage`。

## 3. 环境变量与 Secrets

现有同步相关变量如下：

- `SITE_URL`
  - 用于 Pages 构建和 RSS / sitemap 的站点绝对地址。
  - 建议配置在 `Settings -> Secrets and variables -> Actions -> Variables`。
- `PROJECT_SYNC_TOKEN`
  - 可选 Secret。
  - 默认会回退到 workflow 自带的 `GITHUB_TOKEN`。
  - 当你要读取跨仓库、私有仓库，或命中更高 API 频率限制时，再单独配置。

## 4. 本地维护建议

- 本地开发与预览继续使用：

```powershell
.\tools\dev.ps1
.\tools\build.ps1
.\tools\preview.ps1
```

- 文章同步与项目同步都属于“内容源 -> `src/content/*`” 的预处理步骤。
- 日常刷新可直接执行：

```powershell
npm run sync:content
```

- 如果你希望把“同步内容 + 构建 + git add/commit/push”合并成一步，直接执行：

```powershell
.\tools\publish-content.ps1
```

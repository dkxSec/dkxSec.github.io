# dkx Personal Site

Astro 个人博客站点，应用根目录就是当前仓库根目录，面向 GitHub Pages 静态部署。

## 本地开发

```sh
npm install
npm run dev
```

当前 Windows 工作区路径为 `D:\desktop\AI安全&开发\github个人博客开发`，路径中包含 `&`。
这会导致部分通过 `npm.cmd` 间接启动的命令在某些 shell/脚本上下文里出现解析问题。开发时应优先：

- 直接在已进入该目录的 PowerShell 中执行 `npm` 命令
- 避免自己拼接未经引用的 Windows 路径到 `cmd`/批处理命令
- 如遇工具链兼容性问题，改用不含 `&` 的目录副本、junction 或仓库克隆路径
- 或直接使用仓库内的 PowerShell 脚本绕开 `npm.cmd`

推荐的本地命令：

```powershell
.\tools\dev.ps1
.\tools\build.ps1
.\tools\preview.ps1
```

常用命令：

| Command | Action |
| :-- | :-- |
| `npm run dev` | 启动本地开发服务器，默认地址为 `http://localhost:4321` |
| `npm run build` | 构建生产产物到 `dist/` |
| `npm run preview` | 本地预览构建结果 |

## 内容目录

当前内容以 Astro Content Collections 和预生成数据共同管理，示例目录如下：

- `src/content/posts/`: 正式文章集合，对应 `/posts` 与 RSS
- `src/content/projects/`: 手写项目内容与后续详情页内容壳
- `src/data/project-curation.json`: GitHub 仓库白名单与人工覆盖配置
- `src/data/generated/projects.generated.json`: GitHub 同步后的项目卡片数据
- `src/content/site/`: 站点级文案与 SEO 内容样例

当前已接入的页面路由：

- `src/pages/posts/index.astro`: 文章列表页
- `src/pages/posts/[slug].astro`: 文章详情页骨架与目录侧栏
- `src/pages/projects/index.astro`: 项目列表页
- `src/pages/rss.xml.js`: 从 `posts` 集合生成 RSS
- `src/pages/404.astro`: 自定义 404 页面

## 内容同步

仓库当前有两类内容同步能力：

- Obsidian 文章同步：将笔记库里 `publish: true` 的文章整理到 `src/content/posts/generated/`，并把附件复制到 `public/obsidian-assets/<slug>/`
- GitHub 项目同步：从白名单仓库拉取数据，预生成 `src/data/generated/projects.generated.json`

### Obsidian 文章同步

本地命令：

```powershell
npm run sync:posts
```

配置来源：

- `content-sync.config.json`
- 或环境变量 `OBSIDIAN_CONTENT_DIR`

同步规则：

- 公开文章至少需要 `title`、`description`、`date`、`tags`、`publish`
- 只有 `publish: true` 的笔记会被同步
- 输出目录默认是 `src/content/posts/generated/`
- Wiki Link 应被转换为站内 `/posts/<slug>/` 链接
- 附件引用应被复制到 `public/obsidian-assets/`
- 现有契约测试见 `tests/obsidian-sync.test.mjs`

### GitHub 项目同步

本地命令：

```powershell
npm run sync:projects
```

组合刷新命令：

```powershell
npm run sync:content
```

仓库新增了 `.github/workflows/sync-github-projects.yml`，用于每天 `02:17 UTC` 自动同步一次项目数据，也支持手动触发。同步结果写入 `src/data/generated/projects.generated.json`，项目页和首页会优先读取这份生成数据。

同步输入优先级：

1. `src/data/project-curation.json` 中的人工配置与覆盖字段
2. GitHub 仓库返回的事实字段

白名单项至少包括：

- `repo`
- `category`
- `status`
- `featured`

可选覆盖：

- `summaryOverride`
- `titleOverride`
- `liveUrlOverride`
- `sortOrder`
- `stack`

覆盖配置示例：

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

完整说明见 [docs/content-sync.md](D:\desktop\AI安全&开发\github个人博客开发\docs\content-sync.md)。

## GitHub Pages 部署

仓库根目录提供了 GitHub Actions workflow：`.github/workflows/deploy-github-pages.yml`。

启用方式：

1. 将默认分支设为 `main`。
2. 在 GitHub 仓库设置中启用 Pages，并选择 `GitHub Actions` 作为部署来源。
3. 首次部署前，按实际域名更新仓库变量 `SITE_URL`。
4. 如果 GitHub 项目同步需要访问私有仓库或跨仓库数据，再额外配置 Secret `PROJECT_SYNC_TOKEN`。

部署逻辑说明：

- 若仓库名为 `<user>.github.io`，站点将部署在根路径 `/`
- 若仓库名为普通项目仓库，workflow 会自动把 `BASE_PATH` 设为 `/<repo>`
- workflow 直接在仓库根目录执行 `npm ci`、`npm run build`，并上传根目录 `dist/`
- `astro.config.mjs` 已从 `SITE_URL` 和 `BASE_PATH` 读取部署参数，便于本地与 Pages 共享同一套配置
- `sync-github-projects.yml` 默认使用 `GITHUB_TOKEN` 读取公开仓库；需要更高权限时可切换到 `PROJECT_SYNC_TOKEN`
- 更完整的发布步骤见 [docs/deploy-checklist.md](D:\desktop\AI安全&开发\github个人博客开发\docs\deploy-checklist.md)

## 后续维护

- 发布文章时，优先按 `src/content.config.ts` 中 `posts` / `projects` 集合定义的 frontmatter 字段填写内容
- 如果希望项目页由 GitHub 仓库自动补齐信息，优先维护 `src/data/project-curation.json`
- 如果需要自定义域名，可将 `SITE_URL` 改为完整线上地址，并根据需要补充 `public/CNAME`

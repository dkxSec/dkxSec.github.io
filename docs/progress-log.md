# Progress Log

## 2026-05-03

### Main / Homepage UI Light Refresh

- 完成事项：
  - 将首页主视觉从深色面板风调整为白底研究员极简风
  - 重做 Hero 区结构，加入深色代码视窗、轻网格背景和关键指标摘要
  - 重构精选项目、最新文章、技能矩阵的卡片层次与排版节奏
  - 同步调整全局浅色 token、顶栏深色导航、页脚联系区和导航链接状态
- 修改文件：
  - `src/pages/index.astro`
  - `src/styles/global.css`
  - `src/components/Header.astro`
  - `src/components/HeaderLink.astro`
  - `src/components/Footer.astro`
- 验证：
  - 使用 `.\tools\build.ps1` 完成 Astro 静态构建，通过
- 风险 / 遗留：
  - 本轮已把共享基础视觉切到浅色体系，关于页、文章页、项目页虽然可正常构建，但尚未做逐页视觉细修
  - 目前只完成了构建级验证，尚未进行浏览器实机截图检查
- 下一步建议：
  - 打开本地首页做桌面端和移动端视觉复核
  - 如需更贴近参考稿，可继续补首页插图细节、文章缩略图和更精细的 spacing 微调

### Main / Coordination

- 完成事项：
  - 初始化并行实施文档 `docs/implementation-plan.md`
  - 创建统一进度记录入口 `docs/progress-log.md`
  - 启动多线程开发分工：内容模型、设计系统、路由部署、页面集成
- 修改文件：
  - `docs/implementation-plan.md`
  - `docs/progress-log.md`
- 风险 / 阻塞：
  - 当前 Windows 路径含 `&`，本地 `npm.cmd` 调用存在解析问题
  - 仓库仍有 Astro 默认模板残留，需待各线程合并后统一清理
- 下一步建议：
  - 等待 Thread A / C / D 完成
  - 主线接管首页与关于页实现
  - 最后统一做联调与构建验证

### Thread C / Content Model

- 完成事项：
  - 正式切换为 `site / posts / projects` 三类内容集合
  - 补充站点级配置、文章样例和项目样例
- 修改文件：
  - `src/content.config.ts`
  - `src/content/site/home.md`
  - `src/content/posts/*`
  - `src/content/projects/*`
- 风险 / 阻塞：
  - 子线程落下了不属于当前仓库的占位身份信息，主线已接管修正
  - 默认 `blog` 模板残留需由主线清理
- 下一步建议：
  - 主线统一字段名并接到首页、关于页、文章/项目路由

### Thread A / Design System

- 完成事项：
  - Tailwind v4 接入 Astro
  - 建立研究员极简风的全局 token、组件原语和布局层
- 修改文件：
  - `astro.config.mjs`
  - `src/styles/global.css`
  - `src/components/*`
  - `src/layouts/*`
- 风险 / 阻塞：
  - 导航、页脚仍残留旧路由指向，需在主线统一到正式路径
- 下一步建议：
  - 与内容模型和页面层统一收口

### Thread D / Routing and Deploy

- 完成事项：
  - 根目录 GitHub Pages workflow 已改正
  - README 已同步根目录构建方式
  - `/projects`、`/posts`、`/posts/[slug]`、`/404`、`rss.xml` 骨架已落地
- 修改文件：
  - `.github/workflows/deploy-github-pages.yml`
  - `README.md`
  - `src/pages/projects/*`
  - `src/pages/posts/*`
  - `src/pages/rss.xml.js`
  - `src/pages/404.astro`
- 风险 / 阻塞：
  - 路由线程是基于旧字段假设写的，主线需统一为 `date / summary / posts`
- 下一步建议：
  - 主线接管页面与 schema 的最终对齐，并完成构建验证

### Main / Integration and Verification

- 完成事项：
  - 清理默认 `blog` 模板路由和内容残留
  - 统一 `site / posts / projects` schema 与页面读取逻辑
  - 修正错误占位资料为 `dkx / dk6251`
  - 实现首页、关于页、项目列表、文章列表、文章详情页、404、RSS
  - 修正导航、页脚、README、包名与根目录构建方式
  - 使用 `node .\\node_modules\\astro\\bin\\astro.mjs build` 完成静态构建验证
- 修改文件：
  - `src/pages/index.astro`
  - `src/pages/about.astro`
  - `src/pages/projects/index.astro`
  - `src/pages/posts/index.astro`
  - `src/pages/posts/[slug].astro`
  - `src/pages/404.astro`
  - `src/pages/rss.xml.js`
  - `src/components/*`
  - `src/content/*`
  - `README.md`
  - `package.json`
- 风险 / 阻塞：
  - 当前 Windows 工作目录含 `&`，不适合依赖 `npm.cmd` 的默认命令链；本地验证需继续使用直接调用 Astro bin 的方式，或迁移到不含 `&` 的路径
- 下一步建议：
  - 补充真实头像、更多项目内容与文章
  - 如需更严格验收，可在无 `&` 路径下补浏览器级响应式与 Lighthouse 检查

### Main / Local Runtime Support

- 完成事项：
  - 新增 `tools/dev.ps1`、`tools/build.ps1`、`tools/preview.ps1`
  - 新增 GitHub Pages 上线清单 `docs/deploy-checklist.md`
  - README 补充 Windows `&` 路径下的本地运行建议
- 修改文件：
  - `tools/dev.ps1`
  - `tools/build.ps1`
  - `tools/preview.ps1`
  - `docs/deploy-checklist.md`
  - `README.md`
- 风险 / 阻塞：
  - 当前本地仓库尚未绑定远端，无法直接替你完成首发 push 和线上部署
- 下一步建议：
  - 绑定 GitHub 远端仓库
  - 推送到 `main`
  - 在 GitHub Pages 中启用 `GitHub Actions`

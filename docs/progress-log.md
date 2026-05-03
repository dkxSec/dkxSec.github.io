# Progress Log

## 2026-05-03

### Main / Docs and GitHub Project Sync

- 完成事项：
  - 新增 Obsidian 文章同步脚本、本地组合同步命令与契约测试
  - 新增 GitHub 项目同步脚本，按白名单生成 `src/data/generated/projects.generated.json`
  - 项目页与首页精选切到“生成数据优先，手写内容兜底”的读取方式
  - 新增定时 GitHub 项目同步 workflow，支持 schedule 与手动触发，并自动提交生成数据文件
  - README 与同步说明文档补齐 Obsidian 文章同步、GitHub 项目同步、本地命令和环境变量说明
- 修改文件：
  - `.github/workflows/sync-github-projects.yml`
  - `README.md`
  - `docs/content-sync.md`
  - `docs/deploy-checklist.md`
  - `docs/progress-log.md`
  - `content-sync.config.json`
  - `src/data/project-curation.json`
  - `src/data/generated/projects.generated.json`
  - `src/lib/project-feed.ts`
  - `src/pages/projects/index.astro`
  - `src/pages/index.astro`
  - `tools/lib/obsidian-sync.mjs`
  - `tools/lib/github-project-sync.mjs`
  - `tools/sync-posts.mjs`
  - `tools/sync-projects.mjs`
  - `tools/sync-content.mjs`
  - `tests/obsidian-sync.test.mjs`
  - `tests/github-project-sync.test.mjs`
  - `package.json`
- 验证：
  - `npm test`
  - `npm run sync:projects`
  - `npm run build`
- 风险 / 遗留：
  - `content-sync.config.json` 默认未填写 Obsidian 目录，首次本地同步前仍需要用户配置 `obsidian.sourceDir` 或 `OBSIDIAN_CONTENT_DIR`
  - 当前 GitHub 白名单只放了站点主仓库，后续需要继续补充需要展示的仓库
- 下一步建议：
  - 继续补充 `src/data/project-curation.json` 中的精选仓库
  - 为重点项目增加 Markdown 详情页内容壳

### Main / Homepage Motion Pass

- 完成事项：
  - 按 `Research Grid Motion` 方向为首页加入轻动态层
  - Hero 区新增浅网格漂移、柔和蓝色光斑、分区进入动画
  - 右侧代码窗新增缓慢浮动、扫描光和状态点脉冲
  - 项目卡、文章卡、指标卡、技能矩阵补充克制的 hover / pulse / scan 效果
  - 增加 `prefers-reduced-motion` 兜底，降低动画可访问性风险
- 修改文件：
  - `src/pages/index.astro`
  - `src/styles/global.css`
- 验证：
  - 使用 `.\tools\build.ps1` 完成 Astro 静态构建，通过
- 风险 / 遗留：
  - 当前动效主要通过 CSS 完成，仍未做浏览器级逐帧观感校准
  - 部分文章页和项目页仍沿用旧视觉假设，后续若继续增强全站交互，需先统一其它页面基调
- 下一步建议：
  - 在浏览器中重点复核 Hero、项目卡 hover 和技能矩阵 pulse 的强度是否过量
  - 如需更进一步，可继续加基于滚动的 section reveal，但应继续保持低幅度

### Main / Homepage Comment Fixes

- 完成事项：
  - 将顶栏左上角站点缩写替换为用户提供的头像资源
  - 为首页首个指标卡补充中文注解与说明文案
  - 将项目卡左上角缩写文字切换为微软雅黑字族，改善中文显示
- 修改文件：
  - `public/avatar.jpg`
  - `src/components/Header.astro`
  - `src/pages/index.astro`
- 验证：
  - 使用 `.\tools\build.ps1` 完成 Astro 静态构建，通过
- 风险 / 遗留：
  - 当前头像直接采用 `public/` 资源直出，后续若需要统一裁切或压缩，可再补图片处理流程
- 下一步建议：
  - 在线上页面复核头像裁切位置与指标卡中文注解密度
  - 如需统一中文气质，可再评估是否替换更多局部标题字体

### Main / Homepage Comment Follow-up

- 完成事项：
  - 为 `Published Posts` 与 `Focus Tracks` 指标卡补齐中文标签与注解
  - 将 `查看全部项目`、`查看全部文章` 链接改为微软雅黑并加粗
- 修改文件：
  - `src/pages/index.astro`
- 验证：
  - 使用 `.\tools\build.ps1` 完成 Astro 静态构建，通过
- 风险 / 遗留：
  - 当前“查看全部”链接已从等宽字风格切到中文字体，若后续继续统一 section 顶部语言气质，可能还需同步调整标题行
- 下一步建议：
  - 浏览器里复核两处链接在桌面端和移动端的字重与间距

### Main / GitHub Identity Update

- 完成事项：
  - 将仓库内旧 GitHub 账号引用从 `dk6251` 统一更新为 `dkxSec`
  - 同步修正站点默认 URL、项目仓库链接、部署文档和站点内容中的旧账号引用
  - 顺手修正首页站点内容里的 RSS 双斜杠链接
- 修改文件：
  - `src/consts.ts`
  - `astro.config.mjs`
  - `src/content/site/home.md`
  - `src/content/projects/*`
  - `docs/deploy-checklist.md`
  - `docs/progress-log.md`
- 验证：
  - 使用 `rg` 复查旧链接残留，未再命中
  - 使用 `.\tools\build.ps1` 完成 Astro 静态构建，通过
- 风险 / 遗留：
  - 本轮默认按账号和 GitHub Pages 域名都已切换到 `dkxSec / dkxsec.github.io` 处理；如果你只想改 GitHub 资料页、不改 Pages 域名，需要把站点 URL 与部署文档再切回
- 下一步建议：
  - 上线前确认 GitHub Pages 实际仓库名和 `SITE_URL` 环境变量与当前账号一致

### Main / List Page Title Contrast Fix

- 完成事项：
  - 修正 `/projects` 页标题与说明文字的浅底对比度问题
  - 修正 `/posts` 页标题、说明文字与卡片标题的浅底对比度问题
  - 顺手统一两页卡片底部分割线与 hover 边框颜色，使其更贴近当前白底主题
- 修改文件：
  - `src/pages/projects/index.astro`
  - `src/pages/posts/index.astro`
- 验证：
  - 使用 `.\tools\build.ps1` 完成 Astro 静态构建，通过
- 风险 / 遗留：
  - 当前仅修正了列表页标题和说明区的文字对比；如果还觉得不够显眼，下一轮可以进一步提高 `SectionHeading` 或页面主标题的视觉权重
- 下一步建议：
  - 浏览器中复核 `/projects` 与 `/posts` 页面首屏标题在桌面端和移动端的可读性

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
  - 修正错误占位资料为 `dkx / dkxSec`
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

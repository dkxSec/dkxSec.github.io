# GitHub Pages 上线清单

## 1. 仓库准备

1. 在 GitHub 上创建目标仓库。
2. 如果要作为用户主页，仓库名使用 `dkxsec.github.io`。
3. 如果要作为项目站，仓库名可以保持当前项目名，最终地址会是 `https://dkxsec.github.io/<repo>/`。
4. 在本地绑定远端：

```powershell
git remote add origin <your-repo-url>
git branch -M main
git add .
git commit -m "feat: initialize personal site"
git push -u origin main
```

## 2. Pages 配置

1. 打开 GitHub 仓库 `Settings -> Pages`
2. `Source` 选择 `GitHub Actions`
3. 可选：在 `Settings -> Secrets and variables -> Actions` 中添加仓库变量 `SITE_URL`

推荐值：

- 用户主页仓库：`https://dkxsec.github.io`
- 项目仓库：`https://dkxsec.github.io/<repo>`

## 3. 本地验证

如果当前 Windows 路径仍包含 `&`，优先使用这些脚本：

```powershell
.\tools\build.ps1
.\tools\dev.ps1
.\tools\preview.ps1
```

## 4. 发布后检查

1. 首页可访问
2. `/about`、`/projects`、`/posts` 可访问
3. 任意文章详情页可访问
4. `/rss.xml` 可访问
5. `sitemap-index.xml` 已生成
6. 页面标题、导航、外链正常

## 5. 后续增强

- 替换为真实头像或头图
- 增加更多真实项目条目
- 增加更完整的关于页介绍
- 如需自定义域名，再补 `public/CNAME`

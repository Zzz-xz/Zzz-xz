# Apps 页面维护

已实现应用目录 `/apps/` 和数据驱动详情 `/apps/[slug]/`。全站导航为 Collection、Apps、GitHub，头像返回主页。列表使用 `aria-current="page"`，详情中 Apps 使用 `aria-current="location"`。

## 新增应用

1. 在 `src/data/apps/` 新增 JSON，参考 `goodnight.json`。
2. 素材放入 `public/assets/apps/<slug>/`，填写真实图片尺寸、替代文本及截图说明。
3. 填写唯一 slug、平台、版本、状态、功能、使用步骤、注意事项及 HTTPS 外链。必须且只能指定一个 `primary: true` 下载入口；支持不同平台、商店链接，截图数组可为空。
4. 运行 `npm.cmd run build`（非 PowerShell 环境可用 `npm run build`），核对列表、详情和下载。
5. 内容集合自动生成路由，无需复制页面或修改导航。重复 slug、非法 URL、缺失主下载及无效图片尺寸会阻止构建或测试。

代码职责：

- `src/lib/app-schema.ts`：内容契约与路由唯一性检查。
- `src/lib/apps.ts`：构建时读取集合。
- `src/components/AppDetail.astro`：通用内容展示。
- `src/pages/apps/`：列表和静态详情路由。
- `public/css/apps.css`：页面样式，复用现有 `public/css/tokens.css`。
- `tests/apps.test.mjs`：数据、素材、路由和下载边界测试。

## Cloudflare Pages 构建环境

仓库根目录的 `.node-version` 固定 Node.js 为 `24.14.0`，与已验证的本地构建版本一致。该文件需要提交到 Git；`package.json` 的 `engines.node` 仅声明兼容要求，不能代替 Cloudflare 的版本选择配置。

Cloudflare Pages 项目使用以下设置：

- 构建根目录：包含 `package.json` 和 `.node-version` 的仓库目录。
- 构建命令：`npm run build`。
- 构建输出目录：`dist`。
- 若控制台已设置 `NODE_VERSION`，生产和预览环境均统一为 `24.14.0`，避免与仓库配置冲突。

提交并推送 `.node-version` 后，对包含此文件的新提交发起部署。检查构建日志中实际使用的 Node.js 为 `24.14.0`，并确认测试、类型检查和静态构建全部通过。若只想立即重试现有提交，也可以先在 Cloudflare Pages 的 Settings → Environment variables 中设置 `NODE_VERSION=24.14.0`，保存后重试部署。

2026-09-10 的失败日志使用 Node.js `22.16.0`，低于项目要求的 `>=24.0.0`；测试导入 `src/lib/app-schema.ts` 时出现 `ERR_UNKNOWN_FILE_EXTENSION`，未进入 Astro 构建。修复方式是统一构建运行时版本，保留现有测试及类型检查。

参考：[Cloudflare Pages 构建环境与版本覆盖配置](https://developers.cloudflare.com/pages/configuration/build-image/)。


## GoodNight 更新

发布新版本时同步更新 GitHub 附件、下载 Worker 的 RELEASE_TAGS 和 `goodnight.json` 的 version。本站不会在访客浏览时调用 GitHub API。

下载使用普通链接与服务端 Content-Disposition，明确设置 `data-astro-prefetch="false"`。不添加 APK 预取、Service Worker 预缓存、前端 Blob 下载或代理。默认主机沿用 `https://www.lingin.top`；本项目原先没有 sitemap，本次未另建重复索引机制。

当前图标来自 GoodNight 的 `docs/assets/goodnight-readme.png`。倒计时截图为用户于 2026-09-10 确认的当前 Release 运行原图 `E:/Personal_Code/release.png`（281 × 628），原样复制至 `public/assets/apps/goodnight/release-countdown.png`，无裁剪、放大或界面重绘。之前使用的 `temp/experience-active.png` 属于旧版本测试图，已替换并移除网站内的旧素材。MIT 链接仅说明应用许可证。

## 本地验收（2026-09-10）

- `npm.cmd run build`：13 项测试通过；Astro 0 错误、0 警告、0 提示；生成首页、Collection、Apps 和 GoodNight 共四个页面。
- Chrome 真实浏览器：四页面分别通过 320、360、375、390、414、768、1440 像素宽度检查；无横向溢出或被裁切的关键内容，导航垂直对齐。
- Apps 页面 200% 文字放大、键盘下载焦点、图片 alt、减少动画均通过。减少动画模式下不创建水纹 canvas，普通模式每页最多一个实例。
- 首页水莲及时间页脚，Collection 搜索、清空、分类锚点及声明通过。回归中修复了原有 grid 样式覆盖 hidden 属性的问题。
- Apps 列表/详情/返回、直接访问、刷新、浏览器前进后退通过。未知 slug 返回 404。
- 四个下载入口均经 latest 跳转至 v1.0.0 并返回 APK Content-Type；GitHub 备用下载及 main 分支 MIT 链接返回 200。
- 浏览器点击前没有 APK 请求；点击后成功完整下载通用版，49,265,368 字节，ZIP 完整性通过。SHA-256 与 GitHub Release 附件摘要一致：

```text
0efc40bf02fe9909d2fb42dc9461ded5afdab25c3c040af2e04d9ac442fa0220
```

浏览器报告、桌面/手机截图、临时测试工具及 APK 位于已忽略的 `artifacts/apps/` 和 `.cache/browser-testing/`，不提交。没有修改项目依赖。

预览：`npm.cmd run preview -- --host 127.0.0.1 --port 4321`，打开 `http://127.0.0.1:4321/apps/`。停止预览：`npm.cmd run preview -- stop`。

尚未执行线上部署、真实手机安装、各 Android 厂商兼容性或断点续传测试。本次是网站开发及下载验收，不将已有应用验收视为本轮重新验证。

建议提交信息：`feat(apps): add app catalog and GoodNight download page`。

补充验证：临时第二款应用已成功生成独立详情，并验证无截图、单一商店下载入口的模板分支；临时数据已移除，最终构建仅含真实应用。APK 元数据确认为 versionName 1.0.0、versionCode 2、最低 API 28（Android 9），与页面一致。
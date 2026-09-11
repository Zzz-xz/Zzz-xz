# Apps 开发与维护

Apps 使用 Astro 内容集合生成应用列表和详情页。应用信息与展示模板分离，增加应用无需复制页面。

## 路由与模块

| 文件或目录 | 职责 |
| --- | --- |
| `src/data/apps/` | 应用内容数据 |
| `src/lib/app-schema.ts` | 内容结构、下载入口和路由唯一性校验 |
| `src/lib/apps.ts` | 读取并整理应用集合 |
| `src/pages/apps/index.astro` | 应用列表 `/apps/` |
| `src/pages/apps/[slug].astro` | 按 slug 生成静态详情页 |
| `src/components/AppDetail.astro` | 通用详情模板 |
| `public/assets/apps/` | 随站点发布的应用图标和截图 |
| `public/css/apps.css` | 应用页面样式 |
| `tests/apps.test.mjs` | 内容、素材及路由边界测试 |

页面复用共享导航、布局和设计变量。Apps 列表使用 `aria-current="page"` 标记导航状态，详情页使用 `aria-current="location"`。只有内容集合中的应用会生成详情路由，未知 slug 应由静态托管服务返回 404。

## 新增应用

1. 在 `src/data/apps/` 新增 JSON，参考 `goodnight.json` 的字段结构。
2. 设置唯一的 slug，并填写名称、摘要、支持平台、发布状态、版本及排序值。
3. 提供功能介绍、使用步骤、注意事项、源码地址、更新记录和许可证链接。
4. 将图标和真实发布版截图加入 `public/assets/apps/<slug>/`，填写站点资源地址、实际宽高、替代文本和截图说明。没有可用截图时使用空数组。
5. 配置下载入口，必须且只能有一项设置为 `primary: true`。入口支持安装包和应用商店链接，不要求所有应用使用相同平台或架构。
6. 执行检查和构建，确认列表、详情及下载链接正确。

外部链接必须使用 HTTPS，不得包含用户名、密码或临时访问凭据。应用说明、版本、兼容性及截图应对应实际发布内容，不使用占位应用或未经核实的宣传数据。

## 版本与下载维护

应用版本统一维护在对应 JSON 的 `version` 字段中。可选的 `release` 对象包含 `date`（有效的 YYYY-MM-DD 发布日期）、`summary`（更新摘要）、`changes`（更新条目）和 `upgradeNotice`（升级提示）；填写时应提供全部字段。列表与详情共用这些数据，发布日期以正式 Release 为准，不使用站点构建日期。没有更新说明的应用可省略整个 `release` 对象。

GoodNight 的四种架构下载入口统一使用 `https://download.lingin.top/goodnight/latest/<架构>.apk`，`fallbackUrl` 使用 GitHub 的 `/releases/latest`。发布新版本时无需改写这些入口；其他应用也应优先使用下载服务提供的稳定入口或商店链接，不假设所有服务都支持 `latest`。

`latest` 的实际版本由下载服务决定，不由页面中的 `version` 字段决定，也不能仅凭路径名称认定它会自动跟随 GitHub Release。每次发布须确认下载服务已切换到最新正式版，逐个验证架构、重定向目标与附件，并同步 `version` 和 `release` 展示信息。下载服务应避免缓存旧的 `latest` 跳转，保留固定版本地址以支持旧链接。

`releaseUrl` 对应页面展示的更新说明，使用该版本的 Release 地址；历史记录同样保留固定版本链接。若展示具体包大小或 SHA-256，应将它们与固定版本下载配对，避免稳定入口升级后校验信息仍属于旧版。

下载通过普通链接交由浏览器处理，安装包响应由下载服务提供 Content-Disposition。下载链接设置 `data-astro-prefetch="false"`，防止页面访问触发安装包预取。不得将 APK 加入预缓存，也不需要前端 Blob 下载、代理接口或访客侧 GitHub API 请求。

图标与截图使用仓库内的公开素材，不依赖仓库外的文件。图片应明确宽高，首屏外图片延迟加载。更新素材时检查并移除 EXIF、XMP 等可能携带个人信息或编辑记录的附加元数据。

每个应用的许可证仅适用于对应项目。第三方字体和脚本的版权声明及许可证应保留，不将应用许可证扩大到全部站点资源。

## 构建与部署

Node.js 版本以仓库根目录的 `.node-version` 为准，npm 版本以 `package.json` 的 `packageManager` 为准。

```sh
npm ci
npm run check
npm run build
```

生产构建会执行资源校验、测试和 Astro 类型检查，静态文件输出至 `dist`。

Cloudflare Pages 配置：

| 配置项 | 值 |
| --- | --- |
| 构建根目录 | 包含 `package.json` 和 `.node-version` 的仓库目录 |
| 构建命令 | `npm run build` |
| 输出目录 | `dist` |
| Node.js 版本 | 由 `.node-version` 指定 |

若托管平台另设 `NODE_VERSION`，应与 `.node-version` 保持一致，并同步生产及预览环境。`engines.node` 声明兼容范围，不能代替托管平台的运行时版本配置。部署时确认实际使用的 Node.js 版本符合要求。

站点主机名由 `astro.config.mjs` 的 `site` 配置决定，新增页面应通过共享布局生成 canonical 地址。

## 提交前检查

- 内容校验、测试、类型检查和生产构建通过。
- 列表、详情、返回导航、刷新、直接访问及未知 slug 行为正确。
- 窄屏、平板和桌面无内容溢出；文字放大、键盘焦点、图片替代文本和减少动画设置可用。
- 下载链接仅在用户操作后触发，安装包版本与页面一致；需要校验值时，以对应发布附件为准。
- 首页与 Collection 的既有功能正常，页面没有新增资源加载错误。
- 提交仅包含源码、维护文档和必要的公开素材，不包含凭据、个人设备信息、调试记录或生成产物。

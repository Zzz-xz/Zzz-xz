# 第三方资源

本目录保存随站点分发的第三方脚本与字体，页面加载不依赖外部 CDN。

| 资源 | 固定版本 | 项目地址 | 许可证 |
| --- | --- | --- | --- |
| jQuery | 3.7.1 | https://github.com/jquery/jquery | [许可证](licenses/jquery-LICENSE.txt) |
| jquery.ripples | 0.5.3 | https://github.com/sirxemic/jquery.ripples | [许可证](licenses/jquery-ripples-LICENSE.txt) |
| Maple Mono NL CN | 7.9，Regular / Medium 核心子集与 Unicode 分片 | https://github.com/subframe7536/maple-font | [许可证](licenses/maple-mono-OFL.txt) |
| Noto Sans SC | 中文回退页面字符子集 | https://github.com/google/fonts/tree/main/ofl/notosanssc | [许可证](licenses/noto-sans-sc-OFL.txt) |

更新资源时，应同步更新版本号、许可证文件和 HTML/CSS 中的资源引用。页面按需加载 Unicode 字体分片；升级字体版本时，可使用仓库中的 `scripts/build-maple-font-shards.py` 重新生成分片。

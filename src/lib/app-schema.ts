/**
 * @file app-schema.ts
 * @brief 定义自有应用的内容契约，在构建时阻止无效地址与不完整下载信息。
 */
import { z } from 'astro/zod';

const text = z.string().trim().min(1);
const httpsUrl = z.url().refine((value) => {
    try {
        const url = new URL(value);
        return url.protocol === 'https:' && !url.username && !url.password && !/[\s。]/u.test(value);
    } catch {
        return false;
    }
}, '应用外链必须是无凭据的 HTTPS 地址');
const imageSchema = z.object({
    src: z.string().regex(/^\/assets\/apps\/[a-z0-9/_-]+\.(png|webp|svg)$/),
    alt: text,
    width: z.number().int().positive(),
    height: z.number().int().positive()
});

/** 应用支持不同平台及商店链接；主入口显式声明，不依赖设备识别。 */
export const appSchema = z.object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: text.max(80),
    summary: text.max(200),
    platforms: z.array(text).min(1),
    status: text,
    version: text,
    release: z.object({
        date: z.iso.date(),
        summary: text.max(200),
        changes: z.array(text).min(1),
        upgradeNotice: text
    }).optional(),
    order: z.number().int().nonnegative(),
    sourceUrl: httpsUrl,
    releaseUrl: httpsUrl,
    fallbackUrl: httpsUrl,
    license: z.object({ name: text, url: httpsUrl }),
    icon: imageSchema,
    screenshots: z.array(imageSchema.extend({ caption: text })),
    features: z.array(text).min(1),
    usage: z.array(text).min(1),
    notes: z.array(text).min(1),
    downloadHelp: text,
    downloads: z.array(z.object({
        label: text,
        architecture: text,
        description: text,
        url: httpsUrl,
        primary: z.boolean()
    })).min(1)
}).refine((app) => app.downloads.filter((download) => download.primary).length === 1, {
    message: '必须且只能指定一个主下载入口',
    path: ['downloads']
});

export type AppDefinition = z.infer<typeof appSchema>;

/**
 * 将内容条目整理为稳定路由，阻止重复 slug 覆盖其他应用。
 * @param entries 内容集合中的应用数据。
 * @returns 按顺序排列的应用副本及站内地址。
 * @throws slug 重复时抛出错误，中止构建。
 * @note 不修改传入数组，不访问网络。
 */
export function buildAppCatalog(entries: AppDefinition[]) {
    const slugs = new Set<string>();
    for (const entry of entries) {
        if (slugs.has(entry.slug)) throw new Error(`应用 slug 重复：${entry.slug}`);
        slugs.add(entry.slug);
    }
    return [...entries]
        .sort((first, second) => first.order - second.order || first.slug.localeCompare(second.slug))
        .map((entry) => ({ ...entry, href: `/apps/${entry.slug}/` }));
}

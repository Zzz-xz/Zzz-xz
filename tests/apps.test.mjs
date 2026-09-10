/**
 * @file apps.test.mjs
 * @brief 验证应用内容、路由冲突、外链及素材边界，保证新应用无需复制页面。
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { appSchema, buildAppCatalog } from '../src/lib/app-schema.ts';

const apps = readdirSync(new URL('../src/data/apps/', import.meta.url))
    .filter((file) => file.endsWith('.json'))
    .map((file) => JSON.parse(readFileSync(new URL(`../src/data/apps/${file}`, import.meta.url), 'utf8')));
const sample = apps[0];

test('正式应用数据有效且图像位于静态目录，PNG 尺寸与声明一致', () => {
    for (const app of apps) {
        assert.equal(appSchema.safeParse(app).success, true);
        for (const image of [app.icon, ...app.screenshots]) {
            const path = new URL(`../public${image.src}`, import.meta.url);
            assert.equal(existsSync(path), true, image.src);
            if (image.src.endsWith('.png')) {
                const png = readFileSync(path);
                assert.equal(png.subarray(1, 4).toString(), 'PNG');
                assert.equal(png.readUInt32BE(16), image.width);
                assert.equal(png.readUInt32BE(20), image.height);
            }
        }
    }
    assert.equal(buildAppCatalog(apps).length, apps.length);
});

test('多应用生成独立路由、稳定排序且不改动原数组', () => {
    const second = { ...sample, slug: 'another-app', name: '另一个应用', order: sample.order + 1 };
    const input = [second, sample];
    assert.deepEqual(buildAppCatalog(input).map((app) => app.href), [`/apps/${sample.slug}/`, '/apps/another-app/']);
    assert.equal(input[0], second);
    assert.deepEqual(buildAppCatalog([]), []);
    assert.throws(() => buildAppCatalog([sample, { ...sample }]), /slug 重复/);
});

test('无效 slug、非 HTTPS 外链、凭据、中文句号和路径穿越阻止构建', () => {
    for (const slug of ['', '../home', 'two/slugs', 'with space']) {
        assert.equal(appSchema.safeParse({ ...sample, slug }).success, false);
    }
    for (const sourceUrl of ['', 'not-a-url', 'javascript:alert(1)', 'http://example.com', 'https://user:pass@example.com', 'https://example.com/。']) {
        assert.equal(appSchema.safeParse({ ...sample, sourceUrl }).success, false);
    }
    assert.equal(appSchema.safeParse({ ...sample, icon: { ...sample.icon, src: '/assets/apps/../secret.png' } }).success, false);
    assert.equal(appSchema.safeParse({ ...sample, icon: { ...sample.icon, width: 0 } }).success, false);
    assert.equal(appSchema.safeParse(null).success, false);
});

test('下载入口必须有且只有一个主选项，支持不同平台及商店地址', () => {
    assert.equal(appSchema.safeParse({ ...sample, downloads: [] }).success, false);
    assert.equal(appSchema.safeParse({ ...sample, downloads: sample.downloads.map((item) => ({ ...item, primary: false })) }).success, false);
    assert.equal(appSchema.safeParse({ ...sample, downloads: sample.downloads.map((item) => ({ ...item, primary: true })) }).success, false);
    assert.equal(appSchema.safeParse({
        ...sample, platforms: ['iOS'], screenshots: [],
        downloads: [{ label: 'App Store', architecture: 'iOS', description: '前往商店', url: 'https://apps.apple.com/app/example', primary: true }]
    }).success, true);
});

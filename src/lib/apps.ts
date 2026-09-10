/**
 * @file apps.ts
 * @brief 封装应用集合读取，使列表与静态详情路由使用同一份数据。
 */
import { getCollection } from 'astro:content';
import { buildAppCatalog } from './app-schema';

/**
 * 读取并整理所有应用。
 * @returns 经过内容校验、排序并补充站内地址的应用列表。
 * @throws 内容无效或路由重复时向构建流程报告错误。
 * @note 仅在构建时读取本地内容，不请求远程服务。
 */
export async function getApps() {
    const entries = await getCollection('apps');
    return buildAppCatalog(entries.map((entry) => entry.data));
}

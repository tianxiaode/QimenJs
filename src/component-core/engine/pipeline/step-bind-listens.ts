/**
 * step-bind-listens.ts — 绑定外部事件订阅 + i18n 系统事件
 *
 * 1. 绑定组件声明的 listens（节点/实体/路由/文件/系统事件）
 * 2. 自动检测 i18nNodes/_i18nFields，有 i18n 内容时自动绑定
 *    i18n:localeChange → _refreshI18n（内置自动刷新）
 *    onLocaleChange 保留给组件自定义的特殊逻辑
 */

import type { InitContext } from '../../types/init-context';
import { ListensEngine } from '../ListensEngine';
import { SystemEventBus } from '@/events/SystemEventBus';

/** 管线步骤：绑定外部事件订阅 */
export function bindListens(ctx: InitContext): void {
    const { instance } = ctx;
    const listens = instance.constructor.listens ?? instance.listens;
    if (listens) {
        ListensEngine.bindListens(instance, listens);
    }

    bindI18nLocaleChange(instance);
}

/**
 * 自动绑定 i18n:localeChange 系统事件
 *
 * 当组件有 i18nNodes 或 _i18nFields 时，自动订阅 localeChange 事件，
 * 触发 _refreshI18n 内置刷新。onLocaleChange 保留给组件自定义逻辑。
 */
function bindI18nLocaleChange(instance: any): void {
    const hasI18nNodes = instance.nodeMapMgr?.i18nNodes?.length > 0;
    const hasI18nFields = Object.keys(instance._i18nFields ?? {}).length > 0;

    if (!hasI18nNodes && !hasI18nFields) return;

    const bus = SystemEventBus.getInstance();
    const off = bus.on('i18n:localeChange', () => {
        instance._refreshI18n?.();
        instance.onLocaleChange?.();
    });
    instance.onCleanup(off);
}

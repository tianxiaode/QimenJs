/**
 * MsgboxManager — msgbox 实例管理器
 *
 * 单例模式，管理 msgbox 实例的创建和销毁调度。
 * Msgbox 类内聚了 el 管理、节点缓存、事件绑定、动画、销毁等全部功能，
 * MsgboxManager 只负责创建/销毁调度。
 */

import { Msgbox } from './Msgbox';
import type { MsgboxOptions, MsgboxResult, MsgboxType } from './types';

export class MsgboxManager {
    private static instance: MsgboxManager;

    private instances = new Set<Msgbox>();

    private constructor() {}

    static getInstance(): MsgboxManager {
        if (!MsgboxManager.instance) {
            MsgboxManager.instance = new MsgboxManager();
        }
        return MsgboxManager.instance;
    }

    /**
     * 创建 msgbox 实例
     */
    create(options: MsgboxOptions & { type: MsgboxType }): Promise<MsgboxResult> {
        let resolveFn!: (result: MsgboxResult) => void;
        const promise = new Promise<MsgboxResult>(resolve => {
            resolveFn = resolve;
        });

        const instance = new Msgbox(options, resolveFn);
        instance.onClose = () => {
            this.instances.delete(instance);
        };
        this.instances.add(instance);

        return promise;
    }
}

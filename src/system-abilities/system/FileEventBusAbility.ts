/**
 * FileEventBusAbility 文件事件总线系统能力
 *
 * 将 FileEventBus 单例的方法暴露为组件实例方法，
 * 组件可直接通过 this.fileEmit() / this.fileOn() 调用，
 * 无需手动获取 FileEventBus.getInstance()。
 *
 * fileEmit 只接收 EventContext，由发送方构建。
 * FileEventBus 内部从 ctx.source 提取 fileKey，从 ctx.type 提取 action。
 *
 * 与 EntityEventBusAbility / OverlayEventBusAbility 同构：
 * - fileOn 返回的取消订阅函数经 this.onCleanup 注册，组件销毁时自动清理
 * - 组件借此与 FileDispatchCenter 解耦，不直接 import 调度中心
 *
 * 通信范式：
 * - 命令（select/upload/remove/cancel/download/clear/setItems）：组件 fileEmit → 中心监听
 * - 反馈（selected/uploaded/uploadProgress/...）：中心 fileEmit → 组件 fileOn
 * - 通道生命周期（createChannel/connect/disconnect）：仍为直接调用 fileDispatchCenter
 */

import type { AbilityDefinition } from '@/composable';
import { FileEventBus } from '@/events';
import type { EventContext } from '@/context';

export const FileEventBusAbility = {
    fileEmit(ctx: EventContext): void {
        FileEventBus.getInstance().fileEmit(ctx);
    },

    fileOn(fileKey: string, action: string, handler: (data: any) => void): () => void {
        const off = FileEventBus.getInstance().fileOn(fileKey, action, handler);
        this.onCleanup(off);
        return off;
    },

    fileOnce(fileKey: string, action: string, handler: (data: any) => void): void {
        FileEventBus.getInstance().fileOnce(fileKey, action, handler);
    },
} satisfies AbilityDefinition;

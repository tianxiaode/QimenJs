import { OptionDecl } from '@/composable';
import { IComponentCore } from './component';

/**
 * 选项处理器接口
 *
 * 用于处理组件选项变更时的自定义逻辑
 *
 * @interface IOptionHandler
 */
export interface IOptionHandler {
    /**
     * 处理器名称，用于标识和调试
     */
    name: string;

    /**
     * 处理选项变更
     *
     * @param key - 选项键名
     * @param value - 新值
     * @param old - 旧值
     * @param definition - 选项定义
     * @param component - 组件实例
     * @returns 是否已处理（true 表示已处理，不再执行默认逻辑）
     */
    handler: OptionHandlerFn;
}

/**
 * 选项处理器函数类型
 *
 * @type OptionHandlerFn
 */
export type OptionHandlerFn = (
    value: any,
    component: IComponentCore,
    definition?: OptionDecl
) => boolean;

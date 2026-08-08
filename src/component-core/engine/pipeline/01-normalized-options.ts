import { ComponentOptions, InitContext, StructuredOptions } from '../../types';
import { splitOptions } from '../utils';

// steps/normalize-options.ts

/**
 * 管道步骤：标准化选项
 *
 * 将平铺配置转换为结构化配置（$props、$attrs、$options）
 */
export function normalizeOptions(ctx: InitContext): void {
    const { instance } = ctx;
    const { options } = instance;

    instance.logger.debug(
        `[prepare:normalize-options]`,
        `[${instance.type}]:[${instance.id}]`,
        '开始标准化'
    );

    // 已经是结构化配置，跳过
    if (isStructuredOptions(options)) {
        instance.logger.debug(
            `[prepare:normalize-options]`,
            `[${instance.type}]:[${instance.id}]`,
            '已是结构化配置，跳过'
        );
        return;
    }
    const parent = (options as ComponentOptions).parent;
    const slotName = (options as ComponentOptions).slotName;
    const container = (options as ComponentOptions).container;
    delete (options as ComponentOptions).parent;
    delete (options as ComponentOptions).slotName;

    // 拆分平铺配置
    const { props, attrs, options: config } = splitOptions(options);

    // 替换为结构化配置
    instance.options = {
        parent,
        slotName,
        container,
        $props: props,
        $attrs: attrs,
        $options: config,
    };

    instance.logger.debug(
        `[prepare:normalize-options]`,
        `[${instance.type}]:[${instance.id}]`,
        '标准化完成',
        instance.options
    );
}

/**
 * 判断是否为结构化配置
 */
function isStructuredOptions(options: any): options is StructuredOptions {
    return !!(options.$props || options.$attrs || options.$options);
}

import type { AbilityDefinition } from '@/composable';

export const OptionAbility: AbilityDefinition = {
    /**
     * 获取选项值
     */
    _getOptions(nodeName: string) {
        return this.getNode(nodeName).options ?? {};
    },

    /**
     * 设置选项值
     */
    _getOption(nodeName: string, key: string): any | undefined {
        return this._getOptions(nodeName)[key];
    },

    hasParent: {
        get(): boolean {
            return this._hasParent ?? this._getOption('root', 'hasParent');
        },
    },

    container: {
        get(): HTMLElement | undefined {
            return this._getOption('root', 'container');
        },
    },
} satisfies AbilityDefinition;

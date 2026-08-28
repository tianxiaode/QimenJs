import type { AbilityDefinition } from '@/composable';

export const OptionAbility: AbilityDefinition = {
    getNodeOption(nodeName: string, key?: string): any {
        const options = this.getNode(nodeName).options ?? {};
        return key ? options[key] : options;
    },

    setNodeOption(nodeName: string, key: string, value: any): void {
        const node = this.getNode(nodeName);
        if (!node.options) {
            node.options = {};
        }
        node.options[key] = value;
    },

    hasParent: {
        get(): boolean {
            return this._hasParent ?? this.getNodeOption('root', 'hasParent');
        },
    },

    container: {
        get(): HTMLElement | undefined {
            return this.getNodeOption('root', 'container');
        },
    },
} satisfies AbilityDefinition;
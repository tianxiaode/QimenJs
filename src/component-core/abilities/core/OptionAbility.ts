import { OPTION_ATTRIBUTE_PROPS, OPTION_STYLE_PROPS } from '@/component-core/constants';
import { type AbilityDefinition, type TargetToOptionDefinition } from '@/composable';

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

    _onOptionChange(key: string, value: any, old: any, def: TargetToOptionDefinition): void {
        if (value === old) return;
        if (OPTION_STYLE_PROPS.has(key)) {
            this.setStyles({ [key]: value });
            return;
        }
        if (OPTION_ATTRIBUTE_PROPS.has(key)) {
            this.setAttributes({ [key]: value });
        }
        if (def) {
            if (def.i18n) {
                this._applyI18nToElement(key, def);
                return;
            }
            this._applyContentToElement(def.target ?? 'root', value, def.to);
        }
    },
} satisfies AbilityDefinition;

import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@/component-core';
import { AVATAR_TPL } from './avatar-tpl';
import { Definitions } from '@/composable';
import './avatar.css';
import { ColorAbility, SizeAbility } from '@/component-abilities';

export type AvatarMode = 'src' | 'text' | 'iconCls';

const AvatarComponentDefs: Definitions = {
    options: {
        src: null,
        text: null,
        iconCls: null,
        size: 'md',
        color: null,
    },
} as const;

class AvatarComponent extends Component {
    static type = 'avatar';
    get tpl(): TemplateDecl {
        return AVATAR_TPL;
    }

    _onSrcOptionChange(value: string) {
        const nodeName = 'image';
        this.setNodeHidden(!value, nodeName);
        if (value) {
            this.setAttributes({ src: value }, nodeName);
        }
    }

    _onTextOptionChange(value: string) {
        const nodeName = 'text';
        this.setNodeHidden(!value, nodeName);
        if (value) {
            const el = this.getNodeEl(nodeName);
            if (el) el.textContent = value.charAt(0).toUpperCase();
        }
    }

    _onIconClsOptionChange(value: string, old: string) {
        const nodeName = 'icon';
        this.setNodeHidden(!value, nodeName);
        this.toggleOptionCls('', value, old, nodeName);
    }
}

AvatarComponent.define(AvatarComponentDefs);
AvatarComponent.use(SizeAbility, ColorAbility);
export { AvatarComponent };

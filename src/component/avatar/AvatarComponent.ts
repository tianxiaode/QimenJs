import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@/component-core';
import { AVATAR_TPL } from './avatar-tpl';
import { Definitions } from '@/composable';
import { SizeAbility, ColorAbility } from '@/component-abilities';
import './avatar.css';

export type AvatarMode = 'src' | 'text' | 'icon';

const AvatarComponentDefs: Definitions = {
    options: {
        src: null,
        text: null,
        icon: null,
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
        this._setNodeHidden(!value, nodeName);
        if (value) {
            this.setAttributes({ src: value }, nodeName);
        }
    }

    _onTextOptionChange(value: string) {
        const nodeName = 'text';
        const el = this.getNodeEl(nodeName);
        this._setNodeHidden(!value, nodeName);
        if (value) {
            if (el) el.textContent = value.charAt(0).toUpperCase();
        }
    }

    _onIconOptionChange(value: string) {
        const nodeName = 'icon';
        this._setNodeHidden(!value, nodeName);
        const el = this.getNodeEl(nodeName);
        if (value) {
            if (el) el.textContent = value;
        }
    }
}

AvatarComponent.define(AvatarComponentDefs);
AvatarComponent.use(SizeAbility);
AvatarComponent.use(ColorAbility);

export { AvatarComponent };

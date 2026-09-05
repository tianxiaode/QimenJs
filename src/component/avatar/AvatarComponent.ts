import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@/component-core';
import { AVATAR_TPL } from './avatar-tpl';
import { Definitions } from '@/composable';
import { SizeAbility } from '@/component-abilities';
import './avatar.css';

export type AvatarMode = 'src' | 'text' | 'icon';

const AvatarComponentDefs: Definitions = {
    options: {
        src: null,
        text: null,
        icon: null,
        size: 'md',
    },
} as const;

class AvatarComponent extends Component {
    static type = 'avatar';
    get tpl(): TemplateDecl {
        return AVATAR_TPL;
    }

    _onSrcOptionChange(value: string) {
        const nodeName = 'image';
        if (value) {
            this.setAttributes({ src: value }, nodeName);
            this.removeCls('hidden', nodeName);
        } else {
            this.addCls('hidden', nodeName);
        }
    }

    _onTextOptionChange(value: string) {
        const nodeName = 'text';
        const el = this.getNodeEl(nodeName);
        if (value) {
            if (el) el.textContent = value.charAt(0).toUpperCase();
            this.removeCls('hidden', nodeName);
        } else {
            this.addCls('hidden', nodeName);
        }
    }

    _onIconOptionChange(value: string) {
        const nodeName = 'icon';
        const el = this.getNodeEl(nodeName);
        if (value) {
            if (el) el.textContent = value;
            this.removeCls('hidden', nodeName);
        } else {
            this.addCls('hidden', nodeName);
        }
    }
}

AvatarComponent.define(AvatarComponentDefs);
AvatarComponent.use(SizeAbility);

export { AvatarComponent };
export type AvatarComponentInstance = InstanceType<typeof AvatarComponent>;

import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@/component-core';
import { TAG_TPL } from './tag-tpl';
import { Definitions } from '@/composable';
import { SizeAbility } from '@/component-abilities';
import './tag.css';

export type TagType = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

export interface TagProps {
    text?: string;
    tagType?: TagType;
    iconCls?: string;
    closable?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const TagComponentDefs: Definitions = {
    options: {
        text: null,
        tagType: 'default',
        iconCls: null,
        closable: false,
        size: 'md',
    },
} as const;

class TagComponent extends Component {
    static type = 'tag';
    get tpl(): TemplateDecl {
        return TAG_TPL;
    }

    _onTextOptionChange(value: string) {
        this._setNodeText('text', value);
    }

    _onTagTypeOptionChange(value: string, old: string) {
        this._toggleOptionCls('q-tag--', value, old);
    }

    _onIconClsOptionChange(value: string, old: string) {
        const nodeName = 'icon';
        if (old) this.removeCls(old, nodeName);
        if (value) {
            this.addCls(value, nodeName);
            this.removeCls('hidden', nodeName);
        } else {
            this.addCls('hidden', nodeName);
        }
    }

    _onClosableOptionChange(value: boolean) {
        const nodeName = 'closeBtn';
        value ? this.removeCls('hidden', nodeName) : this.addCls('hidden', nodeName);
    }
}

TagComponent.define(TagComponentDefs);
TagComponent.use(SizeAbility);

export { TagComponent };
export type TagComponentInstance = InstanceType<typeof TagComponent>;

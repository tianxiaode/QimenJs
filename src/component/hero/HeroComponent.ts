import { Component } from '@qimenjs/component-core';
import type { DomEventsMap, TemplateDecl } from '@/component-core';
import { HERO_TPL } from './hero-tpl';
import { Definitions } from '@/composable';
import './hero.css';

const HeroComponentDefs: Definitions = {
    options: {
        title: null,
        subtitle: null,
        desc: null,
        actionText: null,
    },
} as const;

class HeroComponent extends Component {
    static type = 'hero';
    get tpl(): TemplateDecl {
        return HERO_TPL;
    }

    domEvents?: DomEventsMap | undefined = {
        click: {
            actionBtn: {
                emits: ['action'],
            },
        },
    };

    _onTitleOptionChange(value: string): void {
        this._setNodeText('title', value);
    }

    _onSubtitleOptionChange(value: string): void {
        this._setNodeText('subtitle', value);
        value ? this.removeCls('hidden', 'subtitle') : this.addCls('hidden', 'subtitle');
    }

    _onDescOptionChange(value: string): void {
        this._setNodeText('desc', value);
        value ? this.removeCls('hidden', 'desc') : this.addCls('hidden', 'desc');
    }

    _onActionTextOptionChange(value: string): void {
        this._setNodeText('actionBtn', value);
        value ? this.removeCls('hidden', 'actions') : this.addCls('hidden', 'actions');
    }
}

HeroComponent.define(HeroComponentDefs);

export { HeroComponent };
export type HeroComponentInstance = InstanceType<typeof HeroComponent>;

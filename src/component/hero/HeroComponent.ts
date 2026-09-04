import { Component } from '@qimenjs/component-core';
import type { DomEventsMap, TemplateDecl } from '@/component-core';
import { HERO_TPL } from './hero-tpl';
import { Definitions } from '@/composable';
import './hero.css';

const HeroComponentDefs: Definitions = {
    targetToOptions: {
        title: { target: 'title', to: 'text' },
        subtitle: { target: 'subtitle', to: 'text' },
        desc: { target: 'desc', to: 'text' },
        actionText: { target: 'actionBtn', to: 'text' },
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

    _onSubtitleOptionChange(value: string) {
        value ? this.removeCls('hidden', 'subtitle') : this.addCls('hidden', 'subtitle');
    }

    _onDescOptionChange(value: string) {
        value ? this.removeCls('hidden', 'desc') : this.addCls('hidden', 'desc');
    }

    _onActionTextOptionChange(value: string) {
        value ? this.removeCls('hidden', 'actions') : this.addCls('hidden', 'actions');
    }
}

HeroComponent.define(HeroComponentDefs);

export { HeroComponent };
export type HeroComponentInstance = InstanceType<typeof HeroComponent>;

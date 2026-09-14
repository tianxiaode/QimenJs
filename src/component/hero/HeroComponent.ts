import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@/component-core';
import { HERO_TPL } from './hero-tpl';
import { Definitions } from '@/composable';
import './hero.css';

const HeroComponentDefs: Definitions = {
    options: {
        title: null,
        subtitle: null,
        desc: null,
        actionText: null,
        actionHref: null,
        image: null,
        imagePosition: null,
    },
} as const;

class HeroComponent extends Component {
    static type = 'hero';
    get tpl(): TemplateDecl {
        return HERO_TPL;
    }

    _onTitleOptionChange(value: string): void {
        this.setNodeText(value, 'title');
    }

    _onSubtitleOptionChange(value: string): void {
        this.setNodeText(value, 'subtitle');
        this.setNodeHidden(!value, 'subtitle');
    }

    _onDescOptionChange(value: string): void {
        this.setNodeText(value, 'desc');
        this.setNodeHidden(!value, 'desc');
    }

    _onActionTextOptionChange(value: string): void {
        const btn = this.getComponent('actionBtn');
        if (btn) {
            btn.setData('text', value);
        }
        this.setNodeHidden(!value, 'actions');
    }

    _onActionHrefOptionChange(value: string): void {
        const btn = this.getComponent('actionBtn');
        if (btn) {
            btn.setData('href', value);
        }
    }

    _onImageOptionChange(value: string): void {
        if (value) {
            this.setNodeAttr('src', value, 'image');
            this.setNodeHidden(false, 'image');
            this.toggleCls('q-hero--split', true);
        } else {
            this.setNodeHidden(true, 'image');
            this.toggleCls('q-hero--split', false);
        }
    }

    _onImagePositionOptionChange(value: string): void {
        this.toggleCls('q-hero--split-left', value === 'left');
    }
}

HeroComponent.define(HeroComponentDefs);

export { HeroComponent };

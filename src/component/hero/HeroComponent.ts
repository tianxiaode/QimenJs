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
        click: { path: 'actionBtn', emits: ['action'] },
    };

    _onTitleOptionChange(value: string): void {
        this.setNodeText(value, 'title');
    }

    _onSubtitleOptionChange(value: string): void {
        this.setNodeText(value, 'subtitle');
        this.setNodeHidden(!value, 'subtitle'); // 显示或隐藏 subtitle
    }

    _onDescOptionChange(value: string): void {
        this.setNodeText(value, 'desc');
        this.setNodeHidden(!value, 'desc'); // 显示或隐藏 desc
    }

    _onActionTextOptionChange(value: string): void {
        this.setNodeText(value, 'actionBtn');
        this.setNodeHidden(!value, 'actionBtn'); // 显示或隐藏 actionBtn
    }
}

HeroComponent.define(HeroComponentDefs);

export { HeroComponent };

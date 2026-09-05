import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@/component-core';
import { Definitions } from '@/composable';
import { HEADER_TPL } from './header-tpl';
import './header.css';

export interface HeaderProps {
    icon?: string;
    title?: string;
    subtitle?: string;
    toolsLeft?: Record<string, any>;
    toolsRight?: Record<string, any>;
    action?: Record<string, any>;
}

const HeaderComponentDefs: Definitions = {
    options: {
        title: null,
        icon: null,
        subtitle: null,
        toolsLeft: null,
        toolsRight: null,
        action: null,
    },
} as const;

class HeaderComponent extends Component {
    static type = 'header';

    get tpl(): TemplateDecl {
        return HEADER_TPL;
    }

    _onTitleOptionChange(value: string): void {
        this._setNodeText('title', value);
    }

    _onIconOptionChange(value: string): void {
        if (value) {
            this._setNodeHidden(false, 'icon');
            const el = this.getNodeEl('icon');
            if (el) el.innerHTML = value;
        }
    }

    _onSubtitleOptionChange(value: string): void {
        if (value) {
            this._setNodeHidden(false, 'subtitle');
            const el = this.getNodeEl('subtitle');
            if (el) el.textContent = value;
        }
    }

    _onToolsLeftOptionChange(value: Record<string, any>): void {
        if (value) {
            this._setNodeHidden(false, 'toolsLeft');
            const comp = this.getComponent('toolsLeft');
            if (comp) comp._initItemGroupComponent(value);
        }
    }

    _onToolsRightOptionChange(value: Record<string, any>): void {
        if (value) {
            this._setNodeHidden(false, 'toolsRight');
            const comp = this.getComponent('toolsRight');
            if (comp) comp._initItemGroupComponent(value);
        }
    }

    _onActionOptionChange(value: Record<string, any>): void {
        if (value) {
            this._setNodeHidden(false, 'action');
            const comp = this.getComponent('action');
            if (comp && typeof comp.update === 'function') {
                comp.update(value);
            }
        }
    }
}

HeaderComponent.define(HeaderComponentDefs);

export { HeaderComponent };
export type HeaderComponentInstance = InstanceType<typeof HeaderComponent>;

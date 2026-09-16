import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@/component-core';
import { Definitions } from '@/composable';
import { HEADER_TPL } from './header-tpl';
import './header.css';

const HeaderComponentDefs: Definitions = {
    options: {
        title: null,
        iconCls: null,
        subtitle: null,
        toolsLeft: null,
        toolsRight: null,
        actionCls: null,
    },
} as const;

class HeaderComponent extends Component {
    static type = 'header';

    get tpl(): TemplateDecl {
        return HEADER_TPL;
    }

    _onTitleOptionChange(value: string): void {
        this.setNodeText(value, 'title');
    }

    _onIconClsOptionChange(value: string, old: string): void {
        this.setNodeHidden(!!value, 'icon');
        if (value) this.addCls(value, 'icon');
        if (old) this.removeCls(old, 'icon');
    }

    _onSubtitleOptionChange(value: string): void {
        if (value) {
            this.setNodeHidden(false, 'subtitle');
            const el = this.getNodeEl('subtitle');
            if (el) el.textContent = value;
        }
    }

    _onToolsLeftOptionChange(value: Record<string, any>): void {
        if (value) {
            this.setNodeHidden(false, 'toolsLeft');
            const comp = this.getComponent('toolsLeft');
            if (comp) comp._initItemGroupComponent(value);
        }
    }

    _onToolsRightOptionChange(value: Record<string, any>): void {
        if (value) {
            this.setNodeHidden(false, 'toolsRight');
            const comp = this.getComponent('toolsRight');
            if (comp) comp._initItemGroupComponent(value);
        }
    }

    _onActionClsOptionChange(value: string, old: string): void {
        this.setNodeHidden(!value, 'action');
        if (old) this.removeCls(old, 'action');
        if (value) this.addCls(value, 'action');
    }
}

HeaderComponent.define(HeaderComponentDefs);

export { HeaderComponent };

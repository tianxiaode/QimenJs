import { Component } from '@qimenjs/component-core';
import type { DomEventsMap, TemplateDecl } from '@/component-core';
import { HREF_TPL } from './href-tpl';
import { Definitions } from '@/composable';
import './href.css';
import { ColorAbility, SizeAbility } from '@/component-abilities';

export type HrefTarget = '_self' | '_blank' | '_parent' | '_top';

const HrefComponentDefs: Definitions = {
    options: {
        text: null,
        href: null,
        target: null,
        size: 'md',
        color: null,
    },
} as const;

class HrefComponent extends Component {
    static type = 'href';
    get tpl(): TemplateDecl {
        return HREF_TPL;
    }

    domEvents?: DomEventsMap | undefined = {
        click: {
            path: 'root',
            emits: ['navigate'],
            router: 'navigate',
        },
    };

    _onTextOptionChange(value: string) {
        this.setNodeText(value);
    }

    _onHrefOptionChange(value: string) {
        if (value && this._isExternal(value)) {
            this.setNodeAttr('href', value);
        } else {
            this.removeAttributes(['href']);
        }
    }

    _onTargetOptionChange(value: string) {
        if (value && value !== '_self') {
            this.setAttributes({ target: value });
        } else {
            this.removeAttributes(['target']);
        }
    }

    _isExternal(href: string): boolean {
        return /^(https?:|mailto:|tel:|ftp:|\/\/)/i.test(href);
    }

    get defaultEventData(): Record<string, any> {
        return { ...super.defaultEventData, href: this.href };
    }

    getForwardFilter(_domEvent?: any): string[] | null {
        return this.disable ? [] : null;
    }
}

HrefComponent.define(HrefComponentDefs);
HrefComponent.use(SizeAbility, ColorAbility);
export { HrefComponent };

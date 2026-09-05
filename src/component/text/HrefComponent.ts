import { Component } from '@qimenjs/component-core';
import type { DomEventsMap, TemplateDecl } from '@/component-core';
import { HREF_TPL } from './href-tpl';
import { Definitions } from '@/composable';
import './href.css';

export type HrefTarget = '_self' | '_blank' | '_parent' | '_top';

const HrefComponentDefs: Definitions = {
    options: {
        text: null,
        href: null,
        target: null,
    },
} as const;

class HrefComponent extends Component {
    static type = 'href';
    get tpl(): TemplateDecl {
        return HREF_TPL;
    }

    _pendingNavData: { href: string } | null = null;

    domEvents?: DomEventsMap | undefined = {
        click: {
            root: {
                handler: '_onContentClick',
                emits: ['navigate'],
                router: 'navigate',
            },
        },
    };

    _onTextOptionChange(value: string) {
        this._setNodeText('root', value);
    }

    _onHrefOptionChange(value: string) {
        this._setNodeAttr('root', 'href', value ?? '');
    }

    _onTargetOptionChange(value: string) {
        if (value && value !== '_self') {
            this.setAttributes({ target: value });
        } else {
            this.removeAttributes(['target']);
        }
    }

    _onContentClick(domEvt: any): void {
        if (this.disable) {
            domEvt?.preventDefault?.();
            return;
        }
        const href = this.href;
        if (href && !HrefComponent._isExternal(href)) {
            domEvt?.preventDefault?.();
        }
        this._pendingNavData = { href };
    }

    static _isExternal(href: string): boolean {
        return /^(https?:|mailto:|tel:|ftp:|\/\/)/i.test(href);
    }

    getForwardFilter(_domEvent?: any): string[] | null {
        return this.disable ? [] : null;
    }

    getCustomEventData(): any {
        const data = this._pendingNavData;
        this._pendingNavData = null;
        return data ?? {};
    }
}

HrefComponent.define(HrefComponentDefs);

export { HrefComponent };
export type HrefComponentInstance = InstanceType<typeof HrefComponent>;

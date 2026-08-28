import { FloatingComponent } from '../overlay';
import type { TemplateDecl } from '../types';
import type { Definitions } from '@/composable';
import { ZIndexLevel, zIndexManager } from '../engine';
import { TOOLTIP_TPL } from './tooltip-tpl';
import { InferAbility } from '@/composable';
import './tooltip.css.ts';
import { ArrowAbility } from '../abilities';

export class TooltipComponent extends FloatingComponent {
    static type = 'tooltip';

    get tpl(): TemplateDecl {
        return TOOLTIP_TPL;
    }

    open(): void {
        this.hidden = false;
        this.zIndex = zIndexManager.acquire(ZIndexLevel.tooltip);
        this._overlayOpen = true;
        if (this._anchor && typeof this.updateArrowPlacement === 'function') {
            const anchorRect = this._anchor.getBoundingClientRect();
            const elRect = this.el.getBoundingClientRect();
            this.updateArrowPlacement(this._inferPlacement(anchorRect, elRect));
        }
    }

    close(): void {
        this.hidden = true;
        this._overlayOpen = false;
    }

    _inferPlacement(anchorRect: DOMRect, _elRect: DOMRect): 'top' | 'bottom' | 'left' | 'right' {
        const spaceAbove = anchorRect.top;
        const spaceBelow = window.innerHeight - anchorRect.bottom;
        const spaceLeft = anchorRect.left;
        const spaceRight = window.innerWidth - anchorRect.right;
        const max = Math.max(spaceAbove, spaceBelow, spaceLeft, spaceRight);
        if (max === spaceAbove) return 'bottom';
        if (max === spaceBelow) return 'top';
        if (max === spaceLeft) return 'right';
        return 'left';
    }

    onOverlayChange(data: any): void {
        if (!data) return;
        if (data.tooltip !== undefined) this.text = data.tooltip;
        if (data.visible !== undefined) this.hidden = !data.visible;
    }
}

const TooltipComponentDefs: Definitions = {
    options: {
        tooltip: { target: 'text', to: 'text' },
    },
};

TooltipComponent.use(ArrowAbility);
TooltipComponent.define(TooltipComponentDefs);
TooltipComponent.register();

export interface TooltipComponent extends InferAbility<typeof ArrowAbility> {}

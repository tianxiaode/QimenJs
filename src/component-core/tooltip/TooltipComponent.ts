import { FloatingComponent } from '../overlay';
import type { TemplateDecl } from '../types';
import type { Definitions } from '@/composable';
import { ZIndexLevel, zIndexManager } from '../engine';
import { TOOLTIP_TPL } from './tooltip-tpl';
import { InferAbility } from '@/composable';
import './tooltip.css';
import { ArrowAbility } from '../abilities';

export class TooltipComponent extends FloatingComponent {
    static type = 'tooltip';

    get tpl(): TemplateDecl {
        return TOOLTIP_TPL;
    }

    open(): void {
        this.setData('hidden', false);
        this.setData('zIndex', zIndexManager.acquire(ZIndexLevel.tooltip));
        this._overlayOpen = true;
        if (typeof this.updateArrowPlacement === 'function') {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const placement = (this as any)._actualPlacement ?? 'bottom';
                    const arrowPlacement = this._inferArrowPlacement(placement);
                    this.updateArrowPlacement(arrowPlacement);
                });
            });
        }
    }

    close(): void {
        this.setData('hidden', true);
        this._overlayOpen = false;
    }

    _inferArrowPlacement(
        placement: 'top' | 'bottom' | 'left' | 'right'
    ): 'top' | 'bottom' | 'left' | 'right' {
        const map: Record<string, 'top' | 'bottom' | 'left' | 'right'> = {
            top: 'bottom',
            bottom: 'top',
            left: 'right',
            right: 'left',
        };
        const arrowPlacement = map[placement];
        return arrowPlacement;
    }

    onOverlayChange(data: any): void {
        if (!data) return;
        if (data.tooltip !== undefined) this.text = data.tooltip;
        if (data.visible !== undefined) this.setData('hidden', !data.visible);
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

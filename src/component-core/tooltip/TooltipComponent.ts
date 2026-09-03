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
        this.hidden = false; // 修正这里
        this.zIndex = zIndexManager.acquire(ZIndexLevel.tooltip); // 修正这里
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
        this.hidden = true; // 修正这里
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
}

const TooltipComponentDefs: Definitions = {
    targetToOptions: {
        tooltip: { target: 'text', to: 'text' },
    },
};

TooltipComponent.use(ArrowAbility);
TooltipComponent.define(TooltipComponentDefs);

export interface TooltipComponent extends InferAbility<typeof ArrowAbility> {}

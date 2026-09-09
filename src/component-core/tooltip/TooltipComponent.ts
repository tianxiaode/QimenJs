import { Component } from '../Component';
import type { TemplateDecl } from '../types';
import type { Definitions } from '@/composable';
import { ZIndexLevel, zIndexManager } from '../engine';
import { TOOLTIP_TPL } from './tooltip-tpl';
import { InferAbility } from '@/composable';
import './tooltip.css';
import { ArrowAbility } from '../abilities';

export class TooltipComponent extends Component {
    static type = 'tooltip';

    get tpl(): TemplateDecl {
        return TOOLTIP_TPL;
    }

    open(): void {
        this.hidden = false;
        this.el!.style.zIndex = String(zIndexManager.acquire(ZIndexLevel.tooltip));
        this.setAbilityState('OverlayAbility:open', true);
        if (typeof this.updateArrowPlacement === 'function') {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const placement =
                        this.abilityState('OverlayAbility:actualPlacement') ?? 'bottom';
                    const arrowPlacement = this._inferArrowPlacement(placement);
                    this.updateArrowPlacement(arrowPlacement);
                });
            });
        }
    }

    close(): void {
        this.hidden = true;
        this.setAbilityState('OverlayAbility:open', false);
    }

    _onTooltipOptionChange(value: string): void {
        this.setNodeText(value, 'text');
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
        return map[placement];
    }
}

const TooltipComponentDefs: Definitions = {
    options: {
        tooltip: null,
    },
};

TooltipComponent.use(ArrowAbility);
TooltipComponent.define(TooltipComponentDefs);

export interface TooltipComponent extends InferAbility<typeof ArrowAbility> {}

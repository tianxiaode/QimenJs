import { Component } from '../Component';
import type { TemplateDecl } from '../types';
import type { Definitions } from '@/composable';
import { TOOLTIP_TPL } from './tooltip-tpl';
import './tooltip.css';

export class TooltipComponent extends Component {
    static type = 'tooltip';
    private _rafId: number = 0;

    get tpl(): TemplateDecl {
        return TOOLTIP_TPL;
    }

    open(): void {
        this._rafId = requestAnimationFrame(() => {
            this._rafId = requestAnimationFrame(() => {
                this._rafId = 0;
                const placement = this.abilityState('OverlayAbility:actualPlacement') ?? 'bottom';
                const arrowPlacement = this._inferArrowPlacement(placement);
                this.updateArrowPlacement(arrowPlacement);
            });
        });
    }

    close(): void {}

    override onBeforeDispose(): void {
        if (this._rafId) cancelAnimationFrame(this._rafId);
    }

    _onTextOptionChange(value: string): void {
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
        text: null,
        persistent: true,
    },
};

TooltipComponent.define(TooltipComponentDefs);

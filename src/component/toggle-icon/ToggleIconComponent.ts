import { Component } from '@qimenjs/component-core';
import type { DomEventsMap, TemplateDecl } from '@/component-core';
import { SizeAbility } from '@/component-abilities';
import { TOGGLE_ICON_TPL } from './toggle-icon-tpl';
import { Definitions } from '@/composable';
import './toggle-icon.css';

const ToggleIconComponentDefs: Definitions = {
    options: {
        pressed: false,
        onIcon: null,
        offIcon: null,
        size: 'md',
    },
} as const;

class ToggleIconComponent extends Component {
    static type = 'toggle-icon';
    get tpl(): TemplateDecl {
        return TOGGLE_ICON_TPL;
    }

    domEvents?: DomEventsMap | undefined = {
        click: { handler: true },
    };

    _onPressedOptionChange(value: boolean): void {
        this.toggleCls('q-toggle-icon--on', value);
        this.setAttributes({ 'aria-pressed': String(value) });
        this._applyIcon();
    }

    _onOnIconOptionChange(_value: string): void {
        this._applyIcon();
    }

    _onOffIconOptionChange(_value: string): void {
        this._applyIcon();
    }

    _applyIcon(): void {
        const iconValue = this.pressed ? this.onIcon : this.offIcon;
        const el = this.getNodeEl('icon');
        if (el && iconValue) el.textContent = iconValue;
    }

    onClick(): void {
        if (this.disable) return;
        this.pressed = !this.pressed;
        this.emit('toggle', { pressed: this.pressed });
    }
}

ToggleIconComponent.define(ToggleIconComponentDefs);
ToggleIconComponent.use(SizeAbility);

export { ToggleIconComponent };
export type ToggleIconComponentInstance = InstanceType<typeof ToggleIconComponent>;

import { Component } from '@qimenjs/component-core';
import type { DomEventsMap, TemplateDecl } from '@/component-core';
import { TAG_TPL } from './tag-tpl';
import { Definitions } from '@/composable';
import { string } from '@/utils';
import { resolveI18nValue } from '@/i18n';
import './tag.css';

export type TagType = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

const TagComponentDefs: Definitions = {
    options: {
        tags: null,
        size: 'md',
        tagType: 'default',
        closable: false,
        maxCount: 0,
        collapsed: true,
        overflowTagType: 'info',
        direction: 'horizontal',
    },
} as const;

class TagComponent extends Component {
    static type = 'tag';
    get tpl(): TemplateDecl {
        return TAG_TPL;
    }

    _initialized: boolean = false;

    domEvents: DomEventsMap = {
        click: { path: 'items', handler: '_onTagClick' },
    };

    onAfterInit(): void {
        this._initialized = true;
        this._render();
        this.registerI18nRefresh(() => this._render());
    }

    _onTagsOptionChange(): void {
        this._scheduleRender();
    }

    _onSizeOptionChange(): void {
        this._scheduleRender();
    }

    _onTagTypeOptionChange(): void {
        this._scheduleRender();
    }

    _onClosableOptionChange(): void {
        this._scheduleRender();
    }

    _onMaxCountOptionChange(): void {
        this._scheduleRender();
    }

    _onCollapsedOptionChange(): void {
        this._scheduleRender();
    }

    _onOverflowTagTypeOptionChange(): void {
        this._scheduleRender();
    }

    _onDirectionOptionChange(): void {
        this._scheduleRender();
    }

    _onTagClick(domEvt: any): void {
        const target = domEvt?.target as HTMLElement | undefined;
        if (!target) return;

        const closeEl = target.closest('.q-tag__close');
        if (closeEl) {
            const tagEl = closeEl.closest('.q-tag');
            if (!tagEl) return;
            const index = parseInt(tagEl.getAttribute('data-index') ?? '-1', 10);
            if (index < 0 || index >= this._allTags.length) return;
            this.emit('tagclose', { index, text: this._allTags[index] });
            this.removeTagAt(index);
            return;
        }

        const overflowEl = target.closest('.q-tags__overflow-tag');
        if (overflowEl) {
            this.toggleOverflow();
        }
    }

    setTags(tags: string[]): void {
        this.tags = tags;
        this._scheduleRender();
    }

    addTag(tag: string): void {
        this.tags.push(tag);
        this._scheduleRender();
    }

    insertTag(index: number, tag: string): void {
        const clamped = Math.min(Math.max(0, index), this.tags.length);
        this.tags.splice(clamped, 0, tag);
        this._scheduleRender();
    }

    removeTagAt(index: number): void {
        if (index < 0 || index >= this.tags.length) return;
        this.tags.splice(index, 1);
        this._scheduleRender();
    }

    getTags(): readonly string[] {
        return this.tags;
    }

    get tagCount(): number {
        return this.tags.length;
    }

    expand(): void {
        if (!this.collapsed) return;
        this.collapsed = false;
        this.emit('overflowtoggle', { collapsed: false, hiddenItems: [] });
    }

    collapse(): void {
        if (this.collapsed) return;
        this.collapsed = true;
        this.emit('overflowtoggle', { collapsed: true, hiddenItems: this._getHiddenTags() });
    }

    toggleOverflow(): void {
        this.collapsed ? this.expand() : this.collapse();
    }

    get defaultEventData(): Record<string, any> {
        return {
            tagCount: this._allTags.length,
            maxCount: this.maxCount,
            collapsed: this.collapsed,
        };
    }

    _scheduleRender(): void {
        if (!this._initialized) return;
        this.debounce('render', () => this._render())();
    }

    _getVisibleTags(): string[] {
        if (this.maxCount > 0 && this.collapsed && this.tags.length > this.maxCount) {
            return this.tags.slice(0, this.maxCount - 1);
        }
        return this.tags;
    }

    _getHiddenTags(): string[] {
        if (this.maxCount > 0 && this.collapsed && this.tags.length > this.maxCount) {
            return this.tags.slice(this.maxCount - 1);
        }
        return [];
    }

    _render(): void {
        const visible = this._getVisibleTags();
        const htmlParts: string[] = [];

        for (let i = 0; i < visible.length; i++) {
            htmlParts.push(this._buildTagHtml(visible[i], i));
        }

        const hiddenCount = this.tags.length - visible.length;
        if (hiddenCount > 0) {
            htmlParts.push(this._buildOverflowHtml(hiddenCount));
        }

        this.setNodeHtml(htmlParts.join(''), 'items');
        this.toggleCls('q-tags--vertical', 'root', this.direction === 'vertical');
    }

    _buildTagHtml(text: string, index: number): string {
        const cls = `q-tag q-tag--${this.tagType} q-size--${this.size}`;
        let inner = `<span class="q-tag__text">${string.escapeHtml(resolveI18nValue(text))}</span>`;
        if (this.closable) {
            inner += `<span class="q-tag__close">×</span>`;
        }
        return `<span class="${cls}" data-index="${index}">${inner}</span>`;
    }

    _buildOverflowHtml(hiddenCount: number): string {
        const cls = `q-tag q-tag--${this.overflowTagType} q-size--${this.size} q-tags__overflow-tag`;
        return `<span class="${cls}">+${hiddenCount}</span>`;
    }
}

TagComponent.define(TagComponentDefs);

export { TagComponent };
export type TagComponentInstance = InstanceType<typeof TagComponent>;

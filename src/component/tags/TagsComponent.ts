/**
 * TagsComponent 标签组组件
 *
 * 从 ItemGroupPooledComponent 派生，承载多个 TagComponent 子项。
 * 池化复用、order 排序、overflow 滚动等通用能力继承自父类；
 * 本层只做 tag 领域语义封装：
 *   1. 语法糖 API（setTags/addTag/removeTagAt/getTags/tagCount）
 *   2. maxCount 数量截断 + "+N" 折叠 tag（区别于父类 OverflowAbility 的宽度维度溢出）
 *   3. close 事件统一代理（容器层事件委托，子 TagComponent 不 emit close）
 *
 * 折叠维度说明：
 *   - 父类 overflowMode='menu' —— 按容器宽度运行时溢出，ResizeObserver 驱动
 *   - 本层 maxCount —— 按数量确定性截断，无观测开销，语义为"最多显示 N 个"
 *   两者可叠加：maxCount 截断后仍可由父类 menu 模式处理二次溢出。
 *
 * 事件：
 *   - 'tagclose'      — { index, component, data }，点击某 tag 的 closeBtn 时触发并移除
 *   - 'overflowtoggle'— { collapsed, hiddenItems }，点击 +N tag 或调用 expand/collapse 时触发
 *
 * @example
 * ```ts
 * new TagsComponent({
 *     items: [{ text: 'A' }, { text: 'B' }, { text: 'C' }],
 *     maxCount: 2,
 *     closable: true,
 * })
 *   .on('tagclose', ({ index }) => console.log('removed', index))
 *   .on('overflowtoggle', ({ hiddenItems }) => showPopover(hiddenItems))
 * ```
 */

import { ItemGroupPooledComponent } from '../itemgroup/ItemGroupPooledComponent';
import { TagComponent } from '../tag/TagComponent';
import type { TagType, TagComponentInstance } from '../tag/TagComponent';
import type { DomEventsMap } from '@qimenjs/component-core';
import './tags.css';

class TagsComponent extends ItemGroupPooledComponent {
    _allTags: Record<string, any>[] = [];
    _maxCount: number = 0;
    _collapsed: boolean = true;
    _overflowTagType: TagType = 'info';
    _closable: boolean = false;
    _overflowTag: TagComponentInstance | null = null;

    domEvents?: DomEventsMap | undefined = {
        click: {
            Tag: {
                handler: '_onTagClick',
            },
        },
    };

    onAfterInit(props?: Record<string, any>): void {
        this.addCls('q-tags');
        (this as any).itemContainer?.el?.classList.add('q-tags__items');

        this._maxCount = props?.maxCount ?? 0;
        this._collapsed = props?.collapsed ?? true;
        this._overflowTagType = props?.overflowTagType ?? 'info';
        this._closable = props?.closable ?? false;

        const { items, ...rest } = props ?? {};
        super.onAfterInit({
            ...rest,
            defaultItemType: 'Tag',
            direction: rest.direction ?? 'horizontal',
            gap: rest.gap ?? '4px',
        });

        if (items && items.length > 0) this.setTags(items as Record<string, any>[]);
    }

    /**
     * 点击 tag 委托处理 —— 仅 closeBtn 命中时触发 tagclose 并移除
     * +N 折叠 tag 不在 _items 中（domEvents 委托不到），由独立监听处理
     */
    _onTagClick(domEvt: any): void {
        const target = domEvt?.target as HTMLElement | undefined;
        if (!target) return;
        if (target.closest('.q-tags__overflow-tag')) return;
        const closeEl = target.closest('.q-tag__close');
        if (!closeEl) return;

        const hit = this.getTargetItem(target);
        if (!hit) return;

        const index = hit.index;
        const data = this._allTags[index];
        this.emit('tagclose', { index, component: hit.component, data });
        this.removeTagAt(index);
    }

    /**
     * 全量替换并重渲染
     */
    setTags(tags: Record<string, any>[]): void {
        this._allTags = tags;
        this._render();
    }

    /**
     * 末尾追加一个 tag
     */
    addTag(tag: Record<string, any>): void {
        this._allTags.push(tag);
        this._render();
    }

    /**
     * 在指定位置插入一个 tag
     */
    insertTag(index: number, tag: Record<string, any>): void {
        const clamped = Math.min(Math.max(0, index), this._allTags.length);
        this._allTags.splice(clamped, 0, tag);
        this._render();
    }

    /**
     * 移除指定位置的 tag
     */
    removeTagAt(index: number): void {
        if (index < 0 || index >= this._allTags.length) return;
        this._allTags.splice(index, 1);
        this._render();
    }

    /**
     * 获取全量 tag 数据
     */
    getTags(): readonly Record<string, any>[] {
        return this._allTags;
    }

    /** tag 总数（含折叠隐藏的） */
    get tagCount(): number {
        return this._allTags.length;
    }

    /** 当前是否处于折叠态 */
    get collapsed(): boolean {
        return this._collapsed;
    }

    /** 最大显示数量 */
    get maxCount(): number {
        return this._maxCount;
    }
    set maxCount(value: number) {
        if (this._maxCount === value) return;
        this._maxCount = value;
        this._render();
    }

    /** 展开显示全部 */
    expand(): void {
        if (!this._collapsed) return;
        this._collapsed = false;
        this._render();
        this.emit('overflowtoggle', { collapsed: false, hiddenItems: [] });
    }

    /** 折叠到 maxCount */
    collapse(): void {
        if (this._collapsed) return;
        this._collapsed = true;
        this._render();
        this.emit('overflowtoggle', { collapsed: true, hiddenItems: this._getHiddenTags() });
    }

    /** 切换折叠/展开 */
    toggleOverflow(): void {
        this._collapsed ? this.collapse() : this.expand();
    }

    get defaultEventData(): Record<string, any> {
        return {
            ...super.defaultEventData,
            tagCount: this._allTags.length,
            maxCount: this._maxCount,
            collapsed: this._collapsed,
        };
    }

    update(props?: Record<string, any>): void {
        if (props?.items !== undefined) this.setTags(props.items as Record<string, any>[]);
        if (props?.maxCount !== undefined) this.maxCount = props.maxCount;
        if (props?.overflowTagType !== undefined) {
            this._overflowTagType = props.overflowTagType;
            this._render();
        }
        if (props?.closable !== undefined) {
            this._closable = props.closable;
            this._render();
        }
        if (props?.collapsed !== undefined) {
            props.collapsed ? this.collapse() : this.expand();
        }
        super.update(props);
    }

    onBeforeDispose(): void {
        if (this._overflowTag) {
            this._overflowTag.el.remove();
            (this._overflowTag as any).dispose?.();
            this._overflowTag = null;
        }
        super.onBeforeDispose();
    }

    // ============================================
    // 内部渲染
    // ============================================

    /** 计算当前可见的 tag 子集（折叠时截断，留一位给 +N） */
    _getVisibleTags(): Record<string, any>[] {
        if (this._maxCount > 0 && this._collapsed && this._allTags.length > this._maxCount) {
            return this._allTags.slice(0, this._maxCount - 1);
        }
        return this._allTags;
    }

    /** 计算被折叠隐藏的 tag */
    _getHiddenTags(): Record<string, any>[] {
        if (this._maxCount > 0 && this._collapsed && this._allTags.length > this._maxCount) {
            return this._allTags.slice(this._maxCount - 1);
        }
        return [];
    }

    /** 注入 closable 批量下发 + 固化 type */
    _decorateTag(tag: Record<string, any>): Record<string, any> {
        return {
            ...tag,
            type: 'Tag',
            closable: tag.closable ?? this._closable,
        };
    }

    /** 全量重渲染（池化复用由父类 setItems 保证） */
    _render(): void {
        const visible = this._getVisibleTags();
        super.setItems(visible.map(t => this._decorateTag(t)));
        this._updateOverflowTag();
    }

    /** 同步 "+N" 折叠 tag 的创建/更新/隐藏 */
    _updateOverflowTag(): void {
        const hiddenCount = this._allTags.length - this._getVisibleTags().length;
        const container = (this as any).itemContainer?.el as HTMLElement | undefined;

        if (hiddenCount > 0 && container) {
            const text = `+${hiddenCount}`;
            if (!this._overflowTag) {
                this._overflowTag = new TagComponent({
                    text,
                    tagType: this._overflowTagType,
                }) as TagComponentInstance;
                this._overflowTag.el.classList.add('q-tags__overflow-tag');
                this._overflowTag.el.addEventListener('click', () => this._onOverflowClick());
                container.appendChild(this._overflowTag.el);
            } else {
                this._overflowTag.update({ text, tagType: this._overflowTagType });
            }
            this._overflowTag.el.hidden = false;
        } else if (this._overflowTag) {
            this._overflowTag.el.hidden = true;
        }

        this._applyOrders();
    }

    /** 点击 "+N" tag —— 切换折叠态并通知外部 */
    _onOverflowClick(): void {
        this.toggleOverflow();
    }

    /** 重写以给 "+N" tag 设末尾 order（不进 _items，父类不会管它） */
    _applyOrders(): void {
        super._applyOrders();
        if (this._overflowTag && !this._overflowTag.el.hidden) {
            const step = this._step;
            this._overflowTag.el.style.order = String((this._items.length + 1) * step);
        }
    }
}

export { TagsComponent };
/** 标签集实例类型 */
export type TagsComponentInstance = InstanceType<typeof TagsComponent>;

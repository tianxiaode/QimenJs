/**
 * ToolbarComponent 工具栏组件
 *
 * 支持方向切换、溢出处理的工具栏容器。
 * 模板预定义了所有溢出模式的节点（contentArea、prevBtn、nextBtn、triggerBtn、menuPanel），
 * 通过显隐切换实现模式互斥，不需要运行时 DOM 改造。
 *
 * 溢出模式（overflowMode）：
 * - 'scroll': 子项超出时显示左/右（或上/下）箭头，支持拖拽滑动
 * - 'menu': 子项超出时在最右/下显示下拉箭头，弹出菜单显示溢出项
 * - 'none': 不处理溢出（默认）
 *
 * 互斥说明：scroll 和 menu 模式互斥，切换时隐藏前一个模式的节点并断开 Observer。
 *
 * @example
 * ```js
 * // 横向工具栏（默认）
 * { type: ComponentTypes.TOOLBAR }
 *
 * // 竖向工具栏
 * { type: ComponentTypes.TOOLBAR, direction: 'vertical' }
 *
 * // 横向工具栏 + 溢出滚动
 * { type: ComponentTypes.TOOLBAR, overflowMode: 'scroll' }
 *
 * // 竖向工具栏 + 溢出菜单
 * { type: ComponentTypes.TOOLBAR, direction: 'vertical', overflowMode: 'menu' }
 * ```
 */

import { TemplateComponent } from '@qimenjs/component-core';
import { OverflowScrollAbility, OverflowMenuAbility } from '@qimenjs/component-abilities';
import type { OverflowDirection } from '@qimenjs/component-abilities';

/** 溢出模式 */
export type OverflowMode = 'none' | 'scroll' | 'menu';

/**
 * ToolbarBase — 在 withTemplate 强类基础上，通过 with() 混入溢出能力
 *
 * OverflowScrollAbility / OverflowMenuAbility 的方法直接挂到原型上，
 * 运行时按 overflowMode 选择性调用 init 方法。
 */
const ToolbarBase = TemplateComponent
    .withTemplate({
        tpl: {
            tag: 'div',
            children: [
                { tag: 'div', name: 'toolbar:prevBtn', events: { click: { handler: 'onPrev' } }, className: 'q-overflow-arrow q-overflow-arrow--prev', hidden: true, children: [
                    { tag: 'i' },
                ]},
                { tag: 'div', name: 'toolbar:contentArea', className: 'q-toolbar__content', style: 'display:flex;' },
                { tag: 'div', name: 'toolbar:nextBtn', events: { click: { handler: 'onNext' } }, className: 'q-overflow-arrow q-overflow-arrow--next', hidden: true, children: [
                    { tag: 'i' },
                ]},
                { tag: 'button', name: 'toolbar:triggerBtn', events: { click: { handler: 'onTrigger' } }, className: 'q-overflow-menu__trigger', hidden: true },
                { tag: 'div', name: 'toolbar:menuPanel', className: 'q-overflow-menu__panel', hidden: true, style: 'position:absolute;' },
            ]
        },
        body: {
            type: 'Toolbar',
        },
    })
    .with([OverflowScrollAbility, OverflowMenuAbility]);

export let ToolbarComponent = class extends ToolbarBase {
    private _direction: string = 'horizontal';
    private _overflowMode: OverflowMode = 'none';

    constructor(props?: Record<string, any>) {
        super(props);

        this.el.classList.add('q-toolbar');

        if (props?.direction) this._direction = props.direction;
        this.applyDirection();

        if (props?.overflowMode) this._overflowMode = props.overflowMode;
        this.applyOverflowMode();
    }

    /** 布局方向：horizontal（横向）或 vertical（竖向） */
    get direction(): string { return this._direction; }
    set direction(value: string) {
        this._direction = value;
        this.applyDirection();
    }

    /** 溢出模式：none / scroll / menu */
    get overflowMode(): OverflowMode { return this._overflowMode; }
    set overflowMode(value: OverflowMode) {
        this._overflowMode = value;
        this.applyOverflowMode();
    }

    private applyDirection(): void {
        this.el.classList.remove('q-toolbar--horizontal', 'q-toolbar--vertical');
        this.el.classList.add(`q-toolbar--${this._direction}`);
    }

    private applyOverflowMode(): void {
        // 先清理当前溢出能力（断开 Observer、隐藏节点、清理样式类）
        this.cleanupOverflow();

        const direction = this._direction as OverflowDirection;

        switch (this._overflowMode) {
            case 'scroll':
                this.initOverflowScroll({ direction });
                break;
            case 'menu':
                this.initOverflowMenu({ direction });
                break;
            case 'none':
            default:
                break;
        }
    }

    /**
     * 清理当前激活的溢出能力
     *
     * 模板节点是固定的，不需要移除/还原 DOM。
     * 只需：断开 Observer、隐藏模式专属节点、清理容器样式类。
     */
    private cleanupOverflow(): void {
        // 断开 OverflowScrollAbility 的 Observer
        const scrollResizeObserver = this.getOverflowScroll?.('resizeObserver') as ResizeObserver | null;
        const scrollMutationObserver = this.getOverflowScroll?.('mutationObserver') as MutationObserver | null;
        scrollResizeObserver?.disconnect();
        scrollMutationObserver?.disconnect();

        // 断开 OverflowMenuAbility 的 Observer
        const menuResizeObserver = this.getOverflowMenu?.('resizeObserver') as ResizeObserver | null;
        const menuMutationObserver = this.getOverflowMenu?.('mutationObserver') as MutationObserver | null;
        menuResizeObserver?.disconnect();
        menuMutationObserver?.disconnect();

        // 隐藏 scroll 模式节点
        const prevBtn = this.nodeMap?.['toolbar']?.['prevBtn']?.el as HTMLElement | null;
        const nextBtn = this.nodeMap?.['toolbar']?.['nextBtn']?.el as HTMLElement | null;
        if (prevBtn) prevBtn.hidden = true;
        if (nextBtn) nextBtn.hidden = true;

        // 隐藏 menu 模式节点
        const triggerBtn = this.nodeMap?.['toolbar']?.['triggerBtn']?.el as HTMLElement | null;
        if (triggerBtn) triggerBtn.hidden = true;

        // 还原 menu 模式隐藏的子项
        const contentArea = this.nodeMap?.['toolbar']?.['contentArea']?.el as HTMLElement | null;
        if (contentArea) {
            const children = Array.from(contentArea.children) as HTMLElement[];
            for (const child of children) {
                child.hidden = false;
            }
        }

        // 清理容器样式类
        const container = this.el;
        container.classList.remove(
            'q-overflow-scroll', 'q-overflow-scroll--horizontal', 'q-overflow-scroll--vertical',
            'q-overflow-scroll--can-prev', 'q-overflow-scroll--can-next', 'q-overflow-scroll--overflowing',
            'q-overflow-menu-container', 'q-overflow-menu-container--horizontal', 'q-overflow-menu-container--vertical',
            'q-overflow-menu-container--overflowing',
        );

        // 清理 contentArea 上的能力样式类
        if (contentArea) {
            contentArea.classList.remove('q-overflow-scroll__area', 'q-overflow-menu__visible');
        }

        // 清理触发按钮激活状态
        if (triggerBtn) {
            triggerBtn.classList.remove('q-overflow-menu__trigger--active');
        }

        // 销毁 MenuComponent 实例（如果存在）
        const menuInstance = this.getOverflowMenu?.('menuInstance') as any;
        if (menuInstance) {
            menuInstance.dispose();
        }
    }

    update(props?: Record<string, any>): void {
        if (props?.direction !== undefined) {
            this._direction = props.direction;
            this.applyDirection();
        }
        if (props?.overflowMode !== undefined) {
            this._overflowMode = props.overflowMode;
            this.applyOverflowMode();
        }
    }
};

export type ToolbarComponent = InstanceType<typeof ToolbarComponent>;

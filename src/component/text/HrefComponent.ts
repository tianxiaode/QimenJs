/**
 * HrefComponent 超链接文本组件
 *
 * 轻量超链接封装，渲染为 <a> 标签，支持 href 跳转、target、禁用状态。
 * 适用于 Navbar、ItemGroup 等容器中需要带链接的文本项。
 *
 * 点击行为：
 *   - disabled 时阻止一切跳转与转发
 *   - 外部链接（http(s)/mailto/tel/ftp/协议相对）走浏览器原生跳转
 *   - 内部路径（/path、#hash 等）preventDefault 后交路由系统处理
 *
 * 事件（domEvents 声明式）：
 *   - click → emits ['navigate']（父组件可监听）
 *   - click → router 'navigate'（路由系统处理）
 *   - 两种转发均携带 { href } 数据
 *
 * @example
 * ```ts
 * new HrefComponent({ text: '首页', href: '/home' })
 * navbar.add({ type: 'Href', text: '文档', href: '/docs', order: 100 })
 * href.on('navigate', ({ data }) => { router.push(data.href) })
 * ```
 */

import { Component } from '@qimenjs/component-core';
import type { DomEventsMap } from '@qimenjs/component-core';
import { HREF_TPL } from './href-tpl';

/** 链接目标 */
export type HrefTarget = '_self' | '_blank' | '_parent' | '_top';

/** 链接属性接口 */
export interface HrefProps {
    text?: string;
    href?: string;
    target?: HrefTarget;
    cls?: string;
    role?: string;
    disabled?: boolean;
}

class HrefComponent extends Component {
    _href: string = '';
    _disabled: boolean = false;
    _pendingNavData: { href: string } | null = null;

    /**
     * domEvents — 委托模式
     *
     * root (<a>) 点击 → _onContentClick 处理 + emits navigate + router navigate
     */
    domEvents?: DomEventsMap | undefined = {
        click: {
            root: {
                handler: '_onContentClick',
                emits: ['navigate'],
                router: 'navigate',
            },
        },
    };

    onAfterInit(props?: HrefProps): void {
        this.update(props);
    }

    /**
     * 点击处理 — 禁用拦截 + 外链放行 + 内链 preventDefault
     *
     * 内部路径不交给浏览器跳转，统一由路由系统处理；
     * 外部链接保留默认行为，浏览器原生打开。
     */
    _onContentClick(domEvt: any): void {
        if (this._disabled) {
            domEvt?.preventDefault?.();
            return;
        }
        if (this._href && !HrefComponent._isExternal(this._href)) {
            domEvt?.preventDefault?.();
        }
        this._pendingNavData = { href: this._href };
    }

    /**
     * 判断是否为外部链接（浏览器原生跳转）
     */
    static _isExternal(href: string): boolean {
        return /^(https?:|mailto:|tel:|ftp:|\/\/)/i.test(href);
    }

    /**
     * 转发过滤器 — disabled 时阻止所有转发
     */
    getForwardFilter(_domEvent?: any): string[] | null {
        return this._disabled ? [] : null;
    }

    /**
     * 获取自定义事件数据 — 供 EventForwarder 合并到 navigate 事件
     */
    getCustomEventData(): any {
        const data = this._pendingNavData;
        this._pendingNavData = null;
        return data ?? {};
    }

    update(props?: Partial<HrefProps>): void {
        if (props?.text !== undefined) this.text = props.text;
        if (props?.href !== undefined) this.href = props.href;
        if (props?.target !== undefined) this.target = props.target;
        if (props?.cls !== undefined) this.cls = props.cls;
        if (props?.role !== undefined) this.role = props.role;
        if (props?.disabled !== undefined) this.disabled = props.disabled;
    }

    get text(): string {
        return this.el?.textContent ?? '';
    }
    set text(v: string) {
        this.setNodeProp('text', v);
    }

    get href(): string {
        return this._href;
    }
    set href(v: string) {
        this._href = v ?? '';
        if (this._href) this.setAttr('href', this._href);
        else this.removeAttr('href');
    }

    get target(): HrefTarget {
        return ((this.el as HTMLAnchorElement | null)?.target as HrefTarget) ?? '_self';
    }
    set target(v: HrefTarget) {
        if (v && v !== '_self') this.setAttr('target', v);
        else this.removeAttr('target');
    }

    get disabled(): boolean {
        return this._disabled;
    }
    set disabled(v: boolean) {
        this._disabled = v;
        this.toggleCls('q-href--disabled', v);
        this.ariaDisabled = v ? 'true' : false;
    }
}

HrefComponent.useTemplate(HREF_TPL);
export { HrefComponent };
/** 链接实例类型 */
export type HrefComponentInstance = InstanceType<typeof HrefComponent>;

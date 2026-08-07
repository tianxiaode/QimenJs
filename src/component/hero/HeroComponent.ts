/**
 * HeroComponent 横幅区域组件
 *
 * 大图/横幅展示区，支持标题、副标题、描述和操作按钮。
 * 适用于首页 Hero、活动横幅、空状态提示等场景。
 *
 * 模板节点：
 * - title    — 主标题
 * - subtitle — 副标题（可选）
 * - desc     — 描述文字（可选）
 * - actions  — 操作按钮区域（可选）
 *
 * 内容属性（由 ChildNodePropsEngine 自动生成）：
 * - title / titleHtml — 主标题（text/innerHTML）
 * - subtitle / subtitleHtml — 副标题
 * - desc / descHtml — 描述
 * - actionBtn / actionBtnHtml — 操作按钮文字
 *
 * 事件（domEvents 声明式）：
 * - actionBtn click → emits: ['action']
 *
 * @example
 * ```ts
 * new HeroComponent({ title: '欢迎使用', subtitle: 'QimenJS 组件库' })
 * new HeroComponent({ title: '暂无数据', desc: '点击添加第一条记录', actionText: '添加' })
 *   .on('action', () => { ... })
 * ```
 */

import { Component, DomEventsMap } from '@qimenjs/component-core';
import { resolveI18nValue } from '@qimenjs/i18n';
import { HERO_TPL } from './hero-tpl';
import './hero.css.ts';

const I18N_PREFIX = 'i18n:';

/** 英雄区属性接口 */
export interface HeroProps {
    title?: string;
    subtitle?: string;
    desc?: string;
    actionText?: string;
}

class HeroComponent extends Component {
    domEvents?: DomEventsMap | undefined = {
        click: {
            actionBtn: {
                emits: ['action'],
            },
        },
    };

    onAfterInit(): void {
        this._initFromRawProps();
    }

    /**
     * 从 _rawProps 初始化内容并处理 hidden 状态
     *
     * applyConfig 已在 onAfterInit 之前执行，i18n 值已通过 setter 设置到 DOM。
     * 此方法负责：根据 _rawProps 中存在的字段取消 hidden，并对值做 i18n resolve。
     *
     * 内容属性名规则：contentMode='html' 的节点同时生成 text 和 html setter，
     * text setter 名 = 节点名（如 title），html setter 名 = 节点名+Html（如 titleHtml）。
     */
    _initFromRawProps(): void {
        const raw = this._rawProps;
        if (!raw || typeof raw !== 'object') return;

        if (raw.title !== undefined) {
            this.title = this._resolveVal(raw.title);
        }
        if (raw.subtitle !== undefined) {
            this.subtitle = this._resolveVal(raw.subtitle);
            this.setNodeHidden(false, 'subtitle');
        }
        if (raw.desc !== undefined) {
            this.desc = this._resolveVal(raw.desc);
            this.setNodeHidden(false, 'desc');
        }
        if (raw.actionText !== undefined) {
            this.actionBtn = this._resolveVal(raw.actionText);
            this.setNodeHidden(false, 'actions');
        }
    }

    /**
     * 解析 i18n: 前缀值，非 i18n 值原样返回
     */
    private _resolveVal(val: any): any {
        if (typeof val === 'string' && val.startsWith(I18N_PREFIX)) {
            return resolveI18nValue(val);
        }
        return val;
    }

    update(props?: Partial<HeroProps>): void {
        if (props?.title !== undefined) this.title = props.title;
        if (props?.subtitle !== undefined) {
            this.subtitle = props.subtitle;
            this.setNodeHidden(!props.subtitle, 'subtitle');
        }
        if (props?.desc !== undefined) {
            this.desc = props.desc;
            this.setNodeHidden(!props.desc, 'desc');
        }
        if (props?.actionText !== undefined) {
            this.actionBtn = props.actionText;
            this.setNodeHidden(!props.actionText, 'actions');
        }
    }
}

HeroComponent.useTemplate(HERO_TPL);
export { HeroComponent };
/** 英雄区实例类型 */
export type HeroComponentInstance = InstanceType<typeof HeroComponent>;

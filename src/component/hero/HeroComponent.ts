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

    onAfterInit(props?: HeroProps): void {
        this._initHero(props);
    }

    _initHero(props?: HeroProps): void {
        if (props?.title) this.title = props.title;
        if (props?.subtitle) {
            this.subtitle = props.subtitle;
            this.setNodeHidden(false, 'subtitle');
        }
        if (props?.desc) {
            this.desc = props.desc;
            this.setNodeHidden(false, 'desc');
        }
        if (props?.actionText) {
            this.actionBtn = props.actionText;
            this.setNodeHidden(false, 'actions');
        }
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

export { HeroComponent };
export type HeroComponentInstance = InstanceType<typeof HeroComponent>;

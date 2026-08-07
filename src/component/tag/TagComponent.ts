/**
 * TagComponent 标签组件
 *
 * 紧凑标记，支持类型色、可关闭、图标。
 * 单 tag 渲染单元，不负责 close 事件 emit —— close 语义由 TagsComponent
 * 容器层统一代理（事件委托），避免 N 次绑定与职责下沉。
 *
 * 模板节点：
 * - icon — 图标（可选）
 * - closeBtn — 关闭按钮（可选）
 *
 * @example
 * ```ts
 * new TagComponent({ text: '新功能' })
 * new TagComponent({ text: '可删除', closable: true })
 * new TagComponent({ text: '警告', type: 'warning' })
 * ```
 */

import { Component } from '@qimenjs/component-core';
import { SizeAbility } from '@qimenjs/component-abilities';
import { TAG_TPL } from './tag-tpl';

/** 标签类型 */
export type TagType = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

/** 标签属性接口 */
export interface TagProps {
    text?: string;
    type?: TagType;
    icon?: string;
    closable?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

class TagComponent extends Component {
    _initTag(props?: TagProps): void {
        if (props?.type) this.addCls(`q-tag--${props.type}`);
        if (props?.icon) {
            this.icon = props.icon;
            this.setNodeHidden(false, 'icon');
        }
        if (props?.text) this.text = props.text;
        if (props?.closable) this.setNodeHidden(false, 'closeBtn');
        if (props?.size) this.size = props.size;
    }

    get tagType(): TagType {
        for (const t of ['primary', 'success', 'warning', 'error', 'info']) {
            if (this.contains(`q-tag--${t}`)) return t as TagType;
        }
        return 'default';
    }
    set tagType(value: TagType) {
        this.removeCls(`q-tag--${this.tagType}`);
        if (value !== 'default') this.addCls(`q-tag--${value}`);
    }

    update(props?: Partial<TagProps>): void {
        if (props?.type !== undefined) this.tagType = props.type;
        if (props?.icon !== undefined) {
            this.icon = props.icon;
            this.setNodeHidden(!props.icon, 'icon');
        }
        if (props?.text !== undefined) this.text = props.text;
        if (props?.closable !== undefined) this.setNodeHidden(!props.closable, 'closeBtn');
        if (props?.size !== undefined) this.size = props.size;
    }
}

TagComponent.use([SizeAbility]);
TagComponent.useTemplate(TAG_TPL);

export { TagComponent };
/** 标签实例类型 */
export type TagComponentInstance = InstanceType<typeof TagComponent>;

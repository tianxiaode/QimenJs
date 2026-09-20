/**
 * 浮层能力共享方法
 *
 * 供 TooltipAbility/PopoverAbility/LoadingAbility/DialogAbility 复用，
 * 收敛四份重复的锚点解析、mask 解析、trigger 绑定与实例清理逻辑。
 * FloatTriggerSpec 类型定义在 types/events.ts。
 */

import { DomEventsEngine } from '../../engine';
import type { DelegatedEventRule, FloatTriggerSpec } from '../../types/events';

/** 解析 mask 控制字段（maskMode 优先），返回子组件 MaskAbility 可识别的 mask 值 */
export function resolveFloatMask(decl: any): any {
    if (decl.maskMode === 'none') return false;
    if (decl.maskMode === 'global') return true;
    if (decl.maskMode === 'scoped') return 'scoped';
    return decl.mask;
}

/**
 * 绑定浮层 trigger 事件（只绑一次从不取消，不做规则 diff）：
 * - 规则 owner 为父组件，父组件销毁时统一清理
 * - 按 handlerPrefix 生成 _on${prefix}Enter/_on${prefix}Leave/_on${prefix}Click 处理器
 */
export function bindFloatTrigger(component: any, decl: any, spec: FloatTriggerSpec): void {
    if (!decl) return;
    if (component.abilityState(spec.stateKey)) return;

    const trigger = decl.trigger ?? spec.defaultTrigger;
    if (trigger === 'manual' || trigger === 'always') return;

    const anchorEl = decl.anchor && decl.anchor !== 'self'
        ? (component.getNodeEl?.(decl.anchor) ?? component.el!)
        : component.el!;
    const triggers = Array.isArray(trigger) ? trigger : [trigger];
    const rules: DelegatedEventRule[] = [];
    for (const t of triggers) {
        if (t === 'hover') {
            rules.push({
                event: 'mouseenter',
                path: anchorEl,
                handler: `_on${spec.handlerPrefix}Enter`,
                needsBinding: true,
            });
            rules.push({
                event: 'mouseleave',
                path: anchorEl,
                handler: `_on${spec.handlerPrefix}Leave`,
                needsBinding: true,
            });
        } else if (t === 'click') {
            rules.push({
                event: 'click',
                path: anchorEl,
                handler: `_on${spec.handlerPrefix}Click`,
                needsBinding: true,
            });
        }
    }
    if (rules.length === 0) return;

    for (const rule of rules) {
        DomEventsEngine.addEventRule(component, rule);
    }
    component.setAbilityState(spec.stateKey, true);
    component.onCleanup(() => {
        for (const rule of rules) {
            DomEventsEngine.removeEventRule(component, rule);
        }
        component.setAbilityState(spec.stateKey, undefined);
    });
}

/** 检查当前 decl 配置的 trigger 是否包含指定触发方式（配置变更兜底） */
export function floatTriggerMatches(decl: any, mode: string, defaultTrigger: string): boolean {
    if (!decl) return false;
    const triggers = Array.isArray(decl.trigger) ? decl.trigger : [decl.trigger ?? defaultTrigger];
    return triggers.includes(mode);
}

/** 清理已创建的浮层实例（option 置 null 时调用） */
export function disposeFloatInstance(component: any, stateKey: string): void {
    const inst = component.abilityState(stateKey);
    if (inst) {
        inst.dispose();
        component.setAbilityState(stateKey, undefined);
    }
}

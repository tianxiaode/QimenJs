import { systemEventBus, SYSTEM_EVENTS } from '@/events';
import { resolveI18nValue } from '@/i18n';

class I18nTextRegistry {
    private entries = new Map<any, Map<string, Map<string, string>>>();
    private offEvent: (() => void) | null = null;

    constructor() {
        this.offEvent = systemEventBus.on(SYSTEM_EVENTS.I18N_MESSAGES_UPDATE, () => {
            this.flushAll();
        });
    }

    register(component: any, nodeName: string, prop: string, text: string): void {
        let compMap = this.entries.get(component);
        if (!compMap) {
            compMap = new Map();
            this.entries.set(component, compMap);
        }
        let nodeMap = compMap.get(nodeName);
        if (!nodeMap) {
            nodeMap = new Map();
            compMap.set(nodeName, nodeMap);
        }
        nodeMap.set(prop, text);
    }

    unregister(component: any, nodeName: string, prop: string): void {
        const compMap = this.entries.get(component);
        if (!compMap) return;
        const nodeMap = compMap.get(nodeName);
        if (!nodeMap) return;
        nodeMap.delete(prop);
        if (nodeMap.size === 0) compMap.delete(nodeName);
        if (compMap.size === 0) this.entries.delete(component);
    }

    unregisterAll(component: any): void {
        this.entries.delete(component);
    }

    private flushAll(): void {
        for (const [component, compMap] of this.entries) {
            for (const [nodeName, nodeMap] of compMap) {
                const el = component.getNodeEl?.(nodeName);
                if (!el) continue;
                for (const [prop, text] of nodeMap) {
                    if (prop === 'textContent') {
                        (el as HTMLElement).textContent = resolveI18nValue(text);
                    } else {
                        (el as HTMLElement).setAttribute(prop, resolveI18nValue(text));
                    }
                }
            }
        }
    }

    dispose(): void {
        this.offEvent?.();
        this.offEvent = null;
        this.entries.clear();
    }
}

export const i18nTextRegistry = new I18nTextRegistry();

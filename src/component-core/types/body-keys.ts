/**
 * body-keys 类型定义
 */

export type BodyKeyCategory = 'static' | 'init' | 'exclude';

export interface BodyKeyDef {
    category: BodyKeyCategory;
    description: string;
    deprecated?: boolean;
    alias?: string;
}

export type DomainOverlayKey = 'tooltip' | 'overflowConfig' | 'submenu' | 'contextMenu';

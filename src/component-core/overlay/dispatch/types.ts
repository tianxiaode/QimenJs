export type OverlayTrigger = 'hover' | 'click' | 'focus' | 'contextmenu' | 'manual' | 'always';

export type OverlayPlacement =
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'left-start'
    | 'left-end'
    | 'right'
    | 'right-start'
    | 'right-end'
    | 'center';

export interface OverlayKeyDef {
    required?: boolean;
    description: string;
}

import { DragState } from '../types';

class DragStateManager {
    private static instance: DragStateManager;
    private _activeDrag: DragState | null = null;

    static getInstance(): DragStateManager {
        if (!DragStateManager.instance) {
            DragStateManager.instance = new DragStateManager();
        }
        return DragStateManager.instance;
    }

    getActiveDrag(): DragState | null {
        return this._activeDrag;
    }

    setActiveDrag(state: DragState | null): void {
        this._activeDrag = state;
    }

    isDragging(): boolean {
        return this._activeDrag !== null;
    }

    reset(): void {
        this._activeDrag = null;
    }
}

export const dragStateManager = DragStateManager.getInstance();

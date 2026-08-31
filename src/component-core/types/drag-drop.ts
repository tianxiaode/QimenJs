import { IComponentCore } from './component';

export interface IDropZone extends IComponentCore {
    dragEnterHandler: (e: DragEvent) => void;
    dragOverHandler: (e: DragEvent) => void;
    dragLeaveHandler: (e: DragEvent) => void;
    dropHandler: (e: DragEvent) => void;
}

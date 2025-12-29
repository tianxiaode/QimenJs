import { GestureEventDescriptor, GestureSemantic } from '../semantic-map';
import { GestureProcessor } from './GestureProcessor';
import { TapProcessor } from './TapProcessor';
import { DragProcessor } from './DragProcessor';
import { LongPressProcessor } from './LongPressProcessor';
import { DoubleTapProcessor } from './DoubleTapProcessor';
import { SwipeProcessor } from './SwipeProcessor';
import { HoverProcessor } from './HoverProcessor';
import { ContextMenuProcessor } from './ContextMenuProcessor';
import { SubmitProcessor } from './SubmitProcessor';
import { GestureEmit } from './types';
import { GestureError } from '../../errors/GestureError'; // 导入新错误类

export type GestureProcessorFactory = <S extends GestureSemantic>(
    descriptor: GestureEventDescriptor<S>,
    emit: (event: GestureEmit) => void
) => GestureProcessor<S>;

const processorRegistry = {
    tapProcessor: TapProcessor,
    doubleTapProcessor: DoubleTapProcessor,
    longPressProcessor: LongPressProcessor,
    panProcessor: DragProcessor, // ✅ 修正：drag 使用 panProcessor
    swipeProcessor: SwipeProcessor,
    hoverProcessor: HoverProcessor,
    contextMenuProcessor: ContextMenuProcessor,
    enterKeyProcessor: SubmitProcessor, // ✅ 修正：submit 使用 enterKeyProcessor
} as const;

export function createGestureProcessor<S extends GestureSemantic>(
    descriptor: GestureEventDescriptor<S>,
    emit: (event: GestureEmit) => void
): GestureProcessor<S> {
    const processorKey = descriptor.processor as keyof typeof processorRegistry;
    const ProcessorCtor = processorRegistry[processorKey];

    if (!ProcessorCtor) {
        throw new GestureError(`Unknown gesture processor: ${descriptor.processor}`, {
            processor: descriptor.processor,
            semantic: descriptor.semantic,
        });
    }

    // 实际上，processor 和 semantic 是关联的，我们需要从外部传入或通过其他方式获取
    // 这里我们假设 S 类型就是我们需要的语义类型
    return new ProcessorCtor(descriptor.semantic, emit, descriptor.constraints);
}
import { ComponentError, GestureError, KernelError, KernelErrorCode } from '@/error';

describe('KernelError', () => {
    it('should create instance with message and code', () => {
        const error = new KernelError('test', KernelErrorCode.ENTITY_NOT_FOUND);
        expect(error).toBeInstanceOf(KernelError);
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('test');
        expect(error.code).toBe(KernelErrorCode.ENTITY_NOT_FOUND);
    });

    it('should create instance with context', () => {
        const ctx = { entityId: '123' };
        const error = new KernelError('not found', KernelErrorCode.ENTITY_NOT_FOUND, ctx);
        expect(error.context).toEqual(ctx);
    });

    it('should have correct prototype chain', () => {
        const error = new KernelError('test', KernelErrorCode.ENTITY_NOT_FOUND);
        expect(Object.getPrototypeOf(error)).toBe(KernelError.prototype);
    });
});

describe('ComponentError', () => {
    it('should create instance with message and code', () => {
        const error = new ComponentError('tpl error', KernelErrorCode.COMPONENT_TPL_KEY_NOT_FOUND);
        expect(error).toBeInstanceOf(ComponentError);
        expect(error).toBeInstanceOf(KernelError);
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('tpl error');
        expect(error.code).toBe(KernelErrorCode.COMPONENT_TPL_KEY_NOT_FOUND);
    });

    it('should create instance with context', () => {
        const ctx = { props: { labelPosition: 'top' } };
        const error = new ComponentError(
            '没有匹配的模板变体',
            KernelErrorCode.COMPONENT_TPL_KEY_NOT_FOUND,
            ctx
        );
        expect(error.context).toEqual(ctx);
    });

    it('should have correct prototype chain', () => {
        const error = new ComponentError('test', KernelErrorCode.COMPONENT_TPL_KEY_NOT_FOUND);
        expect(Object.getPrototypeOf(error)).toBe(ComponentError.prototype);
    });

    it('should be catchable as Error', () => {
        try {
            throw new ComponentError('test', KernelErrorCode.COMPONENT_BODY_INVALID_FIELD);
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
            expect((e as ComponentError).code).toBe(KernelErrorCode.COMPONENT_BODY_INVALID_FIELD);
        }
    });
});

describe('GestureError', () => {
    it('should create instance with message and code', () => {
        const error = new GestureError('gesture fail', KernelErrorCode.GESTURE_RECOGNITION_ERROR);
        expect(error).toBeInstanceOf(GestureError);
        expect(error).toBeInstanceOf(KernelError);
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('gesture fail');
        expect(error.code).toBe(KernelErrorCode.GESTURE_RECOGNITION_ERROR);
    });

    it('should create instance with context', () => {
        const ctx = { gestureType: 'swipe', minDistance: 50 };
        const error = new GestureError(
            'distance insufficient',
            KernelErrorCode.GESTURE_DISTANCE_INSUFFICIENT,
            ctx
        );
        expect(error.context).toEqual(ctx);
    });

    it('should have correct prototype chain', () => {
        const error = new GestureError('test', KernelErrorCode.GESTURE_RECOGNITION_ERROR);
        expect(Object.getPrototypeOf(error)).toBe(GestureError.prototype);
    });
});

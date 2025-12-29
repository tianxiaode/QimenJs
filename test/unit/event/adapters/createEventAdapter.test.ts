import { createEventAdapter } from '../../../../src/event/adapters/createEventAdapter';
import { DomEventAdapter } from '../../../../src/event/adapters/dom';

describe('createEventAdapter', () => {
    it('should return an instance of DomEventAdapter', () => {
        const adapter = createEventAdapter();
        
        expect(adapter).toBeDefined();
        expect(adapter).toBeInstanceOf(DomEventAdapter);
    });

    it('should return a new instance each time it is called', () => {
        const adapter1 = createEventAdapter();
        const adapter2 = createEventAdapter();
        
        expect(adapter1).not.toBe(adapter2);
    });

    it('should have bind method', () => {
        const adapter = createEventAdapter();
        
        expect(adapter.bind).toBeDefined();
        expect(typeof adapter.bind).toBe('function');
    });
});
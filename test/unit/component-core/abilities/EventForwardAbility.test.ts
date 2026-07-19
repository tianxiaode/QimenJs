import { EventForwardAbility } from '@/component-core/abilities/EventForwardAbility';

describe('EventForwardAbility', () => {
    it('提供 bindDomEventBindings 方法', () => {
        expect(typeof EventForwardAbility.bindDomEventBindings).toBe('function');
    });

    it('提供 _handleDomEvent 方法', () => {
        expect(typeof EventForwardAbility._handleDomEvent).toBe('function');
    });
});

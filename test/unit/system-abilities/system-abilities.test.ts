/**
 * System Abilities 单元测试
 *
 * 新架构下，System Abilities 是 AbilityDefinition（普通对象），
 * 不再是 class，不能 new。
 */

jest.mock('@/logger', () => {
    const actualLogger = jest.requireActual('@/logger');
    return {
        ...actualLogger,
        Logger: {
            ...actualLogger.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
            })),
        },
    };
});

import { EventAbility } from '@/system-abilities/system/EventAbility';
import { DomEventsAbility } from '@/system-abilities/system/DomEventsAbility';
import { DomainAbility } from '@/system-abilities/system/DomainAbility';
import { SystemAbility } from '@/system-abilities/system/SystemAbility';

describe('System Abilities', () => {
    describe('Ability Definitions', () => {
        it('EventAbility should be a valid AbilityDefinition', () => {
            expect(EventAbility).toBeDefined();
            expect(typeof EventAbility).toBe('object');
            expect(typeof EventAbility.on).toBe('function');
            expect(typeof EventAbility.emit).toBe('function');
        });

        it('DomainAbility should be a valid AbilityDefinition', () => {
            expect(DomainAbility).toBeDefined();
            expect(typeof DomainAbility).toBe('object');
        });

        it('SystemAbility should be a valid AbilityDefinition', () => {
            expect(SystemAbility).toBeDefined();
            expect(typeof SystemAbility).toBe('object');
        });

        it('DomEventsAbility should be a valid AbilityDefinition', () => {
            expect(DomEventsAbility).toBeDefined();
            expect(typeof DomEventsAbility).toBe('object');
        });
    });
});

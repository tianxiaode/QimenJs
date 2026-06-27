/**
 * System Abilities 单元测试
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
            }))
        }
    };
});

import { EventAbility } from '@/system-abilities/system/EventAbility';
import { DomEventsAbility } from '@/system-abilities/system/DomEventsAbility';
import { DomainAbility } from '@/system-abilities/system/DomainAbility';
import { SystemAbility } from '@/system-abilities/system/SystemAbility';

describe('System Abilities', () => {
    describe('Ability Classes', () => {
        it('should create EventAbility instance', () => {
            const ability = new EventAbility();
            expect(ability).toBeDefined();
            expect(ability.name).toBe('EventAbility');
        });
        
        it('should create DomainAbility instance', () => {
            const ability = new DomainAbility();
            expect(ability).toBeDefined();
            expect(ability.name).toBe('DomainAbility');
        });
        
        it('should create SystemAbility instance', () => {
            const ability = new SystemAbility();
            expect(ability).toBeDefined();
            expect(ability.name).toBe('SystemAbility');
        });
        
        it('should create DomEventsAbility instance', () => {
            const ability = new DomEventsAbility();
            expect(ability).toBeDefined();
            expect(ability.name).toBe('DomEventsAbility');
        });
    });
    
    describe('Static metadata', () => {
        it('EventAbility should have description', () => {
            expect(EventAbility.description).toBeDefined();
        });
        
        it('DomEventsAbility should have deps', () => {
            expect(DomEventsAbility.deps).toContain('EventAbility');
        });
        
        it('DomainAbility should have description', () => {
            expect(DomainAbility.description).toBeDefined();
        });
        
        it('SystemAbility should have description', () => {
            expect(SystemAbility.description).toBeDefined();
        });
    });
});

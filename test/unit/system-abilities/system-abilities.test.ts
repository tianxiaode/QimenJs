/**
 * System Abilities 单元测试
 */

// Mock Logger to avoid issues in test environment
jest.mock('@orbitjs/logger', () => {
    const actualLogger = jest.requireActual('@orbitjs/logger');
    return {
        ...actualLogger,
        Logger: {
            ...actualLogger.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
                child: jest.fn().mockReturnValue({
                    debug: jest.fn(),
                    info: jest.fn(),
                    warn: jest.fn(),
                    error: jest.fn(),
                    child: jest.fn(),
                }),
            }))
        }
    };
});

import { ComposableRegistrar } from '@/composable';
import {
    EventAbilityEntry,
    DomEventsAbilityEntry,
    DomainConfigAbilityEntry,
    SystemConfigAbilityEntry,
    registerSystemAbilities,
} from '@/system-abilities';

describe('System Abilities', () => {
    let registrar: ComposableRegistrar;
    
    beforeEach(() => {
        registrar = new ComposableRegistrar();
    });
    
    describe('Ability Entries', () => {
        it('should have EventAbilityEntry', () => {
            expect(EventAbilityEntry.name).toBe('EventAbility');
            expect(EventAbilityEntry.description).toBeDefined();
            expect(EventAbilityEntry.abilityClass).toBeDefined();
        });
        
        it('should have DomEventsAbilityEntry', () => {
            expect(DomEventsAbilityEntry.name).toBe('DomEventsAbility');
            expect(DomEventsAbilityEntry.description).toBeDefined();
            expect(DomEventsAbilityEntry.abilityClass).toBeDefined();
            expect(DomEventsAbilityEntry.deps).toContain('EventAbility');
        });
        
        it('should have DomainConfigAbilityEntry', () => {
            expect(DomainConfigAbilityEntry.name).toBe('DomainAbility');
            expect(DomainConfigAbilityEntry.description).toBeDefined();
            expect(DomainConfigAbilityEntry.abilityClass).toBeDefined();
        });
        
        it('should have SystemConfigAbilityEntry', () => {
            expect(SystemConfigAbilityEntry.name).toBe('SystemAbility');
            expect(SystemConfigAbilityEntry.description).toBeDefined();
            expect(SystemConfigAbilityEntry.abilityClass).toBeDefined();
        });
    });
    
    describe('registerSystemAbilities', () => {
        it('should register all system abilities', () => {
            registerSystemAbilities(registrar);
            
            // 验证所有能力都已注册
            expect(registrar.get('EventAbility')).toBeDefined();
            expect(registrar.get('DomEventsAbility')).toBeDefined();
            expect(registrar.get('DomainAbility')).toBeDefined();
            expect(registrar.get('SystemAbility')).toBeDefined();
        });
        
        it('should register abilities with correct names', () => {
            registerSystemAbilities(registrar);
            
            const eventEntry = registrar.get('EventAbility');
            expect(eventEntry?.name).toBe('EventAbility');
            
            const domEventsEntry = registrar.get('DomEventsAbility');
            expect(domEventsEntry?.name).toBe('DomEventsAbility');
            
            const domainEntry = registrar.get('DomainAbility');
            expect(domainEntry?.name).toBe('DomainAbility');
            
            const systemEntry = registrar.get('SystemAbility');
            expect(systemEntry?.name).toBe('SystemAbility');
        });
        
        it('should allow getting precompiled abilities', () => {
            registerSystemAbilities(registrar);
            
            // 获取预编译能力
            const eventPrecompiled = registrar.getPrecompiled('EventAbility');
            expect(eventPrecompiled).toBeDefined();
            
            const domainPrecompiled = registrar.getPrecompiled('DomainAbility');
            expect(domainPrecompiled).toBeDefined();
            
            const systemPrecompiled = registrar.getPrecompiled('SystemAbility');
            expect(systemPrecompiled).toBeDefined();
        });
    });
    
    describe('Ability Classes', () => {
        it('should create EventAbility instance', () => {
            const ability = new EventAbilityEntry.abilityClass();
            expect(ability).toBeDefined();
            expect(ability.name).toBe('Event');
        });
        
        it('should create DomainAbility instance', () => {
            const ability = new DomainConfigAbilityEntry.abilityClass();
            expect(ability).toBeDefined();
            expect(ability.name).toBe('Domain');
        });
        
        it('should create SystemAbility instance', () => {
            const ability = new SystemConfigAbilityEntry.abilityClass();
            expect(ability).toBeDefined();
            expect(ability.name).toBe('System');
        });
        
        it('should create DomEventsAbility instance', () => {
            const ability = new DomEventsAbilityEntry.abilityClass();
            expect(ability).toBeDefined();
            expect(ability.name).toBe('DomEvents');
        });
    });
});

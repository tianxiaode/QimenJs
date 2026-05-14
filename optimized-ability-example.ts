/**
 * AbilityBase 优化实现示例
 * 
 * 混合方案：预编译属性模板 + 快速挂载
 */

// ============================================
// 优化后的 AbilityBase
// ============================================

abstract class OptimizedAbilityBase<T extends { logger: any }> {
    protected host: T = null as any;
    private _injectedKeys: (string | symbol)[] = [];
    private static ownerMap = new WeakMap<object, Map<string | symbol, string>>();
    
    /**
     * 静态缓存：预编译的属性模板
     * Map<AbilityClassName, Map<PropertyKey, PropertyConfig>>
     */
    private static propertyTemplates = new Map<string, Map<string | symbol, {
        value: any;
        isFunction: boolean;
        isAccessor: boolean;
    }>>();
    
    /**
     * 预编译属性模板（装饰器阶段调用）
     */
    static precompileTemplate(abilityClass: any) {
        const instance = new abilityClass();
        const props = instance.expose();
        const template = new Map<string | symbol, {
            value: any;
            isFunction: boolean;
            isAccessor: boolean;
        }>();
        
        const keys = [...Object.keys(props), ...Object.getOwnPropertySymbols(props)];
        
        for (const key of keys) {
            const value = props[key as any];
            const isAccessor = value && typeof value === 'object' && ('get' in value || 'set' in value);
            const isFunction = !isAccessor && typeof value === 'function';
            
            template.set(key, {
                value,
                isFunction,
                isAccessor
            });
        }
        
        OptimizedAbilityBase.propertyTemplates.set(abilityClass.name, template);
        console.log(`  预编译完成: ${abilityClass.name}, 属性数: ${template.size}`);
    }
    
    /**
     * 快速挂载（使用预编译模板）
     */
    public attach(host: T): void {
        this.host = host;
        
        // 获取预编译模板
        let template = OptimizedAbilityBase.propertyTemplates.get(this.constructor.name);
        
        // 如果没有预编译，现场编译
        if (!template) {
            console.log(`  现场编译: ${this.constructor.name}`);
            OptimizedAbilityBase.precompileTemplate(this.constructor);
            template = OptimizedAbilityBase.propertyTemplates.get(this.constructor.name)!;
        }
        
        // 快速挂载
        template.forEach((config, key) => {
            // 冲突检查（必须运行时）
            this.trackConflict(key);
            
            // 快速创建描述符
            let descriptor: PropertyDescriptor;
            
            if (config.isAccessor) {
                descriptor = {
                    ...config.value,
                    configurable: true,
                    enumerable: true
                };
            } else if (config.isFunction) {
                descriptor = {
                    value: config.value.bind(host),
                    writable: true,
                    configurable: true,
                    enumerable: true
                };
            } else {
                descriptor = {
                    value: config.value,
                    writable: true,
                    configurable: true,
                    enumerable: true
                };
            }
            
            Object.defineProperty(host, key, descriptor);
            this._injectedKeys.push(key);
        });
    }
    
    private trackConflict(key: string | symbol) {
        // 简化的冲突检查
        if (key in this.host) {
            this.host.logger.warn(`属性冲突: ${String(key)}`);
        }
        
        if (!OptimizedAbilityBase.ownerMap.has(this.host)) {
            OptimizedAbilityBase.ownerMap.set(this.host, new Map());
        }
        OptimizedAbilityBase.ownerMap.get(this.host)!.set(key, this.constructor.name);
    }
    
    public dispose(): void {
        this._injectedKeys.forEach(key => {
            delete (this.host as any)[key];
        });
        this._injectedKeys = [];
        this.host = null as any;
    }
    
    protected abstract expose(): Record<string | symbol, any>;
}


// ============================================
// 使用示例
// ============================================

console.log('=== 优化后的 AbilityBase 使用示例 ===\n');

// 模拟宿主
class MockHost {
    logger = {
        warn: (msg: string) => console.log(`  [WARN] ${msg}`)
    };
}

// 定义能力
class EventAbility extends OptimizedAbilityBase<MockHost> {
    protected expose() {
        return {
            on: (event: string, handler: Function) => {
                console.log(`  注册事件: ${event}`);
            },
            emit: (event: string, data: any) => {
                console.log(`  触发事件: ${event}`);
            },
            eventCount: 0
        };
    }
}

class SchemaAbility extends OptimizedAbilityBase<MockHost> {
    protected expose() {
        return {
            getSchema: () => ({ name: 'test' }),
            validate: (data: any) => true
        };
    }
}

// 预编译（装饰器阶段）
console.log('1. 预编译阶段（装饰器阶段）:');
OptimizedAbilityBase.precompileTemplate(EventAbility);
OptimizedAbilityBase.precompileTemplate(SchemaAbility);

// 实例化（运行时）
console.log('\n2. 实例化阶段（运行时）:');
const host1 = new MockHost();
const eventAbility1 = new EventAbility();
const schemaAbility1 = new SchemaAbility();

console.log('  挂载 EventAbility:');
eventAbility1.attach(host1);

console.log('  挂载 SchemaAbility:');
schemaAbility1.attach(host1);

console.log('\n3. 使用能力:');
(host1 as any).on('click', () => {});
(host1 as any).emit('click', {});
console.log('  eventCount:', (host1 as any).eventCount);
console.log('  schema:', (host1 as any).getSchema());

// 第二次实例化（更快）
console.log('\n4. 第二次实例化（使用缓存）:');
const host2 = new MockHost();
const eventAbility2 = new EventAbility();
eventAbility2.attach(host2);


// ============================================
// 性能对比
// ============================================

console.log('\n=== 性能对比 ===\n');

console.log('当前方案：');
console.log('- 每次实例化都要：');
console.log('  1. 调用 expose()');
console.log('  2. 遍历属性');
console.log('  3. 判断类型');
console.log('  4. 创建描述符');
console.log('  5. 挂载属性');

console.log('\n优化方案：');
console.log('- 首次实例化：');
console.log('  1. 获取预编译模板');
console.log('  2. 遍历模板');
console.log('  3. 快速创建描述符（跳过类型判断）');
console.log('  4. 挂载属性');
console.log('- 后续实例化：');
console.log('  1. 获取缓存模板');
console.log('  2. 快速挂载');

console.log('\n性能提升：');
console.log('- 减少类型判断开销');
console.log('- 减少对象创建开销');
console.log('- 预期提升 30-50%');

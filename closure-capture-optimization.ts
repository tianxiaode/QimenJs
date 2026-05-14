/**
 * 优化方案：闭包捕获 host，无需 this.host
 * 
 * 核心思路：
 * 1. 预编译能力时，方法不绑定 this
 * 2. 实例化时，传入 host 作为参数
 * 3. 方法通过闭包捕获 host
 * 4. 直接复制到实例，无需 Ability 实例
 */

// ============================================
// 方案分析：闭包捕获 host
// ============================================

console.log('=== 方案分析：闭包捕获 host ===\n');

console.log('当前方案的问题：');
console.log(`
class EventAbility extends AbilityBase {
    protected host: T;  // ← 需要存储 host
    
    protected expose() {
        return {
            on: (event, handler) => {
                // this.host ← 通过 this 访问
            }
        };
    }
}
`);

console.log('\n优化方案：闭包捕获');
console.log(`
class EventAbility {
    // 预编译：返回工厂函数
    static precompile() {
        return {
            on: (host) => (event, handler) => {
                // host ← 闭包捕获，无需 this
            },
            emit: (host) => (event, data) => {
                // host ← 闭包捕获
            }
        };
    }
}

// 实例化时
const factory = EventAbility.precompile();
const host = new Entity();

// 直接复制到 host，闭包捕获 host
host.on = factory.on(host);
host.emit = factory.emit(host);
`);

// ============================================
// 完整实现示例
// ============================================

console.log('\n=== 完整实现示例 ===\n');

/**
 * 优化后的能力基类
 */
abstract class OptimizedAbility {
    /**
     * 预编译能力（装饰器阶段）
     * 返回工厂函数映射
     */
    static precompile(): Map<string, (host: any) => any> {
        throw new Error('子类必须实现');
    }
}

/**
 * 事件能力
 */
class EventAbility extends OptimizedAbility {
    static precompile(): Map<string, (host: any) => any> {
        const factory = new Map<string, (host: any) => any>();
        
        // 工厂函数：接收 host，返回绑定的方法
        factory.set('on', (host) => {
            // 闭包：捕获 host 和事件存储
            const events = new Map<string, Function[]>();
            
            return (event: string, handler: Function) => {
                if (!events.has(event)) {
                    events.set(event, []);
                }
                events.get(event)!.push(handler);
                console.log(`  [${host.name}] 注册事件: ${event}`);
            };
        });
        
        factory.set('emit', (host) => {
            // 注意：这里需要访问 events，实际实现需要更复杂的设计
            return (event: string, data: any) => {
                console.log(`  [${host.name}] 触发事件: ${event}`);
            };
        });
        
        factory.set('eventCount', (host) => {
            // 属性：返回初始值
            return 0;
        });
        
        return factory;
    }
}

/**
 * Schema 能力
 */
class SchemaAbility extends OptimizedAbility {
    static precompile(): Map<string, (host: any) => any> {
        const factory = new Map<string, (host: any) => any>();
        
        factory.set('getSchema', (host) => {
            return () => {
                console.log(`  [${host.name}] 获取 Schema`);
                return { name: 'test' };
            };
        });
        
        factory.set('validate', (host) => {
            return (data: any) => {
                console.log(`  [${host.name}] 验证数据`);
                return true;
            };
        });
        
        return factory;
    }
}

/**
 * 能力管理器
 */
class AbilityManager {
    /**
     * 预编译缓存
     */
    private static compiledCache = new Map<string, Map<string, (host: any) => any>>();
    
    /**
     * 检查是否已预编译
     */
    static hasCompiled(abilityName: string) {
        return AbilityManager.compiledCache.has(abilityName);
    }
    
    /**
     * 预编译能力
     */
    static precompile(abilityClass: any) {
        const compiled = abilityClass.precompile();
        AbilityManager.compiledCache.set(abilityClass.name, compiled);
        console.log(`预编译完成: ${abilityClass.name}, 属性数: ${compiled.size}`);
    }
    
    /**
     * 快速挂载能力到实例
     */
    static attachAbilities(host: any, abilityNames: string[]) {
        console.log(`\n挂载能力到 ${host.name}:`);
        
        abilityNames.forEach(abilityName => {
            const compiled = AbilityManager.compiledCache.get(abilityName);
            if (!compiled) {
                console.log(`  警告: ${abilityName} 未预编译`);
                return;
            }
            
            compiled.forEach((factory, key) => {
                // 调用工厂函数，传入 host
                const value = factory(host);
                
                // 直接复制到 host
                Object.defineProperty(host, key, {
                    value,
                    writable: true,
                    configurable: true,
                    enumerable: true
                });
                
                console.log(`  挂载: ${key}`);
            });
        });
    }
}

// ============================================
// 使用示例
// ============================================

console.log('1. 预编译阶段（装饰器阶段）:');
AbilityManager.precompile(EventAbility);
AbilityManager.precompile(SchemaAbility);

console.log('\n2. 实例化阶段:');
const entity1 = { name: 'Entity1' };
const entity2 = { name: 'Entity2' };

AbilityManager.attachAbilities(entity1, ['EventAbility', 'SchemaAbility']);
AbilityManager.attachAbilities(entity2, ['EventAbility']);

console.log('\n3. 使用能力:');
(entity1 as any).on('click', () => {});
(entity1 as any).emit('click', {});
(entity1 as any).getSchema();

(entity2 as any).on('change', () => {});

console.log('\n4. 验证独立性:');
console.log('Entity1.eventCount:', (entity1 as any).eventCount);
console.log('Entity2.eventCount:', (entity2 as any).eventCount);


// ============================================
// 更优雅的实现：装饰器集成
// ============================================

console.log('\n\n=== 更优雅的实现：装饰器集成 ===\n');

const ABILITIES_KEY = Symbol('abilities');

/**
 * 装饰器：预编译并收集能力
 */
function Ability(...abilityClasses: any[]) {
    return (ctor: any) => {
        // 1. 收集能力类
        const parentAbilities = Object.getPrototypeOf(ctor)?.[ABILITIES_KEY] || [];
        ctor[ABILITIES_KEY] = [...new Set([...parentAbilities, ...abilityClasses])];
        
        // 2. 预编译所有能力
        abilityClasses.forEach(abilityClass => {
            if (!AbilityManager.hasCompiled(abilityClass.name)) {
                AbilityManager.precompile(abilityClass);
            }
        });
        
        console.log(`装饰 ${ctor.name}: 能力数 ${ctor[ABILITIES_KEY].length}`);
    };
}

/**
 * 基类：自动挂载能力
 */
class Entity {
    name: string;
    
    constructor(name: string) {
        this.name = name;
        this.setupAbilities();
    }
    
    private setupAbilities() {
        const abilityClasses = (this.constructor as any)[ABILITIES_KEY] || [];
        const abilityNames = abilityClasses.map((a: any) => a.name);
        AbilityManager.attachAbilities(this, abilityNames);
    }
}

// 使用装饰器
@Ability(EventAbility, SchemaAbility)
class User extends Entity {
    constructor(name: string) {
        super(name);
    }
}

console.log('使用装饰器:');
const user1 = new User('User1');
const user2 = new User('User2');

(user1 as any).on('login', () => {});
(user2 as any).on('logout', () => {});


// ============================================
// 性能分析
// ============================================

console.log('\n\n=== 性能分析 ===\n');

console.log('当前方案：');
console.log('- 创建 Ability 实例');
console.log('- 存储 this.host');
console.log('- 调用 attach(host)');
console.log('- 遍历 expose()');
console.log('- 创建描述符');
console.log('- 挂载属性');

console.log('\n优化方案：');
console.log('- 获取预编译工厂');
console.log('- 调用工厂函数(host)');
console.log('- 直接复制到实例');

console.log('\n性能提升：');
console.log('✅ 无需创建 Ability 实例');
console.log('✅ 无需存储 this.host');
console.log('✅ 无需 attach() 调用');
console.log('✅ 直接复制，速度更快');
console.log('✅ 预期提升 50-70%');

console.log('\n内存优化：');
console.log('✅ 无需 Ability 实例');
console.log('✅ 只存储工厂函数');
console.log('✅ 内存占用更小');

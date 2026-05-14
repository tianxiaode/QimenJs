/**
 * 销毁能力分析
 * 
 * 问题：当前方案中，能力没有实例，如何处理销毁？
 */

// ============================================
// 问题分析
// ============================================

console.log('=== 问题分析 ===\n');

console.log('当前方案的销毁流程：');
console.log(`
class ComposableBase {
    private _instances: IComposable[] = [];
    
    public dispose() {
        // 遍历能力实例，调用销毁
        for (let i = this._instances.length - 1; i >= 0; i--) {
            const c = this._instances[i];
            c.dispose?.();  // ← 需要能力实例
        }
    }
}
`);

console.log('优化方案的问题：');
console.log('❌ 没有能力实例');
console.log('❌ 无法调用 dispose()');
console.log('❌ 无法执行清理逻辑');


// ============================================
// 解决方案1：在闭包中存储销毁函数
// ============================================

console.log('\n=== 解决方案1：闭包存储销毁函数 ===\n');

interface IPrecompiledAbility {
    factories: Map<string, (host: any) => any>;
    disposers: Map<string, (host: any) => () => void>;  // 销毁函数工厂
    name: string;
}

class EventAbilityWithDispose {
    name = 'Event';
    
    static precompile(): { 
        factories: Map<string, (host: any) => any>;
        disposers: Map<string, (host: any) => () => void>;
    } {
        const factories = new Map<string, (host: any) => any>();
        const disposers = new Map<string, (host: any) => () => void>();
        
        // on 方法
        factories.set('on', (host) => {
            const events = new Map<string, Function[]>();
            
            // 存储到 host 上，供 dispose 使用
            (host as any).__event_data__ = events;
            
            return (event: string, handler: Function) => {
                if (!events.has(event)) {
                    events.set(event, []);
                }
                events.get(event)!.push(handler);
            };
        });
        
        // emit 方法
        factories.set('emit', (host) => {
            return (event: string, data: any) => {
                const events = (host as any).__event_data__;
                // 触发事件...
            };
        });
        
        // 销毁函数
        disposers.set('dispose', (host) => {
            return () => {
                const events = (host as any).__event_data__;
                if (events) {
                    events.clear();
                    delete (host as any).__event_data__;
                    console.log('  清理事件数据');
                }
            };
        });
        
        return { factories, disposers };
    }
}

console.log('方案1实现：');
console.log(`
// 预编译时返回销毁函数工厂
{
    factories: Map<属性名, 工厂函数>,
    disposers: Map<销毁名, 销毁工厂函数>
}

// 实例化时
const ability = registrar.get('Event');
ability.factories.forEach((factory, key) => {
    host[key] = factory(host);
});

// 同时创建销毁函数
ability.disposers.forEach((disposer, key) => {
    host[key] = disposer(host);
});
`);

console.log('优点：');
console.log('✅ 销毁函数也是闭包');
console.log('✅ 可以访问闭包中的状态');
console.log('✅ 无需能力实例');

console.log('\n缺点：');
console.log('⚠️ 销毁函数暴露到 host 上');
console.log('⚠️ 可能与能力属性冲突');


// ============================================
// 解决方案2：存储销毁函数数组
// ============================================

console.log('\n\n=== 解决方案2：存储销毁函数数组 ===\n');

interface IPrecompiledAbilityV2 {
    factories: Map<string, (host: any) => any>;
    createDisposer: (host: any) => () => void;  // 单个销毁函数工厂
    name: string;
}

class EventAbilityV2 {
    name = 'Event';
    
    static precompile(): IPrecompiledAbilityV2 {
        const factories = new Map<string, (host: any) => any>();
        
        factories.set('on', (host) => {
            const events = new Map<string, Function[]>();
            (host as any).__event_data__ = events;
            
            return (event: string, handler: Function) => {
                if (!events.has(event)) {
                    events.set(event, []);
                }
                events.get(event)!.push(handler);
            };
        });
        
        factories.set('emit', (host) => {
            return (event: string, data: any) => {};
        });
        
        // 销毁函数工厂
        const createDisposer = (host: any) => {
            return () => {
                const events = (host as any).__event_data__;
                if (events) {
                    events.clear();
                    delete (host as any).__event_data__;
                    console.log('  清理事件数据');
                }
            };
        };
        
        return { factories, createDisposer, name: 'Event' };
    }
}

console.log('方案2实现：');
console.log(`
interface IPrecompiledAbility {
    factories: Map<属性名, 工厂函数>;
    createDisposer: (host) => () => void;  // 销毁函数工厂
}

// 实例化时
const ability = registrar.get('Event');
const disposers: (() => void)[] = [];

// 挂载能力
ability.factories.forEach((factory, key) => {
    host[key] = factory(host);
});

// 创建销毁函数
disposers.push(ability.createDisposer(host));

// 销毁时
disposers.forEach(disposer => disposer());
`);

console.log('优点：');
console.log('✅ 销毁函数不暴露到 host');
console.log('✅ 统一管理销毁函数');
console.log('✅ 更清晰的设计');

console.log('\n缺点：');
console.log('⚠️ 需要存储销毁函数数组');


// ============================================
// 解决方案3：在 host 上存储销毁函数（推荐）
// ============================================

console.log('\n\n=== 解决方案3：在 host 上存储销毁函数（推荐） ===\n');

const DISPOSERS_KEY = Symbol('__disposers__');

interface IPrecompiledAbilityV3 {
    factories: Map<string, (host: any) => any>;
    createDisposer?: (host: any) => () => void;  // 可选的销毁函数工厂
    name: string;
}

class ComposableBaseV3 {
    name: string;
    
    constructor(name: string) {
        this.name = name;
        // 初始化销毁函数数组
        Object.defineProperty(this, DISPOSERS_KEY, {
            value: [] as (() => void)[],
            enumerable: false,
            configurable: true
        });
        
        this.setupAbilities();
    }
    
    private setupAbilities() {
        const abilityNames = (this.constructor as any)[Symbol.for('abilities')] || [];
        
        abilityNames.forEach((name: string) => {
            const ability = registrar.get(name);
            if (!ability) return;
            
            // 挂载能力
            ability.factories.forEach((factory, key) => {
                Object.defineProperty(this, key, {
                    value: factory(this),
                    writable: true,
                    configurable: true,
                    enumerable: true
                });
            });
            
            // 创建并存储销毁函数
            if (ability.createDisposer) {
                const disposer = ability.createDisposer(this);
                (this as any)[DISPOSERS_KEY].push(disposer);
            }
        });
    }
    
    public dispose() {
        console.log(`销毁 ${this.name}:`);
        
        // 按逆序执行销毁函数
        const disposers = (this as any)[DISPOSERS_KEY] as (() => void)[];
        for (let i = disposers.length - 1; i >= 0; i--) {
            try {
                disposers[i]();
            } catch (e) {
                console.error('销毁错误:', e);
            }
        }
        
        // 清空销毁函数数组
        disposers.length = 0;
    }
}

console.log('方案3实现：');
console.log(`
// 1. 预编译时提供销毁函数工厂
interface IPrecompiledAbility {
    factories: Map<属性名, 工厂函数>;
    createDisposer?: (host) => () => void;  // 可选
}

// 2. 实例化时
class ComposableBase {
    constructor() {
        // 初始化销毁函数数组（Symbol 存储）
        this[DISPOSERS_KEY] = [];
        
        // 挂载能力
        ability.factories.forEach((factory, key) => {
            this[key] = factory(this);
        });
        
        // 创建并存储销毁函数
        if (ability.createDisposer) {
            this[DISPOSERS_KEY].push(ability.createDisposer(this));
        }
    }
    
    // 3. 销毁时
    dispose() {
        // 按逆序执行销毁函数
        for (let i = this[DISPOSERS_KEY].length - 1; i >= 0; i--) {
            this[DISPOSERS_KEY][i]();
        }
    }
}
`);

console.log('优点：');
console.log('✅ 销毁函数存储在 host 上（Symbol）');
console.log('✅ 不暴露到公共 API');
console.log('✅ 统一管理销毁');
console.log('✅ 按逆序销毁（与当前方案一致）');
console.log('✅ 可选的销毁函数（能力可以不提供）');


// ============================================
// 完整示例
// ============================================

console.log('\n\n=== 完整示例 ===\n');

// 模拟注册中心
const registrar = {
    abilities: new Map<string, IPrecompiledAbilityV3>(),
    
    register(ability: IPrecompiledAbilityV3) {
        this.abilities.set(ability.name, ability);
    },
    
    get(name: string) {
        return this.abilities.get(name);
    }
};

// 定义能力
class EventAbilityComplete {
    static precompile(): IPrecompiledAbilityV3 {
        const factories = new Map<string, (host: any) => any>();
        
        factories.set('on', (host) => {
            const events = new Map<string, Function[]>();
            (host as any).__event_data__ = events;
            
            return (event: string, handler: Function) => {
                if (!events.has(event)) {
                    events.set(event, []);
                }
                events.get(event)!.push(handler);
                console.log(`  [${host.name}] 注册事件: ${event}`);
            };
        });
        
        factories.set('emit', (host) => {
            return (event: string, data: any) => {
                console.log(`  [${host.name}] 触发事件: ${event}`);
            };
        });
        
        const createDisposer = (host: any) => {
            return () => {
                const events = (host as any).__event_data__;
                if (events) {
                    console.log(`  [${host.name}] 清理 ${events.size} 个事件`);
                    events.clear();
                    delete (host as any).__event_data__;
                }
            };
        };
        
        return { factories, createDisposer, name: 'Event' };
    }
}

class SchemaAbilityComplete {
    static precompile(): IPrecompiledAbilityV3 {
        const factories = new Map<string, (host: any) => any>();
        
        factories.set('getSchema', (host) => {
            const schema = { name: 'test', cached: true };
            (host as any).__schema_data__ = schema;
            
            return () => {
                console.log(`  [${host.name}] 获取 Schema`);
                return schema;
            };
        });
        
        const createDisposer = (host: any) => {
            return () => {
                if ((host as any).__schema_data__) {
                    console.log(`  [${host.name}] 清理 Schema 缓存`);
                    delete (host as any).__schema_data__;
                }
            };
        };
        
        return { factories, createDisposer, name: 'Schema' };
    }
}

// 注册能力
console.log('注册能力:');
registrar.register(EventAbilityComplete.precompile());
registrar.register(SchemaAbilityComplete.precompile());

// 实例化（需要装饰器）
console.log('\n实例化:');
// 模拟装饰器
class TestEntity extends ComposableBaseV3 {
    constructor() {
        super('TestEntity');
    }
}
(TestEntity as any)[Symbol.for('abilities')] = ['Event', 'Schema'];

const host = new TestEntity();

// 使用能力
console.log('\n使用能力:');
(host as any).on('click', () => {});
(host as any).on('change', () => {});
(host as any).emit('click', {});
(host as any).getSchema();

// 销毁
console.log('\n销毁:');
host.dispose();


// ============================================
// 总结
// ============================================

console.log('\n\n=== 总结 ===\n');

console.log('推荐方案：方案3（在 host 上存储销毁函数）');
console.log('');
console.log('实现要点：');
console.log('1. 预编译时提供 createDisposer 工厂函数');
console.log('2. 实例化时创建销毁函数并存储到 host');
console.log('3. 使用 Symbol 存储，不暴露到公共 API');
console.log('4. 销毁时按逆序执行销毁函数');
console.log('');
console.log('优势：');
console.log('✅ 无需能力实例');
console.log('✅ 销毁逻辑完整');
console.log('✅ 与当前方案行为一致');
console.log('✅ 性能最优');

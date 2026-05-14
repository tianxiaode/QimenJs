/**
 * 原型链爬取必要性演示
 * 
 * 这个文件演示为什么需要原型链爬取，以及直接从类获取的问题
 */

// ============================================
// 场景1：单层继承 - 直接获取可行
// ============================================

@Ability('Event')
class BaseManager extends ComposableBase {
    // BaseManager[ABILITIES_KEY] = ['Event']
}

@Ability('Domain')
class EntityManager extends BaseManager {
    // EntityManager[ABILITIES_KEY] = ['Domain']
    // ❌ 问题：只拿到了自己的['Domain']，丢失了父类的['Event']
}

// 如果直接从类获取：
// EntityManager[ABILITIES_KEY] → ['Domain']  // ❌ 缺少Event
// 需要的能力：['Event', 'Domain']


// ============================================
// 场景2：多层继承 - 原型链爬取的必要性
// ============================================

@Ability('Event')
class Level1 extends ComposableBase {
    // Level1[ABILITIES_KEY] = ['Event']
}

@Ability('Domain')
class Level2 extends Level1 {
    // Level2[ABILITIES_KEY] = ['Domain']
    // ❌ 只有['Domain']，没有['Event']
}

@Ability('Schema')
class Level3 extends Level2 {
    // Level3[ABILITIES_KEY] = ['Schema']
    // ❌ 只有['Schema']，没有['Event', 'Domain']
}

// 原型链结构：
// Level3 → Level2 → Level1 → ComposableBase → Object

// 原型链爬取过程：
// 1. Level3[ABILITIES_KEY] → ['Schema']
// 2. Level2[ABILITIES_KEY] → ['Domain']
// 3. Level1[ABILITIES_KEY] → ['Event']
// 4. ComposableBase[ABILITIES_KEY] → undefined
// 结果：['Event', 'Domain', 'Schema'] ✅


// ============================================
// 场景3：装饰器改进方案 - 在装饰器阶段收集
// ============================================

// 改进后的装饰器
function AbilityImproved(...keys: string[]) {
    return (ctor: any) => {
        // 关键：在装饰器执行时，父类已经装饰完成
        const parentAbilities = Object.getPrototypeOf(ctor)?.[ABILITIES_KEY] || [];
        
        // 合并父类和自己的能力
        ctor[ABILITIES_KEY] = [...new Set([...parentAbilities, ...keys])];
        
        console.log(`${ctor.name} abilities:`, ctor[ABILITIES_KEY]);
    };
}

// 执行顺序：
// 1. 装饰 Level1：parentAbilities = []，结果 = ['Event']
// 2. 装饰 Level2：parentAbilities = ['Event']，结果 = ['Event', 'Domain']
// 3. 装饰 Level3：parentAbilities = ['Event', 'Domain']，结果 = ['Event', 'Domain', 'Schema']

@AbilityImproved('Event')
class ImprovedLevel1 extends ComposableBase {
    // ImprovedLevel1[ABILITIES_KEY] = ['Event'] ✅
}

@AbilityImproved('Domain')
class ImprovedLevel2 extends ImprovedLevel1 {
    // ImprovedLevel2[ABILITIES_KEY] = ['Event', 'Domain'] ✅
}

@AbilityImproved('Schema')
class ImprovedLevel3 extends ImprovedLevel2 {
    // ImprovedLevel3[ABILITIES_KEY] = ['Event', 'Domain', 'Schema'] ✅
}

// 现在可以直接从类获取，无需原型链爬取！
// ImprovedLevel3[ABILITIES_KEY] → ['Event', 'Domain', 'Schema'] ✅


// ============================================
// 为什么装饰器阶段可以工作？
// ============================================

/**
 * TypeScript/JavaScript类装饰器执行顺序：
 * 
 * 1. 先定义基类
 * 2. 装饰基类（此时父类已完成装饰）
 * 3. 定义子类
 * 4. 装饰子类（此时父类已完成装饰，可以获取父类的装饰结果）
 * 
 * 示例：
 * 
 * class A {}           // 定义A
 * @decorator           // 装饰A（此时A已完成）
 * class B extends A {} // 定义B
 * @decorator           // 装饰B（此时B已完成，且可以访问A的装饰结果）
 * class C extends B {} // 定义C
 */

// ============================================
// 对比两种方案
// ============================================

/**
 * 方案1：运行时原型链爬取（当前实现）
 * 
 * 优点：
 * - 简单直观
 * - 不依赖装饰器执行顺序
 * 
 * 缺点：
 * - 每次实例化都要爬取（即使有缓存）
 * - 性能开销
 * - 运行时才能发现错误
 */

/**
 * 方案2：装饰器阶段收集（改进方案）
 * 
 * 优点：
 * - 只在装饰时执行一次
 * - 性能更好
 * - 可以在装饰阶段验证
 * - 直接从类获取，无需爬取
 * 
 * 缺点：
 * - 依赖装饰器执行顺序（但这是确定的）
 * - 装饰器代码稍复杂
 */

// ============================================
// 实际测试
// ============================================

console.log('=== 原型链爬取测试 ===');

// 模拟Symbol
const ABILITIES_KEY = Symbol('abilities');

// 当前方案：需要原型链爬取
function AbilityOld(...keys: string[]) {
    return (ctor: any) => {
        ctor[ABILITIES_KEY] = keys;
    };
}

@AbilityOld('Event')
class Old1 {
    static [ABILITIES_KEY]: string[];
}
@AbilityOld('Domain')
class Old2 extends Old1 {
    static [ABILITIES_KEY]: string[];
}
@AbilityOld('Schema')
class Old3 extends Old2 {
    static [ABILITIES_KEY]: string[];
}

console.log('Old3直接获取:', Old3[ABILITIES_KEY]); // ['Schema'] ❌

// 原型链爬取
function collectFromPrototypeChain(cls: any): string[] {
    const keys = new Set<string>();
    let proto = cls;
    
    while (proto && proto !== Object) {
        const ownKeys = proto[ABILITIES_KEY];
        if (Array.isArray(ownKeys)) {
            ownKeys.forEach(k => keys.add(k));
        }
        proto = Object.getPrototypeOf(proto);
    }
    return Array.from(keys);
}

console.log('Old3原型链爬取:', collectFromPrototypeChain(Old3)); // ['Event', 'Domain', 'Schema'] ✅


console.log('\n=== 装饰器阶段收集测试 ===');

// 改进方案：装饰器阶段收集
function AbilityNew(...keys: string[]) {
    return (ctor: any) => {
        const parentAbilities = Object.getPrototypeOf(ctor)?.[ABILITIES_KEY] || [];
        ctor[ABILITIES_KEY] = [...new Set([...parentAbilities, ...keys])];
    };
}

@AbilityNew('Event')
class New1 {
    static [ABILITIES_KEY]: string[];
}
@AbilityNew('Domain')
class New2 extends New1 {
    static [ABILITIES_KEY]: string[];
}
@AbilityNew('Schema')
class New3 extends New2 {
    static [ABILITIES_KEY]: string[];
}

console.log('New3直接获取:', New3[ABILITIES_KEY]); // ['Event', 'Domain', 'Schema'] ✅
// 无需原型链爬取！

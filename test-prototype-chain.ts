// 简化的原型链测试
const ABILITIES_KEY = Symbol('abilities');

// ============================================
// 方案1：当前实现（需要原型链爬取）
// ============================================

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

console.log('=== 方案1：当前实现 ===');
console.log('Old3直接获取:', Old3[ABILITIES_KEY]); 
// 结果：['Schema'] ❌ 缺少父类能力

// 原型链爬取函数
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

console.log('Old3原型链爬取:', collectFromPrototypeChain(Old3)); 
// 结果：['Event', 'Domain', 'Schema'] ✅


// ============================================
// 方案2：改进实现（装饰器阶段收集）
// ============================================

function AbilityNew(...keys: string[]) {
    return (ctor: any) => {
        // 关键：获取父类已收集的能力
        const parentAbilities = Object.getPrototypeOf(ctor)?.[ABILITIES_KEY] || [];
        // 合并父类和自己的能力
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

console.log('\n=== 方案2：改进实现 ===');
console.log('New3直接获取:', New3[ABILITIES_KEY]); 
// 结果：['Event', 'Domain', 'Schema'] ✅ 无需原型链爬取！


// ============================================
// 结论
// ============================================

console.log('\n=== 结论 ===');
console.log('方案1需要原型链爬取才能获取所有父类能力');
console.log('方案2在装饰器阶段就完成了收集，直接获取即可');
console.log('\n装饰器执行顺序保证了父类先于子类完成装饰，');
console.log('因此可以在装饰子类时获取父类的装饰结果。');

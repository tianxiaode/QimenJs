/**
 * 装饰器执行时机完整说明
 */

console.log('=== 装饰器执行时机详解 ===\n');

console.log('关键问题：装饰器是在编译时还是运行时执行？');
console.log('答案：运行时执行，但执行顺序是确定的！\n');

console.log('=== 执行时机分析 ===\n');

console.log('1. TypeScript编译阶段（编译时）:');
console.log('   - 类型检查');
console.log('   - 将装饰器语法转换为函数调用');
console.log('   - 不执行装饰器函数');
console.log('   - 只生成JavaScript代码\n');

console.log('2. JavaScript执行阶段（运行时）:');
console.log('   - 加载模块时立即执行');
console.log('   - 类定义时立即应用装饰器');
console.log('   - 执行顺序：从基类到子类');
console.log('   - 这是JavaScript代码执行顺序决定的\n');

console.log('3. 实例化阶段:');
console.log('   - 装饰器已经执行完毕');
console.log('   - 可以直接使用装饰结果\n');

console.log('=== 为什么执行顺序是确定的？ ===\n');

console.log('JavaScript代码执行顺序：');
console.log(`
// 源代码
@Ability('Event')
class Level1 { }

@Ability('Domain')
class Level2 extends Level1 { }

@Ability('Schema')
class Level3 extends Level2 { }

// 编译后（概念上）
class Level1 { }
Level1 = Ability('Event')(Level1);  // ← 第1步执行

class Level2 extends Level1 { }
Level2 = Ability('Domain')(Level2);  // ← 第2步执行（此时Level1已完成）

class Level3 extends Level2 { }
Level3 = Ability('Schema')(Level3);  // ← 第3步执行（此时Level2已完成）
`);

console.log('关键：JavaScript是按顺序执行的，前面的代码一定先于后面的代码执行\n');

console.log('=== 实际验证 ===\n');

const ABILITIES_KEY = Symbol('abilities');

function Ability(...keys: string[]) {
    return (ctor: any) => {
        const parentAbilities = Object.getPrototypeOf(ctor)?.[ABILITIES_KEY] || [];
        ctor[ABILITIES_KEY] = [...new Set([...parentAbilities, ...keys])];
        console.log(`${ctor.name} 装饰完成: [${ctor[ABILITIES_KEY].join(', ')}]`);
        return ctor;
    };
}

console.log('开始定义类：');

@Ability('Event')
class TestLevel1 {
    static [ABILITIES_KEY]: string[];
}

@Ability('Domain')
class TestLevel2 extends TestLevel1 {
    static [ABILITIES_KEY]: string[];
}

@Ability('Schema')
class TestLevel3 extends TestLevel2 {
    static [ABILITIES_KEY]: string[];
}

console.log('\n所有类定义完成！');
console.log('\n=== 结论 ===');
console.log('✅ 装饰器在运行时执行（不是编译时）');
console.log('✅ 但执行顺序是确定的（从基类到子类）');
console.log('✅ 这保证了在装饰子类时，父类已完成装饰');
console.log('✅ 因此可以安全地获取父类的装饰结果');
console.log('✅ 无需运行时原型链爬取，性能更好');

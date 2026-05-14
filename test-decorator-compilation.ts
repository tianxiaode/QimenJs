/**
 * TypeScript装饰器编译结果对比
 * 
 * 展示装饰器是如何被编译成JavaScript的
 */

// ============================================
// TypeScript源代码
// ============================================

/*
@Ability('Event')
class Level1 { }

@Ability('Domain')
class Level2 extends Level1 { }

@Ability('Schema')
class Level3 extends Level2 { }
*/

// ============================================
// 编译后的JavaScript代码（简化版）
// ============================================

console.log('=== TypeScript装饰器编译结果 ===\n');

console.log('TypeScript源代码:');
console.log(`
@Ability('Event')
class Level1 { }

@Ability('Domain')
class Level2 extends Level1 { }

@Ability('Schema')
class Level3 extends Level2 { }
`);

console.log('\n编译后的JavaScript（简化）:');
console.log(`
// 1. 定义类
class Level1 { }
class Level2 extends Level1 { }
class Level3 extends Level2 { }

// 2. 应用装饰器（关键：按顺序执行）
Level1 = Ability('Event')(Level1);  // 先装饰Level1
Level2 = Ability('Domain')(Level2); // 再装饰Level2（此时Level1已完成）
Level3 = Ability('Schema')(Level3); // 最后装饰Level3（此时Level2已完成）
`);

console.log('\n=== 关键点 ===');
console.log('1. 装饰器不是编译时执行的');
console.log('2. 装饰器是运行时执行的普通函数调用');
console.log('3. 但执行顺序是确定的：从上到下，从基类到子类');
console.log('4. 这是由JavaScript代码执行顺序决定的');


// ============================================
// 实际模拟编译后的执行
// ============================================

console.log('\n=== 模拟编译后的执行过程 ===\n');

const ABILITIES_KEY = Symbol('abilities');

// 装饰器函数
function Ability(...keys: string[]) {
    return (ctor: any) => {
        console.log(`装饰 ${ctor.name}:`);
        const parentAbilities = Object.getPrototypeOf(ctor)?.[ABILITIES_KEY] || [];
        console.log(`  父类能力: [${parentAbilities.join(', ')}]`);
        console.log(`  当前能力: [${keys.join(', ')}]`);
        ctor[ABILITIES_KEY] = [...new Set([...parentAbilities, ...keys])];
        console.log(`  合并结果: [${ctor[ABILITIES_KEY].join(', ')}]\n`);
        return ctor;
    };
}

// 模拟编译后的代码
console.log('// 1. 定义类');
class SimLevel1 { static [ABILITIES_KEY]: string[]; }
class SimLevel2 extends SimLevel1 { static [ABILITIES_KEY]: string[]; }
class SimLevel3 extends SimLevel2 { static [ABILITIES_KEY]: string[]; }

console.log('\n// 2. 应用装饰器（按顺序执行）');
console.log('SimLevel1 = Ability(\'Event\')(SimLevel1);');
SimLevel1 = Ability('Event')(SimLevel1);

console.log('SimLevel2 = Ability(\'Domain\')(SimLevel2);');
SimLevel2 = Ability('Domain')(SimLevel2);

console.log('SimLevel3 = Ability(\'Schema\')(SimLevel3);');
SimLevel3 = Ability('Schema')(SimLevel3);

console.log('// 3. 装饰完成\n');

console.log('=== 最终结果 ===');
console.log('SimLevel1:', SimLevel1[ABILITIES_KEY]);
console.log('SimLevel2:', SimLevel2[ABILITIES_KEY]);
console.log('SimLevel3:', SimLevel3[ABILITIES_KEY]);


// ============================================
// 执行时机总结
// ============================================

console.log('\n=== 执行时机总结 ===');
console.log(`
┌─────────────────────────────────────────┐
│         TypeScript 编译阶段              │
│  - 类型检查                              │
│  - 转换装饰器语法为函数调用               │
│  - 不执行装饰器                          │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         JavaScript 运行阶段              │
│  - 加载模块                              │
│  - 执行类定义                            │
│  - 立即执行装饰器函数 ← 关键！            │
│  - 从基类到子类依次执行                   │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         实例化阶段                        │
│  - 创建实例                              │
│  - 装饰器已经执行完毕                     │
│  - 可以直接使用装饰结果                   │
└─────────────────────────────────────────┘
`);

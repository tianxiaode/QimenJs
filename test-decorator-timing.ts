/**
 * 装饰器执行时机详解
 * 
 * 关键点：装饰器是在运行时执行的，不是编译时！
 * 但执行顺序是确定的：从基类到子类依次执行
 */

// ============================================
// 实验1：装饰器执行时机
// ============================================

console.log('=== 1. 开始定义类 ===');

function LogDecorator(name: string) {
    console.log(`  装饰器函数被调用: ${name}`);
    return (ctor: any) => {
        console.log(`  装饰器应用到类: ${ctor.name} (${name})`);
        ctor.decoratorName = name;
    };
}

console.log('=== 2. 定义ClassA ===');
@LogDecorator('A')
class ClassA {
    static decoratorName: string;
}
console.log('=== 3. ClassA定义完成 ===');

console.log('=== 4. 定义ClassB ===');
@LogDecorator('B')
class ClassB extends ClassA {
    static decoratorName: string;
}
console.log('=== 5. ClassB定义完成 ===');

console.log('=== 6. 定义ClassC ===');
@LogDecorator('C')
class ClassC extends ClassB {
    static decoratorName: string;
}
console.log('=== 7. ClassC定义完成 ===');

console.log('\n=== 8. 所有类定义完成，开始实例化 ===');
const instance = new ClassC();
console.log('=== 9. 实例化完成 ===');


// ============================================
// 实验2：TypeScript装饰器编译结果
// ============================================

console.log('\n=== TypeScript装饰器编译结果 ===');
console.log('装饰器会被编译成普通的JavaScript函数调用');
console.log('执行顺序：类定义时立即执行，从外到内（从基类到子类）');


// ============================================
// 实验3：能力收集装饰器的执行顺序
// ============================================

const ABILITIES_KEY = Symbol('abilities');

function Ability(...keys: string[]) {
    console.log(`  Ability装饰器函数创建: ${keys.join(', ')}`);
    return (ctor: any) => {
        console.log(`  Ability装饰器执行: ${ctor.name}, keys: ${keys.join(', ')}`);
        const parentAbilities = Object.getPrototypeOf(ctor)?.[ABILITIES_KEY] || [];
        console.log(`    父类能力: [${parentAbilities.join(', ')}]`);
        ctor[ABILITIES_KEY] = [...new Set([...parentAbilities, ...keys])];
        console.log(`    合并后: [${ctor[ABILITIES_KEY].join(', ')}]`);
    };
}

console.log('\n=== 能力收集装饰器执行顺序 ===');

console.log('\n定义Level1:');
@Ability('Event')
class Level1 {
    static [ABILITIES_KEY]: string[];
}

console.log('\n定义Level2:');
@Ability('Domain')
class Level2 extends Level1 {
    static [ABILITIES_KEY]: string[];
}

console.log('\n定义Level3:');
@Ability('Schema')
class Level3 extends Level2 {
    static [ABILITIES_KEY]: string[];
}

console.log('\n=== 最终结果 ===');
console.log('Level1能力:', Level1[ABILITIES_KEY]);
console.log('Level2能力:', Level2[ABILITIES_KEY]);
console.log('Level3能力:', Level3[ABILITIES_KEY]);


// ============================================
// 关键结论
// ============================================

console.log('\n=== 关键结论 ===');
console.log('1. 装饰器在运行时执行，不是编译时');
console.log('2. 执行时机：类定义时立即执行');
console.log('3. 执行顺序：从基类到子类依次执行');
console.log('4. 这保证了在装饰子类时，父类已完成装饰');
console.log('5. 因此可以安全地获取父类的装饰结果');

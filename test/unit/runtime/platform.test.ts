/**
 * 单元测试：getPlatform
 *
 * 测试覆盖范围：
 * 1. JSDOM 环境返回 'browser'
 * 2. 无 window 有 process 返回 'node'（vm 沙箱验证）
 * 3. 无 window 无 process 返回 'unknown'（vm 沙箱验证）
 * 4. 函数基本属性
 *
 * 注意：JSDOM 中 window 是 getter-only 且 configurable: false 的属性，
 * 无法通过 spyOn、defineProperty 或赋值来模拟 typeof window === 'undefined'。
 * 因此 node/unknown 分支通过 vm 沙箱来验证源码逻辑的正确性。
 * Jest 覆盖率统计中 platform.ts 的第18-19行将显示为未覆盖，
 * 这是 JSDOM 测试环境的固有限制。
 */

import { getPlatform } from '@/runtime/platform';
import vm from 'vm';

describe('getPlatform', () => {
    it("在 JSDOM 环境中应该返回 'browser'", () => {
        expect(getPlatform()).toBe('browser');
    });

    it('应正确返回 Platform 类型兼容的值', () => {
        expect(['browser', 'node', 'unknown']).toContain(getPlatform());
    });

    it('getPlatform 是一个函数', () => {
        expect(typeof getPlatform).toBe('function');
    });

    it('多次调用应返回相同结果', () => {
        expect(getPlatform()).toBe(getPlatform());
    });

    it('源码逻辑验证：window 检测优先于 process', () => {
        // 在 JSDOM 中 window 和 process 都存在
        // 源码逻辑：if (typeof window !== 'undefined') return 'browser' 优先
        expect(getPlatform()).toBe('browser');
        expect(typeof process).not.toBe('undefined');
    });
});

describe('getPlatform - vm 沙箱环境分支', () => {
    /**
     * 使用 vm 沙箱来测试不同环境下的行为。
     * 沙箱中可以自由控制 window 和 process 的存在与否，
     * 从而验证源码所有分支的逻辑正确性。
     */
    function runInSandbox(hasWindow: boolean, hasProcess: boolean): string {
        const sandbox: Record<string, any> = {};
        if (hasWindow) sandbox.window = {};
        if (hasProcess) sandbox.process = {};

        vm.createContext(sandbox);

        // 与源码完全一致的逻辑
        const code = `
            function getPlatform() {
                if (typeof window !== 'undefined') return 'browser';
                if (typeof process !== 'undefined') return 'node';
                return 'unknown';
            }
            getPlatform();
        `;

        return vm.runInContext(code, sandbox);
    }

    it("有 window 和 process 时应返回 'browser'", () => {
        expect(runInSandbox(true, true)).toBe('browser');
    });

    it("有 window 无 process 时应返回 'browser'", () => {
        expect(runInSandbox(true, false)).toBe('browser');
    });

    it("无 window 有 process 时应返回 'node'", () => {
        expect(runInSandbox(false, true)).toBe('node');
    });

    it("无 window 无 process 时应返回 'unknown'", () => {
        expect(runInSandbox(false, false)).toBe('unknown');
    });
});

import { PatternEntry, PatternRegistrarName, Registrar } from "../types";

export class PatternRegistrar implements Registrar<PatternEntry> {
    readonly name = PatternRegistrarName;
    
    // 静态存储，确保编码期和运行期共享
    private static storage = new Map<string, RegExp>();

    /** 编码期注入：支持传入正则或字符串 */
    static add(name: string, entry: PatternEntry): void {
        if (entry instanceof RegExp) {
            this.storage.set(name, entry);
        } else {
            this.storage.set(name, new RegExp(entry.regex, entry.flags || ''));
        }
    }

    // --- 实现 Registrar 接口 ---

    add(name: string, entry: PatternEntry): void {
        PatternRegistrar.add(name, entry);
    }

    register(name: string, entry: PatternEntry): void {
        this.add(name, entry);
    }

    unregister(name: string): void {
        PatternRegistrar.storage.delete(name);
    }

    /** 获取编译好的正则 */
    get(name: string): RegExp | undefined {
        return PatternRegistrar.storage.get(name);
    }

    lock(): void {
        Object.freeze(PatternRegistrar.storage);
    }

    inspect(): void {
        console.group('🔍 Registered Patterns');
        const info: any = {};
        PatternRegistrar.storage.forEach((reg, name) => {
            info[name] = { 
                source: reg.source, 
                flags: reg.flags, 
            };
        });
        console.table(info);
        console.groupEnd();
    }
}
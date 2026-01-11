import { PatternEntry, PatternRegistrarName } from '../types';

export class PatternRegistrar {
    static readonly registrarName = PatternRegistrarName;

    // 静态存储，确保编码期和运行期共享
    private static storage = new Map<string, RegExp>();

    /** 编码期注入：支持传入正则或字符串 */
    static register(name: string, entry: PatternEntry): void {
        if (entry instanceof RegExp) {
            this.storage.set(name, entry);
        } else {
            this.storage.set(name, new RegExp(entry.regex, entry.flags || ''));
        }
    }

    static unregister(name: string): void {
        PatternRegistrar.storage.delete(name);
    }

    /** 获取编译好的正则 */
    static get(name: string): RegExp | undefined {
        return PatternRegistrar.storage.get(name);
    }

    static lock(): void {
        Object.freeze(PatternRegistrar.storage);
    }

    static inspect(): void {
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



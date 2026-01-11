import { PatternEntry, PatternRegistrarName } from '../types';
import { RegistrarBase } from './RegistrarBase';
import { RegistrarInvalidArgumentError, RegistrarNotFoundError } from './errors';

export class PatternRegistrar extends RegistrarBase<Map<string, RegExp>> {
    public readonly name = PatternRegistrarName;

    // 存储，确保编码期和运行期共享
    protected storage = new Map<string, RegExp>();
    
    /**
     * 注册模式：
     * 1. 单个: register('email', /^[...]$/)
     * 2. 对象: register({ 'uuid': /[...]/, 'zip': { regex: '^[0-9]{6}$', flags: 'g' } })
     */
    register(nameOrObj: string | Record<string, PatternEntry>, entry?: PatternEntry): void {
        this.checkLock();

        if (typeof nameOrObj === 'object' && !(nameOrObj instanceof RegExp)) {
            // 模式 2：批量注册对象
            for (const [name, val] of Object.entries(nameOrObj)) {
                this.doRegister(name, val);
            }
        } else if (typeof nameOrObj === 'string') {
            // 模式 1：单个注册
            if (!entry)
                throw new RegistrarInvalidArgumentError(this.name, nameOrObj);
            this.doRegister(nameOrObj, entry);
        }
    }

    unregister(name: string): void {
        this.checkLock();
        this.storage.delete(name);
    }

    /** 核心逻辑提取：负责将多种输入统一转化为 RegExp 并存入 Map */
    private doRegister(name: string, entry: PatternEntry): void {
        if (entry instanceof RegExp) {
            this.storage.set(name, entry);
        } else {
            // 处理字符串形式的正则
            this.storage.set(name, new RegExp(entry.regex, entry.flags || ''));
        }
    }

    get(name: string): RegExp {
        const pattern = this.storage.get(name);
        if (!pattern) throw new RegistrarNotFoundError(this.name, name);
        return pattern;
    }
    
    protected doInspect(): void {
        console.group('🔍 Registered Patterns');
        const info: any = {};
        this.storage.forEach((reg, name) => {
            info[name] = {
                source: reg.source,
                flags: reg.flags,
            };
        });
        console.table(info);
        console.groupEnd();
    }
}
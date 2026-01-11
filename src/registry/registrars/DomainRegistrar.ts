import { DomainConfig, DomainRegistrarName } from '../types';
import { RegistrarBase } from './RegistrarBase';
import { RegistrarConflictError } from './errors';

export class DomainRegistrar extends RegistrarBase<Map<string, DomainConfig>> {
    public readonly name = DomainRegistrarName;
    
    protected storage = new Map<string, DomainConfig>();

    /** 注册一个域配置 */
    register(name: string, config: DomainConfig, force = false): void {
        this.checkLock();
        
        // 1. 如果不强制且已存在，直接炸掉，不给任何模糊空间
        if (!force && this.storage.has(name)) {
            throw new RegistrarConflictError(this.name, name);
        }

        // 2. 只有两种情况会走到这：要么是新的，要么你明确说了要覆盖
        this.storage.set(name, config);
    }
    
    /** 删除一个域配置 */
    unregister(name: string): void {
        this.checkLock();
        this.storage.delete(name);
    }
    
    /** 获取原始配置 */
    get(name: string): DomainConfig {
        return this.storage.get(name)!;
    }

    /** * 核心业务接口：获取该域的所有有效 Headers
     * 无论内部是静态还是动态，外部统一 await
     */
    async getHeaders(name: string): Promise<Record<string, string>> {
        const config = this.storage.get(name);
        return (await config!.getHeaders(config!)) as any;
    }

    getBaseUrl(name: string): string {
        const config = this.storage.get(name);
        return config!.baseUrl;
    }

    protected doInspect(): void {
        console.group('🌐 Domain Registry Status');
        const summary: Record<string, string> = {};
        this.storage.forEach((config, name) => {
            summary[name] = config.baseUrl;
        });
        console.table(summary);
        console.groupEnd();
    }
}
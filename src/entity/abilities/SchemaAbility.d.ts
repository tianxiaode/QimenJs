import { AbilityBase } from '../../composable';
import { ICoreEntityManager, IExposeResult } from '../../types';
/**
 * SchemaAbility - 模式能力类
 *
 * 提供实体结构定义和验证能力，处理模式的继承、混入、字段合并等功能。
 * 主要负责：
 * 1. 编译和缓存实体模式（Schema）
 * 2. 处理模式继承（extends）和混入（mixins）
 * 3. 字段定义的合并与覆盖（override）
 * 4. 校验规则的提取和管理
 * 5. 提供标准化的模式访问接口
 */
export declare class SchemaAbility<T extends ICoreEntityManager> extends AbilityBase<T> {
    /**
     * 暴露模式相关的属性和方法
     *
     * 提供对编译后模式的访问接口，包括模式定义、校验规则、键名映射等。
     * 使用缓存机制避免重复编译，提高性能。
     *
     * @returns 包含模式定义相关属性和方法的对象
     */
    protected expose(): IExposeResult;
    private compileSchema;
    /**
     * 核心：批量字段处理器
     */
    private processFieldBatch;
    private extractRule;
    /**
     * 补充：树形结构默认值处理
     */
    private ensureTreeDefaults;
}
//# sourceMappingURL=SchemaAbility.d.ts.map
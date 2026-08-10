/** Loading 快捷配置，用于声明式创建加载浮层 */
export interface LoadingDecl {
    text?: string;
    spinner?: string;
    maskMode?: 'none' | 'scoped' | 'global';
    mask?: boolean | string;
}

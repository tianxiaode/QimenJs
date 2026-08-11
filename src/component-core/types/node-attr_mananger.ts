export interface INodeAttrManager {
    getProp(nodeName: string, prop: string): any;
    setProp(nodeName: string, prop: string, value: any): void;
    setProps(nodeName: string, props: Record<string, any>): void;
    removeProps(nodeName: string, props: string[]): void;
    flush(): void;
    dispose(): void;
}

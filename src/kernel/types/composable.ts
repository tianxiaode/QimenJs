export interface IComposable {
    attach: (host: any) => void;
    dispose?: () => void;
}

export interface ComposableEntry{
    name: string;
    description?: string;
    ctor: new (...args: any[]) => IComposable;
}


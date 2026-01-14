export interface IComposable {
    attach: (host: any) => void;
    dispose?: () => void;
}



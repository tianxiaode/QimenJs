export interface NodeAttributes {
    [key: string]: any;
}

export type NodeAttributesMap = Record<string, NodeAttributes>;

export interface NodeStyle {
    [key: string]: string | number;
}

export type NodeSytleMap = Record<string, NodeStyle>;

export type NodeHTMLClass = string | string[];

export type NodeHTMLClassMap = Record<string, NodeHTMLClass>;

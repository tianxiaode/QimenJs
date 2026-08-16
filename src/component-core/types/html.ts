export interface NodeAttributes {
    href?: string;
    target?: string;
    src?: string;
    alt?: string;
    tabIndex?: number;
    autoFocus?: boolean;
    style?: NodeStyle;
    [key: string]: any;
}

export interface NodeStyle {
    color?: string | number;
    fontSize?: string | number;
    width?: string | number;
    height?: string | number;
    padding?: string | number;
    margin?: string | number;
    display?: string;
    position?: string;
    top?: string | number;
    left?: string | number;
    right?: string | number;
    bottom?: string | number;
    gap?: string | number;
    flex?: string;
    flexDirection?: string;
    justifyContent?: string;
    alignItems?: string;
    grid?: string;
    opacity?: string | number;
    visible?: string;
    cursor?: string;
    backgroundColor?: string;
    background?: string;
    border?: string;
    borderRadius?: string | number;
    transform?: string;
    transition?: string;
    overflow?: string;
    zIndex?: string | number;
    [key: string]: string | number | undefined;
}

export type NodeHTMLClass = string | string[];

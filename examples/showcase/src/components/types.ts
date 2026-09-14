import type { TemplateDecl, Component } from '@qimenjs/component-core';

export interface DemoSection {
    label: string;
    template?: TemplateDecl;
    component?: typeof Component;
    code?: string;
}

export interface DemoConfig {
    title: string;
    description: string;
    sections: DemoSection[];
}

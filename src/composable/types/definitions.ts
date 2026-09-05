export interface DataMap {
    defaultValues: Record<string, any>;
    optionsKeys: Set<string>;
    propertyKeys: Set<string>;
    propertyClearKeys: Array<string>;
}

export type Definitions = {
    options?: Record<string, any>;
    privateFields?: Record<string, any>;
    fields?: Record<string, any>;
    overrides?: Record<string, any>;
};

export type InferDefinitions<T extends Definitions> = (T['fields'] extends Record<string, any>
    ? T['fields']
    : object) &
    (T['privateFields'] extends Record<string, any> ? T['privateFields'] : object);

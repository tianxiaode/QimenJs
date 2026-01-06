export interface ValidationRule {
    // 规则类型：预设常用类型 + 自定义类型
    type: 'compare' | 'boolean' | 'boolean' | 'date' | 'currency' | 'enum' | 'number' | 'password';

    //基础
    required?: boolean;
    nullable?: boolean;    
    empty?: boolean;
    trim?: boolean;
    ttrimInner?: boolean;
    trimNewline?: boolean;

    //数字相关的
    min?: number;
    max?: number;
    integer?: boolean;
    positive?: boolean;
    negative?: boolean;
    odd?: boolean;
    even?: boolean;
    finite?: boolean;
    infinite?: boolean;


    //字符串相关的
    minLength?: number;
    maxLength?: number;
    exactLength?: number;
    pattern?: RegExp;
    uppercase?: boolean;
    lowercase?: boolean;
    number?: boolean;
    specialChar?: boolean;
    urlSearchParams?: boolean;
    hexColor?: boolean;
    rgbColor?: boolean;
    rgbaColor?: boolean;
    base64?: boolean;
    email?: boolean;
    phone?: boolean;
    username?: boolean;
    uuid?: boolean;
    chineseID?: boolean;
    postcode?: boolean;
    url?: boolean;
    ipv4?: boolean;
    ipv6?: boolean;
    macAddress?: boolean;

    //字符串分隔符拆分验证
    separator: string | RegExp;
    minItems?: number;
    maxItems?: number;
    allowEmptyItem?: boolean;
    

    //集合
    enum?: any[];
    allowsValues?: number[];
    disallowsValues?: number[];
    minContains?: number;
    maxContains?: number;
    contains?: string | RegExp;

    //比较验证规则
    operator: CompareOperator;
    target: readonly any[] |  unknown | ((ctx?: any) => unknown);
    strict?: boolean;
    transform?: (value: any) => any; //待定

    //日期相关
    format?: string;
    weekend: number | number[];
    future?: boolean;
    past?: boolean;
    today?: boolean;
    tomorrow?: Date | string;
    yesterday?: Date | string;
    between?: Date | string | [Date | string, Date | string];


    //数组相关
    allowEmpty?: boolean;
    unique?: boolean;
    uniqueBy: string | ((item: any) => any);
    sorted: 'asc' | 'desc' | ((a: any, b: any) => number);

    //对象相关的
    allowKeys?: string[];
    denyKeys?: string[];

    //文件
    isBlob?: boolean;
    isFile?: boolean;
    isImage?: boolean;

}

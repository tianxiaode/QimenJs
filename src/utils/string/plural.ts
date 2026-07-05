export interface PluralRule {
    test: (word: string) => boolean;
    apply: (word: string) => string;
}

const DEFAULT_IRREGULAR: Record<string, string> = {
    child: 'children',
    man: 'men',
    woman: 'women',
    tooth: 'teeth',
    foot: 'feet',
    goose: 'geese',
    mouse: 'mice',
    person: 'people',
};

const DEFAULT_RULES: PluralRule[] = [
    // 处理以 'fe' 结尾的词 (如: knife -> knives)
    {
        test: w => w.endsWith('fe'),
        apply: w => w.slice(0, -2) + 'ves',
    },
    // 处理以 'f' 结尾的词 (如: leaf -> leaves)
    {
        test: w => w.endsWith('f'),
        apply: w => w.slice(0, -1) + 'ves',
    },
    // 处理以 'y' 结尾且前面是辅音的词 (如: city -> cities)
    {
        test: w => /[^aeiou]y$/i.test(w),
        apply: w => w.slice(0, -1) + 'ies',
    },
    // 处理以 'sh', 'ch', 'x' 结尾的词 (如: box -> boxes)
    {
        test: w => /(sh|ch|x)$/i.test(w),
        apply: w => w + 'es',
    },
    // 处理以 'z' 结尾的词 (如: quiz -> quizzes)
    {
        test: w => w.endsWith('z'),
        apply: w => w + 'zes',
    },
    // 处理以 's' 结尾的词 (如: cats -> cats)
    {
        test: w => w.endsWith('s'),
        apply: w => w,
    },
    // 处理其他以辅音字母结尾的词 (如: cat -> cats)
    {
        test: w => !/[aeiou]$/i.test(w),
        apply: w => w + 's',
    },
];

export function pluralize(
    word: string,
    options?: {
        irregular?: Record<string, string>;
        rules?: PluralRule[];
    }
): string {
    const irregular = options?.irregular ?? DEFAULT_IRREGULAR;
    const rules = options?.rules ?? DEFAULT_RULES;

    if (irregular[word]) return irregular[word];

    for (const rule of rules) {
        if (rule.test(word)) {
            return rule.apply(word);
        }
    }

    // 默认添加 s
    return word + 's';
}

export function plural(count: number, singular: string, pluralForm: string): string {
    return count === 1 ? singular : pluralForm;
}

export function pluralWithCount(count: number, singular: string, pluralForm: string): string {
    return `${count} ${plural(count, singular, pluralForm)}`;
}

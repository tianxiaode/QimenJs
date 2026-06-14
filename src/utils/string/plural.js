"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluralize = pluralize;
exports.plural = plural;
exports.pluralWithCount = pluralWithCount;
const DEFAULT_IRREGULAR = {
    child: "children",
    man: "men",
    woman: "women",
    tooth: "teeth",
    foot: "feet",
    goose: "geese",
    mouse: "mice",
    person: "people",
};
const DEFAULT_RULES = [
    // 处理以 'fe' 结尾的词 (如: knife -> knives)
    {
        test: w => w.endsWith("fe"),
        apply: w => w.slice(0, -2) + "ves",
    },
    // 处理以 'f' 结尾的词 (如: leaf -> leaves)
    {
        test: w => w.endsWith("f"),
        apply: w => w.slice(0, -1) + "ves",
    },
    // 处理以 'y' 结尾且前面是辅音的词 (如: city -> cities)
    {
        test: w => /[^aeiou]y$/i.test(w),
        apply: w => w.slice(0, -1) + "ies",
    },
    // 处理以 'sh', 'ch', 'x' 结尾的词 (如: box -> boxes)
    {
        test: w => /(sh|ch|x)$/i.test(w),
        apply: w => w + "es",
    },
    // 处理以 'z' 结尾的词 (如: quiz -> quizzes)
    {
        test: w => w.endsWith("z"),
        apply: w => w + "zes",
    },
    // 处理以 's' 结尾的词 (如: cats -> cats)
    {
        test: w => w.endsWith("s"),
        apply: w => w,
    },
    // 处理其他以辅音字母结尾的词 (如: cat -> cats)
    {
        test: w => !/[aeiou]$/i.test(w),
        apply: w => w + "s",
    },
];
function pluralize(word, options) {
    var _a, _b;
    const irregular = (_a = options === null || options === void 0 ? void 0 : options.irregular) !== null && _a !== void 0 ? _a : DEFAULT_IRREGULAR;
    const rules = (_b = options === null || options === void 0 ? void 0 : options.rules) !== null && _b !== void 0 ? _b : DEFAULT_RULES;
    if (irregular[word])
        return irregular[word];
    for (const rule of rules) {
        if (rule.test(word)) {
            return rule.apply(word);
        }
    }
    // 默认添加 s
    return word + "s";
}
function plural(count, singular, pluralForm) {
    return count === 1 ? singular : pluralForm;
}
function pluralWithCount(count, singular, pluralForm) {
    return `${count} ${plural(count, singular, pluralForm)}`;
}
//# sourceMappingURL=plural.js.map
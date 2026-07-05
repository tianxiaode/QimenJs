/**
 * 中文（简体）语言包
 *
 * 包含：翻译文本 + 区域格式配置（日期、时间、货币、数字）
 */
__qimen_i18n_register__('zh-CN', {
    // ---- 区域格式配置 ----
    _locale: {
        // 日期格式
        date: {
            short: 'yyyy/M/d',       // 2024/1/5
            medium: 'yyyy年M月d日',   // 2024年1月5日
            long: 'yyyy年M月d日',     // 2024年1月5日
            full: 'yyyy年M月d日EEEE', // 2024年1月5日星期五
        },
        // 时间格式
        time: {
            short: 'H:mm',           // 9:30
            medium: 'H:mm:ss',       // 9:30:00
            long: 'H:mm:ss z',       // 9:30:00 CST
        },
        // 货币格式
        currency: {
            code: 'CNY',
            symbol: '¥',
            position: 'prefix',      // ¥1,234.56
            decimalDigits: 2,
        },
        // 数字格式
        number: {
            decimalSeparator: '.',   // 小数点
            groupSeparator: ',',     // 千分位
            groupSize: 3,            // 每三位分组
        },
        // 单位习惯
        units: {
            length: 'metric',        // 公制
            weight: 'metric',
            temperature: 'celsius',
            area: 'metric',
            volume: 'metric',
        },
        // 周起始日
        weekStart: 1, // 周一
        // 12/24小时制
        hourCycle: 'h23',
    },

    // ---- 通用翻译 ----
    common: {
        save: '保存',
        cancel: '取消',
        confirm: '确认',
        delete: '删除',
        edit: '编辑',
        add: '添加',
        search: '搜索',
        loading: '加载中...',
        noData: '暂无数据',
        success: '操作成功',
        error: '操作失败',
        yes: '是',
        no: '否',
        ok: '确定',
    },
});

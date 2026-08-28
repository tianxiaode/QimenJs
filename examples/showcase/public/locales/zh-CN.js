/**
 * 中文简体语言包
 *
 * 包含：翻译文本 + 区域格式配置（日期、时间、货币、数字）
 */
__qimen_i18n_register__('zh-CN', {
    _locale: {
        date: {
            short: 'yyyy/M/d',
            medium: 'yyyy年M月d日',
            long: 'yyyy年M月d日',
            full: 'yyyy年M月d日EEEE',
        },
        time: {
            short: 'H:mm',
            medium: 'H:mm:ss',
            long: 'H:mm:ss z',
        },
        currency: {
            code: 'CNY',
            symbol: '¥',
            position: 'prefix',
            decimalDigits: 2,
        },
        number: {
            decimalSeparator: '.',
            groupSeparator: ',',
            groupSize: 3,
        },
        units: {
            length: 'metric',
            weight: 'metric',
            temperature: 'celsius',
            area: 'metric',
            volume: 'metric',
        },
        weekStart: 1,
        hourCycle: 'h23',
        weekdays: ['日', '一', '二', '三', '四', '五', '六'],
        weekdaysShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        monthsShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    },
    common: {
        save: '保存',
        cancel: '取消',
        confirm: '确认',
        delete: '删除',
        edit: '编辑',
        add: '添加',
        search: '搜索',
        reset: '重置',
        submit: '提交',
        close: '关闭',
        loading: '加载中...',
        noData: '暂无数据',
        success: '操作成功',
        error: '操作失败',
        failed: '操作失败',
        retry: '重试',
        back: '返回',
        yes: '是',
        no: '否',
        ok: '确定',
        all: '全部',
        selected: '已选择 {count} 项',
        greeting: '你好, {name}',
    },
    validation: {
        required: '{field}不能为空',
        minLength: '{field}至少{min}个字符',
        maxLength: '{field}最多{max}个字符',
        email: '请输入有效的邮箱地址',
        phone: '请输入有效的手机号码',
    },
    pagination: {
        total: '共 {total} 条',
        pageSize: '{size} 条/页',
        page: '第 {current}/{total} 页',
    },
    error: {
        network: '网络错误，请稍后重试',
        timeout: '请求超时，请稍后重试',
        unauthorized: '未授权，请重新登录',
        forbidden: '没有权限执行此操作',
        notFound: '请求的资源不存在',
        server: '服务器错误，请稍后重试',
    },
});
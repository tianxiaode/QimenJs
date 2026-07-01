/**
 * 中文简体语言包示例
 *
 * 使用方式：将此文件复制到项目的 public/locales/zh-CN.js
 * 在 HTML 中同步加载：
 *   <script src="/orbit-i18n.js"></script>
 *   <script src="/locales/zh-CN.js"></script>
 */
__orbit_i18n_register__('zh-CN', {
  common: {
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    confirm: '确认',
    loading: '加载中...',
    noData: '暂无数据',
    success: '操作成功',
    failed: '操作失败',
    retry: '重试',
    back: '返回',
    search: '搜索',
    reset: '重置',
    submit: '提交',
    close: '关闭',
    yes: '是',
    no: '否',
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

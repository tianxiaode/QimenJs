/**
 * 日本語言語パックの例
 *
 * 使用方法: このファイルを public/locales/ja-JP.js にコピー
 * HTMLで同期的に読み込み:
 *   <script src="/qimen-i18n.js"></script>
 *   <script src="/locales/ja-JP.js"></script>
 */
__qimen_i18n_register__('ja-JP', {
  common: {
    save: '保存',
    cancel: 'キャンセル',
    delete: '削除',
    edit: '編集',
    confirm: '確認',
    loading: '読み込み中...',
    noData: 'データがありません',
    success: '操作が成功しました',
    failed: '操作に失敗しました',
    retry: '再試行',
    back: '戻る',
    search: '検索',
    reset: 'リセット',
    submit: '送信',
    close: '閉じる',
    yes: 'はい',
    no: 'いいえ',
    all: 'すべて',
    selected: '{count}件選択済み',
    greeting: 'こんにちは, {name}',
  },
  validation: {
    required: '{field}は必須です',
    minLength: '{field}は{min}文字以上で入力してください',
    maxLength: '{field}は{max}文字以下で入力してください',
    email: '有効なメールアドレスを入力してください',
    phone: '有効な電話番号を入力してください',
  },
  pagination: {
    total: '合計{total}件',
    pageSize: '{size}件/ページ',
    page: '{current}/{total}ページ',
  },
  error: {
    network: 'ネットワークエラー、後でもう一度お試しください',
    timeout: 'リクエストがタイムアウトしました',
    unauthorized: '認証されていません、再度ログインしてください',
    forbidden: 'この操作を実行する権限がありません',
    notFound: 'リクエストされたリソースが見つかりません',
    server: 'サーバーエラー、後でもう一度お試しください',
  },
});

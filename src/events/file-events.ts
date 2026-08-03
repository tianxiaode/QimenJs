/**
 * 文件事件常量定义
 *
 * 定义文件域的命令事件（组件 → 调度中心）与反馈事件（调度中心 → 组件），
 * 供 file 包和 component 包统一引用，消除硬编码字符串。
 *
 * 设计说明：
 * - 采用"命令事件 + 反馈事件"对称模式（参照 DataDispatchCenter / EntityEventBusAbility）：
 *   组件通过 FileEventBusAbility 的 fileEmit 发送命令事件，
 *   中心监听命令执行后通过 FileEventBus 广播反馈事件，组件用 fileOn 接收。
 * - 通道生命周期（createChannel / connect / disconnect）仍为直接调用，
 *   因中心需按 fileKey 注册命令监听器（事件总线按精确 key 订阅），
 *   与 DataDispatchCenter.register 为直接调用同理。
 * - 多个组件订阅同一 fileKey 的反馈事件，可感知同一通道状态变化。
 */

// ============================================
// 命令事件（组件 → FileDispatchCenter）
// ============================================
export const FILE_ACTIONS = {
    /** 选择文件（携带 files；中心校验类型/大小后入队） */
    SELECT: 'select',
    /** 开始上传通道内待传项 */
    UPLOAD: 'upload',
    /** 取消指定项上传（携带 itemId） */
    CANCEL: 'cancel',
    /** 移除文件项（携带 itemId） */
    REMOVE: 'remove',
    /** 下载文件（携带 url, fileName?） */
    DOWNLOAD: 'download',
    /** 取消下载 */
    CANCEL_DOWNLOAD: 'cancelDownload',
    /** 回填已上传项（setFormValue 用，携带 items） */
    SET_ITEMS: 'setItems',
    /** 清空通道队列（formReset 用） */
    CLEAR: 'clear',
} as const;

// ============================================
// 反馈事件（FileDispatchCenter → 组件）
// ============================================
export const FILE_FEEDBACK_EVENTS = {
    /** 文件已加入队列（校验通过后） */
    SELECTED: 'selected',
    /** 文件已从队列移除 */
    REMOVED: 'removed',

    /** 哈希计算开始 */
    HASH_START: 'hashStart',
    /** 哈希计算进度 */
    HASH_PROGRESS: 'hashProgress',
    /** 哈希计算完成 */
    HASH_COMPLETE: 'hashComplete',

    /** 单文件上传开始 */
    UPLOAD_START: 'uploadStart',
    /** 单文件上传进度 */
    UPLOAD_PROGRESS: 'uploadProgress',
    /** 单文件上传完成 */
    UPLOADED: 'uploaded',
    /** 单文件上传失败 */
    UPLOAD_ERROR: 'uploadError',
    /** 通道内全部文件上传完成 */
    UPLOAD_COMPLETE: 'uploadComplete',
    /** 上传已取消 */
    CANCELLED: 'cancelled',

    /** 下载开始 */
    DOWNLOAD_START: 'downloadStart',
    /** 下载进度 */
    DOWNLOAD_PROGRESS: 'downloadProgress',
    /** 下载完成 */
    DOWNLOADED: 'downloaded',
    /** 下载失败 */
    DOWNLOAD_ERROR: 'downloadError',
} as const;

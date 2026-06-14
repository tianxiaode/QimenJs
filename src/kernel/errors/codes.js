"use strict";
/**
 * @fileoverview 定义内核模块使用的错误代码枚举
 * 包含了内核功能模块可能出现的各种错误代码
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KernelErrorCode = void 0;
/**
 * 内核错误代码枚举
 * 定义了内核模块中可能出现的各种错误状态
 */
var KernelErrorCode;
(function (KernelErrorCode) {
    /**
     * 实体操作正在进行中，不能同时执行多个相同操作
     */
    KernelErrorCode["ENTITY_OPERATION_IN_PROGRESS"] = "ENTITY_OPERATION_IN_PROGRESS";
    /**
     * 实体获取失败
     */
    KernelErrorCode["ENTITY_FETCH_FAILED"] = "ENTITY_FETCH_FAILED";
    /**
     * 未找到指定的实体
     */
    KernelErrorCode["ENTITY_NOT_FOUND"] = "ENTITY_NOT_FOUND";
    /**
     * 实体获取超时
     */
    KernelErrorCode["ENTITY_FETCH_TIMEOUT"] = "ENTITY_FETCH_TIMEOUT";
    /**
     * 实体获取被取消
     */
    KernelErrorCode["ENTITY_FETCH_CANCELLED"] = "ENTITY_FETCH_CANCELLED";
    /**
     * 分页大小超出有效范围
     */
    KernelErrorCode["INVALID_PAGE_SIZE"] = "INVALID_PAGE_SIZE";
    /**
     * 未找到指定的可组合项
     */
    KernelErrorCode["COMPOSABLE_NOT_FOUND"] = "COMPOSABLE_NOT_FOUND";
    /**
     * 检测到循环依赖关系
     */
    KernelErrorCode["CIRCULAR_DEPENDENCY"] = "CIRCULAR_DEPENDENCY";
    /**
     * 流式请求失败
     */
    KernelErrorCode["STREAM_REQUEST_FAILED"] = "STREAM_REQUEST_FAILED";
    /**
     * 手势识别过程中发生错误
     */
    KernelErrorCode["GESTURE_RECOGNITION_ERROR"] = "GESTURE_RECOGNITION_ERROR";
    /**
     * 手势移动距离不足以触发识别
     */
    KernelErrorCode["GESTURE_DISTANCE_INSUFFICIENT"] = "GESTURE_DISTANCE_INSUFFICIENT";
    /**
     * 未知的手势处理器类型
     */
    KernelErrorCode["UNKNOWN_GESTURE_PROCESSOR"] = "UNKNOWN_GESTURE_PROCESSOR";
    /**
     * 未找到指定的动作
     */
    KernelErrorCode["ACTION_NOT_FOUND"] = "ACTION_NOT_FOUND";
    /**
     * 未找到指定的模式
     */
    KernelErrorCode["SCHEMA_NOT_FOUND"] = "SCHEMA_NOT_FOUND";
    /**
     * 模式注册失败
     */
    KernelErrorCode["SCHEMA_REGISTRATION_FAILED"] = "SCHEMA_REGISTRATION_FAILED";
    /**
     * 动作注册失败
     */
    KernelErrorCode["ACTION_REGISTRATION_FAILED"] = "ACTION_REGISTRATION_FAILED";
})(KernelErrorCode || (exports.KernelErrorCode = KernelErrorCode = {}));
//# sourceMappingURL=codes.js.map
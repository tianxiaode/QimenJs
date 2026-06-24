"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreEntityManager = void 0;
const core_1 = require("../core");
const registrars_1 = require("../registrars");
const types_1 = require("../types");
const composable_1 = require("../composable");
let CoreEntityManager = class CoreEntityManager extends composable_1.ComposableBase {
    constructor() {
        super();
        this.domain = 'default';
        // 存储当前正在进行的任务：Action -> AbortController
        this.activeTasks = new Map();
    }
    request(action, options) {
        var _a;
        // 1. 自动取消逻辑（逻辑同前）
        if (this.activeTasks.has(action)) {
            this.logger.warn(`Action [${action}] is already running. Auto-cancelling previous task.`);
            (_a = this.activeTasks.get(action)) === null || _a === void 0 ? void 0 : _a.abort('auto_cancelled');
        }
        const controller = new AbortController();
        this.activeTasks.set(action, controller);
        // 2. 构建上下文
        const context = (0, core_1.createFlowContext)('GET', this.url, this.domain, this.getDomainConfig(), {
            ...options,
            signal: controller.signal,
        }, this.entityName, action, this.getScheme());
        // 3. 定义异步执行体
        const execute = async () => {
            const startTime = Date.now();
            try {
                this.logger.debug(`Executing Action [${action}] for Entity [${this.entityName}]`);
                // 1. 尝试从类级缓存获取已合并的管道
                const CACHE_KEY = '__ACTION_PIPELINE__';
                let allActions = this.getStatic(CACHE_KEY);
                // 2. 如果没有缓存（第一次执行），则进行合并并存入缓存
                if (!allActions) {
                    const baseActions = registrars_1.EntityActionRegistrar.getInstance().getPipeline();
                    // 假设 customActions 是定义在类上的静态属性或通过构造传入的固定列表
                    allActions = [...baseActions, ...(this.customActions || [])];
                    this.setStatic(CACHE_KEY, allActions);
                    this.logger.debug(`Pipeline cached for Entity [${this.entityName}]`);
                }
                // 3. 直接使用缓存的管道执行
                await (0, core_1.runPipeline)(context, allActions);
                if (context.metadata.hasError) {
                    this.logger.error(`Action [${action}] failed:`, context.metadata.error);
                }
                else {
                    const duration = Date.now() - startTime;
                    this.logger.debug(`Action [${action}] completed in ${duration}ms`);
                }
                return context;
            }
            catch (e) {
                this.logger.error(`Pipeline Crash in Action [${action}]!`, e);
                throw e;
            }
            finally {
                if (this.activeTasks.get(action) === controller) {
                    this.activeTasks.delete(action);
                }
            }
        };
        // 4. 立即返回任务对象，而不是等待请求完成
        return {
            context: execute(),
            cancel: (reason) => controller.abort(reason || 'manual_cancelled'),
        };
    }
    /**
     * 强力工具：取消该实体下所有的在研请求
     */
    cancelAll() {
        this.activeTasks.forEach(c => c.abort('manager_cancel_all'));
        this.activeTasks.clear();
    }
    dispose() {
        // 1. 立即中断所有正在进行的请求任务
        this.cancelAll();
        // 2. 清理 Ability 容器 (由于继承自 ComposableBase，这里可能需要调用父类的清理)
        if (typeof super.dispose === 'function') {
            super.dispose();
        }
        // 3. 释放大对象引用，协助 GC
        this.activeTasks.clear();
        this.schema = undefined;
        this.customActions = [];
        this.logger.debug(`CoreEntityManager [${this.entityName}] disposed.`);
    }
};
exports.CoreEntityManager = CoreEntityManager;
exports.CoreEntityManager = CoreEntityManager = __decorate([
    (0, composable_1.Ability)(types_1.EventAbilityName, types_1.DomainAbilityName, types_1.SystemAbilityName, types_1.SechmaAbilityName),
    __metadata("design:paramtypes", [])
], CoreEntityManager);
//# sourceMappingURL=CoreEntityManager.js.map
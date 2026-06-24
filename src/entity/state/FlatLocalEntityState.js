"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlatLocalEntityState = void 0;
const composable_1 = require("../../composable");
const types_1 = require("../../types");
const BaseEntityState_1 = require("./BaseEntityState");
let FlatLocalEntityState = class FlatLocalEntityState extends BaseEntityState_1.BaseEntityState {
    constructor() {
        super(...arguments);
        this.isRemote = false;
        this.sourceData = new Map();
    }
    async refreshView() {
        this.loading = true;
        try {
            // 1. 从 Map 仓库提取所有原始数据
            const allData = Array.from(this.sourceData.values());
            // 2. 第一道工序：关键词过滤 (利用 SearchAbility 提供的 matchKeyword)
            // 注意：matchKeyword(i) 内部已经处理了关键词为空返回 true 的逻辑
            let filtered = allData.filter(item => this.matchKeyword(item));
            // 3. 第二道工序：排序处理 (利用 SearchAbility 提供的 applySort)
            this.items = this.applySort(filtered);
        }
        finally {
            this.loading = false;
        }
    }
    dispose() {
        this.sourceData.clear();
        super.dispose();
    }
};
exports.FlatLocalEntityState = FlatLocalEntityState;
exports.FlatLocalEntityState = FlatLocalEntityState = __decorate([
    (0, composable_1.Ability)(types_1.StateLocalMutationAbilityName)
], FlatLocalEntityState);
//# sourceMappingURL=FlatLocalEntityState.js.map
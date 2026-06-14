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
exports.BaseEntityState = void 0;
const composable_1 = require("../../composable");
const types_1 = require("../../types");
let BaseEntityState = class BaseEntityState extends composable_1.ComposableBase {
    constructor(schema, cacheTTL) {
        super();
        this.loading = false;
        this.items = [];
        this.item = null;
        this.search = {};
        this.isRemote = false;
        this.schema = schema;
        this.cacheTTL = cacheTTL;
    }
    dispose() {
        this.search = null; // 统一搜索对象
        this.items = [];
        this.item = null;
        this.schema = null;
        this.loading = false;
        super.dispose();
    }
};
exports.BaseEntityState = BaseEntityState;
exports.BaseEntityState = BaseEntityState = __decorate([
    (0, composable_1.Ability)(types_1.StateCacheAbilityName, types_1.StateSchemaAbilityName, types_1.StateSearchAbilityName, types_1.StateDirtyAbilityName),
    __metadata("design:paramtypes", [Object, Number])
], BaseEntityState);
//# sourceMappingURL=BaseEntityState.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalCrudEntityManager = exports.RemoteCurdEntityManager = exports.LocalReadonlyEntityManager = exports.RemoteReadonlyEntityManager = void 0;
const composable_1 = require("../composable");
const types_1 = require("../types");
const BaseEntityManager_1 = require("./BaseEntityManager");
let RemoteReadonlyEntityManager = class RemoteReadonlyEntityManager extends BaseEntityManager_1.BaseEntityManager {
};
exports.RemoteReadonlyEntityManager = RemoteReadonlyEntityManager;
exports.RemoteReadonlyEntityManager = RemoteReadonlyEntityManager = __decorate([
    (0, composable_1.Ability)(types_1.RemoteListAbilityName, types_1.RemoteGetAbilityName, types_1.RemoteGetAllAbilityName, types_1.RemoteQueryAbilityName)
], RemoteReadonlyEntityManager);
let LocalReadonlyEntityManager = class LocalReadonlyEntityManager extends EntitBaseEntityManageryManagerBase {
};
exports.LocalReadonlyEntityManager = LocalReadonlyEntityManager;
exports.LocalReadonlyEntityManager = LocalReadonlyEntityManager = __decorate([
    (0, composable_1.Ability)(types_1.LocalListAbilityName)
], LocalReadonlyEntityManager);
let RemoteCurdEntityManager = class RemoteCurdEntityManager extends BaseEntityManager_1.BaseEntityManager {
};
exports.RemoteCurdEntityManager = RemoteCurdEntityManager;
exports.RemoteCurdEntityManager = RemoteCurdEntityManager = __decorate([
    (0, composable_1.Ability)(types_1.RemoteCreateAbilityName, types_1.RemoteUpdateAbilityName, types_1.RemoteDeleteAbilityName, types_1.RemoteToggleAbilityName)
], RemoteCurdEntityManager);
let LocalCrudEntityManager = class LocalCrudEntityManager extends EntityManagerBase {
};
exports.LocalCrudEntityManager = LocalCrudEntityManager;
exports.LocalCrudEntityManager = LocalCrudEntityManager = __decorate([
    (0, composable_1.Ability)(types_1.LocalCreateAbilityName, types_1.LocalUpdateAbilityName, types_1.LocalDeleteAbilityName, types_1.LocalToggleAbilityName)
], LocalCrudEntityManager);
//# sourceMappingURL=managers.js.map
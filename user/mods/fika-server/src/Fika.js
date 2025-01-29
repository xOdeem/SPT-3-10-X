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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fika = void 0;
const node_path_1 = __importDefault(require("node:path"));
const tsyringe_1 = require("C:/snapshot/project/node_modules/tsyringe");
const ImageRouter_1 = require("C:/snapshot/project/obj/routers/ImageRouter");
const DatabaseServer_1 = require("C:/snapshot/project/obj/servers/DatabaseServer");
const ImporterUtil_1 = require("C:/snapshot/project/obj/utils/ImporterUtil");
const Overrider_1 = require("./overrides/Overrider");
const FikaPlayerRelationsCacheService_1 = require("./services/cache/FikaPlayerRelationsCacheService");
const FikaDedicatedProfileService_1 = require("./services/dedicated/FikaDedicatedProfileService");
const FikaConfig_1 = require("./utils/FikaConfig");
const FikaServerTools_1 = require("./utils/FikaServerTools");
let Fika = class Fika {
    databaseServer;
    overrider;
    fikaServerTools;
    fikaConfig;
    fikaDedicatedProfileService;
    imageRouter;
    importerUtil;
    fikaPlayerRelationCacheServce;
    modPath;
    natPunchServerConfig;
    dedicatedConfig;
    backgroundConfig;
    constructor(databaseServer, overrider, fikaServerTools, fikaConfig, fikaDedicatedProfileService, imageRouter, importerUtil, fikaPlayerRelationCacheServce) {
        this.databaseServer = databaseServer;
        this.overrider = overrider;
        this.fikaServerTools = fikaServerTools;
        this.fikaConfig = fikaConfig;
        this.fikaDedicatedProfileService = fikaDedicatedProfileService;
        this.imageRouter = imageRouter;
        this.importerUtil = importerUtil;
        this.fikaPlayerRelationCacheServce = fikaPlayerRelationCacheServce;
        this.modPath = fikaConfig.getModPath();
        this.natPunchServerConfig = fikaConfig.getConfig().natPunchServer;
        this.dedicatedConfig = fikaConfig.getConfig().dedicated;
        this.backgroundConfig = fikaConfig.getConfig().background;
    }
    async preSptLoad(container) {
        await this.overrider.override(container);
    }
    async postSptLoad(_container) {
        if (this.natPunchServerConfig.enable) {
            this.fikaServerTools.startService("NatPunchServer");
        }
        if (this.dedicatedConfig.profiles.amount > 0) {
            this.fikaDedicatedProfileService.init();
        }
        this.addFikaClientLocales();
        this.fikaPlayerRelationCacheServce.postInit();
        if (this.backgroundConfig.enable) {
            const image = this.backgroundConfig.easteregg ? "assets/images/launcher/bg-senko.png" : "assets/images/launcher/bg.png";
            this.imageRouter.addRoute("/files/launcher/bg", node_path_1.default.join(this.modPath, image));
        }
    }
    async addFikaClientLocales() {
        const database = this.databaseServer.getTables();
        const databasePath = node_path_1.default.join(this.fikaConfig.getModPath(), "assets/database/");
        const locales = await this.importerUtil.loadAsync(node_path_1.default.join(databasePath, "locales/"), databasePath);
        for (const folderName in locales) {
            if (folderName === "global") {
                for (const localeKey in locales.global) {
                    const localeData = locales.global[localeKey];
                    database.locales.global[localeKey] = { ...database.locales.global[localeKey], ...localeData };
                }
            }
        }
    }
};
exports.Fika = Fika;
exports.Fika = Fika = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("DatabaseServer")),
    __param(1, (0, tsyringe_1.inject)("Overrider")),
    __param(2, (0, tsyringe_1.inject)("FikaServerTools")),
    __param(3, (0, tsyringe_1.inject)("FikaConfig")),
    __param(4, (0, tsyringe_1.inject)("FikaDedicatedProfileService")),
    __param(5, (0, tsyringe_1.inject)("ImageRouter")),
    __param(6, (0, tsyringe_1.inject)("ImporterUtil")),
    __param(7, (0, tsyringe_1.inject)("FikaPlayerRelationsCacheService")),
    __metadata("design:paramtypes", [typeof (_a = typeof DatabaseServer_1.DatabaseServer !== "undefined" && DatabaseServer_1.DatabaseServer) === "function" ? _a : Object, typeof (_b = typeof Overrider_1.Overrider !== "undefined" && Overrider_1.Overrider) === "function" ? _b : Object, typeof (_c = typeof FikaServerTools_1.FikaServerTools !== "undefined" && FikaServerTools_1.FikaServerTools) === "function" ? _c : Object, typeof (_d = typeof FikaConfig_1.FikaConfig !== "undefined" && FikaConfig_1.FikaConfig) === "function" ? _d : Object, typeof (_e = typeof FikaDedicatedProfileService_1.FikaDedicatedProfileService !== "undefined" && FikaDedicatedProfileService_1.FikaDedicatedProfileService) === "function" ? _e : Object, typeof (_f = typeof ImageRouter_1.ImageRouter !== "undefined" && ImageRouter_1.ImageRouter) === "function" ? _f : Object, typeof (_g = typeof ImporterUtil_1.ImporterUtil !== "undefined" && ImporterUtil_1.ImporterUtil) === "function" ? _g : Object, typeof (_h = typeof FikaPlayerRelationsCacheService_1.FikaPlayerRelationsCacheService !== "undefined" && FikaPlayerRelationsCacheService_1.FikaPlayerRelationsCacheService) === "function" ? _h : Object])
], Fika);
//# sourceMappingURL=Fika.js.map
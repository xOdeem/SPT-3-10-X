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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LauncherControllerOverride = void 0;
const tsyringe_1 = require("C:/snapshot/project/node_modules/tsyringe");
const LauncherController_1 = require("C:/snapshot/project/obj/controllers/LauncherController");
const HttpServerHelper_1 = require("C:/snapshot/project/obj/helpers/HttpServerHelper");
const DatabaseService_1 = require("C:/snapshot/project/obj/services/DatabaseService");
const ConfigServer_1 = require("C:/snapshot/project/obj/servers/ConfigServer");
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
const FikaConfig_1 = require("../../utils/FikaConfig");
const Override_1 = require("../../di/Override");
let LauncherControllerOverride = class LauncherControllerOverride extends Override_1.Override {
    launcherController;
    httpServerHelper;
    databaseService;
    configServer;
    fikaConfig;
    coreConfig;
    constructor(launcherController, httpServerHelper, databaseService, configServer, fikaConfig) {
        super();
        this.launcherController = launcherController;
        this.httpServerHelper = httpServerHelper;
        this.databaseService = databaseService;
        this.configServer = configServer;
        this.fikaConfig = fikaConfig;
        this.coreConfig = this.configServer.getConfig(ConfigTypes_1.ConfigTypes.CORE);
    }
    execute(container) {
        container.afterResolution("LauncherController", (_t, result) => {
            result.connect = () => {
                let editions = this.databaseService.getProfiles();
                if (!this.fikaConfig.getConfig().server.showDevProfile) {
                    // biome-ignore lint/performance/noDelete: Only ran once.
                    delete editions["SPT Developer"];
                }
                if (!this.fikaConfig.getConfig().server.showNonStandardProfile) {
                    for (const id of ["Tournament", "SPT Easy start", "SPT Zero to hero"]) {
                        delete editions[id];
                    }
                }
                // Stop TS from throwing a tantrum over protected methods
                const launchController = this.launcherController;
                return {
                    backendUrl: this.httpServerHelper.getBackendUrl(),
                    name: this.coreConfig.serverName,
                    editions: Object.keys(editions),
                    profileDescriptions: launchController.getProfileDescriptions(),
                };
            };
        }, { frequency: "Always" });
    }
};
exports.LauncherControllerOverride = LauncherControllerOverride;
exports.LauncherControllerOverride = LauncherControllerOverride = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("LauncherController")),
    __param(1, (0, tsyringe_1.inject)("HttpServerHelper")),
    __param(2, (0, tsyringe_1.inject)("DatabaseService")),
    __param(3, (0, tsyringe_1.inject)("ConfigServer")),
    __param(4, (0, tsyringe_1.inject)("FikaConfig")),
    __metadata("design:paramtypes", [typeof (_a = typeof LauncherController_1.LauncherController !== "undefined" && LauncherController_1.LauncherController) === "function" ? _a : Object, typeof (_b = typeof HttpServerHelper_1.HttpServerHelper !== "undefined" && HttpServerHelper_1.HttpServerHelper) === "function" ? _b : Object, typeof (_c = typeof DatabaseService_1.DatabaseService !== "undefined" && DatabaseService_1.DatabaseService) === "function" ? _c : Object, typeof (_d = typeof ConfigServer_1.ConfigServer !== "undefined" && ConfigServer_1.ConfigServer) === "function" ? _d : Object, typeof (_e = typeof FikaConfig_1.FikaConfig !== "undefined" && FikaConfig_1.FikaConfig) === "function" ? _e : Object])
], LauncherControllerOverride);
//# sourceMappingURL=LauncherController.js.map
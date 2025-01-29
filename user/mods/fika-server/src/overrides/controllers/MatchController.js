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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchControllerOverride = void 0;
const tsyringe_1 = require("C:/snapshot/project/node_modules/tsyringe");
const Override_1 = require("../../di/Override");
const FikaInsuranceService_1 = require("../../services/FikaInsuranceService");
const FikaMatchService_1 = require("../../services/FikaMatchService");
const ILogger_1 = require("C:/snapshot/project/obj/models/spt/utils/ILogger");
let MatchControllerOverride = class MatchControllerOverride extends Override_1.Override {
    fikaInsuranceService;
    fikaMatchService;
    logger;
    constructor(fikaInsuranceService, fikaMatchService, logger) {
        super();
        this.fikaInsuranceService = fikaInsuranceService;
        this.fikaMatchService = fikaMatchService;
        this.logger = logger;
    }
    execute(container) {
        container.afterResolution("MatchController", (_t, result) => {
            result.endLocalRaid = (sessionId, request) => {
                this.fikaInsuranceService.onEndLocalRaidRequest(sessionId, this.fikaInsuranceService.getMatchId(sessionId), request);
            };
        }, { frequency: "Always" });
    }
};
exports.MatchControllerOverride = MatchControllerOverride;
exports.MatchControllerOverride = MatchControllerOverride = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("FikaInsuranceService")),
    __param(1, (0, tsyringe_1.inject)("FikaMatchService")),
    __param(2, (0, tsyringe_1.inject)("WinstonLogger")),
    __metadata("design:paramtypes", [typeof (_a = typeof FikaInsuranceService_1.FikaInsuranceService !== "undefined" && FikaInsuranceService_1.FikaInsuranceService) === "function" ? _a : Object, typeof (_b = typeof FikaMatchService_1.FikaMatchService !== "undefined" && FikaMatchService_1.FikaMatchService) === "function" ? _b : Object, typeof (_c = typeof ILogger_1.ILogger !== "undefined" && ILogger_1.ILogger) === "function" ? _c : Object])
], MatchControllerOverride);
//# sourceMappingURL=MatchController.js.map
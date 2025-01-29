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
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FikaRaidController = void 0;
const tsyringe_1 = require("C:/snapshot/project/node_modules/tsyringe");
const ws_1 = require("C:/snapshot/project/node_modules/ws");
const InraidController_1 = require("C:/snapshot/project/obj/controllers/InraidController");
const ProfileHelper_1 = require("C:/snapshot/project/obj/helpers/ProfileHelper");
const ILogger_1 = require("C:/snapshot/project/obj/models/spt/utils/ILogger");
const DatabaseService_1 = require("C:/snapshot/project/obj/services/DatabaseService");
const EDedicatedStatus_1 = require("../models/enums/EDedicatedStatus");
const EFikaMatchEndSessionMessages_1 = require("../models/enums/EFikaMatchEndSessionMessages");
const EFikaNotifications_1 = require("../models/enums/EFikaNotifications");
const FikaMatchService_1 = require("../services/FikaMatchService");
const FikaDedicatedRaidService_1 = require("../services/dedicated/FikaDedicatedRaidService");
const FikaDedicatedRaidWebSocket_1 = require("../websockets/FikaDedicatedRaidWebSocket");
const FikaNotificationWebSocket_1 = require("../websockets/FikaNotificationWebSocket");
let FikaRaidController = class FikaRaidController {
    databaseService;
    fikaMatchService;
    fikaDedicatedRaidService;
    fikaDedicatedRaidWebSocket;
    profileHelper;
    logger;
    inraidController;
    fikaNotificationWebSocket;
    constructor(databaseService, fikaMatchService, fikaDedicatedRaidService, fikaDedicatedRaidWebSocket, profileHelper, logger, inraidController, fikaNotificationWebSocket) {
        this.databaseService = databaseService;
        this.fikaMatchService = fikaMatchService;
        this.fikaDedicatedRaidService = fikaDedicatedRaidService;
        this.fikaDedicatedRaidWebSocket = fikaDedicatedRaidWebSocket;
        this.profileHelper = profileHelper;
        this.logger = logger;
        this.inraidController = inraidController;
        this.fikaNotificationWebSocket = fikaNotificationWebSocket;
        // empty
    }
    /**
     * Handle /fika/raid/create
     * @param request
     */
    handleRaidCreate(request) {
        const notification = {
            type: EFikaNotifications_1.EFikaNotifications.StartedRaid,
            nickname: request.hostUsername,
            location: request.settings.location,
        };
        this.fikaNotificationWebSocket.broadcast(notification);
        return {
            success: this.fikaMatchService.createMatch(request),
        };
    }
    /**
     * Handle /fika/raid/join
     * @param request
     */
    handleRaidJoin(request) {
        const match = this.fikaMatchService.getMatch(request.serverId);
        return {
            serverId: request.serverId,
            timestamp: match.timestamp,
            gameVersion: match.gameVersion,
            fikaVersion: match.fikaVersion,
            raidCode: match.raidCode,
        };
    }
    /**
     * Handle /fika/raid/leave
     * @param request
     */
    handleRaidLeave(request) {
        if (request.serverId === request.profileId) {
            this.fikaMatchService.endMatch(request.serverId, EFikaMatchEndSessionMessages_1.EFikaMatchEndSessionMessage.HOST_SHUTDOWN_MESSAGE);
            return;
        }
        this.fikaMatchService.removePlayerFromMatch(request.serverId, request.profileId);
    }
    /**
     * Handle /fika/raid/gethost
     * @param request
     */
    handleRaidGetHost(request) {
        const match = this.fikaMatchService.getMatch(request.serverId);
        if (!match) {
            return;
        }
        return {
            ips: match.ips,
            port: match.port,
            natPunch: match.natPunch,
            isDedicated: match.isDedicated,
        };
    }
    /**
     * Handle /fika/raid/getsettings
     * @param request
     */
    handleRaidGetSettings(request) {
        const match = this.fikaMatchService.getMatch(request.serverId);
        if (!match) {
            return;
        }
        return {
            metabolismDisabled: match.raidConfig.metabolismDisabled,
            playersSpawnPlace: match.raidConfig.playersSpawnPlace,
            hourOfDay: match.raidConfig.timeAndWeatherSettings.hourOfDay,
            timeFlowType: match.raidConfig.timeAndWeatherSettings.timeFlowType,
        };
    }
    /** Handle /fika/raid/dedicated/start */
    handleRaidStartDedicated(sessionID, info) {
        if (!this.fikaDedicatedRaidService.isDedicatedClientAvailable()) {
            return {
                matchId: null,
                error: "No dedicated clients available.",
            };
        }
        if (sessionID in this.fikaDedicatedRaidService.dedicatedClients) {
            return {
                matchId: null,
                error: "You are trying to connect to a dedicated client while having Fika.Dedicated installed. Please remove Fika.Dedicated from your client and try again.",
            };
        }
        let dedicatedClient = undefined;
        let dedicatedClientWs = undefined;
        for (const dedicatedSessionId in this.fikaDedicatedRaidService.dedicatedClients) {
            const dedicatedClientInfo = this.fikaDedicatedRaidService.dedicatedClients[dedicatedSessionId];
            if (dedicatedClientInfo.state != EDedicatedStatus_1.EDedicatedStatus.READY) {
                continue;
            }
            dedicatedClientWs = this.fikaDedicatedRaidWebSocket.clientWebSockets[dedicatedSessionId];
            if (!dedicatedClientWs || dedicatedClientWs.readyState == ws_1.WebSocket.CLOSED) {
                continue;
            }
            dedicatedClient = dedicatedSessionId;
            break;
        }
        if (!dedicatedClient) {
            return {
                matchId: null,
                error: "No dedicated clients available at this time.",
            };
        }
        const pmcDedicatedClientProfile = this.profileHelper.getPmcProfile(dedicatedClient);
        const requesterProfile = this.profileHelper.getPmcProfile(sessionID);
        this.logger.debug(`Dedicated: ${pmcDedicatedClientProfile.Info.Nickname} ${pmcDedicatedClientProfile.Info.Level} - Requester: ${requesterProfile.Info.Nickname} ${requesterProfile.Info.Level}`);
        //Set level of the dedicated profile to the person that has requested the raid to be started.
        pmcDedicatedClientProfile.Info.Level = requesterProfile.Info.Level;
        pmcDedicatedClientProfile.Info.Experience = requesterProfile.Info.Experience;
        this.fikaDedicatedRaidService.requestedSessions[dedicatedClient] = sessionID;
        dedicatedClientWs.send(JSON.stringify({
            type: "fikaDedicatedStartRaid",
            ...info,
        }));
        this.logger.info(`Sent WS fikaDedicatedStartRaid to ${dedicatedClient}`);
        return {
            // This really isn't required, I just want to make sure on the client
            matchId: dedicatedClient,
            error: null,
        };
    }
    /** Handle /fika/raid/dedicated/status */
    handleRaidStatusDedicated(sessionId, info) {
        // Temp fix because the enum gets deserialized as a string instead of an integer
        switch (info.status.toString()) {
            case "READY":
                info.status = EDedicatedStatus_1.EDedicatedStatus.READY;
                break;
            case "IN_RAID":
                info.status = EDedicatedStatus_1.EDedicatedStatus.IN_RAID;
                break;
        }
        if (info.status == EDedicatedStatus_1.EDedicatedStatus.READY && !this.fikaDedicatedRaidService.isDedicatedClientAvailable()) {
            if (this.fikaDedicatedRaidService.onDedicatedClientAvailable) {
                this.fikaDedicatedRaidService.onDedicatedClientAvailable();
            }
        }
        this.fikaDedicatedRaidService.dedicatedClients[sessionId] = {
            state: info.status,
            lastPing: Date.now(),
        };
        return {
            sessionId: info.sessionId,
            status: info.status,
        };
    }
    /** Handle /fika/raid/dedicated/getstatus */
    handleRaidGetStatusDedicated() {
        return {
            available: this.fikaDedicatedRaidService.isDedicatedClientAvailable(),
        };
    }
    /** Handle /fika/raid/dedicated/registerPlayer */
    handleRaidRegisterPlayer(sessionId, info) {
        this.inraidController.addPlayer(sessionId, info);
    }
};
exports.FikaRaidController = FikaRaidController;
exports.FikaRaidController = FikaRaidController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("DatabaseService")),
    __param(1, (0, tsyringe_1.inject)("FikaMatchService")),
    __param(2, (0, tsyringe_1.inject)("FikaDedicatedRaidService")),
    __param(3, (0, tsyringe_1.inject)("FikaDedicatedRaidWebSocket")),
    __param(4, (0, tsyringe_1.inject)("ProfileHelper")),
    __param(5, (0, tsyringe_1.inject)("WinstonLogger")),
    __param(6, (0, tsyringe_1.inject)("InraidController")),
    __param(7, (0, tsyringe_1.inject)("FikaNotificationWebSocket")),
    __metadata("design:paramtypes", [typeof (_a = typeof DatabaseService_1.DatabaseService !== "undefined" && DatabaseService_1.DatabaseService) === "function" ? _a : Object, typeof (_b = typeof FikaMatchService_1.FikaMatchService !== "undefined" && FikaMatchService_1.FikaMatchService) === "function" ? _b : Object, typeof (_c = typeof FikaDedicatedRaidService_1.FikaDedicatedRaidService !== "undefined" && FikaDedicatedRaidService_1.FikaDedicatedRaidService) === "function" ? _c : Object, typeof (_d = typeof FikaDedicatedRaidWebSocket_1.FikaDedicatedRaidWebSocket !== "undefined" && FikaDedicatedRaidWebSocket_1.FikaDedicatedRaidWebSocket) === "function" ? _d : Object, typeof (_e = typeof ProfileHelper_1.ProfileHelper !== "undefined" && ProfileHelper_1.ProfileHelper) === "function" ? _e : Object, typeof (_f = typeof ILogger_1.ILogger !== "undefined" && ILogger_1.ILogger) === "function" ? _f : Object, typeof (_g = typeof InraidController_1.InraidController !== "undefined" && InraidController_1.InraidController) === "function" ? _g : Object, typeof (_h = typeof FikaNotificationWebSocket_1.FikaNotificationWebSocket !== "undefined" && FikaNotificationWebSocket_1.FikaNotificationWebSocket) === "function" ? _h : Object])
], FikaRaidController);
//# sourceMappingURL=FikaRaidController.js.map
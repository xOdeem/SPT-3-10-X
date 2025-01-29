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
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FikaMatchService = void 0;
const tsyringe_1 = require("C:/snapshot/project/node_modules/tsyringe");
const ILogger_1 = require("C:/snapshot/project/obj/models/spt/utils/ILogger");
const SaveServer_1 = require("C:/snapshot/project/obj/servers/SaveServer");
const LocationLifecycleService_1 = require("C:/snapshot/project/obj/services/LocationLifecycleService");
const EFikaMatchEndSessionMessages_1 = require("../models/enums/EFikaMatchEndSessionMessages");
const EFikaMatchStatus_1 = require("../models/enums/EFikaMatchStatus");
const EFikaPlayerPresences_1 = require("../models/enums/EFikaPlayerPresences");
const FikaConfig_1 = require("../utils/FikaConfig");
const FikaInsuranceService_1 = require("./FikaInsuranceService");
const FikaPresenceService_1 = require("./FikaPresenceService");
const FikaDedicatedRaidService_1 = require("./dedicated/FikaDedicatedRaidService");
let FikaMatchService = class FikaMatchService {
    logger;
    locationLifecycleService;
    saveServer;
    fikaConfig;
    fikaDedicatedRaidService;
    fikaInsuranceService;
    fikaPresenceService;
    matches;
    timeoutIntervals;
    constructor(logger, locationLifecycleService, saveServer, fikaConfig, fikaDedicatedRaidService, fikaInsuranceService, fikaPresenceService) {
        this.logger = logger;
        this.locationLifecycleService = locationLifecycleService;
        this.saveServer = saveServer;
        this.fikaConfig = fikaConfig;
        this.fikaDedicatedRaidService = fikaDedicatedRaidService;
        this.fikaInsuranceService = fikaInsuranceService;
        this.fikaPresenceService = fikaPresenceService;
        this.matches = new Map();
        this.timeoutIntervals = new Map();
    }
    /**
     * Adds a timeout interval for the given match
     * @param matchId
     */
    addTimeoutInterval(matchId) {
        const fikaConfig = this.fikaConfig.getConfig();
        if (this.timeoutIntervals.has(matchId)) {
            this.removeTimeoutInterval(matchId);
        }
        this.timeoutIntervals.set(matchId, setInterval(() => {
            const match = this.getMatch(matchId);
            match.timeout++;
            // if it timed out 'sessionTimeout' times or more, end the match
            if (match.timeout >= fikaConfig.server.sessionTimeout) {
                this.endMatch(matchId, EFikaMatchEndSessionMessages_1.EFikaMatchEndSessionMessage.PING_TIMEOUT_MESSAGE);
            }
        }, 60 * 1000));
    }
    /**
     * Removes the timeout interval for the given match
     * @param matchId
     * @returns
     */
    removeTimeoutInterval(matchId) {
        if (!this.timeoutIntervals.has(matchId)) {
            return;
        }
        clearInterval(this.timeoutIntervals.get(matchId));
        this.timeoutIntervals.delete(matchId);
    }
    /**
     * Returns the match with the given id, undefined if match does not exist
     * @param matchId
     * @returns
     */
    getMatch(matchId) {
        if (!this.matches.has(matchId)) {
            return;
        }
        return this.matches.get(matchId);
    }
    /**
     * Returns all matches
     * @returns
     */
    getAllMatches() {
        return this.matches;
    }
    /**
     * Returns all match ids
     * @returns
     */
    getAllMatchIds() {
        return Array.from(this.matches.keys());
    }
    /**
     * Returns the player with the given id in the given match, undefined if either match or player does not exist
     * @param matchId
     * @param playerId
     * @returns
     */
    getPlayerInMatch(matchId, playerId) {
        if (!this.matches.has(matchId)) {
            return;
        }
        if (!this.matches.get(matchId).players.has(playerId)) {
            return;
        }
        return this.matches.get(matchId).players.get(playerId);
    }
    /**
     * Returns an array with all playerIds in the given match, undefined if match does not exist
     *
     * Note:
     * - host player is the one where playerId is equal to matchId
     * @param matchId
     * @returns
     */
    getPlayersIdsByMatch(matchId) {
        if (!this.matches.has(matchId)) {
            return;
        }
        return Array.from(this.matches.get(matchId).players.keys());
    }
    /**
     * Returns the match id that has a player with the given player id, undefined if the player isn't in a match
     *
     * @param playerId
     * @returns
     */
    getMatchIdByPlayer(playerId) {
        for (const [key, value] of this.matches.entries()) {
            if (value.players.has(playerId)) {
                return key;
            }
        }
        return undefined;
    }
    /**
     * Returns the match id that has a player with the given session id, undefined if the player isn't in a match
     *
     * Note:
     * - First tries to find pmc, then scav
     * @param sessionId
     * @returns
     */
    getMatchIdByProfile(sessionId) {
        const profile = this.saveServer.getProfile(sessionId);
        // check if pmc is in match
        let matchId = this.getMatchIdByPlayer(profile.characters.pmc._id);
        if (matchId === undefined) {
            // check if scav is in match
            matchId = this.getMatchIdByPlayer(profile.characters.scav._id);
        }
        return matchId;
    }
    /**
     * Creates a new coop match
     * @param data
     * @returns
     */
    createMatch(data) {
        if (this.matches.has(data.serverId)) {
            this.deleteMatch(data.serverId);
        }
        // Stop TS from throwing a tantrum over protected methods
        const lifecycleService = this.locationLifecycleService;
        const locationData = lifecycleService.generateLocationAndLoot(data.settings.location);
        this.matches.set(data.serverId, {
            ips: null,
            port: null,
            hostUsername: data.hostUsername,
            timestamp: data.timestamp,
            raidConfig: data.settings,
            locationData: locationData,
            status: EFikaMatchStatus_1.EFikaMatchStatus.LOADING,
            timeout: 0,
            players: new Map(),
            gameVersion: data.gameVersion,
            fikaVersion: data.fikaVersion,
            side: data.side,
            time: data.time,
            raidCode: data.raidCode,
            natPunch: false,
            isDedicated: false,
            raids: 0,
        });
        this.addTimeoutInterval(data.serverId);
        this.addPlayerToMatch(data.serverId, data.serverId, { groupId: null, isDead: false, isSpectator: data.isSpectator });
        return this.matches.has(data.serverId) && this.timeoutIntervals.has(data.serverId);
    }
    /**
     * Deletes a coop match and removes the timeout interval
     * @param matchId
     */
    deleteMatch(matchId) {
        if (!this.matches.has(matchId)) {
            return;
        }
        this.matches.delete(matchId);
        this.removeTimeoutInterval(matchId);
    }
    /**
     * Ends the given match, logs a reason and removes the timeout interval
     * @param matchId
     * @param reason
     */
    endMatch(matchId, reason) {
        this.logger.info(`Coop session ${matchId} has ended: ${reason}`);
        if (this.fikaDedicatedRaidService.requestedSessions.hasOwnProperty(matchId)) {
            delete this.fikaDedicatedRaidService.requestedSessions[matchId];
        }
        this.fikaInsuranceService.onMatchEnd(matchId);
        this.deleteMatch(matchId);
    }
    /**
     * Updates the status of the given match
     * @param matchId
     * @param status
     */
    setMatchStatus(matchId, status) {
        if (!this.matches.has(matchId)) {
            return;
        }
        this.matches.get(matchId).status = status;
        if (status.toString() == "COMPLETE") {
            this.fikaDedicatedRaidService.handleRequestedSessions(matchId);
        }
    }
    /**
     * Sets the ip and port for the given match
     * @param matchId
     * @param ips
     * @param port
     */
    setMatchHost(matchId, ips, port, natPunch, isDedicated) {
        if (!this.matches.has(matchId)) {
            return;
        }
        const match = this.matches.get(matchId);
        match.ips = ips;
        match.port = port;
        match.natPunch = natPunch;
        match.isDedicated = isDedicated;
    }
    /**
     * Resets the timeout of the given match
     * @param matchId
     */
    resetTimeout(matchId) {
        if (!this.matches.has(matchId)) {
            return;
        }
        this.matches.get(matchId).timeout = 0;
    }
    /**
     * Adds a player to a match
     * @param matchId
     * @param playerId
     * @param data
     */
    addPlayerToMatch(matchId, playerId, data) {
        if (!this.matches.has(matchId)) {
            return;
        }
        const match = this.matches.get(matchId);
        match.players.set(playerId, data);
        this.fikaInsuranceService.addPlayerToMatchId(matchId, playerId);
        this.fikaPresenceService.updatePlayerPresence(playerId, this.fikaPresenceService.generateSetPresence(EFikaPlayerPresences_1.EFikaPlayerPresences.IN_RAID, this.fikaPresenceService.generateRaidPresence(match.locationData.Id, match.side, match.time)));
    }
    /**
     * Sets a player to dead
     * @param matchId
     * @param playerId
     * @param data
     */
    setPlayerDead(matchId, playerId) {
        if (!this.matches.has(matchId)) {
            return;
        }
        if (!this.matches.get(matchId).players.has(playerId)) {
            return;
        }
        this.matches.get(matchId).players.get(playerId).isDead = true;
    }
    /**
     * Sets the groupId for a player
     * @param matchId
     * @param playerId
     * @param groupId
     */
    setPlayerGroup(matchId, playerId, groupId) {
        if (!this.matches.has(matchId)) {
            return;
        }
        if (!this.matches.get(matchId).players.has(playerId)) {
            return;
        }
        this.matches.get(matchId).players.get(playerId).groupId = groupId;
    }
    /**
     * Removes a player from a match
     * @param matchId
     * @param playerId
     */
    removePlayerFromMatch(matchId, playerId) {
        if (!this.matches.has(matchId)) {
            return;
        }
        this.matches.get(matchId).players.delete(playerId);
        this.fikaPresenceService.updatePlayerPresence(playerId, this.fikaPresenceService.generateSetPresence(EFikaPlayerPresences_1.EFikaPlayerPresences.IN_MENU));
    }
};
exports.FikaMatchService = FikaMatchService;
exports.FikaMatchService = FikaMatchService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("WinstonLogger")),
    __param(1, (0, tsyringe_1.inject)("LocationLifecycleService")),
    __param(2, (0, tsyringe_1.inject)("SaveServer")),
    __param(3, (0, tsyringe_1.inject)("FikaConfig")),
    __param(4, (0, tsyringe_1.inject)("FikaDedicatedRaidService")),
    __param(5, (0, tsyringe_1.inject)("FikaInsuranceService")),
    __param(6, (0, tsyringe_1.inject)("FikaPresenceService")),
    __metadata("design:paramtypes", [typeof (_a = typeof ILogger_1.ILogger !== "undefined" && ILogger_1.ILogger) === "function" ? _a : Object, typeof (_b = typeof LocationLifecycleService_1.LocationLifecycleService !== "undefined" && LocationLifecycleService_1.LocationLifecycleService) === "function" ? _b : Object, typeof (_c = typeof SaveServer_1.SaveServer !== "undefined" && SaveServer_1.SaveServer) === "function" ? _c : Object, typeof (_d = typeof FikaConfig_1.FikaConfig !== "undefined" && FikaConfig_1.FikaConfig) === "function" ? _d : Object, typeof (_e = typeof FikaDedicatedRaidService_1.FikaDedicatedRaidService !== "undefined" && FikaDedicatedRaidService_1.FikaDedicatedRaidService) === "function" ? _e : Object, typeof (_f = typeof FikaInsuranceService_1.FikaInsuranceService !== "undefined" && FikaInsuranceService_1.FikaInsuranceService) === "function" ? _f : Object, typeof (_g = typeof FikaPresenceService_1.FikaPresenceService !== "undefined" && FikaPresenceService_1.FikaPresenceService) === "function" ? _g : Object])
], FikaMatchService);
//# sourceMappingURL=FikaMatchService.js.map